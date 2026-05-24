// app/api/maintenance/route.js
// GET semua data maintenance + filter per kota/wilayah
// POST tambah data maintenance baru

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Maintenance from '@/models/Maintenance';

// ── GET: ambil semua data maintenance ────────────────────────────────────────
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const kota     = searchParams.get('kota');
    const wilayah  = searchParams.get('wilayah');
    const status   = searchParams.get('status');
    const reminder = searchParams.get('reminder'); // "true" = hanya yang hampir jatuh tempo

    const filter = {};
    if (kota)    filter.kota    = { $regex: kota,    $options: 'i' };
    if (wilayah) filter.wilayah = { $regex: wilayah, $options: 'i' };
    if (status)  filter.statusCustomer = status;

    // Filter reminder: tampilkan yang jatuh tempo dalam 14 hari ke depan
    if (reminder === 'true') {
      const today   = new Date(); today.setHours(0, 0, 0, 0);
      const in14    = new Date(today); in14.setDate(in14.getDate() + 14);
      filter.jatuhTempo = { $gte: today, $lte: in14 };
    }

    const data = await Maintenance.find(filter)
      .sort({ jatuhTempo: 1 }) // urutkan dari yang paling dekat jatuh tempo
      .lean();

    // Tambahkan field computed untuk frontend
    const enriched = data.map(m => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const jt    = m.jatuhTempo ? new Date(m.jatuhTempo) : null;
      const hariMenuju = jt
        ? Math.round((jt.setHours(0,0,0,0) - today) / 86400000)
        : null;

      const kunjunganSelesai = (m.kunjungan || []).filter(k => k.status === 'Selesai').length;
      const kunjunganBerikutnyaFree = kunjunganSelesai < (m.totalKunjunganFree || 2);

      return {
        ...m,
        hariMenujuJatuhTempo: hariMenuju,
        jumlahKunjungan: m.kunjungan?.length || 0,
        kunjunganBerikutnyaFree,
        // Label reminder
        reminderLabel: hariMenuju !== null
          ? hariMenuju < 0    ? 'Overdue'
          : hariMenuju === 0  ? 'Hari Ini'
          : hariMenuju <= 14  ? `${hariMenuju} hari lagi`
          : null
          : null,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    console.error('GET /api/maintenance error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST: tambah data maintenance baru ───────────────────────────────────────
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Hitung jatuhTempo dari kunjunganTerakhir
    if (body.kunjunganTerakhir && body.intervalMaintenance) {
      const jt = new Date(body.kunjunganTerakhir);
      jt.setDate(jt.getDate() + (body.intervalMaintenance || 90));
      body.jatuhTempo = jt;
    }

    const maintenance = new Maintenance(body);
    await maintenance.save();

    return NextResponse.json({ success: true, data: maintenance }, { status: 201 });
  } catch (err) {
    console.error('POST /api/maintenance error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}