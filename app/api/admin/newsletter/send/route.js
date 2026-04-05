import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { auth } from '@/auth';
import { Resend } from 'resend';
import dbConnect from '@/lib/mongodb';
import NewsletterCampaign from '@/lib/models/NewsletterCampaign';
import User from '@/lib/models/User';
import HealthIntake from '@/lib/models/HealthIntake';
import { getWeekSchedule } from '@/lib/newsletter-schedule';
import { appendBrandLogo, getCompanyLogoUrl } from '@/lib/email-branding';
import { personalizeTextForRecipient } from '@/lib/email-personalization';

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL =
  process.env.EMAIL_FROM_PRODUCTION ||
  process.env.EMAIL_FROM_LOCAL ||
  'onboarding@resend.dev';

const SENDER_NAME = 'Yuki · INNER LIGHT Yoga';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'innerlightyuki@gmail.com';
const COMPANY_LOGO_CID = 'innerlight-logo-footer';
const REQUIRED_CONFIRM_PHRASE = 'SEND';

// Resend batch limit
const BATCH_SIZE = 100;

function extractResendErrorMessage(error) {
  if (!error) return 'Unknown email error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.name && error.error) return `${error.name}: ${error.error}`;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown email error';
  }
}

function withResendGuidance(message) {
  const normalized = String(message || '').toLowerCase();
  if (
    normalized.includes('you can only send testing emails to your own email address') ||
    normalized.includes('verify a domain at resend.com/domains') ||
    normalized.includes('please use our testing email address instead of domains like')
  ) {
    return `${message} Please verify your sending domain in Resend and set EMAIL_FROM_PRODUCTION to that verified domain sender.`;
  }
  return message;
}

async function loadCompanyLogoAttachment() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'innerlight-logo.png');
    const logoBuffer = await readFile(logoPath);
    return {
      filename: 'innerlight-logo.png',
      content: logoBuffer,
      contentId: COMPANY_LOGO_CID,
    };
  } catch (error) {
    console.warn('Newsletter logo attachment not loaded, fallback to URL logo:', error?.message || error);
    return null;
  }
}

function normalizeTestRecipients(testEmail, fallbackName) {
  if (!testEmail) return [];

  const rawEmails = Array.isArray(testEmail) ? testEmail : [testEmail];
  const uniqueEmails = [...new Set(rawEmails.map((email) => String(email || '').trim()).filter(Boolean))];

  return uniqueEmails.map((email) => ({
    email,
    name: fallbackName,
  }));
}

function isValidEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  if (!value || value.includes('placeholder.local')) return false;
  if (value.includes('*')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function stripChinese(text = '') {
  return String(text)
    .replace(/[\u3400-\u9FFF\uF900-\uFAFF]/g, '')
    .replace(/[，。；：！？、“”‘’（）【】《》·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * POST /api/admin/newsletter/send
 * Send a newsletter campaign to all known students.
 *
 * Body: { weekNumber, testEmail?, selectedRecipients? }
 *   - weekNumber: 1–12
 *   - testEmail: optional — if provided, sends only to this address (test mode)
 *   - selectedRecipients: optional string[] — if provided, sends only to selected customer emails
 */
export async function POST(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const { weekNumber, testEmail, selectedRecipients, confirmPhrase } = body;

    if (!weekNumber || weekNumber < 1 || weekNumber > 12) {
      return NextResponse.json({ error: 'Invalid weekNumber' }, { status: 400 });
    }

    if (!testEmail && String(confirmPhrase || '').trim() !== REQUIRED_CONFIRM_PHRASE) {
      return NextResponse.json(
        { error: `Confirmation required. Please provide confirmPhrase: ${REQUIRED_CONFIRM_PHRASE}` },
        { status: 400 }
      );
    }

    // Load campaign
    const campaign = await NewsletterCampaign.findOne({ weekNumber });
    if (!campaign) {
      return NextResponse.json(
        { error: 'No draft found for this week. Please save a draft first.' },
        { status: 404 }
      );
    }

    // Get static schedule info for this week
    const schedule = getWeekSchedule(weekNumber);
    if (!schedule) {
      return NextResponse.json({ error: 'Week schedule not found' }, { status: 500 });
    }

    // ── Build recipient list ─────────────────────────────────────────────────
    let recipients = [];

    const normalizedSelectedEmails = Array.isArray(selectedRecipients)
      ? [...new Set(selectedRecipients.map((email) => String(email || '').trim().toLowerCase()).filter(Boolean))]
      : [];
    const isSelectedMode = !testEmail && normalizedSelectedEmails.length > 0;

    if (testEmail) {
      recipients = normalizeTestRecipients(testEmail, session.user.name || 'Test User');
    } else {
      // Collect from User model (students with accounts)
      const users = await User.find({ role: 'student' })
        .select('email name')
        .lean();

      // Collect from HealthIntake (may include students without accounts)
      const intakes = await HealthIntake.find({})
        .select('userEmail userName')
        .lean();

      // Merge & deduplicate by email (case-insensitive)
      const emailMap = new Map();
      users.forEach((u) => {
        emailMap.set(u.email.toLowerCase(), { email: u.email, name: u.name });
      });
      intakes.forEach((i) => {
        const key = i.userEmail.toLowerCase();
        if (!emailMap.has(key)) {
          emailMap.set(key, { email: i.userEmail, name: i.userName });
        }
      });

      recipients = Array.from(emailMap.values());

      if (isSelectedMode) {
        const selectedSet = new Set(normalizedSelectedEmails);
        recipients = recipients.filter((recipient) => selectedSet.has(String(recipient.email || '').toLowerCase()));
      }
    }

    const invalidRecipients = recipients.filter((recipient) => !isValidEmail(recipient?.email));
    if (invalidRecipients.length > 0) {
      console.warn(
        'Skipping invalid newsletter recipients:',
        invalidRecipients.map((recipient) => recipient?.email)
      );
    }
    recipients = recipients.filter((recipient) => isValidEmail(recipient?.email));

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          error: isSelectedMode
            ? 'No valid selected recipients found in customer list'
            : 'No valid recipients found',
        },
        { status: 400 }
      );
    }

    const logoAttachment = await loadCompanyLogoAttachment();

    // ── Build email batch ────────────────────────────────────────────────────
    const emailBatch = recipients.map((recipient) => {
      const personalizedSubject = personalizeTextForRecipient(campaign.subject, recipient.name);
      const personalizedMainContent = personalizeTextForRecipient(campaign.mainContent, recipient.name);
      const personalizedInstructorNote = personalizeTextForRecipient(campaign.instructorNote, recipient.name);

      const newsletterHtml = buildNewsletterHtml({
        userName: recipient.name,
        weekNumber: campaign.weekNumber,
        title: schedule.title,
        titleZh: schedule.titleZh,
        bodyFocus: schedule.bodyFocus,
        bodyFocusZh: schedule.bodyFocusZh,
        emoji: schedule.emoji,
        logoUrl: getCompanyLogoUrl(),
        classSummaries: schedule.classSummaries || [],
        mainContent: personalizedMainContent,
        practiceHighlights: campaign.practiceHighlights,
        instructorNote: personalizedInstructorNote,
      });

      return {
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: recipient.email,
        subject: personalizedSubject,
        html: appendBrandLogo(newsletterHtml),
        replyTo: COMPANY_EMAIL,
        attachments: logoAttachment ? [logoAttachment] : undefined,
      };
    });

    // Test mode: send only to the requested test recipients and fail fast on any error
    if (testEmail) {
      const { data, error } = await resend.batch.send(emailBatch);
      if (error) {
        const message = withResendGuidance(extractResendErrorMessage(error));
        console.error('Test email send failed:', error);
        return NextResponse.json(
          { success: false, error: `Test email failed: ${message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        testMode: true,
        sent: emailBatch.length,
        total: emailBatch.length,
        message: `Test email sent to ${recipients.map((recipient) => recipient.email).join(', ')}`,
        ids: Array.isArray(data) ? data.map((item) => item?.id).filter(Boolean) : [data?.id].filter(Boolean),
      });
    }

    // ── Send in chunks via Resend batch API ──────────────────────────────────
    let totalSent = 0;
    const errors = [];

    for (let i = 0; i < emailBatch.length; i += BATCH_SIZE) {
      const chunk = emailBatch.slice(i, i + BATCH_SIZE);
      try {
        const { data, error } = await resend.batch.send(chunk);
        if (error) {
          const message = withResendGuidance(extractResendErrorMessage(error));
          console.error(`Batch send error (chunk ${i / BATCH_SIZE + 1}):`, error);
          errors.push(`Chunk ${i / BATCH_SIZE + 1}: ${message}`);
          continue;
        }

        const sentInChunk = Array.isArray(data) ? data.length : chunk.length;
        totalSent += sentInChunk;
      } catch (err) {
        console.error(`Batch send error (chunk ${i / BATCH_SIZE + 1}):`, err);
        errors.push(`Chunk ${i / BATCH_SIZE + 1}: ${withResendGuidance(extractResendErrorMessage(err))}`);
      }
    }

    if (totalSent === 0) {
      const firstError = errors[0] ? ` ${errors[0]}` : '';
      return NextResponse.json(
        {
          success: false,
          error: `All newsletter deliveries failed.${firstError}`,
          errors,
        },
        { status: 500 }
      );
    }

    // ── Update campaign status (only for real sends) ─────────────────────────
    if (!testEmail && !isSelectedMode) {
      campaign.status = 'sent';
      campaign.sentAt = new Date();
      campaign.recipientCount = totalSent;
      await campaign.save();
    }

    return NextResponse.json({
      success: errors.length === 0,
      partialSuccess: errors.length > 0,
      testMode: false,
      selectedMode: isSelectedMode,
      sent: totalSent,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
      message:
        errors.length > 0
          ? `Newsletter partially sent: ${totalSent}/${recipients.length}`
          : isSelectedMode
          ? `Newsletter sent to selected recipients: ${totalSent}`
          : `Newsletter sent to ${totalSent} students`,
    });
  } catch (error) {
    console.error('POST /api/admin/newsletter/send error:', error);
    return NextResponse.json({ error: 'Failed to send newsletter', detail: error.message }, { status: 500 });
  }
}

// ─── Email HTML Template ─────────────────────────────────────────────────────

function buildNewsletterHtml({
  userName,
  weekNumber,
  title,
  bodyFocus,
  emoji,
  logoUrl,
  classSummaries,
  mainContent,
  practiceHighlights,
  instructorNote,
}) {
  const firstName = userName?.split(' ')[0] || 'Friend';

  // Convert line breaks in mainContent to <br> tags
  const contentHtml = mainContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.8;">${line}</p>`)
    .join('');

  const highlightsHtml =
    practiceHighlights && practiceHighlights.length > 0
      ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
      style="background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%);
             border-radius: 12px; padding: 24px; margin: 0 0 30px;
             border-left: 3px solid #0ea5e9;">
      <tr>
        <td style="padding: 0 0 14px;">
          <p style="margin: 0; color: #0369a1; font-size: 11px;
                    text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
            ✦ &nbsp;This Week's Practice Highlights
          </p>
        </td>
      </tr>
      ${practiceHighlights
        .map(
          (h) => `
      <tr>
        <td style="padding: 5px 0;">
          <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
            <span style="color: #8b5cf6; margin-right: 8px;">◆</span>${h}
          </p>
        </td>
      </tr>`
        )
        .join('')}
    </table>`
      : '';

  // Color config per slot
  const SLOT_STYLES = {
    'Wed 9:15':  { icon: '☀️', accent: '#f97316', bg: '#fff7ed', border: '#fed7aa', label: 'Morning · Pain Relief',   labelColor: '#c2410c' },
    'Wed 18:00': { icon: '🌙', accent: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', label: 'Evening · Breathwork',     labelColor: '#7e22ce' },
    'Thu 17:30': { icon: '🌿', accent: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', label: 'Thursday · Alignment',     labelColor: '#0f766e' },
  };

  const classSummariesHtml =
    Array.isArray(classSummaries) && classSummaries.length > 0
      ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 28px;">
      <tr><td style="padding-bottom: 10px;">
        <p style="margin: 0; color: #374151; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
          This Week · All Three Classes
        </p>
      </td></tr>
      ${classSummaries
        .map((item) => {
          const s = SLOT_STYLES[item.slot] || { icon: '📅', accent: '#6366f1', bg: '#f0f9ff', border: '#c7d2fe', label: item.slot, labelColor: '#4338ca' };
          const englishSummary = stripChinese(item.summary) || `${item.series || 'Class'} session focus.`;
          return `
      <tr>
        <td style="padding: 0 0 10px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
            style="background: ${s.bg}; border: 1px solid ${s.border}; border-left: 4px solid ${s.accent}; border-radius: 10px;">
            <tr>
              <td style="padding: 14px 16px 12px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <p style="margin: 0 0 2px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: ${s.labelColor};">
                        ${s.icon}&nbsp; ${s.label}
                      </p>
                      <p style="margin: 0 0 6px; color: #111827; font-size: 15px; font-weight: 600; line-height: 1.4;">
                        ${item.topic}
                      </p>
                      <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.65;">
                        ${englishSummary}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
        })
        .join('')}
    </table>`
      : '';

  const instructorNoteHtml = instructorNote
    ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
      style="border-top: 1px solid #e5e7eb; margin-top: 10px;">
      <tr>
        <td style="padding: 24px 0 0;">
          <p style="margin: 0 0 10px; color: #9ca3af; font-size: 13px;">
            A note from Yuki 🌸
          </p>
          <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.8;
                    font-style: italic; border-left: 2px solid #e879f9; padding-left: 16px;">
            &ldquo;${instructorNote}&rdquo;
          </p>
        </td>
      </tr>
    </table>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — INNER LIGHT Yoga Week ${weekNumber}</title>
</head>
<body style="margin: 0; padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f0f4f8;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 28px 16px 40px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
          style="max-width: 580px; width: 100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="text-align: center; padding: 36px 24px 28px;
              background: linear-gradient(135deg, #ff8a80 0%, #ffcc80 16.66%, #fff9c4 33.33%, #a5d6a7 50%, #81d4fa 66.66%, #9fa8da 83.33%, #ce93d8 100%);
              border-radius: 16px 16px 0 0;">
              <p style="margin: 0 0 4px; color: rgba(255,255,255,0.7); font-size: 11px;
                         text-transform: uppercase; letter-spacing: 3px;">
                12-Week Yoga Course · 2026
              </p>
              <h1 style="margin: 0 0 6px; color: white; font-size: 30px; font-weight: 300;
                          letter-spacing: 5px; text-transform: uppercase;">
                INNER LIGHT
              </h1>
              <p style="margin: 0 0 20px; color: rgba(255,255,255,0.8); font-size: 13px;
                         letter-spacing: 1px;">
                Yoga &amp; Meditation · Palmerston North, NZ
              </p>
              <div style="display: inline-block;
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.35);
                border-radius: 24px; padding: 7px 22px;">
                <span style="color: white; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">
                  Week ${weekNumber} of 12
                </span>
              </div>
            </td>
          </tr>

          <!-- ── Body Focus Banner ── -->
          <tr>
            <td style="background: linear-gradient(135deg, #0c4a6e 0%, #4c1d95 100%);
              padding: 20px 28px; text-align: center;">
              <p style="margin: 0 0 4px; color: rgba(255,255,255,0.55); font-size: 10px;
                         text-transform: uppercase; letter-spacing: 2.5px;">
                This Week's Focus
              </p>
              <p style="margin: 0; color: white; font-size: 22px; font-weight: 300; letter-spacing: 1px;">
                ${emoji}&nbsp; ${bodyFocus}
              </p>
            </td>
          </tr>

          <!-- ── Main Content ── -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px 20px;">
              <p style="margin: 0 0 6px; color: #9ca3af; font-size: 12px;
                         text-transform: uppercase; letter-spacing: 1.5px;">
                Week ${weekNumber}
              </p>
              <h2 style="margin: 0 0 4px; color: #111827; font-size: 26px; font-weight: 400;">
                ${title}
              </h2>
              <div style="height: 18px;"></div>

              <p style="margin: 0 0 28px; color: #4b5563; font-size: 16px; line-height: 1.7;">
                Hi ${firstName},
              </p>

              ${classSummariesHtml}
              ${contentHtml}
              ${highlightsHtml}
              ${instructorNoteHtml}

              <!-- Sign-off -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                style="margin-top: 32px;">
                <tr>
                  <td style="text-align: left;">
                    <img
                      src="${logoUrl || getCompanyLogoUrl()}"
                      alt="INNER LIGHT Yoga"
                      width="140"
                      style="display:inline-block; height:auto; max-width:140px; opacity:0.95;"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px;
              border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;
              text-align: center;">
              <p style="margin: 0 0 6px; color: #6b7280; font-size: 13px;">
                INNER LIGHT · Palmerston North, New Zealand
              </p>
              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 12px; font-style: italic;">
                Breathe deeply. Move gently. Live fully.
              </p>
              <p style="margin: 0; color: #d1d5db; font-size: 11px;">
                To unsubscribe, reply to this email with the word &ldquo;Unsubscribe&rdquo;.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}
