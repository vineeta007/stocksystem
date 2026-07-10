import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Quotation from '@/models/Quotation'
import Counter from '@/models/Counter'
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

    // Atomically get the next global sequence number (1P, 2P, 3P, ...)
    const counter = await Counter.findOneAndUpdate(
      { _id: 'quotationRefNo' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )

    const today = new Date()
    const dd    = String(today.getDate()).padStart(2, '0')
    const mm    = String(today.getMonth() + 1).padStart(2, '0')
    const yy    = String(today.getFullYear()).slice(-2)
    const refNo = `KL-Quote/${dd}-${mm}-${yy}/${counter.seq}P`

    const quotation = new Quotation({
      customerId:    body.customerId,
      clientName:    body.clientName,
      clientAddress: body.clientAddress || '',
      clientPhone:   body.clientPhone   || '',
      project:       body.project       || '',
      refNo,
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