import mongoose from 'mongoose'

const VisitSchema = new mongoose.Schema({
  date:  { type: Date, default: Date.now },
  notes: { type: String },
}, { _id: true, timestamps: false })

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { _id: true, timestamps: false })

const MaintenanceSchema = new mongoose.Schema(
  {
    customerName:  { type: String, required: true },
    address:       { type: String },
    kota:          { type: String, required: true },
    wilayah:       { type: String },
    phone:         { type: String },
    unitType:      { type: String },
    serialNumber:  { type: String },
    bastDate:      { type: Date },
    lastVisitDate: { type: Date },
    nextVisitDate: { type: Date },
    visitCount:    { type: Number, default: 0 },
    visitHistory:  { type: [VisitSchema], default: [] },
    comments:      { type: [CommentSchema], default: [] },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'New'],
      default: 'New',
    },
    notes: { type: String },
  },
  { timestamps: true }
)

MaintenanceSchema.virtual('isUnderWarranty').get(function () {
  return this.visitCount <= 2
})

MaintenanceSchema.virtual('daysUntilNextVisit').get(function () {
  if (!this.nextVisitDate) return null
  const today = new Date()
  const diff  = this.nextVisitDate - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

MaintenanceSchema.set('toJSON',   { virtuals: true })
MaintenanceSchema.set('toObject', { virtuals: true })

export default mongoose.models.Maintenance ||
  mongoose.model('Maintenance', MaintenanceSchema)