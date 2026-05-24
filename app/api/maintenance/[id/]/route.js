import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Maintenance from '@/models/Maintenance'

// PATCH /api/maintenance/[id] — update customer, or record a new visit
export async function PATCH(request, { params }) {
  await dbConnect()
  const body = await request.json()
  const { id } = await params

  // Jika action = 'recordVisit', increment visitCount dan update lastVisitDate
  if (body.action === 'recordVisit') {
    const customer = await Maintenance.findById(id)
    if (!customer) return NextResponse.json({ success: false }, { status: 404 })

    customer.visitCount    += 1
    customer.lastVisitDate  = new Date()
    // nextVisitDate = lastVisitDate + 90 hari
    customer.nextVisitDate  = new Date(customer.lastVisitDate.getTime() + 90 * 24 * 60 * 60 * 1000)
    customer.status         = 'Active'
    await customer.save()

    return NextResponse.json({ success: true, data: customer })
  }

  // Update biasa
  if (body.lastVisitDate && !body.nextVisitDate) {
    const last = new Date(body.lastVisitDate)
    body.nextVisitDate = new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000)
  }

  const updated = await Maintenance.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/maintenance/[id]
export async function DELETE(request, { params }) {
  await dbConnect()
  const { id } = await params
  await Maintenance.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}