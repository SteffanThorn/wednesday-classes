/**
 * Read-only inspection: compare the "robroz@xtra.co.nz" account against
 * whatever account currently holds "robroz58@gmail.com", to understand
 * an email-update conflict before deciding how to resolve it.
 *
 * Run with:
 *   node scripts/inspect-roz-robinson-conflict-2026-08.mjs
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

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const intakeSchema = new mongoose.Schema({}, { strict: false, collection: 'healthintakes' });
const bookingSchema = new mongoose.Schema({}, { strict: false, collection: 'bookings' });

function printUser(label, u) {
  if (!u) {
    console.log(`${label}: (not found)`);
    return;
  }
  console.log(`${label}:`);
  console.log(`  _id: ${u._id}`);
  console.log(`  name: ${u.name}`);
  console.log(`  email: ${u.email}`);
  console.log(`  phone: ${u.phone || ''}`);
  console.log(`  role: ${u.role}`);
  console.log(`  classCredits: ${u.classCredits}`);
  console.log(`  createdAt: ${u.createdAt}`);
  console.log(`  updatedAt: ${u.updatedAt}`);
}

async function run() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('🔗  Connected to MongoDB\n');

  const User = mongoose.models.ScriptUser || mongoose.model('ScriptUser', userSchema);
  const HealthIntake = mongoose.models.ScriptHealthIntake || mongoose.model('ScriptHealthIntake', intakeSchema);
  const Booking = mongoose.models.ScriptBooking || mongoose.model('ScriptBooking', bookingSchema);

  const oldUser = await User.findOne({ email: OLD_EMAIL }).lean();
  const newUser = await User.findOne({ email: NEW_EMAIL }).lean();

  printUser(`\n=== OLD_EMAIL (${OLD_EMAIL}) ===`, oldUser);
  printUser(`\n=== NEW_EMAIL (${NEW_EMAIL}) - already exists ===`, newUser);

  for (const [label, email] of [['OLD', OLD_EMAIL], ['NEW', NEW_EMAIL]]) {
    const intakes = await HealthIntake.find({ userEmail: email }).lean();
    console.log(`\n${label} HealthIntake records (${intakes.length}):`);
    intakes.forEach((i) => {
      console.log(`  _id: ${i._id} | name: ${i.userName} | remainingClassCredits: ${i.remainingClassCredits} | createdAt: ${i.createdAt}`);
    });

    const bookingCount = await Booking.countDocuments({ userEmail: email });
    console.log(`${label} Booking count: ${bookingCount}`);
  }

  console.log('\n(read-only inspection - nothing was changed)');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Script failed:', err.message);
  process.exit(1);
});
