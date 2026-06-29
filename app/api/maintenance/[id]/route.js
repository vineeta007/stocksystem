import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Maintenance from '@/models/Maintenance'

// GET /api/maintenance/[id]
export async function GET(request, { params }) {
  await dbConnect()
  const { id } = await params
  const customer = await Maintenance.findById(id)
  if (!customer) return NextResponse.json({ success: false }, { status: 404 })

  const obj   = customer.toJSON()
  const today = new Date()

  obj.daysUntilNextVisit = obj.nextVisitDate
    ? Math.ceil((new Date(obj.nextVisitDate) - today) / (1000 * 60 * 60 * 24))
    : null

  obj.warrantyStatus = obj.visitCount <= 2 ? 'free' : 'berbayar'

  return NextResponse.json({ success: true, data: obj })
}

// PATCH /api/maintenance/[id]
export async function PATCH(request, { params }) {
  await dbConnect()
  const body = await request.json()
  const { id } = await params

  if (body.action === 'recordVisit') {
    const customer = await Maintenance.findById(id)
    if (!customer) return NextResponse.json({ success: false }, { status: 404 })

    const visitEntry = { date: new Date(), notes: body.notes || '' }
    customer.visitCount    += 1
    customer.lastVisitDate  = new Date()
    customer.nextVisitDate  = new Date(customer.lastVisitDate.getTime() + 90 * 24 * 60 * 60 * 1000)
    customer.status         = 'Active'
    customer.visitHistory   = [...(customer.visitHistory || []), visitEntry]
    await customer.save()

    return NextResponse.json({ success: true, data: customer })
  }

  if (body.lastVisitDate && !body.nextVisitDate) {
    const last = new Date(body.lastVisitDate)
    body.nextVisitDate = new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000)
  }

  const updated = await Maintenance.findByIdAndUpdate(id, { $set: body }, { new: true })
  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/maintenance/[id]
export async function DELETE(request, { params }) {
  await dbConnect()
  const { id } = await params
  await Maintenance.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}