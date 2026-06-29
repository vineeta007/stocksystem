import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  date:     { type: Date, required: true },
  name:     { type: String, required: true, trim: true },
  amount:   { type: Number, required: true, default: 0 },
  details:  { type: String, default: '' },
  category: { type: String, default: 'biaya_operasional' },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);