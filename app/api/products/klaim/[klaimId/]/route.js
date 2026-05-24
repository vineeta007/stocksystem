import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { productId, action, catatanAdmin } = await request.json();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const klaim = product.riwayatKlaim.id(params.klaimId);
    if (!klaim) {
      return NextResponse.json({ success: false, error: 'Klaim tidak ditemukan' }, { status: 404 });
    }

    if (action === 'approve') {
      product.quantity   = Math.max(0, product.quantity - klaim.jumlah);
      product.stokDiHold = Math.max(0, (product.stokDiHold || 0) - klaim.jumlah);
      klaim.disetujui    = true;
      klaim.catatanAdmin = catatanAdmin || 'Disetujui';
    } else {
      product.stokDiHold = Math.max(0, (product.stokDiHold || 0) - klaim.jumlah);
      klaim.catatanAdmin = catatanAdmin || 'Ditolak';
      klaim.disetujui    = false;
    }

    await product.save();
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}