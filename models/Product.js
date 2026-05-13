import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  stock: Number,
  minStock: Number,
  photo: String,
});

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema);