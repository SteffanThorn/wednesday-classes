/**
 * Announcement email — April 2026 class update
 * Run with: node scripts/send-announcement-apr2026.mjs
 *
 * Sends to all students in User + HealthIntake (deduplicated).
 * Set DRY_RUN=true to preview recipients without sending.
 */

import dotenv from 'dotenv';
import { Resend } from 'resend';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === 'true';

const [{ default: dbConnect }, { default: User }, { default: HealthIntake }] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/User.js'),
  import('../lib/models/HealthIntake.js'),
]);

await dbConnect();

const resend = new Resend(process.env.RESEND_API_KEY);

// Always use production email since we're sending to real customers
const SENDER_EMAIL = process.env.EMAIL_FROM_PRODUCTION || 'onboarding@resend.dev';
const SENDER = `Yuki · INNER LIGHT Yoga <${SENDER_EMAIL}>`;
const REPLY_TO = process.env.COMPANY_EMAIL || 'innerlightyuki@gmail.com';

// ── Load logo ──────────────────────────────────────────────────────────────
let logoAttachment = null;
try {
  const logoPath = path.join(__dirname, '..', 'public', 'innerlight-logo.png');
  const buf = await readFile(logoPath);
  logoAttachment = { filename: 'innerlight-logo.png', content: buf, contentId: 'il-logo' };
} catch {
  console.warn('Logo not loaded, will skip inline image.');
}

// ── Collect recipients ─────────────────────────────────────────────────────
const users = await User.find({}).select('email name').lean();
const intakes = await HealthIntake.find({}).select('userEmail userName').lean();

const map = new Map();
users.forEach((u) => map.set(u.email.toLowerCase(), { email: u.email, name: u.name }));
intakes.forEach((i) => {
  const k = i.userEmail.toLowerCase();
  if (!map.has(k)) map.set(k, { email: i.userEmail, name: i.userName });
});

const allRecipients = Array.from(map.values());
// Filter out placeholder / invalid email addresses
const recipients = allRecipients.filter(
  (r) => r.email && !r.email.includes('placeholder.local') && r.email.includes('@')
);
const skipped = allRecipients.length - recipients.length;
console.log(`\n📬  Recipients found: ${recipients.length}${skipped ? ` (${skipped} placeholder skipped)` : ''}`);
if (DRY_RUN) {
  recipients.forEach((r) => console.log(`  • ${r.name} <${r.email}>`));
  console.log('\n✋  DRY_RUN=true — no emails sent.\n');
  process.exit(0);
}

// ── Safety confirmation before live send ───────────────────────────────────
const CONFIRM_PHRASE = 'SEND';
const rl = createInterface({ input, output });
const answer = await rl.question(
  `\n⚠️  You are about to send to ${recipients.length} customers. Type ${CONFIRM_PHRASE} to continue: `
);
rl.close();

if (answer.trim() !== CONFIRM_PHRASE) {
  console.log('✋  Confirmation mismatch. Sending cancelled.');
  process.exit(1);
}

