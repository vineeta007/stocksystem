import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Maintenance from '@/models/Maintenance'

// Adds exactly 6 calendar months to a date (matches the visit-history tab's logic)
function addSixMonths(date) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 6)
  return d
}

// GET /api/maintenance
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const kota     = searchParams.get('kota')
    const status   = searchParams.get('status')
    const reminder = searchParams.get('reminder')

    const query = {}
    if (kota)   query.kota   = kota
    if (status) query.status = status

    const customers = await Maintenance.find(query).sort({ createdAt: -1 }).lean()

    const today = new Date()

    const data = customers.map(c => {
      const daysUntilNextVisit = c.nextVisitDate
        ? Math.ceil((new Date(c.nextVisitDate) - today) / (1000 * 60 * 60 * 24))
        : null
      const warrantyStatus = (c.visitCount || 0) <= 2 ? 'free' : 'berbayar'
      return { ...c, daysUntilNextVisit, warrantyStatus }
    }).filter(c => {
      if (reminder === 'true') {
        return c.daysUntilNextVisit !== null && c.daysUntilNextVisit <= 14
      }
      return true
    })

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/maintenance
export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()

    if (body.lastVisitDate && !body.nextVisitDate) {
      body.nextVisitDate = addSixMonths(body.lastVisitDate)
    }

    const customer = await Maintenance.create(body)
    return NextResponse.json({ success: true, data: customer }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}