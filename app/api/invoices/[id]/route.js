import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Invoice from '@/models/Invoice'

export async function GET(req, { params }) {
  await dbConnect()
  const { id } = await params
  const inv = await Invoice.findById(id).lean()
  if (!inv) return NextResponse.json({ success: false }, { status: 404 })
  return NextResponse.json({ success: true, data: inv })
}

export async function PATCH(req, { params }) {
  await dbConnect()
  const { id } = await params
  const body = await req.json()

  if (body.items) {
    body.items = body.items.map((item, idx) => ({
      ...item,
      no:     idx + 1,
      amount: Math.round((item.unitPrice || 0) * (item.termPercent || 0) / 100),
    }))
    const subTotal   = body.items.reduce((s, i) => s + i.amount, 0)
    const ppnPercent = body.ppnPercent ?? 11
    body.subTotal    = subTotal
    body.ppnAmount   = Math.round(subTotal * ppnPercent / 100)
    body.totalAmount = subTotal + body.ppnAmount
  }

  const updated = await Invoice.findByIdAndUpdate(id, { $set: body }, { new: true })
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(req, { params }) {
  await dbConnect()
  const { id } = await params
  await Invoice.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}