import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Quotation from '@/models/Quotation'

export async function GET(req, { params }) {
  await dbConnect()
  const q = await Quotation.findById(params.id).lean()
  if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: q })
}

export async function PATCH(req, { params }) {
  await dbConnect()
  const body = await req.json()

  if (body.items) {
    body.items = body.items.map((item, idx) => ({
      ...item,
      no: idx + 1,
      biaya: (item.jumlahUnit || 1) * (item.hargaPerUnit || 0),
    }))
    const totalBiaya = body.items.reduce((s, i) => s + i.biaya, 0)
    const ppnPercent = body.ppnPercent ?? 11
    body.totalBiaya  = totalBiaya
    body.ppnAmount   = Math.round(totalBiaya * ppnPercent / 100)
    body.grandTotal  = totalBiaya + body.ppnAmount
  }

  const q = await Quotation.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json({ data: q })
}

export async function DELETE(req, { params }) {
  await dbConnect()
  await Quotation.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}