// Update existing customers + add Sally Cooper
// Run with: node scripts/update-customers-2026-03-28.js

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

// --- Updates for existing customers ---
// lookupEmail: the email already in DB to find the record
// emailChange: if the email itself is being corrected
// updates: fields to set in BOTH users + healthintakes
const UPDATES = [
  {
    lookupEmail: 'stevensons@inspire.net.nz',
    updates: {
      emergencyContactName: 'Grant Stevenson',
      emergencyContactPhone: '0275 393 433',
    },
  },
  {
    lookupEmail: 'lindamacknight@hotmail.com',
    updates: {
      emergencyContactName: 'Justin',
      emergencyContactPhone: '029 200 8299',
    },
  },
  {
    lookupEmail: 'glenystutt@gmail.com',
    updates: {
      healthNotes: '软组织问题 / 核心无力 / 膝盖不适 / 小幅度关节问题',
      emergencyContactName: 'Liz Wilde',
      emergencyContactPhone: '021 054 2560',
    },
  },
  {
    lookupEmail: 'phillip@inspire.net.nz',
    updates: {
      emergencyContactName: 'Rosdonna Webby (daughter)',
      emergencyContactPhone: '',
    },
  },
  {
    lookupEmail: 'collingspj@gmail.com',
    updates: {
      emergencyContactName: 'Andrew Ninness',
      emergencyContactPhone: '027 454 4568',
    },
  },
  {
    lookupEmail: 'diane3k@windowslive.com',
    updates: {
      emergencyContactName: 'Grant',
      emergencyContactPhone: '021 825 925',
    },
  },
  {
    // Name correction: Bayode → Boyack
    lookupEmail: 'lauriln@yahoo.co.nz',
    updates: {
      userName: 'Lauri Boyack',
      emergencyContactName: 'Richard Boyack',
      emergencyContactPhone: '027 375 757',
      comments: 'Emergency contact last digit unclear. Name spelling: Boyack.',
    },
  },
  {
    lookupEmail: 'rawden@inspire.net.nz',
    updates: {
      emergencyContactName: 'Anthony Rawden',
      emergencyContactPhone: '027 249 5997',
    },
  },
  {
    lookupEmail: 'jessicageggin22@gmail.com',
    updates: {
      healthNotes: '左髋持续疼痛 / 右肩疼痛 / 腿后侧紧绷 (Constant sore left hip & right shoulder / tight lower back)',
      emergencyContactName: 'Murray Armstrong',
      emergencyContactPhone: '',
    },
  },
  {
    // Name & phone & email correction: Atwood → Attwood, phone 4745→4725, email corrected
    lookupEmail: 'di.atwood72@gmail.com',
    emailChange: 'di.attwood72@gmail.com',
    updates: {
      userName: 'Dianne Attwood',
      phone: '027 623 4725',
      emergencyContactName: 'Graeme Attwood',
      emergencyContactPhone: '021 851 862',
    },
  },
  {
    // Email correction: monique@live.com → moandmike@live.com
    lookupEmail: 'monique@live.com',
    emailChange: 'moandmike@live.com',
    updates: {
      emergencyContactName: 'Michael Knowles',
      emergencyContactPhone: '022 024 8156',
      healthNotes: 'Right wrist injury',
    },
  },
];

// --- New customer ---
const NEW_CUSTOMERS = [
  {
    name: 'Sally Cooper',
    phone: '021 106 7658',
    email: 'nesty_the_gardener@gmail.com',
    healthNotes: 'Arthritis; Back surgery (ligament/disc related)',
    emergencyContactName: 'Ari Cooper',
    emergencyContactPhone: '021 024 2456',
    comments: 'Email slightly unclear in source handwriting (nesty_the_gardener@gmail.com).',
  },
];

