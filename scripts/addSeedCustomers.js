// Run with: node scripts/addSeedCustomers.js          (dry-run — shows what would be added)
// Run with: node scripts/addSeedCustomers.js --confirm (actually inserts)
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env.local');
console.log('Looking for env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

let raw = fs.readFileSync(envPath);
if (raw[0] === 0xFF && raw[1] === 0xFE) {
  raw = raw.toString('utf16le');
} else {
  raw = raw.toString('utf8');
}
raw = raw.replace(/^\uFEFF/, '');

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

const VisitSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  notes: { type: String },
}, { _id: true, timestamps: false });

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { _id: true, timestamps: false });

const MaintenanceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  address: { type: String },
  kota: { type: String, required: true },
  wilayah: { type: String },
  phone: { type: String },
  unitType: { type: String },
  serialNumber: { type: String },
  bastDate: { type: Date },
  lastVisitDate: { type: Date },
  nextVisitDate: { type: Date },
  visitCount: { type: Number, default: 0 },
  visitHistory: { type: [VisitSchema], default: [] },
  comments: { type: [CommentSchema], default: [] },
  status: { type: String, enum: ['Active', 'Inactive', 'New'], default: 'New' },
  notes: { type: String },
  perihal: { type: String },
  draftCart: { type: Array, default: [] },
}, { timestamps: true });

const Maintenance = mongoose.models.Maintenance || mongoose.model('Maintenance', MaintenanceSchema);

