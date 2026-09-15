/**
 * Seed two anonymized example messages into the homepage guestbook, already
 * approved so they show up immediately in the auto-scrolling row.
 *
 * These are Yuki-provided example testimonials (knee pain relief, lower back
 * pain from work relieved via core/pelvic stability work) with names hidden —
 * they aren't tied to a real logged-in student account, so userId is a
 * synthetic ObjectId and userEmail is a placeholder for admin reference only.
 *
 * Run with:
 *   node scripts/seed-guestbook-2026-09.mjs
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
const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

const MESSAGES = [
  {
    userName: '匿名学员',
    userEmail: 'anonymous+knee@innerlight.local',
    message:
      '长期被膝盖疼痛困扰，一直不太敢做剧烈运动。跟着Yuki老师上了一段时间课之后，明显感觉膝盖的压力减轻了很多，现在上下楼梯、走路都轻松了不少，很感谢老师耐心的指导。',
    status: 'approved',
    createdAt: daysAgo(5),
  },
  {
    userName: '一位学员',
    userEmail: 'anonymous+back@innerlight.local',
    message:
      '因为工作需要长时间久坐，腰肌劳损，下腰背经常酸痛。听了Yuki老师的建议，加强了核心和骨盆的稳定性练习以后，腰疼的问题缓解了很多，现在工作一整天也没那么难受了。',
    status: 'approved',
    createdAt: daysAgo(2),
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  for (const m of MESSAGES) {
    const doc = await GuestbookMessage.create({
      userId: new mongoose.Types.ObjectId(),
      userName: m.userName,
      userEmail: m.userEmail,
      message: m.message,
      status: m.status,
      moderatedAt: now,
      moderatedByEmail: 'innerlightyuki@gmail.com',
      createdAt: m.createdAt,
      updatedAt: now,
    });
    console.log(`✓ Inserted "${m.userName}" — ${doc._id.toString()}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
