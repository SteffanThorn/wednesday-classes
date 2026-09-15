/**
 * Add one more anonymized example guestbook message (English), already
 * approved so it shows up immediately in the homepage auto-scrolling row.
 * Continues the D./S. initial-only naming pattern from the first two.
 *
 * Run with:
 *   node scripts/seed-guestbook-2026-09b.mjs
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

const guestbookSchema = new mongoose.Schema({}, { strict: false, collection: 'guestbookmessages' });
const GuestbookMessage = mongoose.model('GuestbookMessageSeed', guestbookSchema);

const now = new Date();

const MESSAGE = {
  userName: 'M.',
  userEmail: 'anonymous+sleep@innerlight.local',
  message:
    "I started coming to Yuki's classes just to stretch after work, but what surprised me most was how much calmer I felt afterward. My sleep has improved and I don't carry nearly as much tension in my shoulders and neck anymore. It's become the best part of my week.",
  status: 'approved',
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const doc = await GuestbookMessage.create({
    userId: new mongoose.Types.ObjectId(),
    userName: MESSAGE.userName,
    userEmail: MESSAGE.userEmail,
    message: MESSAGE.message,
    status: MESSAGE.status,
    moderatedAt: now,
    moderatedByEmail: 'innerlightyuki@gmail.com',
    createdAt: now,
    updatedAt: now,
  });
  console.log(`✓ Inserted "${MESSAGE.userName}" — ${doc._id.toString()}`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
