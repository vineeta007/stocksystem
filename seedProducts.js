// seedProducts.js
// Run with: node seedProducts.js
// Make sure MONGODB_URI is in your .env.local

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String },
  quantity:    { type: Number, default: 0 },
  unit:        { type: String, default: 'pcs' },
  price:       { type: Number, default: 0 },
  description: { type: String },
  sku:         { type: String },
  minStock:    { type: Number, default: 5 },
  supplier:    { type: String },
  imageUrl:    { type: String },
  tipeItem:    { type: String, default: 'Other' },
  bisaDiklaim: { type: Boolean, default: false },
  stokDiHold:  { type: Number, default: 0 },
  lokasiGudang:{ type: String },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const products = [
  // ── SWIFT ──────────────────────────────────────────────────────────────────
  { name: 'Stock Oli Swift',                          category: 'Swift',              quantity: 15, minStock: 5,  unit: 'pcs' },
  { name: 'Fuse Pec 150',                             category: 'Swift',              quantity: 1,  minStock: 3,  unit: 'pcs' },
  { name: 'Emergency Key Swift (New Black)',           category: 'Swift',              quantity: 1,  minStock: 2,  unit: 'pcs' },

  // ── LIFTING (PURCHASED) ────────────────────────────────────────────────────
  { name: 'Resistor',                                 category: 'Lifting (Purchased)',quantity: 7,  minStock: 3,  unit: 'pcs' },
  { name: 'Udec M E.100.05.9032',                     category: 'Lifting (Purchased)',quantity: 2,  minStock: 3,  unit: 'pcs' },
  { name: 'Udec C (E.100.10.0002V02)',                 category: 'Lifting (Purchased)',quantity: 2,  minStock: 3,  unit: 'pcs' },
  { name: 'Udec D DOMO2',                             category: 'Lifting (Purchased)',quantity: 3,  minStock: 3,  unit: 'pcs' },
  { name: 'Udec D INDOMO',                            category: 'Lifting (Purchased)',quantity: 9,  minStock: 3,  unit: 'pcs' },
  { name: 'Door Closer F353.05.9021',                 category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'Gervall Door Lock V9011.05.9021',          category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'Sensor Magnetic E800.05.9009',             category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'ITF850 Serial Board E802.05.9003V01',      category: 'Lifting (Purchased)',quantity: 3,  minStock: 2,  unit: 'pcs' },
  { name: 'LED Lamp For Spotlight',                   category: 'Lifting (Purchased)',quantity: 10, minStock: 5,  unit: 'pcs' },
  { name: 'Round Ring for Spotlight 062mm',           category: 'Lifting (Purchased)',quantity: 10, minStock: 5,  unit: 'pcs' },
  { name: 'Karet Seal 84281031',                      category: 'Lifting (Purchased)',quantity: 0,  minStock: 2,  unit: 'pcs' },
  { name: 'Baterai Aki Indomo',                       category: 'Lifting (Purchased)',quantity: 3,  minStock: 3,  unit: 'pcs' },
  { name: 'Baterai Aki Domoflex / Baterai ICAL AKI 7.2 AH', category: 'Lifting (Purchased)', quantity: 9, minStock: 5, unit: 'pcs' },
  { name: 'Relay',                                    category: 'Lifting (Purchased)',quantity: 7,  minStock: 3,  unit: 'pcs' },
  { name: 'Tombol Lifting',                           category: 'Lifting (Purchased)',quantity: 20, minStock: 5,  unit: 'pcs' },
  { name: 'Udec P Domoflex',                          category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'Finger Print Akses',                       category: 'Lifting (Purchased)',quantity: 8,  minStock: 3,  unit: 'pcs' },
  { name: 'Card Access',                              category: 'Lifting (Purchased)',quantity: 59, minStock: 10, unit: 'pcs' },
  { name: 'AI Face ID',                               category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'Power Converter',                          category: 'Lifting (Purchased)',quantity: 22, minStock: 5,  unit: 'pcs' },
  { name: 'Tombol No Touch',                          category: 'Lifting (Purchased)',quantity: 13, minStock: 5,  unit: 'pcs' },
  { name: 'UDEC P INDOMO',                            category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'Kunci Manual Indomo',                      category: 'Lifting (Purchased)',quantity: 6,  minStock: 3,  unit: 'pcs' },
  { name: 'Door Motor',                               category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'Udec EH',                                  category: 'Lifting (Purchased)',quantity: 6,  minStock: 3,  unit: 'pcs' },
  { name: 'CBE 5902/A',                               category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'CBE 5901',                                 category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'Inverter Domo Flex 2',                     category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'MD 55',                                    category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'UDEC H',                                   category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'UDEC P INDOMO 1',                          category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'Switch Cable For Lt 2-4',                  category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'Switch Cable For 1-3',                     category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'Switch 24V',                               category: 'Lifting (Purchased)',quantity: 4,  minStock: 2,  unit: 'pcs' },
  { name: 'Screw Kit',                                category: 'Lifting (Purchased)',quantity: 4,  minStock: 2,  unit: 'pcs' },
  { name: 'Magnet Strip L100mm',                      category: 'Lifting (Purchased)',quantity: 8,  minStock: 3,  unit: 'pcs' },
  { name: 'Magnet Strip L200mm',                      category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'DMG Dialer',                               category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'DMG Dialer Diagram Connection',            category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'Icaro Display',                            category: 'Lifting (Purchased)',quantity: 3,  minStock: 2,  unit: 'pcs' },
  { name: 'Tatakan Oli',                              category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'Box Oli',                                  category: 'Lifting (Purchased)',quantity: 0,  minStock: 2,  unit: 'pcs' },
  { name: 'Roller',                                   category: 'Lifting (Purchased)',quantity: 0,  minStock: 2,  unit: 'pcs' },
  { name: 'Adapter Baterai',                          category: 'Lifting (Purchased)',quantity: 4,  minStock: 2,  unit: 'pcs' },
  { name: 'Vanbelt',                                  category: 'Lifting (Purchased)',quantity: 2,  minStock: 2,  unit: 'pcs' },
  { name: 'Power Supply 15V / Universal',             category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },
  { name: 'UDEC Board / DOMO 1',                      category: 'Lifting (Purchased)',quantity: 1,  minStock: 2,  unit: 'pcs' },  // was 3, sold 0, sisa 3 — using sisa
  { name: 'Kunci Tambahan Domoflex',                  category: 'Lifting (Purchased)',quantity: 3,  minStock: 2,  unit: 'pcs' },
  { name: 'Guide Shoes',                              category: 'Lifting (Purchased)',quantity: 4,  minStock: 3,  unit: 'pcs' },

  // ── PVE ────────────────────────────────────────────────────────────────────
  { name: 'Selenoid Coil',                            category: 'PVE',                quantity: 4,  minStock: 2,  unit: 'pcs', bisaDiklaim: true },
  { name: 'Magnetic Sensor',                          category: 'PVE',                quantity: 4,  minStock: 2,  unit: 'pcs', bisaDiklaim: true },
  { name: 'Magnets',                                  category: 'PVE',                quantity: 6,  minStock: 3,  unit: 'pcs', bisaDiklaim: true },
  { name: 'Door Closer / Door Bracket PVE',           category: 'PVE',                quantity: 4,  minStock: 2,  unit: 'pcs', bisaDiklaim: true },
  { name: 'Cylinder Board',                           category: 'PVE',                quantity: 6,  minStock: 3,  unit: 'pcs', bisaDiklaim: true },
  { name: 'Call Button Lt 2 PVE Outer Cylinder & Cabin', category: 'PVE',            quantity: 1,  minStock: 2,  unit: 'pcs', bisaDiklaim: true },
  { name: 'U.S Board',                                category: 'PVE',                quantity: 1,  minStock: 2,  unit: 'pcs', bisaDiklaim: true },
  { name: 'SMPS 36V (Power Supply) PVE',              category: 'PVE',                quantity: 1,  minStock: 2,  unit: 'pcs', bisaDiklaim: true },
  { name: 'Reliev Valve',                             category: 'PVE',                quantity: 1,  minStock: 2,  unit: 'pcs', bisaDiklaim: true },
  { name: 'Landing Spring dan Cone',                  category: 'PVE',                quantity: 4,  minStock: 2,  unit: 'pcs', bisaDiklaim: true },

  // ── STARLIFT ───────────────────────────────────────────────────────────────
  { name: 'AKI Kering 12V 4.5',                       category: 'Starlift',           quantity: 0,  minStock: 2,  unit: 'pcs' },
  { name: 'Baterai ICAL AKI 7.2 AH (Starlift)',       category: 'Starlift',           quantity: 0,  minStock: 2,  unit: 'pcs' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if products already exist
    const existing = await Product.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  ${existing} products already exist. Skipping seed to avoid duplicates.`);
      console.log('   If you want to re-seed, delete existing products first.');
      await mongoose.disconnect();
      return;
    }

    const result = await Product.insertMany(products);
    console.log(`✅ Successfully inserted ${result.length} products into MongoDB`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
