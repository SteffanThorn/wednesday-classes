/**
 * Resolve the Roz Robinson duplicate-account conflict:
 *  1. Delete the empty duplicate account (robroz58@gmail.com, no intake/bookings)
 *  2. Update the real account (robroz@xtra.co.nz, has credits/intake/booking history)
 *     to use robroz58@gmail.com instead.
 *
 * Run with:
 *   node scripts/merge-roz-robinson-2026-08.mjs
 */

import dotenv from 'dotenv';
import { createRequire } from 'module';

dotenv.config({ path: '.env.local' });

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set.');
  process.exit(1);
}

const OLD_EMAIL = 'robroz@xtra.co.nz';
const NEW_EMAIL = 'robroz58@gmail.com';
const DUPLICATE_USER_ID = '6a77b5826e6d6833f787b1f6';
const REAL_USER_ID = '69ce0e221ec0938aa8aecb92';

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const intakeSchema = new mongoose.Schema({}, { strict: false, collection: 'healthintakes' });
const bookingSchema = new mongoose.Schema({}, { strict: false, collection: 'bookings' });

async function run() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('🔗  Connected to MongoDB\n');

  const User = mongoose.models.ScriptUser || mongoose.model('ScriptUser', userSchema);
  const HealthIntake = mongoose.models.ScriptHealthIntake || mongoose.model('ScriptHealthIntake', intakeSchema);
  const Booking = mongoose.models.ScriptBooking || mongoose.model('ScriptBooking', bookingSchema);

  // Safety re-check right before mutating: confirm the duplicate is still empty
  const dup = await User.findById(DUPLICATE_USER_ID).lean();
  if (!dup) {
    console.error(`❌  Duplicate user ${DUPLICATE_USER_ID} not found. Aborting.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  if (dup.email !== NEW_EMAIL) {
    console.error(`❌  Duplicate user's email is "${dup.email}", expected "${NEW_EMAIL}". Aborting.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  const dupIntakeCount = await HealthIntake.countDocuments({ userEmail: NEW_EMAIL });
  const dupBookingCount = await Booking.countDocuments({ userEmail: NEW_EMAIL });
  if (dupIntakeCount > 0 || dupBookingCount > 0) {
    console.error(`❌  Duplicate account is no longer empty (intakes: ${dupIntakeCount}, bookings: ${dupBookingCount}). Aborting - resolve manually.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const realUser = await User.findById(REAL_USER_ID).lean();
  if (!realUser || realUser.email !== OLD_EMAIL) {
    console.error(`❌  Real user ${REAL_USER_ID} not found or email mismatch. Aborting.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // 1. Delete the empty duplicate account
  await User.deleteOne({ _id: DUPLICATE_USER_ID });
  console.log(`  ✅ Deleted duplicate account: ${NEW_EMAIL} (_id: ${DUPLICATE_USER_ID})`);

  // 2. Update the real account's email
  const now = new Date();
  await User.updateOne(
    { _id: REAL_USER_ID },
    { $set: { email: NEW_EMAIL, updatedAt: now } }
  );
  console.log(`  ✅ Real account email updated: ${OLD_EMAIL} → ${NEW_EMAIL}`);

  const intakeResult = await HealthIntake.updateMany(
    { userEmail: OLD_EMAIL },
    { $set: { userEmail: NEW_EMAIL, updatedAt: now } }
  );
  console.log(`  ✅ HealthIntake records updated: ${intakeResult.modifiedCount}`);

  const bookingResult = await Booking.updateMany(
    { userEmail: OLD_EMAIL },
    { $set: { userEmail: NEW_EMAIL, updatedAt: now } }
  );
  console.log(`  ✅ Booking records updated: ${bookingResult.modifiedCount}`);

  console.log('\n🎉  Done.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Script failed:', err.message);
  process.exit(1);
});
