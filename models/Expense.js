import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, default: 0 },
  details: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);