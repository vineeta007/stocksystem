// app/api/products/klaim/route.js
// POST: ajukan klaim sparepart
// GET:  lihat semua klaim yang pending

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

// ── GET: semua klaim pending ──────────────────────────────────────────────────
export async function GET() {
  try {
    await dbConnect();

    // Cari produk yang punya riwayat klaim belum disetujui
    const products = await Product.find({ 'riwayatKlaim.disetujui': false }).lean();

    const klaimList = [];
    for (const p of products) {
      const pending = (p.riwayatKlaim || []).filter(k => !k.disetujui);
      for (const k of pending) {
        klaimList.push({
          productId:    p._id,
          productName:  p.name,
          sku:          p.sku,
          stokSekarang: p.quantity,
          klaim:        k,
        });
      }
    }

    return NextResponse.json({ success: true, count: klaimList.length, data: klaimList });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST: ajukan klaim sparepart ──────────────────────────────────────────────
export async function POST(request) {
  try {
    await dbConnect();
    const { productId, jumlah, alasan, customerId, namaCustomer } = await request.json();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 });

    if (!product.bisaDiklaim) {
      return NextResponse.json({ success: false, error: 'Produk ini tidak bisa diklaim' }, { status: 400 });
    }

    if (product.stokTersedia < jumlah) {
      return NextResponse.json({ success: false, error: `Stok tidak cukup. Tersedia: ${product.stokTersedia}` }, { status: 400 });
    }

    // Tambah ke riwayat klaim
    product.riwayatKlaim.push({ jumlah, alasan, customerId, namaCustomer, disetujui: false });

    // Hold stok sementara
    product.stokDiHold = (product.stokDiHold || 0) + jumlah;

    await product.save();

    return NextResponse.json({ success: true, message: 'Klaim diajukan, menunggu persetujuan admin', data: product });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}