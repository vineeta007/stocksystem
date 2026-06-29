import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Quotation from '@/models/Quotation'
import mongoose from 'mongoose'

export async function GET(req) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const status     = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  const filter = {}
  if (status && status !== 'All') filter.status = status
  if (customerId) {
    try {
      filter.customerId = new mongoose.Types.ObjectId(customerId)
    } catch (_) {
      return NextResponse.json({ success: true, data: [] })
    }
  }

  const data = await Quotation.find(filter).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ success: true, data })
}

export async function POST(req) {
  try {
    await dbConnect()
    const body = await req.json()

    const items = (body.items || []).map((item, idx) => ({
      no:           idx + 1,
      nama:         item.nama,
      jumlahUnit:   item.jumlahUnit || 1,
      tipe:         item.tipe || 'Service',
      hargaPerUnit: item.hargaPerUnit || 0,
      biaya:        (item.jumlahUnit || 1) * (item.hargaPerUnit || 0),
    }))

    const totalBiaya = items.reduce((s, i) => s + i.biaya, 0)
    const ppnAmount  = Math.round(totalBiaya * 0.11)
    const grandTotal = totalBiaya + ppnAmount

    const quotation = new Quotation({
      customerId:    body.customerId,
      clientName:    body.clientName,
      clientAddress: body.clientAddress || '',
      clientPhone:   body.clientPhone   || '',
      project:       body.project       || '',
      items,
      totalBiaya,
      ppnAmount,
      grandTotal,
    })
    await quotation.save()

    return NextResponse.json({ success: true, data: quotation }, { status: 201 })
  } catch (err) {
    console.error('Quotation POST error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}