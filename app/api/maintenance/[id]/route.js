import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Maintenance from '@/models/Maintenance'

// GET /api/maintenance?kota=Jakarta&status=Active&reminder=true
export async function GET(request) {
  await dbConnect()
  const { searchParams } = new URL(request.url)

  const filter = {}
  if (searchParams.get('kota'))   filter.kota   = searchParams.get('kota')
  if (searchParams.get('status')) filter.status = searchParams.get('status')

  // Filter reminder: hanya yang nextVisitDate dalam 14 hari ke depan
  if (searchParams.get('reminder') === 'true') {
    const today = new Date()
    const in14  = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
    filter.nextVisitDate = { $gte: today, $lte: in14 }
  }

  const customers = await Maintenance.find(filter).sort({ nextVisitDate: 1 })

  // Tambahkan computed fields sebelum return
  const result = customers.map((c) => {
    const obj = c.toJSON()
    const today = new Date()

    // Hari sampai next visit
    obj.daysUntilNextVisit = obj.nextVisitDate
      ? Math.ceil((new Date(obj.nextVisitDate) - today) / (1000 * 60 * 60 * 24))
      : null

    // Status garansi: 2 kunjungan pertama setelah BAST gratis
    obj.warrantyStatus =
      obj.visitCount <= 2 ? 'free' : 'berbayar'

    // Label reminder
    if (obj.daysUntilNextVisit !== null) {
      if (obj.daysUntilNextVisit < 0)       obj.reminderLabel = 'Terlambat'
      else if (obj.daysUntilNextVisit <= 14) obj.reminderLabel = 'Segera'
      else                                  obj.reminderLabel = 'On Track'
    }

    return obj
  })

  return NextResponse.json({ success: true, data: result })
}

// POST /api/maintenance — tambah customer baru
export async function POST(request) {
  await dbConnect()
  const body = await request.json()

  // Hitung nextVisitDate otomatis: lastVisitDate + 90 hari (3 bulan)
  if (body.lastVisitDate && !body.nextVisitDate) {
    const last = new Date(body.lastVisitDate)
    body.nextVisitDate = new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000)
  }

  const customer = await Maintenance.create(body)
  return NextResponse.json({ success: true, data: customer }, { status: 201 })
}