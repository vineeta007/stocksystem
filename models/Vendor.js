import mongoose from 'mongoose'

const VendorSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  speciality:  { type: String, default: '' },
  phone:       { type: String, default: '' },
  email:       { type: String, default: '' },
  address:     { type: String, default: '' },
  notes:       { type: String, default: '' },
  status:      { type: String, default: 'Active' },
}, { timestamps: true })

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema)