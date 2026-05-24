import mongoose from 'mongoose'

const MaintenanceSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    address: { type: String },
    kota: { type: String, required: true },
    wilayah: { type: String },
    phone: { type: String },
    unitType: { type: String },
    serialNumber: { type: String },
    bastDate: { type: Date },                   // tanggal BAST — garansi mulai dari sini
    lastVisitDate: { type: Date },              // tanggal kunjungan terakhir
    nextVisitDate: { type: Date },              // dihitung: lastVisitDate + 3 bulan (atau sesuai kontrak)
    visitCount: { type: Number, default: 0 },  // jumlah kunjungan total
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'New'],
      default: 'New',
    },
    notes: { type: String },
  },
  { timestamps: true }
)

// Virtual: apakah masih dalam garansi (2 kunjungan pertama gratis setelah BAST)
MaintenanceSchema.virtual('isUnderWarranty').get(function () {
  return this.visitCount <= 2
})

// Virtual: hari sampai next visit
MaintenanceSchema.virtual('daysUntilNextVisit').get(function () {
  if (!this.nextVisitDate) return null
  const today = new Date()
  const diff = this.nextVisitDate - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

MaintenanceSchema.set('toJSON', { virtuals: true })
MaintenanceSchema.set('toObject', { virtuals: true })

export default mongoose.models.Maintenance ||
  mongoose.model('Maintenance', MaintenanceSchema)