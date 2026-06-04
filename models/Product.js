// models/Product.js
import mongoose from 'mongoose';

const KlaimSchema = new mongoose.Schema({
  tanggal:      { type: Date, default: Date.now },
  jumlah:       { type: Number, required: true },
  alasan:       { type: String },
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance' },
  namaCustomer: { type: String },
  disetujui:    { type: Boolean, default: false },
  catatanAdmin: { type: String },
}, { _id: true, timestamps: true });

const ProductSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  category:     { type: String, trim: true },
  quantity:     { type: Number, default: 0, min: 0 },
  unit:         { type: String, default: 'pcs' },
  price:        { type: Number, default: 0, min: 0 },
  description:  { type: String },
  sku:          { type: String, trim: true },
  minStock:     { type: Number, default: 5, min: 0 },
  supplier:     { type: String },
  imageUrl:     { type: String },
  tipeItem: {
    type: String,
    enum: ['Ready Part', 'Sparepart', 'Consumable', 'Tool', 'Other'],
    default: 'Other',
  },
  bisaDiklaim:  { type: Boolean, default: false },
  stokDiHold:   { type: Number, default: 0, min: 0 },
  lokasiGudang: { type: String },
  riwayatKlaim: { type: [KlaimSchema], default: [] },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

ProductSchema.virtual('stokTersedia').get(function () {
  return Math.max(0, (this.quantity || 0) - (this.stokDiHold || 0));
});

ProductSchema.virtual('statusStok').get(function () {
  const tersedia = this.stokTersedia;
  if (tersedia <= 0)             return 'Out of Stock';
  if (tersedia <= this.minStock) return 'Low Stock';
  return 'In Stock';
});

ProductSchema.virtual('klaimPending').get(function () {
  return (this.riwayatKlaim || []).filter(k => !k.disetujui).length;
});

ProductSchema.set('toJSON',   { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);