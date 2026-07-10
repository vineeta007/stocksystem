import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Counter from '@/models/Counter'

export async function GET() {
  await dbConnect()

  const today = new Date()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yy = String(today.getFullYear()).slice(-2)
  const counterId = `invoice-${mm}-${yy}`

  const counter = await Counter.findById(counterId).lean()
  const nextSeq = (counter?.seq || 0) + 1
  const seqStr  = String(nextSeq).padStart(3, '0')

  const invoiceNo = `INV.KL.${mm}-${yy}/${seqStr}`

  return NextResponse.json({ success: true, invoiceNo })
}