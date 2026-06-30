// Run with: node scripts/seedUsers.js
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env.local');
console.log('Looking for env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

// Manually read and parse .env.local, bypassing dotenv's parser
// so we don't get burned by UTF-16/BOM encoding issues again.
let raw = fs.readFileSync(envPath);

if (raw[0] === 0xFF && raw[1] === 0xFE) {
  // UTF-16 LE BOM
  raw = raw.toString('utf16le');
} else {
  raw = raw.toString('utf8');
}
raw = raw.replace(/^\uFEFF/, ''); // strip UTF-8 BOM if present

const lines = raw.split(/\r?\n/);
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  process.env[key] = value;
}

console.log('MONGODB_URI loaded as:', process.env.MONGODB_URI);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: { type: String, required: true },
  role: { type: String, required: true },
  passwordHash: { type: String, required: true },
  initials: { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Pulled directly from your existing lib/users.js
const STATIC_USERS = [
  { username: 'asha', displayName: 'Asha', role: 'admin', password: 'Admin@2026', initials: 'AS' },
  { username: 'puji', displayName: 'Puji', role: 'after_sales_1', password: 'Puji@AS1', initials: 'PJ' },
  { username: 'sari', displayName: 'Sari', role: 'after_sales_2', password: 'Sari@AS2', initials: 'SR' },
  { username: 'finance', displayName: 'Finance', role: 'finance', password: 'Finance@26', initials: 'FN' },
  { username: 'cindy', displayName: 'Cindy', role: 'finance_admin', password: 'Cindy@Fin1', initials: 'CY' },
  { username: 'sunny', displayName: 'Sunny', role: 'director', password: 'Sunny@Dir1', initials: 'SN' },
  { username: 'logistic', displayName: 'Logistic', role: 'logistic', password: 'Log@Stock1', initials: 'LG' },
  { username: 'backup', displayName: 'Backup Admin', role: 'admin_backup', password: 'Backup@Adm1', initials: 'BK' },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is undefined — check the path/contents of .env.local above.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  console.log('Connected to MongoDB');

  for (const u of STATIC_USERS) {
    const exists = await User.findOne({ username: u.username });
    if (exists) {
      console.log(`Skipping ${u.username} (already exists)`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      passwordHash,
      initials: u.initials,
    });
    console.log(`Created ${u.username}`);
  }

  console.log('Done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err.message);
  process.exit(1);
});