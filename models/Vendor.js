import mongoose from 'mongoose'

const VendorSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  type:        { type: String, default: 'Supplier' }, // Supplier, Distributor, Online, Other
  phone:       { type: String, default: '' },
  email:       { type: String, default: '' },
  address:     { type: String, default: '' },
  notes:       { type: String, default: '' },
  status:      { type: String, default: 'Active' }, // Active, Inactive
}, { timestamps: true })

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema)