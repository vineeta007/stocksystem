import mongoose from 'mongoose'

const KlaimSchema = new mongoose.Schema(
  {
    customerName:   { type: String, required: true },
    kota:           { type: String },
    unitSerial:     { type: String },
    sparepartId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sparepartName:  { type: String },   // denormalized for easy display
    qty:            { type: Number, required: true, min: 1 },
    reason:         { type: String, required: true },
    technicianName: { type: String },
    claimDate:      { type: Date, default: Date.now },
    notes:          { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Disetujui', 'Ditolak', 'Selesai'],
      default: 'Pending',
    },
  },
  { timestamps: true }
)

export default mongoose.models.Klaim || mongoose.model('Klaim', KlaimSchema)