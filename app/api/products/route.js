import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

// GET all products
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true }).lean();
    return NextResponse.json({ success: true, data: products });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST create new product
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // only pick the fields you want to allow
    const product = await Product.create({
      name:         body.name,
      category:     body.category,
      quantity:     Number(body.quantity) || 0,
      minStock:     Number(body.minStock) || 0,
      unit:         body.unit || 'pcs',
      price:        Number(body.price) || 0,
      sku:          body.sku || '',
      supplier:     body.supplier || '',
      description:  body.description || '',
      tipeItem:     body.tipeItem || 'Other',
      lokasiGudang: body.lokasiGudang || '',
      bisaDiklaim:  body.bisaDiklaim || false,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}