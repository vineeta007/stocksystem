import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Klaim from '@/models/Klaim'

export async function PATCH(request, { params }) {
  await dbConnect()
  const { id } = await params
  const body = await request.json()
  const updated = await Klaim.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(request, { params }) {
  await dbConnect()
  const { id } = await params
  await Klaim.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}