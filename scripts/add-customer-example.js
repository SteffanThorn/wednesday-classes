// Add a customer/student example record to MongoDB
// Run with: node scripts/add-customer-example.js

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

const CUSTOMER = {
  name: 'Debbie Stevenson',
  email: 'stevensons@inspire.net.nz',
  phone: '0277-501-188',
};

async function addCustomerExample() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Please configure .env.local first.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    const normalizedEmail = CUSTOMER.email.toLowerCase().trim();
    const now = new Date();

    // Minimal schemas for this script
    const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
    const intakeSchema = new mongoose.Schema({}, { strict: false, collection: 'healthintakes' });

    const User = mongoose.models.ScriptUser || mongoose.model('ScriptUser', userSchema);
    const HealthIntake = mongoose.models.ScriptHealthIntake || mongoose.model('ScriptHealthIntake', intakeSchema);

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();

    let userId;

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.error(`❌ ${normalizedEmail} belongs to an admin account. Aborted.`);
        process.exit(1);
      }

      await User.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            name: CUSTOMER.name,
            phone: CUSTOMER.phone,
            role: 'student',
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        }
      );

      userId = existingUser._id;
      console.log(`✅ Updated existing user: ${normalizedEmail}`);
    } else {
      const temporaryPassword = `${Math.random().toString(36).slice(2)}Aa1!`;
      const passwordHash = await bcrypt.hash(temporaryPassword, 12);

      const inserted = await User.create({
        email: normalizedEmail,
        password: passwordHash,
        name: CUSTOMER.name,
        phone: CUSTOMER.phone,
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

      userId = inserted._id;
      console.log(`✅ Created new user: ${normalizedEmail}`);
    }

    await HealthIntake.updateOne(
      { userEmail: normalizedEmail },
      {
        $set: {
          userId,
          userEmail: normalizedEmail,
          userName: CUSTOMER.name,
          phone: CUSTOMER.phone,
          healthNotes: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          waiverAccepted: false,
          comments: '',
          signatureDataUrl: '',
          signatureName: '',
          signedAt: now,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    console.log('✅ Upserted health intake record');
    console.log('🎉 Example customer has been saved to MongoDB.');
  } finally {
    await mongoose.disconnect();
  }
}

addCustomerExample().catch((error) => {
  console.error('❌ Failed to add example customer:', error.message);
  process.exit(1);
});
