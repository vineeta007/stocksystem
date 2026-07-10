import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Counter from '@/models/Counter'

export async function GET() {
  await dbConnect()

  const counter = await Counter.findById('quotationRefNo').lean()
  const nextSeq = (counter?.seq || 0) + 1

  const today = new Date()
  const dd    = String(today.getDate()).padStart(2, '0')
  const mm    = String(today.getMonth() + 1).padStart(2, '0')
  const yy    = String(today.getFullYear()).slice(-2)
  const refNo = `KL-Quote/${dd}-${mm}-${yy}/${nextSeq}P`

  return NextResponse.json({ success: true, refNo })
}