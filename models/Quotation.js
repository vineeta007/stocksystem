import mongoose from 'mongoose'

const QuotationItemSchema = new mongoose.Schema({
  no:          { type: Number },
  nama:        { type: String, required: true },
  jumlahUnit:  { type: Number, default: 1 },
  tipe:        { type: String, default: 'Service' },
  hargaPerUnit:{ type: Number, default: 0 },
  biaya:       { type: Number, default: 0 },
}, { _id: true })

const QuotationSchema = new mongoose.Schema({
  refNo:        { type: String, unique: true },
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance', required: true },
  clientName:   { type: String, required: true },
  clientAddress:{ type: String },
  clientPhone:  { type: String },
  project:      { type: String },
  perihal:      { type: String, default: 'Penawaran Biaya Maintenance Per Kunjungan' },
  quoteDate:    { type: Date, default: Date.now },
  validTill:    { type: Date },
  items:        { type: [QuotationItemSchema], default: [] },
  ppnPercent:   { type: Number, default: 11 },
  totalBiaya:   { type: Number, default: 0 },
  ppnAmount:    { type: Number, default: 0 },
  grandTotal:   { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Cancelled'],
    default: 'Draft',
  },
  syaratKondisi: {
    type: [String],
    default: [
      'Harga sudah termasuk biaya akomodasi teknisi',
      'Pembayaran 100% dimuka',
      'Biaya Maintenance per sekali kunjungan',
      'Garansi berlaku 3 bulan sejak maintenance. Apabila terdapat oli rembes, tidak dikenakan biaya apa pun termasuk cleaning site. Garansi akan berlanjut 3 bulan lagi sejak tanggal cleaning (jika diperlukan).',
    ],
  },
}, { timestamps: true })

// Auto-generate refNo before save
QuotationSchema.pre('save', async function (next) {
  if (!this.refNo) {
    const year = new Date().getFullYear()
    const count = await mongoose.models.Quotation.countDocuments()
    this.refNo = `TDE-${year}-${String(count + 1).padStart(4, '0')}`
  }
  // recalculate totals
  this.totalBiaya = this.items.reduce((s, i) => s + (i.biaya || 0), 0)
  this.ppnAmount  = Math.round(this.totalBiaya * (this.ppnPercent / 100))
  this.grandTotal = this.totalBiaya + this.ppnAmount
  next()
})

export default mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema)