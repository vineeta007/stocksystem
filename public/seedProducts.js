// seedProducts.js - Run with: node seedProducts.js
// Paste your MongoDB URI below before running

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://vineetadevnani_db_user:vdevnani007@cluster0.ksvbtfj.mongodb.net/stocksystem';
// Example: 'mongodb+srv://vineetadevnani_db_user:vdevnani007@cluster0.ksvbtfj.mongodb.net/stocksystem'

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  stock: Number,
  minStock: { type: Number, default: 5 },
  status: String,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const products = [
  // SWIFT PARTS
  { name: 'STOCK Oli Swift', category: 'Swift Parts', stock: 15, minStock: 5 },
  { name: 'Fuse Pec 150', category: 'Swift Parts', stock: 1, minStock: 2 },
  { name: 'Emergency Key Swift (New Black)', category: 'Swift Parts', stock: 1, minStock: 2 },

  // LIFTING
  { name: 'RESISTOR', category: 'Lifting', stock: 7, minStock: 3 },
  { name: 'Udec M E.100.05.9032', category: 'Lifting', stock: 2, minStock: 2 },
  { name: 'Udec C (Code: E.100.10.0002V02)', category: 'Lifting', stock: 2, minStock: 2 },
  { name: 'Udec D DOMO2', category: 'Lifting', stock: 3, minStock: 2 },
  { name: 'Udec D INDOMO', category: 'Lifting', stock: 9, minStock: 3 },
  { name: 'Door Closer F353.05.9021', category: 'Lifting', stock: 1, minStock: 2 },
  { name: 'Gervall Door lock V9011.05.9021', category: 'Lifting', stock: 1, minStock: 2 },
  { name: 'Sensor Magnetic E800.05.9009', category: 'Lifting', stock: 2, minStock: 2 },
  { name: 'ITF850 Serial Board E802.05.9003V01', category: 'Lifting', stock: 3, minStock: 2 },
  { name: 'LED LAMP For Spotlight', category: 'Lifting', stock: 10, minStock: 5 },
  { name: 'Round Ring for Spotlight 062mm', category: 'Lifting', stock: 10, minStock: 5 },
  { name: 'Karet Seal 84281031', category: 'Lifting', stock: 0, minStock: 2 },
  { name: 'Baterai aki Indomo', category: 'Lifting', stock: 3, minStock: 3 },
  { name: 'Baterai aki domoflex / Baterai ICAL AKI 7.2 AH', category: 'Lifting', stock: 9, minStock: 3 },
  { name: 'Relay', category: 'Lifting', stock: 7, minStock: 3 },
  { name: 'Tombol Lifting', category: 'Lifting', stock: 20, minStock: 5 },
  { name: 'Udec P domoflex', category: 'Lifting', stock: 2, minStock: 2 },
  { name: 'Finger Print akses', category: 'Lifting', stock: 8, minStock: 3 },
  { name: 'Card Access', category: 'Lifting', stock: 59, minStock: 10 },
  { name: 'AI Face ID', category: 'Lifting', stock: 2, minStock: 2 },
  { name: 'Power Converter', category: 'Lifting', stock: 22, minStock: 5 },
  { name: 'Tombol No Touch', category: 'Lifting', stock: 13, minStock: 5 },
  { name: 'UDEC P INDOMO', category: 'Lifting', stock: 1, minStock: 2 },
  { name: 'Kunci Manual Indomo', category: 'Lifting', stock: 6, minStock: 3 },
  { name: 'Door Motor', category: 'Lifting', stock: 2, minStock: 2 },
  { name: 'Udec EH', category: 'Lifting', stock: 6, minStock: 3 },
  { name: 'CBE 5902/A', category: 'Lifting', stock: 1, minStock: 2 },
  { name: 'CBE 5901', category: 'Lifting', stock: 0, minStock: 2 },
  { name: 'Inverter domo flex 2', category: 'Lifting', stock: 1, minStock: 2 },
  { name: 'MD 55', category: 'Lifting', stock: 1, minStock: 2 },
  { name: 'UDEC H', category: 'Lifting', stock: 2, minStock: 2 },
  { name: 'UDEC P INDOMO 1', category: 'Lifting', stock: 1, minStock: 2 },
  { name: 'Icaro Display', category: 'Lifting', stock: 3, minStock: 2 },
  { name: 'Tatakan Oli', category: 'Lifting', stock: 2, minStock: 2 },

  // CHAIN WARRANTY (COW items)
  { name: 'SWITCH CABLE For lt 2-4', category: 'Chain Warranty', stock: 2, minStock: 2 },
  { name: 'SWITCH CABLE For 1-3', category: 'Chain Warranty', stock: 2, minStock: 2 },
  { name: 'SWITCH 24V', category: 'Chain Warranty', stock: 4, minStock: 2 },
  { name: 'SCREW KIT', category: 'Chain Warranty', stock: 4, minStock: 2 },
  { name: 'Magnet stip L100mm', category: 'Chain Warranty', stock: 8, minStock: 3 },
  { name: 'Magnet strip L200mm', category: 'Chain Warranty', stock: 1, minStock: 2 },
  { name: 'DMG DIALER', category: 'Chain Warranty', stock: 1, minStock: 1 },
  { name: 'DMG DIALER DIAGRAM CONNECTION', category: 'Chain Warranty', stock: 1, minStock: 1 },
];

// Auto-assign status based on stock vs minStock
products.forEach(p => {
  if (p.stock === 0) p.status = 'out';
  else if (p.stock <= p.minStock) p.status = 'low';
  else p.status = 'in_stock';
});

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Optional: clear existing products first
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    const inserted = await Product.insertMany(products);
    console.log(`✅ Successfully inserted ${inserted.length} products!`);

    await mongoose.disconnect();
    console.log('Done. Check your website now.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
