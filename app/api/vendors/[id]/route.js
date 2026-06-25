import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

// GET /api/vendors/[id]
export async function GET(request, { params }) {
  await dbConnect()
  const { id } = await params
  const vendor = await Vendor.findById(id)
  if (!vendor) return NextResponse.json({ success: false }, { status: 404 })
  return NextResponse.json({ success: true, data: vendor })
}

// PATCH /api/vendors/[id]
export async function PATCH(request, { params }) {
  await dbConnect()
  const { id } = await params
  const body = await request.json()
  const updated = await Vendor.findByIdAndUpdate(id, body, { new: true })
  if (!updated) return NextResponse.json({ success: false }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/vendors/[id]
export async function DELETE(request, { params }) {
  await dbConnect()
  const { id } = await params
  await Vendor.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}