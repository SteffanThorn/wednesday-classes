/**
 * Translate the two anonymized example guestbook messages (seeded by
 * scripts/seed-guestbook-2026-09.mjs) from Chinese to English, and swap the
 * hidden names for English-style initials (D. / S.) as requested.
 *
 * Run with:
 *   node scripts/translate-guestbook-seed-2026-09.mjs
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

const UPDATES = [
  {
    id: '6aa8ee34b800bd88564e78bd', // knee pain testimonial
    userName: 'D.',
    message:
      "I've dealt with long-term knee pain and used to avoid anything too strenuous. After taking Yuki's classes for a while, the pressure on my knee eased noticeably — stairs and walking feel so much lighter now. Really grateful for her patient guidance.",
  },
  {
    id: '6aa8ee35b800bd88564e78c0', // lower back pain testimonial
    userName: 'S.',
    message:
      "My job keeps me sitting for long hours, which led to lower back strain and constant soreness. Following Yuki's advice to strengthen my core and pelvic stability, the back pain has eased a lot — I can get through a full work day without nearly as much discomfort.",
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  for (const u of UPDATES) {
    const doc = await GuestbookMessage.findByIdAndUpdate(
      u.id,
      { $set: { userName: u.userName, message: u.message } },
      { new: true }
    );
    console.log(doc ? `✓ Updated ${u.id} -> "${u.userName}"` : `✗ Not found: ${u.id}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('❌  Update failed:', err);
  process.exit(1);
});