// ── Build HTML ─────────────────────────────────────────────────────────────
function buildHtml(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>New Classes Starting April 2026 — INNER LIGHT Yoga</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:28px 16px 40px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"
  style="max-width:580px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="text-align:center;padding:36px 24px 28px;
      background:linear-gradient(135deg,#ff8a80 0%,#ffcc80 16.66%,#fff9c4 33.33%,#a5d6a7 50%,#81d4fa 66.66%,#9fa8da 83.33%,#ce93d8 100%);
      border-radius:16px 16px 0 0;">
      <p style="margin:0 0 4px;color:rgba(255,255,255,0.75);font-size:11px;
                text-transform:uppercase;letter-spacing:3px;">
        April 2026 · Class Update
      </p>
      <h1 style="margin:0 0 6px;color:#fff;font-size:30px;font-weight:300;
                  letter-spacing:5px;text-transform:uppercase;">
        INNER LIGHT
      </h1>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:1px;">
        Yoga &amp; Meditation · Ashhurst, NZ
      </p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background:#fff;padding:40px 32px 32px;">

      <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.8;">
        Hi ${firstName},
      </p>

      <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.8;">
        Our April classes are live and ready to book — and this season we're running
        <strong>three distinct class types</strong>, each designed for a specific focus.
        Here's what's on:
      </p>

      <!-- Class 1: Wed 9:15 AM -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background:#fff7ed;border:1px solid #fed7aa;border-left:4px solid #f97316;
               border-radius:10px;margin:0 0 14px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:1.2px;color:#c2410c;">
              ☀️ &nbsp;Wednesday · 9:15 AM &nbsp;·&nbsp; Morning Class
            </p>
            <p style="margin:0 0 6px;color:#111827;font-size:16px;font-weight:600;">
              Functional Pain Relief Series
            </p>
            <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.65;">
              Release tension, reduce chronic pain, and restore natural movement patterns.
              Ideal for anyone dealing with stiffness, lower back discomfort, or tight joints.
            </p>
          </td>
        </tr>
      </table>

      <!-- Class 2: Wed 6:00 PM -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background:#faf5ff;border:1px solid #e9d5ff;border-left:4px solid #9333ea;
               border-radius:10px;margin:0 0 14px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:1.2px;color:#7e22ce;">
              🌙 &nbsp;Wednesday · 6:00 PM &nbsp;·&nbsp; Evening Class
            </p>
            <p style="margin:0 0 6px;color:#111827;font-size:16px;font-weight:600;">
              Nervous System Reset &amp; Breathwork Series
            </p>
            <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.65;">
              Calm a busy mind, regulate stress, and reconnect with your breath.
              Perfect after a long day — this class is designed to help you truly unwind.
            </p>
          </td>
        </tr>
      </table>

      <!-- Class 3: Thu 5:30 PM -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background:#f0fdfa;border:1px solid #99f6e4;border-left:4px solid #0d9488;
               border-radius:10px;margin:0 0 28px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:1.2px;color:#0f766e;">
              🌿 &nbsp;Thursday · 5:30 PM &nbsp;·&nbsp; Thursday Class
            </p>
            <p style="margin:0 0 6px;color:#111827;font-size:16px;font-weight:600;">
              Structural Alignment &amp; Deep Mobility Series
            </p>
            <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.65;">
              Improve posture, unlock stiff joints, and build a more resilient body.
              Great for those who want to move better and feel more balanced.
            </p>
          </td>
        </tr>
      </table>

      <!-- Details -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;margin:0 0 28px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#374151;
                      text-transform:uppercase;letter-spacing:1px;">
              Class Details
            </p>
            <p style="margin:0 0 6px;color:#4b5563;font-size:14px;">
              📍 &nbsp;<strong>Venue:</strong> Village Valley Centre, Ashhurst
            </p>
            <p style="margin:0 0 6px;color:#4b5563;font-size:14px;">
              ⏱ &nbsp;<strong>Duration:</strong> 60 minutes per class
            </p>
            <p style="margin:0 0 6px;color:#4b5563;font-size:14px;">
              👥 &nbsp;<strong>Class size:</strong> Small group · max 8 people
            </p>
            <p style="margin:0;color:#4b5563;font-size:14px;">
              💰 &nbsp;<strong>Pricing:</strong> $15 per class &nbsp;·&nbsp; 5-class package: $65
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.8;">
        Classes start from <strong>1 April 2026</strong>. Spots are limited — book early
        to secure your place.
      </p>

      <!-- CTA -->
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 32px;">
        <tr>
          <td style="border-radius:50px;background:linear-gradient(135deg,#0ea5e9,#8b5cf6);">
            <a href="https://innerlightyoga.co.nz/wednesday-classes"
               style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;
                      color:#fff;text-decoration:none;letter-spacing:0.5px;">
              Book Your Class →
            </a>
          </td>
        </tr>
      </table>

      <!-- Sign off -->
      <p style="margin:0 0 6px;color:#374151;font-size:15px;line-height:1.8;">
        Looking forward to seeing you on the mat. 🙏
      </p>
      <p style="margin:0 0 28px;color:#374151;font-size:15px;">
        With love,<br/>
        <strong>Yuki</strong>
      </p>

      ${logoAttachment
        ? `<img src="cid:il-logo" alt="INNER LIGHT Yoga" width="140"
             style="display:block;height:auto;max-width:140px;opacity:0.9;"/>`
        : `<p style="margin:0;color:#6b7280;font-size:13px;font-weight:600;letter-spacing:2px;">INNER LIGHT</p>`
      }
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;
               border-radius:0 0 16px 16px;text-align:center;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">
        INNER LIGHT · Ashhurst, New Zealand
      </p>
      <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;font-style:italic;">
        Breathe deeply. Move gently. Live fully.
      </p>
      <p style="margin:0;color:#d1d5db;font-size:11px;">
        To unsubscribe, reply with "Unsubscribe".
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Send in batches of 100 ─────────────────────────────────────────────────
// ── Send individually with retry ──────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sendWithRetry(payload, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { data, error } = await resend.emails.send(payload);
    if (!error) return { ok: true, data };
    if (attempt < retries) {
      console.warn(`  ⚠️  Attempt ${attempt} failed, retrying in 2s…`);
      await sleep(2000);
    } else {
      return { ok: false, error };
    }
  }
}

let sent = 0;
const errors = [];

for (const r of recipients) {
  const firstName = r.name?.split(' ')[0] || 'there';
  const payload = {
    from: SENDER,
    to: r.email,
    replyTo: REPLY_TO,
    subject: `New Classes Starting April 2026 — Book Your Spot 🌿`,
    html: buildHtml(firstName),
    attachments: logoAttachment ? [logoAttachment] : undefined,
  };

  const result = await sendWithRetry(payload);
  if (result.ok) {
    sent++;
    console.log(`✅  [${sent}/${recipients.length}] ${r.email}`);
  } else {
    console.error(`❌  ${r.email}:`, result.error?.message || result.error);
    errors.push({ email: r.email, error: result.error });
  }
  // Small delay to avoid rate limiting
  await sleep(150);
}

console.log(`\n🎉  Done — ${sent}/${recipients.length} emails sent.`);
if (errors.length) {
  console.error('\nFailed recipients:');
  errors.forEach((e) => console.error(`  • ${e.email}:`, e.error?.message || e.error));
}
process.exit(errors.length ? 1 : 0);
