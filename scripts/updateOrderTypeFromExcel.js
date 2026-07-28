// Run with: node scripts/updateOrderTypeFromExcel.js          (dry-run — shows what would change)
// Run with: node scripts/updateOrderTypeFromExcel.js --confirm (actually updates)
//
// Source: SALES_IKL.xlsx, columns "Order #" -> serialNumber, "Type" -> unitType,
// matched against existing Maintenance docs by customerName (same matching logic
// as addCustomerListOrdered.js). Preserves order for duplicate names by matching
// each duplicate against the existing docs sharing that name in the same order
// they were originally inserted (sorted by createdAt descending, same as the
// insert script used), so the Nth occurrence of a name in this list updates the
// Nth-most-recently-created doc with that name.
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

// Exact verbatim rows from SALES_IKL.xlsx, in file order:
// order = "Order #" column -> goes into serialNumber
// type  = "Type" column    -> goes into unitType
const RECORDS = [
  { name: 'PT. Yolita Plasinto Pratama ( Ida)', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'Hendra Dwi Kurniawan', order: '21/0227', type: 'Domo Flex' },
  { name: 'CV Jawa Indah (Ibu Yuli), Samarinda, Kal-Tim', order: '21/0258', type: 'Indomo Shaft' },
  { name: ' Iskandar', order: '21/0256', type: 'Domo Flex' },
  { name: ' Iskandar', order: '21/0257', type: 'Domo Flex' },
  { name: ' Howard Kasima', order: 'PVE', type: 'Pve 37 midio' },
  { name: ' Frans Andreas', order: '21/0374', type: 'Domo Flex' },
  { name: ' Fahmuddin Edy Hadi, Yogjakarta', order: '21/0618', type: 'Indomo Shaft' },
  { name: 'PT. Bertie Sukses Makmur (Andi)', order: '21/0375', type: 'Domo Flex' },
  { name: 'CV Pije Peter Cheryl (Andi)', order: '21/0455', type: 'Domo Flex' },
  { name: 'Hasan Dali', order: '21/0879', type: 'Domo Flex' },
  { name: ' Herry Gunawan', order: '21/0538', type: 'Domo Flex' },
  { name: ' Mirza Budiman Diran', order: '21/0534', type: 'Indomo Shaft' },
  { name: ' Irawan Susanto', order: '21/0753', type: 'Indomo Cabin' },
  { name: ' Thio Margaret (Budi)', order: '21/0556', type: 'Domo Flex 2' },
  { name: ' Esther Indrawati', order: '21/0542', type: 'Domo Flex' },
  { name: ' Suryani', order: '22/355', type: 'Domo Flex' },
  { name: ' Jonatan Christie', order: '21/0973', type: 'Galactic' },
  { name: 'PT. Dwipar Loka Ayu (Aswin)', order: '21/0599', type: 'Domo Flex' },
  { name: ' Erastus Sabdono', order: 'Midio', type: 'Pve 37 midio' },
  { name: 'Dr. Ketut Ananda W. Sp. OG (Klinik Ananda, Sumba)', order: '21/0621', type: 'Indomo Cabin' },
  { name: 'Drg. Melanie Hendriaty', order: '21/0570', type: 'Domo Flex' },
  { name: 'Ir. Pudjo Prihadi Santoso', order: '21/0676', type: 'Domo Flex' },
  { name: ' Thakurdas Pursani W', order: '21/0740', type: 'Indomo Cabin' },
  { name: ' Jenny Lie', order: '21/0638', type: 'Domo Flex' },
  { name: ' Farida Anwari', order: '21/0885', type: 'Domo Flex' },
  { name: ' Syamsuardi Alpat (Sudirman)', order: '21/0745', type: 'Galactic' },
  { name: 'Ir. H. Awan Hermawan Purwadinata MT, Bandung', order: '21/0670', type: 'Domo Flex' },
  { name: ' Kusnaeny Mardjoeki (Dini), Surabaya', order: '22/0078', type: 'Domo Flex' },
  { name: ' Doddi Yoshida', order: '21/0669', type: 'Galactic' },
  { name: ' Junly Kodradjaya, Surabaya', order: '21/0886', type: 'Domo Flex' },
  { name: 'PT. Dwi Tunggal Putra (Michael)', order: '21/0962', type: 'Indomo Shaft' },
  { name: 'PT. Multilabindo Wahana (Hidayat)', order: '21/0877', type: 'Domo Flex' },
  { name: ' Felix Claudius Djimin (Greysia/ PT Kreasi Bintang Anugerah)', order: '21/0973', type: 'Galactic' },
  { name: 'PT. Barnaby Kontruksi Sejahtera (Hilda)', order: '21/0743', type: 'Indomo Cabin' },
  { name: ' Andy Indrajaya, ST', order: '21/0791', type: 'Domo Flex' },
  { name: ' Jico Maradona', order: '21/0812', type: 'Indomo Cabin' },
  { name: 'PT. Esa Pratama (Hafzah)', order: '21/0858', type: 'Domo Flex' },
  { name: 'PT. PT Duta Raya Cipta (Gulshan)', order: '21/0857', type: 'Domo Flex' },
  { name: ' Monica Irmawati Koswara', order: '21/0878', type: 'Domo Flex' },
  { name: ' Ary Indrajanto', order: '189', type: 'Pve 30 minio' },
  { name: 'Yayasan Perkembangan Anak Indonesia', order: '21/0903', type: 'Domo Flex' },
  { name: ' Suyendi', order: '2022/479', type: 'Domo Flex' },
  { name: ' M. Dodiek Tas\'an Wartono', order: '21/0994', type: 'Klasik' },
  { name: ' Natalina Surjani .S', order: '21/0916', type: 'Klasik' },
  { name: 'PT. Mitra Niaga Nusatama (Jelly)', order: '21/0922', type: 'Domo Flex 2' },
  { name: 'PT. Layton Enter Prise (Alicia)', order: '2022/486', type: 'Indomo Shaft' },
  { name: 'Yayasan Karya Kasih Mandiri (Sigit)', order: '21/0901', type: 'Klasik' },
  { name: ' Silvi Liswanda', order: '2022/857', type: 'Galactic' },
  { name: ' Suwanlia', order: '2022/473', type: 'Indomo' },
  { name: ' Sukirman Sutrisno', order: '2022/480', type: 'Galactic' },
  { name: ' Johan Suhalim', order: '21/1135', type: 'Domo Flex' },
  { name: ' Abednego Wibowo (Hartono)', order: '21/1081', type: 'Domo Flex' },
  { name: ' Peter Douglas Simpson', order: '22/856', type: 'Klasik' },
  { name: 'PT. Alfa Citra Karyatama (Dr. Hanifah)', order: '2022/493', type: 'Indomo Cabin' },
  { name: ' Grace Sintjie Soegiarto', order: 'Udah', type: 'Swift Lite' },
  { name: ' Jessica Ronaldy Tjahja (Sumitra)', order: '21/1067', type: 'Klasik' },
  { name: ' Linda Tjahja (Rivai)', order: '21/1068', type: 'Klasik' },
  { name: ' Leonard Wilson Lay', order: '230637', type: 'Domo Flex 2' },
  { name: 'PT. Semesta Andesit Perkasa (Budi) - PT. Vicindo Jaya Makmur', order: '21/1066', type: 'Indomo Cabin' },
  { name: ' Aisyah Zaelani (Nur)', order: '21/1146', type: 'Indomo Cabin' },
  { name: ' Edward', order: '22/107', type: 'Domo Flex 2' },
  { name: ' Handoko Sutjitro Surabaya', order: '21/1311', type: 'Klasik' },
  { name: 'Ir. Indra Prameswara, SE', order: '22/244', type: 'Klasik' },
  { name: ' Sugiono', order: '2022/961', type: 'Domo Flex 2' },
  { name: 'Ir. Tjahjono Tjandra', order: '21/1072', type: 'Domo Flex' },
  { name: ' Djohan Surya Adinata', order: '21/1147', type: 'Klasik' },
  { name: ' Taruna Wirano Lukman (Rully)', order: '21/1120', type: 'Indomo Cabin' },
  { name: ' Linda Irawati, Surabaya', order: '188', type: 'Pve 37 midio' },
  { name: 'PT. Hanny Rancangbangun Abadi', order: '21/1270', type: 'Domo Flex' },
  { name: ' Budi Surjono - Surabaya', order: '21/1219', type: 'Domo Flex' },
  { name: ' Darminto (Eko) / Felicia Nata', order: '230169', type: 'Domo Flex 2' },
  { name: ' Linda Irawati, Surabaya', order: '21/1289', type: 'Domo Flex 2' },
  { name: 'PT. Comfort Aire Aneka Teknik (Edy - Bintaro)', order: '21/1208', type: 'Klasik' },
  { name: ' Lucas Tetardy', order: '21/1313', type: 'Domo Flex 2' },
  { name: 'Ir. Hardy Tanjaya', order: '2022/504', type: 'Indomo Shaft' },
  { name: ' Anjar Reksa Permana (Ghani)', order: '2022/1085', type: 'Klasik' },
  { name: ' Machzum Baisa', order: '21/1226', type: 'Domo Flex 2' },
  { name: ' Riswandi (Heri Riswandi)-Kalimantan Selatan', order: '21/1271', type: 'Indomo Shaft' },
  { name: ' Titik Lestari, Bali', order: '2022/1328', type: 'Domo Flex 2' },
  { name: ' Sofian Atmadja Widjaja', order: '190', type: 'Pve 37 midio' },
  { name: ' Finiantri Sari MSC (Rieke)', order: '22/0008', type: 'Eco Flex' },
  { name: ' Yudi Prawira', order: '22/385', type: 'Klasik' },
  { name: ' Le Agus Felix', order: '2022/115', type: 'Indomo' },
  { name: ' Lucian Lewis', order: '2022/489', type: 'Domo Flex 2' },
  { name: ' Johannes Dhartanto Wibowo (Erman)', order: '2023/0447', type: 'Klasik' },
  { name: ' Susanti Lukman', order: '230052', type: 'Domo Flex 2' },
  { name: ' Rajulur Rakhman', order: '191', type: 'Pve 37 midio' },
  { name: 'PT. Jaya Konstruksi Manggala Pratama Tbk,', order: '22/0071', type: 'Indomo' },
  { name: 'PT. Wahana Sejahtera Langgeng Makmur ( Howard)', order: '22/97', type: 'Pve 37 midio' },
  { name: 'PT Sumberdaya Indonesia (Andi Yusuf - Mangga)', order: '192', type: 'Pve 37 midio' },
  { name: ' Buyung, Surabaya', order: '22/0074', type: 'Domo Flex 2' },
  { name: 'PT. Borlindo Mandiri Jaya (Hermon)', order: '22/243', type: 'Domo Flex 2' },
  { name: ' Stefanus Yulianto (Evan Malang)', order: '2022/472', type: 'Indomo Indoor' },
  { name: ' Lesly Irvan', order: '2022/506', type: 'Domo Flex 2' },
  { name: ' Winarizal', order: '2023/0176', type: 'Domo Flex 2' },
  { name: 'PT. Citra Sembilansatu ( Sahata Saolan Sirait)', order: '2022/322', type: 'Domo Flex 2' },
  { name: 'PT. Anugerah Aneka Industri (Surja)', order: '2022/214', type: 'Domo Flex 2' },
  { name: ' Bertha PT Andal Prima Adhitama Perkasa', order: '2022/491', type: 'Domo Flex 2' },
  { name: ' Ronny Cahyono (PT Usaha Logistik), Surabaya', order: '2022/571', type: 'Domo Flex 2' },
  { name: ' Heri Hariawan', order: '22/322', type: 'Klasik' },
  { name: 'Maikel Effendi - Ivanna', order: '2022/1046', type: 'Eco Flex' },
  { name: 'PT. Sri Buana Sumber Lestari ( Victor)-Surabaya', order: '2022/712', type: 'Eco Flex' },
  { name: ' Stefano Lorenzini', order: '', type: 'Domo Flex 2' },
  { name: 'PT. Samudra Wiwaca Kusuma ( Indah)', order: '2022/806', type: 'Eco Flex' },
  { name: ' Henny  Medan', order: '2022/598', type: 'Domo Flex 2' },
  { name: ' Hendra Surjaputra', order: '2022/387', type: '' },
  { name: ' Charly Sjaiful', order: '240908', type: 'Indomo Shaft - Indoor' },
  { name: 'PT Metrindo (Silvia) -Cirebon', order: '', type: 'Flex' },
  { name: 'Gereja bethany Indonesia (Davy Malada), Gresik', order: '2022/558', type: '' },
  { name: 'Apartemen Senayan Residence', order: '2022/592', type: 'Indomo Shaft' },
  { name: ' Pramudya Winarta (PT Ritme Indah)', order: '2022/591', type: 'DomoFlex 2' },
  { name: ' Peter Chandra-Medan', order: '2022/856', type: 'Galactic' },
  { name: ' Harry Yusuf', order: '2022/605', type: 'Indomo Cabin' },
  { name: ' Ricky Raymond Tjhie', order: '230633', type: 'DomoFlex 2 - All Glass' },
  { name: ' Alexander Tandra', order: '2022/689', type: 'Domoflex 2' },
  { name: 'PT. BUMI PURNAMA RAYA (Nanang)', order: '2022/1223', type: 'Domoflex 2' },
  { name: 'Junial', order: '2022/599', type: '' },
  { name: 'PT. Adimitra prima Lestari (pak Wily)', order: '2022/1128', type: 'Domoflex2- felx 3 sisi kaca' },
  { name: 'Martin Haendra Nata', order: '2023/831', type: '' },
  { name: 'PT. Griya Trada (Elias Hariwondo)-Jl. Bangka', order: '2022/749', type: 'Domoflex 2 - Indoor' },
  { name: ' Yanti Susanti', order: '2022/759', type: 'Galactic -Indoor' },
  { name: ' Suparli', order: '2022/1299', type: 'DomoFlex 2 - Indoor' },
  { name: 'PT. Harimas Tunggal Perkasa (Haryanto)', order: '2022/764', type: 'Indomo - Cabin Only' },
  { name: 'PT. Golden Bird Metro (Kresna)', order: '2022/749', type: 'DomoFlex 2 - Indoor' },
  { name: 'CV. Crown Hotel-Kalimantan Utara', order: '2022/822', type: 'DomoFlex 2 - Indoor' },
  { name: ' Nancy', order: '230133', type: 'Domoflex 2 - Outdoor' },
  { name: 'Arianto Haris- Medan', order: '2022/1108', type: 'Indomo - Cabin Only' },
  { name: 'PT. Mamoru (Wong Sin Yung)', order: '2022/1053', type: 'Indomo - Cabin Only' },
  { name: 'Budi Purnomo (Ibu Lolita)', order: '2022/1127', type: 'DomoFlex 2 - Flex Indoor' },
  { name: 'PT. Gemilang Abadi Santoso ( Unit1 )', order: '2022/973', type: 'Klasik' },
  { name: 'PT. Gemilang Abadi Santoso ( Unit2 )', order: '2022/974', type: '' },
  { name: 'Mr. Hengky Kasim', order: '2022/957', type: '' },
  { name: 'Mr. Listianingdiah Linggo (Inge)', order: '2022/1126', type: 'DOmoFlex 2 - Indoor' },
  { name: 'Mr. Sunata Tjiterosampurno', order: '2022/945', type: 'DomoFlex Outdoor' },
  { name: 'Mr. Anthony Prayogo', order: '260101', type: 'Galactic' },
  { name: 'Mr. Daniel Halim', order: '2022/946', type: 'DomoFlex2' },
  { name: 'Demo Lift', order: '2022/1080', type: 'Icon Lift' },
  { name: 'PT. Global Visi Bersama (Ronald)', order: '2022/1103', type: 'Eco Flex' },
  { name: 'Demo Lift', order: '2022/972', type: 'Icon Lift' },
  { name: 'Sasunto', order: '2022/1327', type: 'Indomo' },
  { name: 'Takdir Mattanete, Surabaya', order: '2022/1120', type: 'Domoflex2 - Ecoflex' },
  { name: 'Hendra Hermanto, Surabaya', order: '2022/1121', type: 'DomoFlex Outdoor' },
  { name: 'Andre Farnandes-MAXIO-Samarinda', order: 'PVE', type: 'PVE Maxio' },
  { name: 'Edison Jingga (Hans Jingga)', order: '23/0247', type: 'Domoflex II' },
  { name: 'Wahyu Tri Rahmanto', order: '2022/1129', type: 'Indomo' },
  { name: 'Syaiful Arifin (Abrian)/ Arnold', order: '2022/1172', type: 'Icon Lift' },
  { name: 'Tedy Irawan (Yanto)Palembang', order: '2022/1171', type: 'Indomo Cabin' },
  { name: 'Paulo Roberto Tio', order: '2023/0392', type: 'Domo Flex 2' },
  { name: 'Bambang Triambodo - Makassar', order: '2022/1230', type: 'DomoFlex2' },
  { name: 'Fonny Makassar', order: '2022/1225', type: 'DomoFlex2' },
  { name: 'PT Sambas Mineral Mining', order: 'PVE', type: 'PEV' },
  { name: 'PT Griya Selaras Pratama -Pondok Pinang-Klinik Rawamangun', order: '2022/1234', type: 'Indomo Cabin' },
  { name: 'PT Fajar Mitra Krida Abadi - Pak Amir', order: '2022/137', type: 'DomoFlex 2' },
  { name: 'Vonny- Loranty Noegroho, Yogjakarta', order: '2022/1267', type: 'Indomo Cabin' },
  { name: 'PT. Trishul Indo Sakti, Bali', order: '230594', type: 'Domoflex2' },
  { name: 'Herman Mintardja', order: '2022/1327', type: 'Indomo Cabin' },
  { name: 'Suyoto- Kebumen', order: '2022/1318', type: 'DomoFlex2' },
  { name: 'Dartomo M Sidik - Depok', order: '2023/065', type: 'Indomo Cabin' },
  { name: 'PT Handal Selaras Maternal-Green Lake', order: '2023/1', type: 'Indomo Cabin' },
  { name: 'Taufik Hidayat, Palembang', order: '', type: 'Indomo Cabin' },
  { name: 'CV Rahmie Group, Gresik', order: '230787', type: 'Indomo Cabin' },
  { name: 'PT. Sari Mas Permai, Wieke , Surabaya', order: '2022/1314', type: 'DomoFlex2' },
  { name: 'Lie Ly Tedjokoesoemo, Surabaya', order: '2022/1334', type: 'Galactic' },
  { name: 'Yayasan Onkologi Anak Indonesia', order: '2300/15', type: 'Indomo Cabin' },
  { name: 'Mohammad Aditya Putra-Eddy Sutrisno', order: '2023/16', type: 'DomoFlex2' },
  { name: 'John Marciano- Bali', order: '2023/14', type: 'DomoFlex2' },
  { name: 'Gunawan, Jambi', order: '230125', type: 'Domo Flex 2' },
  { name: 'Ike Liemawa', order: '', type: 'Indomo Cabin' },
  { name: 'Budi Darmawan, Surabaya', order: '250193', type: 'Domo Flex 2' },
  { name: 'Christine /Michelle / Ong Kim Lian', order: '230164', type: 'Indomo Cabin' },
  { name: 'PT Surya Semesta Permai', order: '2023/39', type: 'Domo Flex 2' },
  { name: 'Then Kon Pin', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Hans Jurgen ', order: '230559', type: 'Indomo Shaft' },
  { name: 'Bintang Jupiter', order: '230100', type: 'Indomo Cabin' },
  { name: ' Ahjiannor, Bupati Kal Teng , Barito', order: '230409', type: 'Domo Flex 2' },
  { name: 'Agung Subagiyo', order: '230613', type: 'Klasik' },
  { name: 'Drs Nurtjahjo Walujo Wibowo', order: '230210', type: 'Indomo Shaft' },
  { name: 'Ida Yulidina-Paso', order: '230303', type: 'Domo Flex 2' },
  { name: 'Liza Anita Sumarsono,Sonnie Pondok Kopi', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'PT. Bintang Surya Sejati Sukses/ Budi', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'PT. Semangat Mekar Jaya Mandiri-Felix Semarang', order: '230230', type: 'Domo Flex 2' },
  { name: 'Ida Sofia SH-Gadog', order: '230304', type: 'Domo Flex 2' },
  { name: 'Andri Pekanbaru', order: '2023/868', type: 'Indomo Cabin' },
  { name: 'Perseroan Komanditer Primatio (CV)', order: '2023/282', type: 'Domo Flex 2' },
  { name: 'Ronny Abril', order: '230611', type: 'Domo Flex 2' },
  { name: 'Elly Lestari - Mangga Besar', order: '230342', type: 'Domo Flex 2' },
  { name: 'Elly Lestari -Puncak - 1280x1335-Basement', order: '230340', type: 'Domo Flex 2' },
  { name: 'Elly Lestari - Puncak-1430 x 1335- Meja', order: '230339', type: 'Domo Flex 2' },
  { name: 'Martien Budiman ', order: 'SW112909', type: 'Swift Pro' },
  { name: 'Sugeng Mulyono', order: '230704', type: 'Indomo Cabin' },
  { name: 'Intan Cristina Chen', order: '2023/0430', type: 'Domo Flex 2' },
  { name: 'PT Andara Buana Mandiri (NOVIAN)', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'PT. Danatama Makmur Sekuritas', order: '2023/523', type: 'Domo Flex 2' },
  { name: 'PT Taktik Promo Sukses', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'PT. Trika Citriine Abiyasa (Bangun Raharja)', order: '230723', type: 'Indomo Cabin' },
  { name: 'FRANSNICO Bandung', order: '240514', type: 'Indomo Cabin' },
  { name: 'PT. Graha Artha Putra (Elizabeth)', order: 'CANCEL', type: 'Domo Flex 2' },
  { name: 'Dinas Pekerjaan Umum dan Penataan Ruang Kota Banjarbaru', order: '230483', type: 'Indomo Cabin' },
  { name: 'Dinas Pekerjaan Umum dan Penataan Ruang Kota Banjarbaru', order: '230484', type: 'Indomo Shaft' },
  { name: 'Subagia Handaja', order: '240055', type: 'Domo Flex 2' },
  { name: 'PT Batara Surya Semesta', order: '230511', type: 'Indomo Cabin' },
  { name: 'Sunarno', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'Julio - Yonanda Putra', order: 'SW104452', type: 'Swift Lite' },
  { name: 'RICKARDO MANGATAS', order: '230557', type: 'Galactic' },
  { name: 'Sudirman (Alex Kemayoran)', order: '230573', type: 'Klasik' },
  { name: 'Djohan Darmadi', order: '230615', type: 'Domo Flex 2' },
  { name: 'Bong Lie Fung (Ketsidy)', order: '230648', type: 'Klasik' },
  { name: 'Feffri Chaidir, SE', order: '230811', type: 'Domo Flex 2' },
  { name: 'PT Rukun Sahabat Senior', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Edwin Agung Saputra(Lydia PIK)', order: 'SW105802', type: 'Swift Pro' },
  { name: 'Djoko Dermanto', order: '230882', type: 'Indomo Cabin' },
  { name: 'Budiyanto (Kelapa Gading)', order: '250375', type: 'Domo Flex 2' },
  { name: 'Bintang Jupiter - Bali', order: '240608', type: 'Indomo Cabin' },
  { name: 'DRA. ARDINA SAFITRI', order: 'SW104862', type: 'Swift Pro' },
  { name: 'Inge Ineke Pieloor', order: '', type: 'Domo Flex 2' },
  { name: 'PT Duta Sarana Perkasa-Philips', order: '230720', type: 'Domo Flex 2' },
  { name: 'Eddy Laimancius (CV BajaSakti Trans Perkasa)', order: '230718', type: 'Domo Flex 2' },
  { name: 'Paulus SIA', order: 'Kanan', type: 'Stairlift' },
  { name: 'TH H Handayani Kiroyan', order: '230738', type: 'Domo Flex 2' },
  { name: 'Lionhart Group (Cambodia) Company Limited ', order: 'SW105022', type: 'Swift Pro' },
  { name: 'Andrew Sunaryo Gunawan', order: 'SW105187', type: 'Swift Pro' },
  { name: 'Christian Bisara', order: 'Kiri', type: 'Stairlift' },
  { name: 'Dian Putri', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'Mulya Darma Wangsa', order: 'Kanan', type: 'Stairlift' },
  { name: 'Yudi Bandung', order: '2023816', type: 'Indomo Cabin' },
  { name: 'Sunarto Rochili - Richard PIK', order: '250541', type: 'Indomo Cabin' },
  { name: 'Rizki Amelia', order: 'SW105494', type: 'Swift Pro' },
  { name: 'TIMMOTHY DANIEL RUSLIM (Lusi Summarecon)', order: '230892', type: 'Domo Flex 2' },
  { name: 'Yessi ( PT. Bangun Konstruksi Cemerlang)', order: 'SW105334', type: 'Swift Lite' },
  { name: 'Edoardus Ardianto', order: 'SW111196', type: 'Swift Pro' },
  { name: 'PT. Sumbersolusindo Hitech (Bpk Hardi)', order: 'Solo', type: 'Stairlift' },
  { name: 'Yuanita Pangestu-Fery BGV', order: 'SW117044', type: 'Swift Pro' },
  { name: 'Eddy Sutomo Santoko PT. CHARMINDO MITRA RAHARJA', order: 'SW105441', type: 'Swift Lite' },
  { name: 'MOHAN VASWANI-Malang', order: '230877', type: 'Domo Flex 2' },
  { name: 'Judi Setiawan', order: 'SW105607', type: 'Swift Pro' },
  { name: 'Benny Limanto - PIK SKYDANCE', order: '230929', type: 'Indomo Shaft' },
  { name: 'PT Dwibina Prima Patra', order: 'SW105648', type: 'Swift Lite' },
  { name: 'DODANI HASSOMAL KU (Hashu)', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Dr. Ham Sigit Budiman', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Christopher Burke - Bali', order: 'Stairlift', type: 'Stairlift' },
  { name: 'ALDO SEBASTIAN SUH', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'PT Octa Utama (Ifan)', order: 'PVE', type: 'Pve 37 midio' },
  { name: 'Eddie Darma Salim', order: '240135', type: 'Indomo Cabin' },
  { name: 'Eddie Darma Salim', order: '240136', type: 'Indomo Cabin' },
  { name: 'CV Lautan Berkat Kontruksi-Ms Lisiani-Banyuwangi', order: '240173', type: 'Domo Flex 2' },
  { name: 'Sutiono Sumarno (Ayen)', order: '240137', type: 'Domo Flex 2' },
  { name: 'PT. Nabil Putra Jabal (Budhe-Panglima Polim)', order: 'SW105905', type: 'Swift Lite' },
  { name: 'Awie Medan-Suwandi', order: 'SW115577', type: 'Swift Pro' },
  { name: 'PT Primaperkasa Intiswadaya (Prayogo)', order: 'SW105827', type: 'Swift Pro' },
  { name: 'PT. Maju Makmur Utomo Sunter', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT. Maju Makmur Utomo Sunter', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT. Maju Makmur Utomo Sunter', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT Implementasi Teknologi Indonesia (Arief Sofian)', order: 'SW106057', type: 'Swift Pro' },
  { name: 'Djohan Junus Tamsir-Rancamaya', order: '240056', type: 'Domo Flex 2' },
  { name: 'Bpk Gianto Trisno', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT Bumi Bangun Perkasa - Budi BGV', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT. Binayasa Putrabatara', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Prof Dr. Maya Devita Lokanata Sp D.V.E', order: 'SW106660', type: 'Swift Pro' },
  { name: 'Windri Lestari Rusli', order: 'PVE/INDN/009/23-24', type: 'Pve 37 midio' },
  { name: 'Monica Pranata', order: 'SW106708', type: 'Swift Lite' },
  { name: 'PT. First Marine Seafoods', order: 'PVE/INDN/010/23-24', type: 'Pve 37 midio' },
  { name: 'Jaman (Ferry)', order: '240434', type: 'Indomo Shaft' },
  { name: 'Jennifer (PT Karya Anugerah)', order: 'PVE/INDN/011/23-24', type: 'Pve 37 midio' },
  { name: 'Norman S Joesoef (Brawijaya)', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT. Prasetya Mulya Abadi (Setyadi)', order: '240373', type: 'Indomo Cabin' },
  { name: 'Katherina Sulastianus (Renata)', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT Kuala Pangan (Arno)', order: '240193', type: 'Domo Flex 2' },
  { name: 'Andi Azhar Cakra', order: '240439', type: 'Indomo Cabin' },
  { name: 'Mr. Jorge Serrano-Timor Leste', order: 'SW107100', type: 'Swift Lite' },
  { name: 'Linas - Bandung', order: 'SW110266', type: 'Swift Lite' },
  { name: 'Hargono, Drs-Banjarmasin', order: 'SW111197', type: 'Swift Pro' },
  { name: 'PT Semesta Selaras', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT Renata Global Supply', order: 'SW106823', type: 'Swift Pro' },
  { name: 'Robin Zulkarnain', order: 'SW111717', type: 'Swift Lite' },
  { name: 'Rita Sriyanti - Bandung', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Sri Ayu Lestari', order: 'SW107230', type: 'Swift Pro' },
  { name: 'PT Intitirta Makmur', order: 'PVE/INDN/012/24-25', type: 'Pve 37 midio' },
  { name: 'UU Sutrisno - Bandung ', order: '240244', type: 'Domo Flex 2' },
  { name: 'Retna Bintarni Oen', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Yesaya Milano - Situbondo', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT. Trimitra Alkabes Mandiri -BALI Andreas Hartono Gani', order: 'PVE/INDN/013/24-25', type: 'Pve 37 midio' },
  { name: 'PT. Swi Jetty Nusantara-Makassar', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Janne Idris', order: '240432', type: 'Domo Flex 2' },
  { name: 'Like Meilani - Surabaya', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Bpk Awong Hidjaya', order: '240339', type: 'Domo Flex 2' },
  { name: 'Rudy Kusmulyadi (Nancy Kelapa Gading)', order: 'SW107304', type: 'Swift Lite' },
  { name: 'Dev - Pasar Baru', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT Jaya Kusuma Sarana', order: 'SW108002', type: 'Swift Pro' },
  { name: 'DRS. Ricky Irawan', order: 'SW112895', type: 'Swift Pro' },
  { name: 'Tinus Thepadjaya', order: 'SW108015', type: 'Swift Lite' },
  { name: 'PT Hage Primadi Konstruksi (Ms Priyanka)', order: '240380', type: 'Indomo Cabin' },
  { name: 'PT Pulau Intan (Yashinta Menteng)', order: 'SW108102', type: 'Swift Pro' },
  { name: 'PT Hurama Anugerah Berjaya - Robin', order: 'SW108260', type: 'Swift Lite' },
  { name: 'PT Hurama Anugerah Berjaya - Vonny', order: '240429', type: 'Domo Flex 2' },
  { name: 'R. Susy Nurhayati - Cirebon', order: '240853', type: 'Indomo Cabin' },
  { name: 'Hasun Lokito-Medan', order: '240538', type: 'Domo Flex 2' },
  { name: 'PT PANEN BERKAT PROPERTINDO-Handoko', order: '250740', type: 'Icon Lift' },
  { name: 'Urban Art (Junita-Chandra)', order: 'SW108711', type: 'Swift Pro' },
  { name: 'PT. Bima Asri Intermitra', order: '240476', type: 'Domo Flex 2' },
  { name: 'Untung Basuki-Maria - Semarang', order: '', type: 'Domo Flex 2' },
  { name: 'Dr. Pengky Pranata-Ms Yulia Sentul', order: 'PVE/INDN/006/24-25', type: 'Pve 37 midio' },
  { name: 'Budi Darmawan, Surabaya', order: '250194', type: 'Domo Flex 2' },
  { name: 'Morgan Arisona', order: 'SW111422', type: 'Swift Pro' },
  { name: 'Hendra Jaya MBA', order: '240475', type: 'Domo Flex 2' },
  { name: 'Budi Nuvrizal-Vania', order: '240528', type: 'Domo Flex 2' },
  { name: 'Arif Suhartojo', order: '240477', type: 'Domo Flex 2' },
  { name: 'PT. TURANGGA KERTAKENCANA-Inne', order: '240515', type: 'Domo Flex 2' },
  { name: 'Eastland Development', order: 'PVE/INDN/007/24-25', type: 'Pve 37 midio' },
  { name: 'PT CERIA NUGRAHA ADITAMA  - Kolaka', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Yay Budi Siswa  Mr. Pater R.B. Leonardus Evert Bambang Winandoko, SJ', order: 'SW108740', type: 'Swift Lite' },
  { name: 'Mr. Oendarno Sinatra', order: '250238', type: 'Domo Flex 2' },
  { name: 'H. Mahmud Fauzi Nasir-Masjid Nurul Amal', order: 'SW108858', type: 'Swift Lite' },
  { name: 'PT Permata Sarana Husada ( Dr Novi )', order: '240539', type: 'Domo Flex 2' },
  { name: 'Aspal Polimer Emulsindo - Ibu Nissa Bintaro', order: '240760', type: 'Domo Flex 2' },
  { name: 'Heni Setiawati', order: '240526', type: 'Domo Flex 2' },
  { name: 'PT Persada Dua Rajawali (Will Kramat Sentiong)', order: '240737', type: 'Indomo Cabin' },
  { name: 'Suharto Hadju- Adhyaksa Dault', order: 'SW105778', type: 'Swift Pro' },
  { name: ' KSO ADHI-CEC   ', order: 'SW107327', type: 'Swift Lite' },
  { name: 'JUJUN TJAKRALAKSAN-Bandung', order: 'SW109242', type: 'Swift Pro' },
  { name: 'Dr. Eddy Widodo', order: 'SW109291', type: 'Swift Lite' },
  { name: 'Vera Josef Utamin', order: '240607', type: 'Domo Flex 2' },
  { name: 'PT Utama Sinergi Persada-Heryanto- Surabaya', order: '240636', type: 'Domo Flex 2' },
  { name: 'Fatehchand Daulatram Stairlift', order: 'Stairlift', type: 'Stairlift' },
  { name: 'JERRY TANDYA  ', order: '', type: 'Swift Pro' },
  { name: 'Mellyanthy-Budiyanto Intercon', order: 'SW112261', type: 'Swift Lite' },
  { name: 'Hartono (Ano)', order: 'Stairlift', type: 'Stairlift' },
  { name: 'PT. Karya Akbar Mandiri (Anggia)', order: 'SW110337', type: 'Swift Lite' },
  { name: 'Andy Santoso', order: 'SW110295', type: 'Swift Lite' },
  { name: 'GRACIA PELITA ABADI-Juan Carlos -Gerry Pulo Gebang', order: '250435', type: 'Indomo Cabin' },
  { name: 'Esmaldiansyah', order: 'SW110460', type: 'Swift Lite' },
  { name: 'PT. Hatsonsurya Electric (Hariyanto)-Surabaya', order: 'SW110356', type: 'Swift Pro' },
  { name: 'Lionhart Group (Cambodia) Company Limited ', order: 'SW111263', type: 'Swift Pro' },
  { name: 'Lionhart Group (Cambodia) Company Limited ', order: 'SW109667', type: 'Swift Pro' },
  { name: 'Priska', order: 'SW110357', type: 'Swift Lite' },
  { name: 'PT Fukuyama Genki Indonesia-Jason', order: 'SW110533', type: 'Swift Lite' },
  { name: 'Gracia Maria Widjajanti H', order: 'SW110698', type: 'Swift Lite' },
  { name: 'Silfanni Yanto-BSD', order: 'SW110684', type: 'Swift Lite' },
  { name: 'PT. Gagah Putera Satria-Dharma ', order: 'SW109596', type: 'Swift Lite' },
  { name: 'Aripin Lie-Pontianak', order: '250239', type: 'Indomo Cabin' },
  { name: 'Tutiawati Subagio', order: 'SW110912', type: 'Swift Lite' },
  { name: 'Suwanto - PVE Kantor Artha Gading', order: 'PVE/INDN/008/24-25', type: 'Pve 37 midio' },
  { name: 'PT Shape Up Indonesia- Ibu Lany =MOI', order: '240735', type: 'Indomo Cabin' },
  { name: 'Yulianah Yulianah - Julius', order: 'SW110975', type: 'Swift Lite' },
  { name: 'Adam Habibie -Surabaya', order: '250693', type: 'Klasik' },
  { name: 'Zakaria - Sby', order: '260440', type: 'Icon Lift' },
  { name: 'Alfan Koshin-Suriani', order: 'SW110472', type: 'Swift Pro' },
  { name: 'Janni BSD', order: 'SW111072', type: 'Swift Pro' },
  { name: 'PT Malcolm Indonesia - Kebumen Menteng-Nining', order: '250130', type: 'Domo Flex 2' },
  { name: 'Lo Herry', order: 'SW111110', type: 'Swift Lite' },
  { name: 'Gunawan Priatna', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Dr Julianus Sloan Soan Petronella', order: 'SW118935', type: 'Swift Lite' },
  { name: 'Harsono Smart Clinic', order: 'SW111010', type: 'Swift Lite' },
  { name: 'Claudius Marcus', order: 'Pending', type: 'Pve 37 midio' },
  { name: 'Elsye Augustina Lie', order: 'SW110925', type: 'Swift Lite' },
  { name: 'PT PESONA DEWI SRI- Candice - Bali -Villa Dewi Sri blok 1A', order: '250240', type: 'Domo Flex 2' },
  { name: 'PT PESONA DEWI SRI- Candice - Bali -Villa Dewi Sri blok 1B', order: '250241', type: 'Domo Flex 2' },
  { name: 'PT PESONA DEWI SRI- Candice - Bali -Villa Dewi Sri blok 2A', order: '250242', type: 'Domo Flex 2' },
  { name: 'PT PESONA DEWI SRI- Candice - Bali-Villa Dewi Sri blok 2B', order: '250243', type: 'Domo Flex 2' },
  { name: 'Goey Sioe Giok (Bpk Astan) Sunter', order: 'SW111445', type: 'Swift Lite' },
  { name: 'Veronica Kadrianto (Vees)', order: 'SW113528', type: 'Swift Pro' },
  { name: 'Bpk Harijanto Adipratomo', order: 'Curve Cognac', type: 'Stairlift' },
  { name: 'PT. Nindya Karya (IKN)', order: 'SW109439', type: 'Swift Lite' },
  { name: 'CV Ozone Friendly (Johansen Ngian)', order: 'SW111988', type: 'Swift Lite' },
  { name: 'Indra Usmansjah Bakrie', order: 'SW111717', type: 'Swift Lite' },
  { name: 'PT. Fajar Jasagraha Utama (Grace Irawati)', order: '250176', type: 'Domo Flex 2' },
  { name: 'PT. Total Bangun Persada Tbk-Batam', order: 'Stairlift Left Cognac', type: 'Stairlift' },
  { name: 'Mus Abdullah - Pandaan Jawa Timur', order: 'Straight Left Sand', type: 'Stairlift' },
  { name: 'Sofiani Iskandarsyah (Ilman)', order: '250023', type: 'Indomo Cabin' },
  { name: 'Jacobus Irawan', order: 'SW112229', type: 'Swift Pro' },
  { name: 'Kinanti Purnamasari-Lucy Ciputat Klinik', order: '250472', type: 'Domo Flex' },
  { name: 'Clara Fransisca Darniaty', order: 'SW112370', type: 'Swift Lite' },
  { name: 'PT Wira Properti (Andy)', order: 'Stairlift Left', type: 'Stairlift' },
  { name: 'Burhanudin (Ebdesk Teknologi- Muhammad Iqbal)', order: 'SW112686', type: 'Swift Lite' },
  { name: 'Yurma Welly (Moey Jaya Abadi)', order: '250483', type: 'Indomo Cabin' },
  { name: 'Siauw Santhi', order: '250256', type: 'Indomo Cabin' },
  { name: 'Mus Abdullah - Pandaan Jawa Timur', order: '250195', type: 'Domo Flex 2' },
  { name: 'Bright Future Rocks (Sergei)', order: '260330', type: 'Indomo Cabin' },
  { name: 'Kumar', order: 'Stairlift', type: 'Stairlift' },
  { name: 'ANDRI SUWARDI (Hendra)', order: 'SW113510', type: 'Swift Lite' },
  { name: 'Duma Riris Silalahi', order: '', type: 'Swift Pro' },
  { name: 'PT. Lego Merah Indonesia (Vian BSD)', order: '250431', type: 'Domo Flex 2' },
  { name: 'Deepak R Chugani', order: 'SW111438', type: 'Swift Pro' },
  { name: 'PT. PRIAMANAYA ENERGI (Rasyad)', order: 'SW112680', type: 'Swift Pro' },
  { name: 'Firman Rusli', order: 'SW113048', type: 'Swift Lite' },
  { name: 'Djie Anna', order: 'Stairlift Curved Left Sand', type: 'Stairlift' },
  { name: 'Jorge Serrano', order: 'SW113663', type: 'Swift Lite' },
  { name: 'ANDRI SUWARDI (Hendra)', order: '', type: 'Swift Pro' },
  { name: 'PT. Kendali Bumi Sejahtera', order: 'SW111545', type: 'Swift Pro' },
  { name: 'Hendra Putra Villa Umalas Bali', order: 'SW114310', type: 'Swift Pro' },
  { name: 'Perseroan Terbatas - Badan Joenoes Ikamulya ', order: 'SW116075', type: 'Swift Pro' },
  { name: 'Bpk Breav Sugiarto Villa Umalas Bali', order: 'SW114309', type: 'Swift Pro' },
  { name: 'Nasir', order: '', type: 'Swift Pro' },
  { name: 'Feby Joko', order: 'UP-004959', type: 'Stairlift' },
  { name: 'Djohan Lawer -  Indayanti Pekanbaru', order: 'SW114366', type: 'Swift Pro' },
  { name: 'Fery Godjali', order: 'SW114388', type: 'Swift Lite' },
  { name: 'Yunarto (Toni Bali) ', order: '250685', type: 'Domo Flex 2' },
  { name: 'PT Royal Bali Hai', order: '250461', type: 'Domo Flex 2' },
  { name: 'PT. BINTAN LAGOON RESORT', order: 'SW114620', type: 'Swift Lite' },
  { name: 'Rika Pauzie', order: '250433', type: 'Domo Flex 2' },
  { name: 'Jandi Djuhari - Bandung-Henru', order: '250499', type: 'Domo Flex 2' },
  { name: 'IR Prihadiyanto', order: '26/0188', type: 'Indomo Cabin' },
  { name: 'Yuni Handaya', order: '26/0407', type: 'Domo Flex 2' },
  { name: 'PT Supranusa Sindata (Christian - Stephen Yie)', order: '260540', type: 'Indomo Cabin' },
  { name: 'Eva Pratiwi', order: '250855', type: 'Domo Flex 2' },
  { name: 'AZKA BELLIZA Pak Abdull Rangkas Bitung (ibu Hasnuryani) Dian', order: '250670', type: 'Indomo Cabin' },
  { name: 'Ricky Constantyn Sondakh', order: '250665', type: 'Domo Flex 2' },
  { name: 'Demo Unit Domo2Flex', order: '250295', type: 'Domo Flex 2' },
  { name: 'Endro', order: 'SW114592', type: 'Swift Lite' },
  { name: 'Etty Totong', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Praditanto Rizabar', order: '', type: 'Swift Lite' },
  { name: 'PT Bintan Lagoon Resort-Easy Plat', order: '250592', type: 'Domo Flex 2' },
  { name: 'Budhi Pratama Kurniawan', order: 'Stairlift Left Curve Cognac', type: 'Stairlift' },
  { name: 'Haris Faisal', order: 'DROPPED CASE', type: 'Swift Pro' },
  { name: 'Rukun Sahabat Senior (Pak Herman)', order: 'PVE 37', type: 'Pve 37 midio' },
  { name: 'PT Alien Bangun Nusantara', order: 'SW114449', type: 'Swift Pro' },
  { name: 'PT Adis Dimension Footware (Balaraja)', order: '250705', type: 'Domo Flex 2' },
  { name: 'PT. Gagah Putera Satria-Sandy', order: 'SW110692', type: 'Swift Pro' },
  { name: 'Edwin EkaPutra Halim', order: '250623', type: 'Domo Flex 2' },
  { name: 'Gunawan/KusWendy Janur Kelapa Gading/Nike', order: 'SW115748', type: 'Swift Pro' },
  { name: 'Etin Sumarni', order: 'Left Cognac', type: 'Stairlift' },
  { name: 'Rumah Inovasi Sosial Ekologi-for Anomali Caffee', order: 'SW115882', type: 'Swift Lite' },
  { name: 'Yonato (Lampung)', order: 'SW116027', type: 'Swift Pro' },
  { name: 'Alice Tanizar', order: 'SW115911', type: 'Swift Pro' },
  { name: 'Gatot Hidayat', order: '250741', type: 'Domo Flex 2' },
  { name: 'Hendry Wijaya', order: '', type: 'Swift Pro' },
  { name: 'PT BINA MITRA ARTHA-Jakarta Timur', order: 'DROPPED CASE', type: 'Swift Lite' },
  { name: 'PT BINA MITRA ARTHA- Jambi', order: 'DROPPED CASE', type: 'Domo Flex 2' },
  { name: 'Rahmadia Diwala Putri Bekasi', order: 'SW116351', type: 'Swift Pro' },
  { name: 'PT. Paris Jaya (Pak Charlie- Ambon)', order: '', type: 'Swift Pro' },
  { name: 'PT Karya Perdana Baru', order: 'SW116075', type: 'Swift Pro' },
  { name: 'HERLINE EUNIKE DAV/Natanael Walker Bunga Piga/GPDI Greenlake', order: 'SW116634', type: 'Swift Pro' },
  { name: 'WINSEN KOESWANTO-Surabaya', order: 'SW116573', type: 'Swift Lite' },
  { name: 'Faesal Adli Samvara (Feisal)', order: 'SW116554', type: 'Swift Lite' },
  { name: 'Stevanus Rahardja ', order: 'SW116520', type: 'Swift Pro' },
  { name: 'Lindawati Pola', order: 'SW116690', type: 'Swift Pro' },
  { name: 'Ir Soni/ Russel/ Ibu Enni', order: 'SW116692', type: 'Swift Pro' },
  { name: 'Bpk Halim Sudrajat', order: '250866', type: 'Indomo Cabin' },
  { name: 'Annes Suryawinata-PIK', order: 'SW116713', type: 'Swift Lite' },
  { name: 'Oktavianti Halim (Frans) ', order: '', type: 'Swift Lite' },
  { name: 'Cherry Cynthia ', order: '260036', type: 'Domo Flex 2' },
  { name: 'Dr Syifa Mustika-Pandaan ', order: 'SW116837', type: 'Swift Lite' },
  { name: 'PT Jeda Property Indonesia - Bali', order: '25/0983', type: 'Indomo Cabin' },
  { name: 'Muskaan Anil Bahirwani ', order: 'Curve', type: 'Stairlift' },
  { name: 'Azis', order: 'Curve', type: 'Stairlift' },
  { name: 'Bong Lhan Lan -Ibu Amy Liong - Kelapa Gading', order: '', type: 'Swift Pro' },
  { name: 'Hasun Lokito-Medan', order: '250969', type: 'Domo Flex 2' },
  { name: 'PT Sandra Jaya Murni', order: '240515', type: 'Domo Flex 2' },
  { name: 'Muhammad Riza Husn', order: '2 Stairlift', type: 'Stairlift' },
  { name: 'Dadam Kamil', order: '250541', type: 'Indomo Cabin' },
  { name: 'Karolin Margret Natasa', order: 'Stairlift', type: 'Stairlift' },
  { name: 'Jefry Wijaya', order: 'SW117439', type: 'Swift Pro' },
  { name: 'Matthew ', order: '2nd Stairlift', type: 'Stairlift' },
  { name: 'Lars Peter Nielsen', order: 'Curve', type: 'Stairlift' },
  { name: 'Ang Hie Hap /Yenni', order: '26/0239', type: 'Domo Flex 2' },
  { name: 'PT Pelita Insan Cendika', order: '', type: 'Swift Pro' },
  { name: 'Demo or Stock Lift Chroma', order: '250996', type: 'Domo Flex 2' },
  { name: 'Simplift Ready Stock', order: '260019', type: 'Simplift' },
  { name: 'Eddy Budiman (Yossie)', order: 'SW114845', type: 'Swift Lite' },
  { name: 'Sarah S Darmawan', order: 'SW117642', type: 'Swift Pro' },
  { name: 'Krisdianto Lesmana', order: '', type: 'Swift Pro' },
  { name: 'Jusuf Kiesworo', order: 'Curve', type: 'Stairlift' },
  { name: 'Dianto', order: 'Curve', type: 'Stairlift' },
  { name: 'PT Dwi Tunggal Ekatama/Stefan', order: 'Left Sand', type: 'Stairlift' },
  { name: 'Felicita Jetty S Sadeli-BSD', order: '', type: 'Indomo Cabin' },
  { name: 'PT. RAYINDO TOROPMA ABADI-RISKA', order: '260333', type: 'Indomo Cabin' },
  { name: 'PT CIME GLOBAL TEKNOLOGI-DEPOK', order: 'SW117909', type: 'Swift Pro' },
  { name: 'PT. Pulau Hamparan Pudi', order: 'SW117955', type: 'Swift Lite' },
  { name: 'Hamadi Widjaja', order: 'SW117755', type: 'Swift Lite' },
  { name: ' Dr. H. Eddy Army Zubair, SH. MH.', order: 'SW118281', type: 'Swift Lite' },
  { name: 'PT. Delta Cipta Sinergi', order: 'Handicare', type: 'Handicare' },
  { name: 'Ernia-REDBERRY INDONESIA', order: 'SW119469', type: 'Swift Lite' },
  { name: 'Oki - Milla Pili Oktrianto Bagus R Kottama', order: 'Curve', type: 'Stairlift' },
  { name: 'Swift Lite STOCK', order: 'SW118302', type: 'Swift Lite' },
  { name: 'Herman Tantriady', order: 'Curve', type: 'Stairlift' },
  { name: 'John Sunarmo', order: 'Curve', type: 'Stairlift' },
  { name: 'PT.Tiga Puteri Pertiwi Anggi Pancoran', order: '260466', type: 'Domo Flex 2' },
  { name: ' Sugeng Suharyono', order: 'PVE MIDIO', type: 'Pve 37 midio' },
  { name: 'Johnny Sentul', order: '260425', type: 'Domo Flex 2' },
  { name: 'PT Pusaka Marmer (Pak Hendrik - Surya Paloh Kapal)', order: 'SW118464', type: 'Swift Pro' },
  { name: 'PT. LANCARJAYA MANDIRI ABADI-MUSTARNO', order: '260371', type: 'Simplift' },
  { name: 'BPK WISHNU HANDOYONO', order: '26/0332', type: 'Domo Flex 2' },
  { name: 'Tandi Suherman-Pekanbaru--CV SAMPANTAO', order: 'Curve', type: 'Stairlift' },
  { name: 'Dr Frieda Hartono', order: 'SW119026', type: 'Swift Pro' },
  { name: 'David Kosmo', order: 'CURVE', type: 'Stairlift' },
  { name: 'PT Rovin Jaya (Roberto)-NTT Flores', order: 'Curve', type: 'Stairlift' },
  { name: 'Rangga (Sarie ) ', order: '260511', type: 'Domo Flex 2' },
  { name: 'LANY Kusumadewi Santoso', order: 'Straight Handicare', type: 'Stairlift' },
  { name: 'PT TOTALINDO OPTIAMA PRAGIA', order: 'Curve', type: 'Stairlift' },
  { name: 'PT TOTALINDO OPTIAMA PRAGIA', order: 'Curve', type: 'Stairlift' },
  { name: 'Daniel Julian Tang (Tonic Tangkau SH)', order: 'SW119590', type: 'Swift Lite' },
  { name: 'Au Chak Man Raymond', order: 'SW119586', type: 'Swift Pro' },
  { name: 'PT Intikarya Bangun Mandiri (Supiandi)', order: '260439', type: 'Domo Flex 2' },
  { name: 'Widyani Sutedjo', order: '', type: 'Indomo Cabin' },
  { name: 'Hendri Gunawan- Palembang', order: '', type: 'Domo Flex 2' },
  { name: 'Lia Femiliawati Dr', order: 'SW120111', type: 'Swift Pro' },
  { name: 'Rijanto', order: '', type: 'Swift Lite' },
  { name: 'ADE MANADO - ABNER DALERU-RANGGA', order: '', type: 'Swift Pro' },
  { name: 'Hendry Khendy', order: 'BAST', type: 'Stairlift' },
  { name: 'Johanes Susanto D', order: 'BAST', type: 'Stairlift' },
  { name: 'Johanes Susanto D', order: 'BAST', type: 'Stairlift' },
  { name: 'Hendry Khendy', order: 'BAST', type: 'Stairlift' },
  { name: 'Lianawati Setiono', order: 'BAST', type: 'Stairlift' },
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

  // Group RECORDS by normalized name, preserving the order they appear in the sheet.
  const groups = new Map();
  RECORDS.forEach((rec) => {
    const key = norm(rec.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(rec);
  });

  // Pull every existing doc that could match, grouped the same way, each
  // group sorted by createdAt descending — the same order addCustomerListOrdered.js
  // used when it originally inserted duplicate names.
  const allDocs = await Maintenance.find({}, { customerName: 1, serialNumber: 1, unitType: 1, createdAt: 1 }).sort({ createdAt: -1 });
  const dbGroups = new Map();
  allDocs.forEach((doc) => {
    const key = norm(doc.customerName);
    if (!dbGroups.has(key)) dbGroups.set(key, []);
    dbGroups.get(key).push(doc);
  });

  const updates = [];       // { doc, order, type, name }
  const noMatch = [];       // records with no matching DB doc at all
  const countMismatch = []; // groups where sheet count !== db count (still updates what it can, in order)
  const noValue = [];       // records where both order and type are blank in the sheet — nothing to set

  groups.forEach((recs, key) => {
    const dbDocs = dbGroups.get(key) || [];
    if (dbDocs.length === 0) {
      recs.forEach(r => noMatch.push(r));
      return;
    }
    if (dbDocs.length !== recs.length) {
      countMismatch.push({ name: recs[0].name, sheetCount: recs.length, dbCount: dbDocs.length });
    }
    recs.forEach((rec, i) => {
      const doc = dbDocs[i];
      if (!doc) { noMatch.push(rec); return; } // more sheet rows than db docs for this name
      if (!rec.order && !rec.type) { noValue.push(rec); return; }
      updates.push({ doc, order: rec.order, type: rec.type, name: rec.name });
    });
  });

  console.log(`\nTotal rows in sheet: ${RECORDS.length}`);
  console.log(`Matched to an existing customer (will update): ${updates.length}`);
  console.log(`No matching customer found in DB (skipped): ${noMatch.length}`);
  console.log(`Sheet had no order/type value to set (skipped): ${noValue.length}`);
  console.log(`Name groups where sheet count != DB doc count: ${countMismatch.length}`);

  if (noMatch.length > 0) {
    console.log('\n--- No DB match ---');
    noMatch.forEach(r => console.log('  •', r.name, '| order:', r.order || '(none)', '| type:', r.type || '(none)'));
  }

  if (countMismatch.length > 0) {
    console.log('\n--- Count mismatches (sheet rows vs DB docs sharing this name) ---');
    countMismatch.forEach(m => console.log(`  • "${m.name}" — sheet: ${m.sheetCount}, DB: ${m.dbCount}`));
  }

  console.log(`\n${confirm ? 'UPDATING' : 'WOULD UPDATE (dry-run)'} — ${updates.length} customer(s):`);
  updates.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.name} -> serialNumber: "${u.order}", unitType: "${u.type}"`);
  });

  if (confirm && updates.length > 0) {
    let done = 0;
    for (const u of updates) {
      const setFields = {};
      if (u.order) setFields.serialNumber = u.order;
      if (u.type) setFields.unitType = u.type;
      await Maintenance.updateOne({ _id: u.doc._id }, { $set: setFields });
      done++;
    }
    console.log(`\nUpdated ${done} customer records.`);
  } else if (!confirm) {
    console.log('\nDry-run only — nothing was updated. Re-run with --confirm to actually apply these.');
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err.message);
  process.exit(1);
});