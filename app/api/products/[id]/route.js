import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(request, context) {
  try {
    await dbConnect();
    const id = context.params.id;
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    await dbConnect();
    const id = context.params.id;
    const body = await request.json();
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { name: body.name, category: body.category, quantity: Number(body.quantity) || 0, minStock: Number(body.minStock) || 0, sku: body.sku || '' } },
      { new: true }
    );
    if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    await dbConnect();
    const id = context.params.id;
    await Product.findByIdAndUpdate(id, { $set: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}