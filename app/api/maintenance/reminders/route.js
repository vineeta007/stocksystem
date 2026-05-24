import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Maintenance from '@/models/Maintenance';

export async function GET() {
  try {
    await dbConnect();

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const in14  = new Date(today); in14.setDate(in14.getDate() + 14);

    const reminders = await Maintenance.find({
      status: 'Active',
      $or: [
        { nextVisitDate: { $gte: today, $lte: in14 } },
        { nextVisitDate: { $lt: today } },
      ]
    }).sort({ nextVisitDate: 1 }).lean();

    const enriched = reminders.map(m => {
      const jt = m.nextVisitDate ? new Date(m.nextVisitDate) : null;
      const hariMenuju = jt
        ? Math.round((jt.setHours(0,0,0,0) - today.getTime()) / 86400000)
        : null;

      return {
        _id:               m._id,
        namaCustomer:      m.customerName,
        noHP:              m.phone,
        kota:              m.kota,
        wilayah:           m.wilayah,
        namaUnit:          m.unitType,
        jatuhTempo:        m.nextVisitDate,
        kunjunganTerakhir: m.lastVisitDate,
        statusGaransi:     m.visitCount <= 2 ? 'free' : 'berbayar',
        hariMenuju,
        alertType: hariMenuju === null ? 'none'
                 : hariMenuju < 0     ? 'overdue'
                 : hariMenuju === 0   ? 'today'
                 : hariMenuju <= 3    ? 'urgent'
                 : hariMenuju <= 7    ? 'warning'
                 :                     'info',
        alertLabel: hariMenuju === null ? ''
                  : hariMenuju < 0     ? `Terlambat ${Math.abs(hariMenuju)} hari`
                  : hariMenuju === 0   ? 'Hari ini!'
                  : hariMenuju <= 14   ? `${hariMenuju} hari lagi`
                  : '',
      };
    });

    return NextResponse.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}