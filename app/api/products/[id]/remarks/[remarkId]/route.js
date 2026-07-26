// app/api/products/[id]/remarks/[remarkId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function DELETE(request, context) {
  try {
    await dbConnect();
    const { id, remarkId } = await context.params;

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const remark = product.remarks.id(remarkId);
    if (!remark) return NextResponse.json({ success: false, error: 'Remark not found' }, { status: 404 });

    const qtyToRestore = remark.quantitySold || 0;

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        $pull: { remarks: { _id: remarkId } },
        $inc: { quantity: qtyToRestore },
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}