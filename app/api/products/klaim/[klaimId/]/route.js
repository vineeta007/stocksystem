// app/api/products/klaim/[klaimId]/route.js
// PUT: approve atau reject klaim sparepart

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { productId, action, catatanAdmin } = await request.json();
    // action: 'approve' | 'reject'

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 });

    const klaim = product.riwayatKlaim.id(params.klaimId);
    if (!klaim) return NextResponse.json({ success: false, error: 'Klaim tidak ditemukan' }, { status: 404 });

    if (action === 'approve') {
      // Setujui: kurangi stok + lepas hold
      product.quantity     = Math.max(0, product.quantity - klaim.jumlah);
      product.stokDiHold   = Math.max(0, (product.stokDiHold || 0) - klaim.jumlah);
      klaim.disetujui      = true;
      klaim.catatanAdmin   = catatanAdmin || 'Disetujui';
    } else {
      // Tolak: lepas hold saja, stok tidak berubah
      product.stokDiHold   = Math.max(0, (product.stokDiHold || 0) - klaim.jumlah);
      klaim.catatanAdmin   = catatanAdmin || 'Ditolak';
      // Hapus dari riwayat atau biarkan dengan flag
      klaim.disetujui      = false;
      // Untuk menandai sudah diproses (ditolak), bisa gunakan catatan
    }

    await product.save();
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}// app/api/products/klaim/[klaimId]/route.js
// PUT: approve atau reject klaim sparepart

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { productId, action, catatanAdmin } = await request.json();
    // action: 'approve' | 'reject'

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 });

    const klaim = product.riwayatKlaim.id(params.klaimId);
    if (!klaim) return NextResponse.json({ success: false, error: 'Klaim tidak ditemukan' }, { status: 404 });

    if (action === 'approve') {
      // Setujui: kurangi stok + lepas hold
      product.quantity     = Math.max(0, product.quantity - klaim.jumlah);
      product.stokDiHold   = Math.max(0, (product.stokDiHold || 0) - klaim.jumlah);
      klaim.disetujui      = true;
      klaim.catatanAdmin   = catatanAdmin || 'Disetujui';
    } else {
      // Tolak: lepas hold saja, stok tidak berubah
      product.stokDiHold   = Math.max(0, (product.stokDiHold || 0) - klaim.jumlah);
      klaim.catatanAdmin   = catatanAdmin || 'Ditolak';
      // Hapus dari riwayat atau biarkan dengan flag
      klaim.disetujui      = false;
      // Untuk menandai sudah diproses (ditolak), bisa gunakan catatan
    }

    await product.save();
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}