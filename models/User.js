import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName:  { type: String, required: true },
  role:         { type: String, required: true },
  passwordHash: { type: String, required: true },
  initials:     { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)