async function run() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
  const intakeSchema = new mongoose.Schema({}, { strict: false, collection: 'healthintakes' });
  const User = mongoose.models.UpdUser || mongoose.model('UpdUser', userSchema);
  const HealthIntake = mongoose.models.UpdIntake || mongoose.model('UpdIntake', intakeSchema);

  const now = new Date();
  let updatedCount = 0;
  let skippedCount = 0;
  let newCount = 0;

  try {
    // --- Apply updates ---
    for (const item of UPDATES) {
      const { lookupEmail, emailChange, updates } = item;

      const existingUser = await User.findOne({ email: lookupEmail }).lean();
      const existingIntake = await HealthIntake.findOne({ userEmail: lookupEmail }).lean();

      if (!existingUser && !existingIntake) {
        console.log(`⚠️  Not found, skipping: ${lookupEmail}`);
        skippedCount++;
        continue;
      }

      const newEmail = emailChange || lookupEmail;

      // Build user update fields
      const userSet = { updatedAt: now };
      if (emailChange) userSet.email = newEmail;
      if (updates.userName) userSet.name = updates.userName;
      if (updates.phone) userSet.phone = updates.phone;

      if (existingUser) {
        await User.updateOne({ email: lookupEmail }, { $set: userSet });
      }

      // Build intake update fields
      const intakeSet = { updatedAt: now };
      if (emailChange) intakeSet.userEmail = newEmail;
      if (updates.userName) intakeSet.userName = updates.userName;
      if (updates.phone) intakeSet.phone = updates.phone;
      if (updates.healthNotes) intakeSet.healthNotes = updates.healthNotes;
      if (updates.emergencyContactName !== undefined) intakeSet.emergencyContactName = updates.emergencyContactName;
      if (updates.emergencyContactPhone !== undefined) intakeSet.emergencyContactPhone = updates.emergencyContactPhone;
      if (updates.comments) intakeSet.comments = updates.comments;

      if (existingIntake) {
        await HealthIntake.updateOne({ userEmail: lookupEmail }, { $set: intakeSet });
      } else if (existingUser) {
        // Intake didn't exist yet — create it
        await HealthIntake.create({
          userId: existingUser._id,
          userEmail: newEmail,
          userName: updates.userName || existingUser.name,
          phone: updates.phone || existingUser.phone || '',
          healthNotes: updates.healthNotes || '',
          emergencyContactName: updates.emergencyContactName || '',
          emergencyContactPhone: updates.emergencyContactPhone || '',
          waiverAccepted: false,
          comments: updates.comments || '',
          signatureDataUrl: '',
          signatureName: '',
          signedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }

      const emailLabel = emailChange ? `${lookupEmail} → ${newEmail}` : lookupEmail;
      console.log(`✅ Updated: ${emailLabel}`);
      updatedCount++;
    }

    // --- Add new customers ---
    for (const customer of NEW_CUSTOMERS) {
      const email = customer.email.toLowerCase().trim();
      const existing = await User.findOne({ email }).lean();

      if (existing) {
        console.log(`⚠️  Already exists, skipping new add: ${email}`);
        skippedCount++;
        continue;
      }

      const passwordHash = await bcrypt.hash(`${Math.random().toString(36).slice(2)}Aa1!`, 12);
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

      await HealthIntake.updateOne(
        { userEmail: email },
        {
          $set: {
            userId: created._id,
            userEmail: email,
            userName: customer.name,
            phone: customer.phone || '',
            healthNotes: customer.healthNotes || '',
            emergencyContactName: customer.emergencyContactName || '',
            emergencyContactPhone: customer.emergencyContactPhone || '',
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

      console.log(`🆕 Added new customer: ${customer.name} <${email}>`);
      newCount++;
    }

    console.log('\n=== Summary ===');
    console.log(`Records updated:    ${updatedCount}`);
    console.log(`New records added:  ${newCount}`);
    console.log(`Skipped (not found or already exists): ${skippedCount}`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((e) => {
  console.error('❌ Script failed:', e.message);
  process.exit(1);
});
