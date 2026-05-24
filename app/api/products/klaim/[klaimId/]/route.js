// app/api/maintenance/reminders/route.js
// Endpoint khusus: ambil semua customer yang maintenance-nya
// jatuh tempo dalam 14 hari ke depan (untuk dashboard reminder)

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Maintenance from '@/models/Maintenance';

export async function GET() {
  try {
    await dbConnect();

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const in14  = new Date(today); in14.setDate(in14.getDate() + 14);

    // Ambil yang:
    // 1. Jatuh tempo antara hari ini s/d 14 hari ke depan (upcoming)
    // 2. Atau sudah overdue (jatuh tempo sudah lewat)
    const reminders = await Maintenance.find({
      statusCustomer: 'Active',
      $or: [
        { jatuhTempo: { $gte: today, $lte: in14 } }, // akan jatuh tempo
        { jatuhTempo: { $lt: today } },               // sudah lewat / overdue
      ]
    })
    .sort({ jatuhTempo: 1 })
    .lean();

    const enriched = reminders.map(m => {
      const jt = m.jatuhTempo ? new Date(m.jatuhTempo) : null;
      const hariMenuju = jt
        ? Math.round((jt.setHours(0,0,0,0) - today.getTime()) / 86400000)
        : null;

      return {
        _id:          m._id,
        namaCustomer: m.namaCustomer,
        noHP:         m.noHP,
        kota:         m.kota,
        wilayah:      m.wilayah,
        namaUnit:     m.namaUnit,
        jatuhTempo:   m.jatuhTempo,
        kunjunganTerakhir: m.kunjunganTerakhir,
        statusGaransi: m.statusGaransi,
        hariMenuju,
        // Tipe alert
        alertType: hariMenuju === null    ? 'none'
                 : hariMenuju < 0        ? 'overdue'    // merah
                 : hariMenuju === 0      ? 'today'      // merah
                 : hariMenuju <= 3       ? 'urgent'     // merah
                 : hariMenuju <= 7       ? 'warning'    // kuning
                 :                        'info',       // biru
        alertLabel: hariMenuju === null  ? ''
                  : hariMenuju < 0      ? `Terlambat ${Math.abs(hariMenuju)} hari`
                  : hariMenuju === 0    ? 'Hari ini!'
                  : hariMenuju <= 14    ? `${hariMenuju} hari lagi`
                  : '',
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}