// Exact verbatim customer list to add under customerName.
// kota is a required field on this model, so it's set to "-" as a placeholder.
const CUSTOMER_NAMES = [
  "Ir. H. Awan Hermawan Purwadinata MT, Bandung",
  " Syamsuardi Alpat (Sudirman)",
  "Hendra Dwi Kurniawan",
  "CV Jawa Indah (Ibu Yuli), Samarinda, Kal-Tim",
  "PT. Yolita Plasinto Pratama ( Ida)",
  "CV Pije Peter Cheryl (Andi)",
  " Esther Indrawati",
  "PT. Bertie Sukses Makmur (Andi)",
  "Ir. Pudjo Prihadi Santoso",
  "PT. Dwipar Loka Ayu (Aswin)",
  " Jenny Lie",
  " Herry Gunawan",
  "Drg. Melanie Hendriaty",
  " Iskandar",
  " Thakurdas Pursani W",
  "PT. Barnaby Kontruksi Sejahtera (Hilda)",
  " Andy Indrajaya, ST",
  " Fahmuddin Edy Hadi, Yogjakarta",
  "Hasan Dali",
  " Frans Andreas",
  " Natalina Surjani .S",
  "Yayasan Karya Kasih Mandiri (Sigit)",
  " Iskandar",
  " Mirza Budiman Diran",
  "PT. Esa Pratama (Hafzah)",
  "PT Sumberdaya Indonesia (Andi Yusuf - Mangga)",
  "PT. Semesta Andesit Perkasa (Budi) - PT. Vicindo Jaya Makmur",
  "Yayasan Perkembangan Anak Indonesia",
  " Abednego Wibowo (Hartono)",
  " M. Dodiek Tas'an Wartono",
  "Dr. Ketut Ananda W. Sp. OG (Klinik Ananda, Sumba)",
  "PT. Mitra Niaga Nusatama (Jelly)",
  " Rajulur Rakhman",
  "PT. PT Duta Raya Cipta (Gulshan)",
  "PT. Multilabindo Wahana (Hidayat)",
  " Linda Irawati, Surabaya",
  " Linda Tjahja (Rivai)",
  "PT. Dwi Tunggal Putra (Michael)",
  " Djohan Surya Adinata",
  " Felix Claudius Djimin (Greysia/ PT Kreasi Bintang Anugerah)",
  " Monica Irmawati Koswara",
  "PT. Comfort Aire Aneka Teknik (Edy - Bintaro)",
  " Farida Anwari",
  " Jonatan Christie",
  "Ir. Tjahjono Tjandra",
  " Johan Suhalim",
  " Jessica Ronaldy Tjahja (Sumitra)",
  " Taruna Wirano Lukman (Rully)",
  " Irawan Susanto",
  " Lucas Tetardy",
  "PT. Hanny Rancangbangun Abadi",
  "PT. Jaya Konstruksi Manggala Pratama Tbk,",
  " Riswandi (Heri Riswandi)-Kalimantan Selatan",
  " Finiantri Sari MSC (Rieke)",
  " Aisyah Zaelani (Nur)",
  " Budi Surjono - Surabaya",
  " Doddi Yoshida",
  " Jico Maradona",
  " Sofian Atmadja Widjaja",
  " Howard Kasima",
  "PT. Wahana Sejahtera Langgeng Makmur ( Howard)",
  " Buyung, Surabaya",
  " Ary Indrajanto",
  "PT. Anugerah Aneka Industri (Surja)",
  " Junly Kodradjaya, Surabaya",
  " Machzum Baisa",
  "PT. Citra Sembilansatu ( Sahata Saolan Sirait)",
  " Peter Douglas Simpson",
  " Heri Hariawan",
  " Suryani",
  " Linda Irawati, Surabaya",
  "PT. Borlindo Mandiri Jaya (Hermon)",
  " Hendra Surjaputra",
  " Kusnaeny Mardjoeki (Dini), Surabaya",
  " Suwanlia",
  " Sukirman Sutrisno",
  "Ir. Hardy Tanjaya",
  " Yudi Prawira",
  " Lesly Irvan",
  "PT Fajar Mitra Krida Abadi - Pak Amir",
  " Harry Yusuf",
  "Gereja bethany Indonesia (Davy Malada), Gresik",
  " Henny  Medan",
  "PT. Sri Buana Sumber Lestari ( Victor)-Surabaya",
  "PT. Samudra Wiwaca Kusuma ( Indah)",
  "Mr. Sunata Tjiterosampurno",
  "Junial",
  " Yanti Susanti",
  "PT. Golden Bird Metro (Kresna)",
  "PT. Gemilang Abadi Santoso ( Unit1 )",
  "PT. Gemilang Abadi Santoso ( Unit2 )",
  " Pramudya Winarta (PT Ritme Indah)",
  " Suyendi",
  " Handoko Sutjitro Surabaya",
  "Then Kon Pin",
  "CV. Crown Hotel-Kalimantan Utara",
  "Mr. Daniel Halim",
  "PT. Harimas Tunggal Perkasa (Haryanto)",
  " Edward",
  "Mr. Hengky Kasim",
  "Hendra Hermanto, Surabaya",
  " Anjar Reksa Permana (Ghani)",
  "Takdir Mattanete, Surabaya",
  " Sugiono",
  " Alexander Tandra",
  "PT. BUMI PURNAMA RAYA (Nanang)",
  "PT Sambas Mineral Mining",
  "Vonny- Loranty Noegroho, Yogjakarta",
  "Suyoto- Kebumen",
  "Herman Mintardja",
  "Liza Anita Sumarsono,Sonnie Pondok Kopi",
  "PT. Bintang Surya Sejati Sukses/ Budi",
  "Mr. Listianingdiah Linggo (Inge)",
  "Bambang Triambodo - Makassar",
  "Fonny Makassar",
  "PT. Global Visi Bersama (Ronald)",
  "PT. Sari Mas Permai, Wieke , Surabaya",
  "Mohammad Aditya Putra-Eddy Sutrisno",
  "Tedy Irawan (Yanto)Palembang",
  "Budi Purnomo (Ibu Lolita)",
  " Ronny Cahyono (PT Usaha Logistik), Surabaya",
  "Syaiful Arifin (Abrian)/ Arnold",
  "Bintang Jupiter",
  "Arianto Haris- Medan",
  "John Marciano- Bali",
  "PT Surya Semesta Permai",
  "Yayasan Onkologi Anak Indonesia",
  " Le Agus Felix",
  "PT. Adimitra prima Lestari (pak Wily)",
  "Sasunto",
  "Lie Ly Tedjokoesoemo, Surabaya",
  " Winarizal",
  "PT Griya Selaras Pratama -Pondok Pinang-Klinik Rawamangun",
  "PT. Semangat Mekar Jaya Mandiri-Felix Semarang",
  "Maikel Effendi - Ivanna",
  "Wahyu Tri Rahmanto",
  "Demo Lift",
  "PT. Mamoru (Wong Sin Yung)",
  "Perseroan Komanditer Primatio (CV)",
  "Dartomo M Sidik - Depok",
  "Gunawan, Jambi",
  "Apartemen Senayan Residence",
  "Demo Lift",
  "Sunarno",
  " Darminto (Eko) / Felicia Nata",
  "Paulus SIA",
  "Christian Bisara",
  "Intan Cristina Chen",
  "PT Andara Buana Mandiri (NOVIAN)",
  "Mulya Darma Wangsa",
  "PT Taktik Promo Sukses",
  " Ahjiannor, Bupati Kal Teng , Barito",
  "PT. Alfa Citra Karyatama (Dr. Hanifah)",
  "Ida Yulidina-Paso",
  "PT. Layton Enter Prise (Alicia)",
  "Elly Lestari - Mangga Besar",
  "Dinas Pekerjaan Umum dan Penataan Ruang Kota Banjarbaru",
  "Dinas Pekerjaan Umum dan Penataan Ruang Kota Banjarbaru",
  " Susanti Lukman",
  "Paulo Roberto Tio",
  "PT. Sumbersolusindo Hitech (Bpk Hardi)",
  " Johannes Dhartanto Wibowo (Erman)",
  "Elly Lestari -Puncak - 1280x1335-Basement",
  "Elly Lestari - Puncak-1430 x 1335- Meja",
  "PT. Danatama Makmur Sekuritas",
  "DODANI HASSOMAL KU (Hashu)",
  "RICKARDO MANGATAS",
  "Dr. Ham Sigit Budiman",
  " Titik Lestari, Bali",
  "Christopher Burke - Bali",
  "Julio - Yonanda Putra",
  "Eddy Sutomo Santoko PT. CHARMINDO MITRA RAHARJA",
  "Sudirman (Alex Kemayoran)",
  "PT Dwibina Prima Patra",
  "Hans Jurgen ",
  "Ronny Abril",
  "Bong Lie Fung (Ketsidy)",
  "PT. Maju Makmur Utomo Sunter",
  "PT. Maju Makmur Utomo Sunter",
  "PT. Maju Makmur Utomo Sunter",
  "Christine /Michelle / Ong Kim Lian",
  "Andre Farnandes-MAXIO-Samarinda",
  "Drs Nurtjahjo Walujo Wibowo",
  "Yessi ( PT. Bangun Konstruksi Cemerlang)",
  "Bpk Gianto Trisno",
  "Dian Putri",
  "PT Handal Selaras Maternal-Green Lake",
  "PT Batara Surya Semesta",
  "PT Duta Sarana Perkasa-Philips",
  "PT Bumi Bangun Perkasa - Budi BGV",
  "PT. Binayasa Putrabatara",
  "Sugeng Mulyono",
  "ALDO SEBASTIAN SUH",
  "Norman S Joesoef (Brawijaya)",
  "Prof Dr. Maya Devita Lokanata Sp D.V.E",
  "PT Octa Utama (Ifan)",
  "Katherina Sulastianus (Renata)",
  "CV Rahmie Group, Gresik",
  "PT Implementasi Teknologi Indonesia (Arief Sofian)",
  "PT. Nabil Putra Jabal (Budhe-Panglima Polim)",
  " Leonard Wilson Lay",
  "TH H Handayani Kiroyan",
  "PT Semesta Selaras",
  " Silvi Liswanda",
  "Judi Setiawan",
  "Rita Sriyanti - Bandung",
  "Retna Bintarni Oen",
  "Monica Pranata",
  "PT. First Marine Seafoods",
  "Djoko Dermanto",
  "Andri Pekanbaru",
  "PT Primaperkasa Intiswadaya (Prayogo)",
  "PT Rukun Sahabat Senior",
  "Yesaya Milano - Situbondo",
  "YESAYA MALINO  - Situbondo",
  "Ida Sofia SH-Gadog",
  "Dev - Pasar Baru",
  "PT. Swi Jetty Nusantara-Makassar",
  "Windri Lestari Rusli",
  "Mr. Jorge Serrano-Timor Leste",
  "Yudi Bandung",
  "Jennifer (PT Karya Anugerah)",
  "Like Meilani - Surabaya",
  "Feffri Chaidir, SE",
  "DRA. ARDINA SAFITRI",
  "PT Renata Global Supply",
  "Eddy Laimancius (CV BajaSakti Trans Perkasa)",
  "PT Intitirta Makmur",
  "Sutiono Sumarno (Ayen)",
  "PT CERIA NUGRAHA ADITAMA  - Kolaka",
  "PT. Trika Citriine Abiyasa (Bangun Raharja)",
  "PT. Trimitra Alkabes Mandiri -BALI Andreas Hartono Gani",
  "PT Pulau Intan (Yashinta Menteng)",
  "Agung Subagiyo",
  "Djohan Darmadi",
  "PT. Trishul Indo Sakti, Bali",
  "Tinus Thepadjaya",
  "TIMMOTHY DANIEL RUSLIM (Lusi Summarecon)",
  " KSO ADHI-CEC   ",
  "Edwin Agung Saputra(Lydia PIK)",
  "Benny Limanto - PIK SKYDANCE",
  "PT Kuala Pangan (Arno)",
  "Hartono (Ano)",
  "UU Sutrisno - Bandung ",
  "MOHAN VASWANI-Malang",
  "Yay Budi Siswa  Mr. Pater R.B. Leonardus Evert Bambang Winandoko, SJ",
  "PT Jaya Kusuma Sarana",
  "Fatehchand Daulatram Stairlift",
  "H. Mahmud Fauzi Nasir-Masjid Nurul Amal",
  " Suparli",
  "PT Hurama Anugerah Berjaya - Robin",
  "Dr. Eddy Widodo",
  "Suharto Hadju- Adhyaksa Dault",
  "PT Hurama Anugerah Berjaya - Vonny",
  "Djohan Junus Tamsir-Rancamaya",
  "Dr. Pengky Pranata-Ms Yulia Sentul",
  "Eddie Darma Salim",
  "Eddie Darma Salim",
  "PT. Prasetya Mulya Abadi (Setyadi)",
  "Bpk Awong Hidjaya",
  "PT. Bima Asri Intermitra",
  "Hendra Jaya MBA",
  " Erastus Sabdono",
  "Sri Ayu Lestari",
  "PT. Hatsonsurya Electric (Hariyanto)-Surabaya",
  "Arif Suhartojo",
  "JUJUN TJAKRALAKSAN-Bandung",
  "Edison Jingga (Hans Jingga)",
  "Janne Idris",
  "Gunawan Priatna",
  "PT. Gagah Putera Satria-Dharma ",
  "Goey Sioe Giok (Bpk Astan) Sunter",
  "PT. Nindya Karya (IKN)",
  "PT. Karya Akbar Mandiri (Anggia)",
  "PT Hage Primadi Konstruksi (Ms Priyanka)",
  "Heni Setiawati",
  "Silfanni Yanto-BSD",
  "Yulianah Yulianah - Julius",
  "Mus Abdullah - Pandaan Jawa Timur",
  "Janni BSD",
  "Andrew Sunaryo Gunawan",
  "Priska",
  "Hasun Lokito-Medan",
  "Budi Nuvrizal-Vania",
  "Tutiawati Subagio",
  "Indra Usmansjah Bakrie",
  "Elsye Augustina Lie",
  "PT. Total Bangun Persada Tbk-Batam",
  "CV Ozone Friendly (Johansen Ngian)",
  " Ricky Raymond Tjhie",
  "Kumar",
  "PT Permata Sarana Husada ( Dr Novi )",
  "Harsono Smart Clinic",
  "PT Wira Properti (Andy)",
  "Hargono, Drs-Banjarmasin",
  "Clara Fransisca Darniaty",
  "Jaman (Ferry)",
  "Esmaldiansyah",
  "Jacobus Irawan",
  "Bintang Jupiter - Bali",
  "Burhanudin (Ebdesk Teknologi- Muhammad Iqbal)",
  "PT Utama Sinergi Persada-Heryanto- Surabaya",
  "Rizki Amelia",
  "Djie Anna",
  "Martin Haendra Nata",
  "Lo Herry",
  "Linas - Bandung",
  "Aspal Polimer Emulsindo - Ibu Nissa Bintaro",
  " Grace Sintjie Soegiarto",
  "Suwanto - PVE Kantor Artha Gading",
  "Febby",
  "PT Persada Dua Rajawali (Will Kramat Sentiong)",
  "Lionhart Group (Cambodia) Company Limited ",
  "Firman Rusli",
  "DRS. Ricky Irawan",
  " Bertha PT Andal Prima Adhitama Perkasa",
  "PT Shape Up Indonesia- Ibu Lany =MOI",
  "PT. PRIAMANAYA ENERGI (Rasyad)",
  "Ir. Indra Prameswara, SE",
  " Lucian Lewis",
  " Stefanus Yulianto (Evan Malang)",
  "Joseph utamin (Vera)",
  "Janne Idris",
  "Robin Zulkarnain ( robin sentul )",
  "Hendra Suwardi",
  "Subagia Handaja",
  "Martin Budiman",
  "Etty Totong",
  "Fery Godzali",
  "Charly alam sutera",
  "Oen Malang",
  "PT Bintan lagoon resort",
  "Budhi Bekasi",
  "Rudy Kusmulyadi (Nancy )",
  "Etin sumarni",
  "Indayati ( djohan pekanbaru )",
  "Andi Anzhar",
  "PT. Rukun sahabat senior ",
  "Grace Irawati",
  "Sofiani Iskandarsyah ( Ilman )",
  "Alice tanizar",
  "Kuswendy Yasukin ( Nike atau gunawan )",
  "PT. Gracia Pelita Abadi ( Gerry ) ",
  "Villa Dewi Sri 1A",
  "Villa Dewi Sri 2A",
  "Edoadrus ( edo cipaku )",
  "Rika Pauzie ",
  "Feisal",
  "Sean ( Anomali Caffe )",
  "Suriani ",
  "Anil ( muskaan )",
  "Henru ( jandi Bandung )",
  "Aripin Pemangkat",
  "Gracia Maria",
  "Azis",
];

