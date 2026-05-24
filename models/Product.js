// models/Product.js (UPDATED)
// Tambahan field: kategori sparepart, status klaim, ready stock

import mongoose from 'mongoose';

// ── Riwayat Klaim Sparepart ───────────────────────────────────────────────────
const KlaimSchema = new mongoose.Schema({
  tanggal:        { type: Date,   default: Date.now },
  jumlah:         { type: Number, required: true },
  alasan:         { type: String },                          // misal: "garansi", "rusak", dll
  customerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance' },
  namaCustomer:   { type: String },
  disetujui:      { type: Boolean, default: false },
  catatanAdmin:   { type: String },
}, { _id: true, timestamps: true });

const ProductSchema = new mongoose.Schema({
  // ── Field yang sudah ada (jangan dihapus) ────────────────────────────────
  name:        { type: String, required: true },
  category:    { type: String },
  quantity:    { type: Number, default: 0 },
  unit:        { type: String, default: 'pcs' },
  price:       { type: Number, default: 0 },
  description: { type: String },
  sku:         { type: String },
  minStock:    { type: Number, default: 5 },     // minimum stock sebelum low stock alert
  supplier:    { type: String },
  imageUrl:    { type: String },

  // ── Field BARU: klasifikasi sparepart ─────────────────────────────────────
  tipeItem: {
    type: String,
    enum: [
      'Ready Part',       // part yang selalu ada di stok
      'Sparepart',        // sparepart pengganti
      'Consumable',       // habis pakai
      'Tool',             // alat kerja
      'Other',
    ],
    default: 'Other',
  },

  // Apakah item ini bisa di-klaim garansi?
  bisaDiklaim:       { type: Boolean, default: false },

  // Stok yang di-hold untuk klaim (belum diproses)
  stokDiHold:        { type: Number, default: 0 },

  // Stok yang benar-benar tersedia (quantity - stokDiHold)
  // Dihitung sebagai virtual

  // Lokasi penyimpanan
  lokasiGudang:      { type: String },   // e.g. "Rak A-3"

  // Riwayat klaim sparepart
  riwayatKlaim:      [KlaimSchema],

  // Status aktif/nonaktif produk
  isActive:          { type: Boolean, default: true },

}, {
  timestamps: true,
});

// ── Virtual: stok tersedia (ready - hold) ────────────────────────────────────
ProductSchema.virtual('stokTersedia').get(function () {
  return Math.max(0, (this.quantity || 0) - (this.stokDiHold || 0));
});

// ── Virtual: status stok ─────────────────────────────────────────────────────
ProductSchema.virtual('statusStok').get(function () {
  const tersedia = this.stokTersedia;
  if (tersedia <= 0)           return 'Out of Stock';
  if (tersedia <= this.minStock) return 'Low Stock';
  return 'In Stock';
});

// ── Virtual: jumlah klaim pending ────────────────────────────────────────────
ProductSchema.virtual('klaimPending').get(function () {
  return (this.riwayatKlaim || []).filter(k => !k.disetujui).length;
});

ProductSchema.set('toJSON',   { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);