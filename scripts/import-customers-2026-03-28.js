// Batch import customers/students into MongoDB
// Run with: node scripts/import-customers-2026-03-28.js

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

const CUSTOMERS = [
  {
    name: 'Linda Macknight',
    phone: '021 102 4149',
    email: 'lindamacknight@hotmail.com',
    healthNotes: 'Recovering from Long COVID',
    comments: '',
  },
  {
    name: 'Indy Rehning?',
    phone: '027 243 0179',
    email: '',
    healthNotes: 'Injuries to knees, ankles, shoulder, back',
    comments: 'Surname uncertain (possibly Rehning). Email not provided in source.',
  },
  {
    name: 'Glenys Tutt',
    phone: '027 478 8129',
    email: 'glenystutt@gmail.com',
    healthNotes: '软组织问题 / 核心无力 / 膝盖不适（手写中文描述）',
    comments: '',
  },
  {
    name: 'Phillip Batchelor',
    phone: '027 229 0444',
    email: 'phillip@inspire.net.nz',
    healthNotes: '',
    comments: '',
  },
  {
    name: 'Nicky Perrin',
    phone: '',
    email: 'nickyperrin@hotmail.co.nz',
    healthNotes: '',
    comments: 'Phone number unclear in source.',
  },
  {
    name: 'Becky (surname unclear)',
    phone: '027 248 78929',
    email: 'bmwilk@hotmail.com',
    healthNotes: 'lower back pain',
    comments: 'Surname unclear. Phone may be incorrect. Email spelling may need confirmation (bmwilk).',
  },
  {
    name: 'Pamela Collings',
    phone: '027 308 6891',
    email: 'collingspj@gmail.com',
    healthNotes: 'occasional respiratory problems',
    comments: '',
  },
  {
    name: 'Diane Barnes',
    phone: '0275 172 113',
    email: 'diane3k@windowslive.com',
    healthNotes: 'Great health',
    comments: '',
  },
  {
    name: 'Lauri Bayode',
    phone: '022 095 2464',
    email: 'lauriln@yahoo.co.nz',
    healthNotes: '',
    comments: 'Name spelling may need confirmation (Bayode / Bayodeh).',
  },
  {
    name: 'Vicki Rawden',
    phone: '027 315 8339',
    email: 'rawden@inspire.net.nz',
    healthNotes: 'No',
    comments: '',
  },
  {
    name: 'Jessica Geggin',
    phone: '027 333 2531',
    email: 'jessicageggin22@gmail.com',
    healthNotes: 'Constant sore left hip & right shoulder / tight lower back',
    comments: '',
  },
  {
    name: 'Monique Knowles',
    phone: '027 849 4237',
    email: 'monique@live.com',
    healthNotes: 'Injury in right wrist',
    comments: '',
  },
  {
    name: 'Dianne Atwood',
    phone: '027 623 4745',
    email: 'di.atwood72@gmail.com',
    healthNotes: 'No issues',
    comments: '',
  },
  {
    name: 'Rosemary Krsnich',
    phone: '021 902 8537',
    email: 'rksnich@gmail.com',
    healthNotes: 'moderate kyphosis',
    comments: 'Name/email/phone may need confirmation from source handwriting.',
  },
];

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'unknown';
}

function normalizedOrPlaceholderEmail(customer) {
  const email = String(customer.email || '').trim().toLowerCase();
  if (email) return email;
  return `${slugify(customer.name)}-no-email@placeholder.local`;
}

async function runImport() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
  const intakeSchema = new mongoose.Schema({}, { strict: false, collection: 'healthintakes' });

  const User = mongoose.models.BatchUser || mongoose.model('BatchUser', userSchema);
  const HealthIntake = mongoose.models.BatchHealthIntake || mongoose.model('BatchHealthIntake', intakeSchema);

  const stats = {
    usersCreated: 0,
    usersUpdated: 0,
    intakesUpserted: 0,
    skippedAdminEmails: [],
    placeholderEmails: [],
  };

  try {
    for (const customer of CUSTOMERS) {
      const now = new Date();
      const email = normalizedOrPlaceholderEmail(customer);
      const hadMissingEmail = !String(customer.email || '').trim();

      if (hadMissingEmail) {
        stats.placeholderEmails.push({ name: customer.name, email });
      }

      const existingUser = await User.findOne({ email }).lean();
      let userId;

      if (existingUser) {
        if (existingUser.role === 'admin') {
          stats.skippedAdminEmails.push(email);
          console.log(`⚠️  Skipped admin account email: ${email}`);
          continue;
        }

        await User.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              name: customer.name,
              phone: customer.phone || '',
              role: 'student',
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          }
        );

        userId = existingUser._id;
        stats.usersUpdated += 1;
      } else {
        const temporaryPassword = `${Math.random().toString(36).slice(2)}Aa1!`;
        const passwordHash = await bcrypt.hash(temporaryPassword, 12);

        const created = await User.create({
          email,
          password: passwordHash,
          name: customer.name,
          phone: customer.phone || '',
          role: 'student',
          classCredits: 0,
          classCreditHistory: [],
          creditBalance: 0,
          creditHistory: [],
          accountSetupToken: null,
          accountSetupExpires: null,
          createdAt: now,
          updatedAt: now,
        });

        userId = created._id;
        stats.usersCreated += 1;
      }

      await HealthIntake.updateOne(
        { userEmail: email },
        {
          $set: {
            userId,
            userEmail: email,
            userName: customer.name,
            phone: customer.phone || '',
            healthNotes: customer.healthNotes || '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            waiverAccepted: false,
            comments: customer.comments || '',
            signatureDataUrl: '',
            signatureName: '',
            signedAt: now,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );

      stats.intakesUpserted += 1;
      console.log(`✅ Imported: ${customer.name} <${email}>`);
    }

    console.log('\n=== Import summary ===');
    console.log(`Users created: ${stats.usersCreated}`);
    console.log(`Users updated: ${stats.usersUpdated}`);
    console.log(`Health intakes upserted: ${stats.intakesUpserted}`);

    if (stats.placeholderEmails.length > 0) {
      console.log('\nPlaceholder emails used (needs follow-up):');
      for (const item of stats.placeholderEmails) {
        console.log(`- ${item.name}: ${item.email}`);
      }
    }

    if (stats.skippedAdminEmails.length > 0) {
      console.log('\nSkipped admin emails:');
      for (const email of stats.skippedAdminEmails) {
        console.log(`- ${email}`);
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

runImport().catch((error) => {
  console.error('❌ Import failed:', error.message);
  process.exit(1);
});
