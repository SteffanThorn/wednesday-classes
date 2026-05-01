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

const SOURCE = 'legacy-members-2026-04-09-batch-2-manual';

const RECORDS = [
  {
    name: 'Ashling Ellis',
    phone: '022 036 3419',
    email: 'ashling.ellis26@gmail.com',
    notes: 'Emergency: Yuri McKenna 022 066 3824; Date: 25/02/2025',
  },
  {
    name: 'Brenda Sinclair Black',
    phone: '021 069 0469',
    email: 'brendasblack@icloud.com',
    notes: 'Emergency: Iain 021 246 0298; Date: 26/02/2025',
  },
  {
    name: 'Bruce Philp (?)',
    phone: '021 062 4566',
    email: 'philpotmc@gmail.com',
    notes: 'Emergency: unnamed 062765120; Date: 17/03/2025; Name spelling needs confirmation.',
  },
  {
    name: 'Carey Churton',
    phone: '021 235 9217',
    email: 'careychurton@hotmail.com',
    notes: 'Health: old finger injury; Emergency: Quentin 021 083 35229; Date: 27/02/2025',
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
    notes: 'Health: shoulder dislocation history; Emergency: Don Kerr 027 422 8876; Date: 15/01/2025',
  },
  {
    name: 'Debbie Stetson',
    phone: '021 860 438',
    email: 'stetsons7472@gmail.com',
    notes: 'Date: 26/02/2025',
  },
  {
    name: 'Deanne Maxwell',
    phone: '022 372 0522',
    email: 'deannemaxwell@gmail.com',
    notes: 'Health: Type 1 Diabetes; Emergency: Dean Maxwell 021 261 3906; Date: 17/03/2025',
  },
  {
    name: 'Emmaleen Sarten',
    phone: '027 479 2455',
    email: 'your_angel_em@hotmail.com',
    notes: 'Health: Endometriosis; Emergency: Dion 021 264 0322; Date: 27/02/2025',
  },
  {
    name: 'Helen Bedford',
    phone: '021 205 6347',
    email: 'hellyandrich@xtra.co.nz',
    notes: 'Health: knee surgery history; Emergency: Richard 027 446 1176; Date: 12/05/2025',
  },
  {
    name: 'Jane Evans',
    phone: '027 323 3683',
    email: 'janeevans128@gmail.com',
    notes: 'Emergency: Suzanne Chelius; Date: 18/09/2025',
  },
  {
    name: 'Justine Lee',
    phone: '021 222 7742',
    email: 'mathandjuss@gmail.com',
    notes: 'Health: L4/L5 nerve issue; Emergency: Martin 021 762 323; Date: 01/05/2025',
  },
  {
    name: 'Karen Beckett',
    phone: '027 620 3930',
    email: 'beckettfamily620@gmail.com',
    notes: 'Health: hip pain; Emergency: Anthony 022 042 3879; Date: 31/03/2025',
  },
  {
    name: 'Kelly Connell',
    phone: '027 311 7073',
    email: 'kellyanneconnell@gmail.com',
    notes: 'Health: none noted; Emergency: Chris 027 632 9632; Date: 04/03/2025',
  },
  {
    name: 'Jane Ayling',
    phone: '027 545 5501',
    email: 'jane_ayling@actrix.co.nz',
    notes: 'Health: hip dislocation / sacral hematoma; Emergency: David Ayling 027 356 3032; Date: 17/03/2025',
  },
  {
    name: 'Julie Dalzell',
    phone: '021 795 280',
    email: '',
    notes: 'Health: no obvious issues; Emergency: 022 011 1749; Date: 17/03/2025; Email unclear, needs confirmation.',
  },
  {
    name: 'Jan Billington',
    phone: '027 575 3423',
    email: 'candybillington@gmail.com',
    notes: 'Health: excellent; Emergency: Judy Renaud 021 300 886; Date: 26/02/2025',
  },
  {
    name: 'Jill Turner',
    phone: '021 022 90698',
    email: 'jill.turner@pncc.govt.nz',
    notes: 'Health: old arm injury affecting load-bearing; Emergency: Clare 021 262 9444; Date: 21/02/2025',
  },
  {
    name: 'Jacqui Saunders',
    phone: '021 101 0735',
    email: 'jacmaree273@gmail.com',
    notes: 'Health: hip metal plate, limited right ankle mobility; Emergency: Graeme Oliver 021 262 9934; Date: 31/03/2025',
  },
  {
    name: 'Lektra Jinell (?)',
    phone: '021 1222 336',
    email: 'hsbjrat@gmail.com',
    notes: 'Health: left ankle fracture 6 years ago, right shoulder stabbing pain; Date: 12/02/2025; Name spelling needs confirmation.',
  },
  {
    name: 'Lisa Hutchinson',
    phone: '027 428 3064',
    email: 'lisahutch1969@gmail.com',
    notes: 'Emergency: Craig Patterson 027 466 7938; Date: 27/02/2025',
  },
  {
    name: 'Melissa Kearney',
    phone: '022 624 1826',
    email: 'pkmelissa@inspire.net.nz',
    notes: 'Emergency: Paul Kearney 021 423 774; Date: 12/03/2025',
  },
  {
    name: 'Nicki Moffatt',
    phone: '027 243 2050',
    email: 'moffatt@outlook.co.nz',
    notes: 'Health: thumb injury; Emergency: Tim Moffatt 021 191 4710; Date: 17/03/2025',
  },
  {
    name: 'Pamela Moriel',
    phone: '027 373 9937',
    email: 'pamelamoriel@hotmail.com',
    notes: 'Health: none; Emergency: David 027 303 9206; Date: 11/06/2025',
  },
  {
    name: 'Rhonda Free',
    phone: '021 517 226',
    email: 'rhonda.free@xtra.co.nz',
    notes: 'Health: none; Emergency: Tony Jessop; Date: 19/05/2025',
  },
  {
    name: 'Rochelle Izatt',
    phone: '027 662 4771',
    email: 'rochelleizatt@yahoo.co.nz',
    notes: 'Health: lumbar disc protrusion; Emergency: Carl Izatt 027 221 3904; Date: 17/03/2025',
  },
  {
    name: 'Sarah Jane Hutchinson',
    phone: '021 025 56578',
    email: 'sarahjane321@live.com',
    notes: 'Emergency: Lisa Hutchinson 027 428 3064; Date: 27/02/2025',
  },
  {
    name: 'Samantha Holden',
    phone: '021 074 0622',
    email: 'samanthagrace@hotmail.com',
    notes: 'Health: none; Emergency: nana 021 069 0820; Date: 18/03/2025',
  },
  {
    name: 'Sharon Pact',
    phone: '021 142 834',
    email: 'shazrac79@yahoo.com',
    notes: 'Health: left knee arthritis, left leg weight-bearing pain; Emergency: Jethro Peek 021 023 6754; Date: 12/05/2025',
  },
  {
    name: 'Sharon Graves',
    phone: '022 369 8792',
    email: 'sharongraves8@gmail.com',
    notes: 'Health: right ankle fracture history; Emergency: Robert 021 712 579; Date: 06/03/2025',
  },
  {
    name: 'Tracy Coyle',
    phone: '022 043 5804',
    email: 'tracycoyle1970@gmail.com',
    notes: 'Emergency: Brent Coyle 027 327 0804; Date: 17/03/2025',
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

let existingFuture = [];
if (candidateEmails.length || candidatePhones.length) {
  existingFuture = await FutureCustomer.find(
    {
      $or: [
        ...(candidateEmails.length ? [{ email: { $in: candidateEmails } }] : []),
        ...(candidatePhones.length ? [{ phone: { $in: candidatePhones } }] : []),
      ],
    },
    { email: 1, phone: 1 }
  ).lean();
}

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
