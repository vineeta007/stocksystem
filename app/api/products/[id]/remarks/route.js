// app/api/products/[id]/remarks/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function POST(request, context) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    if (!body.customerName || !body.customerName.trim()) {
      return NextResponse.json({ success: false, error: 'Customer name is required' }, { status: 400 });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        $push: {
          remarks: {
            customerName: body.customerName,
            quantitySold: Number(body.quantitySold) || 0,
            amount:       Number(body.amount) || 0,
            note:         body.note || '',
            date:         new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}