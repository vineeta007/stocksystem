import mongoose from 'mongoose'

const PaymentTermSchema = new mongoose.Schema({
  percent: { type: Number, required: true },
  label:   { type: String, required: true },
  active:  { type: Boolean, default: false },
}, { _id: true })

const InvoiceItemSchema = new mongoose.Schema({
  no:           { type: Number },
  specification:{ type: String, required: true },
  serialNo:     { type: String, default: '' },
  stops:        { type: String, default: '' },
  termPercent:  { type: Number, default: 0 },
  unitPrice:    { type: Number, default: 0 },
  amount:       { type: Number, default: 0 },
}, { _id: true })

const InvoiceSchema = new mongoose.Schema({
  invoiceNo:     { type: String, required: true },
  refNo:         { type: String, default: '' },
  invoiceDate:   { type: Date, default: Date.now },
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance', required: true },
  clientName:    { type: String, required: true },
  clientAddress: { type: String, default: '' },
  projectLocation: { type: String, default: '' },
  paymentTerms:  { type: [PaymentTermSchema], default: [] },
  items:         { type: [InvoiceItemSchema], default: [] },
  subTotal:      { type: Number, default: 0 },
  ppnPercent:    { type: Number, default: 11 },
  ppnAmount:     { type: Number, default: 0 },
  totalAmount:   { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Cancelled'],
    default: 'Draft',
  },
}, { timestamps: true })

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema)