import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const [{ default: dbConnect }, { default: HealthIntake }, { default: FutureCustomer }] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/HealthIntake.js'),
  import('../lib/models/FutureCustomer.js'),
]);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  const input = String(value || '').trim();
  if (!input) return '';
  const keepPlus = input.startsWith('+');
  const digits = input.replace(/\D/g, '');
  return keepPlus ? `+${digits}` : digits;
}

function buildDedupKey(record) {
  if (record.email) return `email:${record.email}`;
  if (record.phone) return `phone:${record.phone}`;
  return `name:${String(record.name || '').toLowerCase()}`;
}

const SOURCE = 'legacy-members-2026-04-09-manual';

const RECORDS = [
  {
    name: 'Karen Yule',
    phone: '027 462 5565',
    email: 'stormlilly101@gmail.com',
    notes: 'Health: 偶尔使用护腕 (wrist bands); Emergency: Hermann 0274 464 564; Dianne McConnell 0210 299 5838; Date: 12/03/2025',
  },
  {
    name: 'Yvette Kennedy',
    phone: '021 293 6934',
    email: 'yvetteandscott@xtra.co.nz',
    notes: 'Emergency: Scott Kennedy 06 354 0312; Date: 06/03/2025',
  },
  {
    name: 'Sally Darragh',
    phone: '0272 829 790',
    email: 'sallydarragh20@gmail.com',
    notes: 'Health: 易出现颈部疼痛 (sore neck); Emergency: Andrew Watt 021 2277 108; Date: 31/07/2025',
  },
  {
    name: 'Racwyn Moar',
    phone: '0276982231',
    email: 'g.r.moar@inspire.net.nz',
    notes: 'Health: 无; Emergency: Husband 027 636 5446; Date: 05/03/2025; Name may need confirmation (possibly Raewyn Moar).',
  },
  {
    name: 'Linda Shannon',
    phone: '0274 795 562',
    email: 'shannon@inspire.net.nz',
    notes: 'Health: Arthritic knees (关节炎膝盖); Emergency: Tom 0274 34 8700; Date: 26/03/2025',
  },
  {
    name: 'Ashling Ellis',
    phone: '022 036 3419',
    email: 'ashling.ellis26@gmail.com',
    notes: 'Health: 无健康问题; Emergency: Yuri McKenna 022 066 3824; Date: 25/02/2025',
  },
  {
    name: 'Brenda Sinclair Black',
    phone: '021 069 0469',
    email: 'brendasblack@icloud.com',
    notes: 'Health: 无; Emergency: Iain (Spouse) 021 246 0298; Date: 26/02/2025',
  },
  {
    name: 'Bruce Philp (?)',
    phone: '021 062 4566',
    email: 'philpotmc@gmail.com',
    notes: 'Health: 无; Emergency: unnamed 062765120; Date: 17/03/2025; Name uncertain in source.',
  },
  {
    name: 'Carey Churton',
    phone: '021 235 9217',
    email: 'careychurton@hotmail.com',
    notes: 'Health: 手指肌腱旧伤; Emergency: Quentin Milden 021 083 35229; Date: 27/02/2025',
  },
  {
    name: 'Claudine Allan',
    phone: '021 084 88412',
    email: '86claudine@gmail.com',
    notes: 'Emergency: Tevene 027 248 4806; Date: 29/09/2025',
  },
  {
    name: 'Cherie Bedding',
    phone: '021 262 9444',
    email: 'cherebro@yahoo.com',
    notes: 'Emergency: Jill 021 0229 0698; Date: 27/02/2025',
  },
  {
    name: 'Claire Hodds',
    phone: '027 593 7753',
    email: 'claire.hodds@gmail.com',
    notes: 'Health: 肩膀曾多次脱臼 (需避免过度伸展); Emergency: Don Kerr 027 422 8876; Date: 15/01/2025',
  },
  {
    name: 'Debbie Stetson',
    phone: '021 860 438',
    email: 'stetsons7472@gmail.com',
    notes: 'Health: N/A; Date: 26/02/2025',
  },
  {
    name: 'Deanne Maxwell',
    phone: '022 372 0522',
    email: 'deannemaxwell@gmail.com',
    notes: 'Health: Type 1 Diabetes (40年), 随身携带糖果 (低血糖风险); Emergency: Dean Maxwell 021 261 3906; Date: 17/03/2025',
  },
  {
    name: 'Emmaleen Sarten',
    phone: '027 479 2455',
    email: 'your_angel_em@hotmail.com',
    notes: 'Health: Endometriosis (子宫内膜异位症); Emergency: Dion Sarten 021 264 0322; Date: 27/02/2025',
  },
  {
    name: 'Helen Bedford',
    phone: '021 205 6347',
    email: 'hellyandrich@xtra.co.nz',
    notes: 'Health: 膝关节手术史; Emergency: Richard Bedford 027 446 1176; Date: 12/05/2025',
  },
  {
    name: 'Jane Evans',
    phone: '027 323 3683',
    email: 'janeevans128@gmail.com',
    notes: 'Health: 整体健康良好; Emergency: Suzanne Chelius; Date: 18/09/2025',
  },
  {
    name: 'Justine Lee',
    phone: '021 222 7742',
    email: 'mathandjuss@gmail.com',
    notes: 'Health: L4/L5 神经问题 (脊柱); Emergency: Martin 021 762 323; Date: 01/05/2025',
  },
  {
    name: 'Karen Beckett',
    phone: '027 620 3930',
    email: 'beckettfamily620@gmail.com',
    notes: 'Health: 偶发髋部疼痛; Emergency: Anthony Beckett 022 042 3879; Date: 31/03/2025',
  },
];

