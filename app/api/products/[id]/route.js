import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

// GET single product
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id).lean();
    if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH update product
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const updated = await Product.findByIdAndUpdate(
      params.id,
      {
        $set: {
          name:     body.name,
          category: body.category,
          quantity: Number(body.quantity) ?? 0,
          minStock: Number(body.minStock) ?? 0,
          sku:      body.sku || '',
        }
      },
      { new: true }
    );
    if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await Product.findByIdAndUpdate(params.id, { $set: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}