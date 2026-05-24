// app/api/maintenance/[id]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Maintenance from '@/models/Maintenance';

// ── GET: detail satu customer maintenance ─────────────────────────────────────
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const data = await Maintenance.findById(params.id);
    if (!data) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── PUT: update data maintenance / tambah kunjungan baru ─────────────────────
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();

    const existing = await Maintenance.findById(params.id);
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    // Jika ada kunjungan baru yang dikirim, push ke array
    if (body.kunjunganBaru) {
      const kv = body.kunjunganBaru;
      existing.kunjungan.push(kv);

      // Update kunjunganTerakhir ke tanggal kunjungan baru
      if (kv.tanggal) {
        existing.kunjunganTerakhir = new Date(kv.tanggal);
        // Hitung jatuh tempo baru
        const jt = new Date(kv.tanggal);
        jt.setDate(jt.getDate() + (existing.intervalMaintenance || 90));
        existing.jatuhTempo = jt;
      }

      // Reset reminder flag karena sudah dikunjungi
      existing.reminderTerkirim = false;

      delete body.kunjunganBaru;
    }

    // Update field lainnya
    Object.assign(existing, body);
    await existing.save();

    return NextResponse.json({ success: true, data: existing });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── DELETE: hapus data maintenance ───────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await Maintenance.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}