function norm(s) {
  return (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

async function run() {
  const confirm = process.argv.includes('--confirm');

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is undefined — check the path/contents of .env.local above.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  console.log('Connected to MongoDB');

  // Check which names already exist, so we don't create true duplicates
  // (still allows the intentional repeats in the list itself, e.g. multiple units).
  const existingDocs = await Maintenance.find({}, { customerName: 1 });
  const existingNames = new Set(existingDocs.map(d => norm(d.customerName)));

  const toInsert = [];
  const alreadyExists = [];

  for (const name of CUSTOMER_NAMES) {
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    if (existingNames.has(norm(name))) {
      alreadyExists.push(trimmedName);
      continue;
    }
    toInsert.push(trimmedName);
  }

  console.log(`\nTotal names in list: ${CUSTOMER_NAMES.length}`);
  console.log(`Already in database (skipped): ${alreadyExists.length}`);
  if (alreadyExists.length > 0) {
    alreadyExists.forEach(n => console.log('  •', n));
  }

  console.log(`\n${confirm ? 'INSERTING' : 'WOULD INSERT (dry-run)'} — ${toInsert.length}:`);
  toInsert.forEach(n => console.log('  •', n));

  if (confirm && toInsert.length > 0) {
    const docs = toInsert.map(name => ({
      customerName: name,
      kota: '-',
      status: 'New',
    }));
    const result = await Maintenance.insertMany(docs);
    console.log(`\nInserted ${result.length} new customer records.`);
  } else if (!confirm) {
    console.log('\nDry-run only — nothing was inserted. Re-run with --confirm to actually add these.');
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err.message);
  process.exit(1);
});