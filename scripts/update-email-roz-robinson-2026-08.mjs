/**
 * Update Roz Robinson's email address (User + HealthIntake).
 *
 * From: robroz@xtra.co.nz
 * To:   robroz58@gmail.com
 *
 * Run with:
 *   node scripts/update-email-roz-robinson-2026-08.mjs
 */

import dotenv from 'dotenv';
import { createRequire } from 'module';

dotenv.config({ path: '.env.local' });

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set. Please configure .env.local first.');
  process.exit(1);
}

const OLD_EMAIL = 'robroz@xtra.co.nz';
const NEW_EMAIL = 'robroz58@gmail.com';

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const intakeSchema = new mongoose.Schema({}, { strict: false, collection: 'healthintakes' });

async function run() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('🔗  Connected to MongoDB\n');

  const User = mongoose.models.ScriptUser || mongoose.model('ScriptUser', userSchema);
  const HealthIntake = mongoose.models.ScriptHealthIntake || mongoose.model('ScriptHealthIntake', intakeSchema);

  const now = new Date();

  // Guard: make sure the new email isn't already used by a DIFFERENT account
  const conflictUser = await User.findOne({ email: NEW_EMAIL }).lean();
  if (conflictUser) {
    console.error(`❌  ${NEW_EMAIL} is already used by another user (_id: ${conflictUser._id}). Aborting - resolve manually.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const user = await User.findOne({ email: OLD_EMAIL }).lean();
  if (!user) {
    console.error(`❌  No User found with email ${OLD_EMAIL}. Nothing to update.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`👤  Found user: ${user.name || '(no name)'} <${user.email}> (_id: ${user._id})`);

  await User.updateOne(
    { _id: user._id },
    { $set: { email: NEW_EMAIL, updatedAt: now } }
  );
  console.log(`  ✅ User email updated: ${OLD_EMAIL} → ${NEW_EMAIL}`);

  const intakeResult = await HealthIntake.updateMany(
    { userEmail: OLD_EMAIL },
    { $set: { userEmail: NEW_EMAIL, updatedAt: now } }
  );
  console.log(`  ✅ HealthIntake records updated: ${intakeResult.modifiedCount}`);

  console.log('\n🎉  Done.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Script failed:', err.message);
  process.exit(1);
});
