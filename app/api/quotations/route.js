import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Quotation from '@/models/Quotation'

export async function GET(req) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const status     = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  const filter = {}
  if (status && status !== 'All') filter.status = status
  if (customerId) filter.customerId = customerId

  const data = await Quotation.find(filter).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ data })
}

export async function POST(req) {
  await dbConnect()
  const body = await req.json()

  // recalc biaya per item
  const items = (body.items || []).map((item, idx) => ({
    ...item,
    no: idx + 1,
    biaya: (item.jumlahUnit || 1) * (item.hargaPerUnit || 0),
  }))

  const quotation = new Quotation({ ...body, items })
  await quotation.save()
  return NextResponse.json({ data: quotation }, { status: 201 })
}