await dbConnect();

const normalizedRecords = RECORDS.map((item) => ({
  ...item,
  email: normalizeEmail(item.email),
  phone: normalizePhone(item.phone),
  notes: String(item.notes || '').trim(),
}));

const seen = new Set();
const dedupedUpload = [];
const duplicatesInUpload = [];

for (const row of normalizedRecords) {
  const key = buildDedupKey(row);
  if (seen.has(key)) {
    duplicatesInUpload.push(row);
    continue;
  }
  seen.add(key);
  dedupedUpload.push(row);
}

const activeIntakes = await HealthIntake.find({}, { userName: 1, userEmail: 1, phone: 1 }).lean();
const activeByEmail = new Map();
const activeByPhone = new Map();

for (const active of activeIntakes) {
  const email = normalizeEmail(active.userEmail);
  const phone = normalizePhone(active.phone);
  if (email && !activeByEmail.has(email)) {
    activeByEmail.set(email, {
      name: active.userName || '',
      email,
      phone,
    });
  }
  if (phone && !activeByPhone.has(phone)) {
    activeByPhone.set(phone, {
      name: active.userName || '',
      email,
      phone,
    });
  }
}

const overlapWithActive = [];
const importCandidates = [];

for (const row of dedupedUpload) {
  const activeMatch = row.email
    ? activeByEmail.get(row.email)
    : row.phone
      ? activeByPhone.get(row.phone)
      : null;

  if (activeMatch) {
    overlapWithActive.push({ upload: row, active: activeMatch });
    continue;
  }

  importCandidates.push(row);
}

const candidateEmails = [...new Set(importCandidates.map((row) => row.email).filter(Boolean))];
const candidatePhones = [...new Set(importCandidates.map((row) => row.phone).filter(Boolean))];

const existingFuture = await FutureCustomer.find(
  {
    $or: [
      ...(candidateEmails.length ? [{ email: { $in: candidateEmails } }] : []),
      ...(candidatePhones.length ? [{ phone: { $in: candidatePhones } }] : []),
    ],
  },
  { email: 1, phone: 1 }
).lean();

const existingFutureByEmail = new Set(existingFuture.map((row) => normalizeEmail(row.email)).filter(Boolean));
const existingFutureByPhone = new Set(existingFuture.map((row) => normalizePhone(row.phone)).filter(Boolean));

const overlapWithFutureList = [];
const finalInsert = [];

for (const row of importCandidates) {
  if ((row.email && existingFutureByEmail.has(row.email)) || (row.phone && existingFutureByPhone.has(row.phone))) {
    overlapWithFutureList.push(row);
    continue;
  }
  finalInsert.push(row);
}

let imported = 0;
if (finalInsert.length) {
  const created = await FutureCustomer.insertMany(
    finalInsert.map((row) => ({
      name: row.name,
      email: row.email,
      phone: row.phone,
      notes: row.notes,
      source: SOURCE,
      addedByAdminEmail: 'manual-script',
    })),
    { ordered: false }
  );
  imported = created.length;
}

// Auto-clean duplicates that overlap with active customers (confirmation already provided in chat).
const activeOverlapEmails = [...new Set(overlapWithActive.map((item) => item.upload.email).filter(Boolean))];
const activeOverlapPhones = [...new Set(overlapWithActive.map((item) => item.upload.phone).filter(Boolean))];

let cleanedFutureDuplicates = 0;
if (activeOverlapEmails.length || activeOverlapPhones.length) {
  const deleteResult = await FutureCustomer.deleteMany({
    $or: [
      ...(activeOverlapEmails.length ? [{ email: { $in: activeOverlapEmails } }] : []),
      ...(activeOverlapPhones.length ? [{ phone: { $in: activeOverlapPhones } }] : []),
    ],
  });
  cleanedFutureDuplicates = deleteResult.deletedCount || 0;
}

const summary = {
  source: SOURCE,
  totalInput: RECORDS.length,
  dedupedInput: dedupedUpload.length,
  duplicatesInUpload: duplicatesInUpload.length,
  overlapWithActive: overlapWithActive.length,
  overlapWithFutureList: overlapWithFutureList.length,
  imported,
  cleanedFutureDuplicates,
};

console.log(JSON.stringify({ success: true, summary, overlapWithActive, overlapWithFutureList }, null, 2));
process.exit(0);
