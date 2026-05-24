import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Klaim from '@/models/Klaim'
import Product from '@/models/Product'  // adjust path to match your existing Product model

export async function GET() {
  await dbConnect()
  const claims = await Klaim.find().sort({ createdAt: -1 })
  return NextResponse.json({ success: true, data: claims })
}

export async function POST(request) {
  await dbConnect()
  const body = await request.json()

  // Populate sparepartName from Product
  if (body.sparepartId) {
    try {
      const product = await Product.findById(body.sparepartId)
      if (product) body.sparepartName = product.name
    } catch (_) {}
  }

  const klaim = await Klaim.create(body)
  return NextResponse.json({ success: true, data: klaim }, { status: 201 })
}