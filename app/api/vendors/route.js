import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

// GET /api/vendors
export async function GET() {
  await dbConnect()
  const vendors = await Vendor.find().sort({ createdAt: -1 })
  return NextResponse.json({ success: true, data: vendors })
}

// POST /api/vendors
export async function POST(request) {
  await dbConnect()
  const body = await request.json()
  const vendor = await Vendor.create(body)
  return NextResponse.json({ success: true, data: vendor }, { status: 201 })
}