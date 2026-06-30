import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Invoice from '@/models/Invoice'
import mongoose from 'mongoose'

export async function GET(req) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')

  const filter = {}
  if (customerId) {
    try {
      filter.customerId = new mongoose.Types.ObjectId(customerId)
    } catch (_) {
      return NextResponse.json({ success: true, data: [] })
    }
  }

  const data = await Invoice.find(filter).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ success: true, data })
}

export async function POST(req) {
  try {
    await dbConnect()
    const body = await req.json()

    const items = (body.items || []).map((item, idx) => ({
  no:            idx + 1,
  specification: item.specification,
  serialNo:      item.serialNo || '',
  stops:         item.stops || '',
  termPercent:   item.termPercent || 0,
  unitPrice:     item.unitPrice || 0,
  amount:        Math.round((item.unitPrice || 0) * (parseFloat(item.stops) || 0)),
}))

    const subTotal    = items.reduce((s, i) => s + i.amount, 0)
    const ppnPercent  = body.ppnPercent ?? 11
    const ppnAmount   = Math.round(subTotal * ppnPercent / 100)
    const totalAmount = subTotal + ppnAmount

    const invoice = new Invoice({
      invoiceNo:       body.invoiceNo,
      refNo:           body.refNo || '',
      invoiceDate:     body.invoiceDate || new Date(),
      customerId:      body.customerId,
      clientName:      body.clientName,
      clientAddress:   body.clientAddress || '',
      projectLocation: body.projectLocation || '',
      paymentTerms:    body.paymentTerms || [],
      items,
      subTotal,
      ppnPercent,
      ppnAmount,
      totalAmount,
    })
    await invoice.save()

    return NextResponse.json({ success: true, data: invoice }, { status: 201 })
  } catch (err) {
    console.error('Invoice POST error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}