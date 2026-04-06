import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { auth } from '@/auth';
import { Resend } from 'resend';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import HealthIntake from '@/lib/models/HealthIntake';
import { appendBrandLogo, getCompanyLogoUrl } from '@/lib/email-branding';
import { personalizeTextForRecipient } from '@/lib/email-personalization';

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = (
  process.env.EMAIL_FROM_PRODUCTION ||
  process.env.EMAIL_FROM_LOCAL ||
  'onboarding@resend.dev'
).trim();

const SENDER_NAME = 'Yuki · INNER LIGHT Yoga';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'innerlightyuki@gmail.com';
const COMPANY_LOGO_CID = 'innerlight-logo-footer';
const BATCH_SIZE = 100;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_CONFIRM_PHRASE = 'SEND';

function extractErrorMessage(error) {
  if (!error) return 'Unknown email error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
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
    normalized.includes('please use our testing email address instead of domains like') ||
    normalized.includes('domain') ||
    normalized.includes('verify your domain') ||
    normalized.includes('resend.com/domains')
  ) {
    return `${message} Current sender: ${SENDER_EMAIL}. Please verify this sender domain in Resend and set EMAIL_FROM_PRODUCTION to a verified sender (for example: contact@email.innerlight.co.nz), or use onboarding@resend.dev for testing.`;
  }
  return message;
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function estimateBase64Size(base64 = '') {
  const len = base64.length;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((len * 3) / 4) - padding);
}

function normalizeAttachments(input) {
  if (!Array.isArray(input) || input.length === 0) return [];

  const trimmed = input.slice(0, MAX_ATTACHMENTS);

  return trimmed
    .map((file) => {
      const filename = String(file?.filename || '').trim();
      const content = String(file?.content || '').trim();
      const type = String(file?.type || 'application/octet-stream').trim();

      if (!filename || !content) return null;

      if (estimateBase64Size(content) > MAX_ATTACHMENT_SIZE) {
        throw new Error(`Attachment too large: ${filename} (max 5MB each)`);
      }

      return { filename, content, type };
    })
    .filter(Boolean);
}

function isInlineImage(file) {
  if (!file?.type) return false;
  const normalized = String(file.type).toLowerCase();
  return ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(normalized);
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
    console.warn('Custom newsletter logo attachment not loaded, fallback to URL logo:', error?.message || error);
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

function normalizeSelectedRecipients(selectedRecipients) {
  if (!Array.isArray(selectedRecipients)) return [];
  return [...new Set(selectedRecipients.map((email) => String(email || '').trim().toLowerCase()).filter(Boolean))];
}

function buildCustomEmailHtml({ userName, content, logoUrl, inlineImages = [], fileAttachments = [] }) {
  const firstName = userName?.split(' ')[0] || 'Friend';
  const paragraphs = content
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.75;">${p.replace(/\n/g, '<br />')}</p>`
    )
    .join('');

  // For inline images, reference them by CID (Content-ID)
  const imagesSection =
    inlineImages.length > 0
      ? `<div style="margin:24px 0 0 0;padding-top:20px;border-top:2px solid #e5e7eb;text-align:left;">
${inlineImages
  .map(
    (file, idx) => `<div style="margin:0;"><img src="cid:${file.cid}" alt="${escapeHtml(file.filename)}" style="max-width:140px;width:auto;height:auto;max-height:140px;border-radius:8px;display:block;" /></div>`
  )
  .join('')}
</div>`
      : '';

  const attachmentSection =
    fileAttachments.length > 0
      ? `
              <div style="margin-top:24px;padding-top:16px;border-top:1px dashed #d1d5db;">
                <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Attachments:</p>
                <ul style="margin:0;padding-left:18px;color:#4b5563;font-size:14px;line-height:1.7;">
                  ${fileAttachments
                    .map((file) => `<li>${escapeHtml(file.filename)}</li>`)
                    .join('')}
                </ul>
              </div>`
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>INNER LIGHT Yoga</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:28px 24px;background:linear-gradient(135deg,#ff8a80 0%,#ffcc80 16.66%,#fff9c4 33.33%,#a5d6a7 50%,#81d4fa 66.66%,#9fa8da 83.33%,#ce93d8 100%);text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:300;letter-spacing:4px;">INNER LIGHT</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:13px;">Yoga & Meditation</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 26px 16px;">
              <p style="margin:0 0 20px;color:#4b5563;font-size:16px;line-height:1.7;">Hi ${firstName},</p>
              ${paragraphs}
              ${imagesSection}
              ${attachmentSection}
              <div style="margin:24px 0 0;padding-top:20px;border-top:1px solid #e5e7eb;text-align:left;">
                <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;">CLASS DETAILS</p>
                <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">📍 <strong>Venue:</strong> Village Valley Centre, Ashhurst</p>
                <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">⏱ <strong>Duration:</strong> 60 minutes per class</p>
                <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.7;">👥 <strong>Evening class:</strong> Small group</p>

                <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.7;">💡 <strong>Wednesday 9:15am:</strong> Not limited in numbers — <strong>walk-ins welcome</strong></p>

                <p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.7;">Classes start from <strong>1 April 2026</strong>.<br />Spots are limited — book early to secure your place.</p>

                <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">Looking forward to seeing you on the mat 🙏</p>
              </div>

              <table role="presentation" width="86%" cellspacing="0" cellpadding="0" style="margin-top:18px;">
                <tr>
                  <td style="width:36%; text-align:left; vertical-align:top;">
                    <img
                      src="${logoUrl || getCompanyLogoUrl()}"
                      alt="INNER LIGHT Yoga"
                      width="140"
                      style="display:inline-block; height:auto; max-width:140px; opacity:0.95; transform: translateY(-8px);"
                    />
                  </td>
                  <td style="width:64%; text-align:left; vertical-align:top; padding-top:12px;">
                    <a
                      href="https://www.innerlight.co.nz/"
                      style="display:inline-block;padding:12px 24px;border-radius:999px;background:linear-gradient(135deg,#0ea5e9,#8b5cf6);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.2px;margin-left:8px;"
                    >
                      Book Classe Here
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#6b7280;font-size:12px;">Move with awareness. Live with balance. Shine from within. ✨</p>
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

export async function POST(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const { subject, content, testEmail, confirmPhrase } = body;
    const selectedRecipientEmails = normalizeSelectedRecipients(body?.selectedRecipients);
    const attachments = normalizeAttachments(body?.attachments);

    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Email content is required' }, { status: 400 });
    }

    if (!testEmail && String(confirmPhrase || '').trim() !== REQUIRED_CONFIRM_PHRASE) {
      return NextResponse.json(
        { error: `Confirmation required. Please provide confirmPhrase: ${REQUIRED_CONFIRM_PHRASE}` },
        { status: 400 }
      );
    }

    let recipients = [];

    if (testEmail) {
      recipients = normalizeTestRecipients(testEmail, session.user.name || 'Test User');
    } else if (selectedRecipientEmails.length > 0) {
      const users = await User.find({ role: 'student', email: { $in: selectedRecipientEmails } }).select('email name').lean();
      const intakes = await HealthIntake.find({ userEmail: { $in: selectedRecipientEmails } }).select('userEmail userName').lean();

      const emailMap = new Map();
      users.forEach((u) => {
        if (u.email) {
          emailMap.set(u.email.toLowerCase(), { email: u.email, name: u.name || 'Student' });
        }
      });

      intakes.forEach((i) => {
        if (i.userEmail) {
          const key = i.userEmail.toLowerCase();
          if (!emailMap.has(key)) {
            emailMap.set(key, { email: i.userEmail, name: i.userName || 'Student' });
          }
        }
      });

      recipients = selectedRecipientEmails
        .map((email) => emailMap.get(email))
        .filter(Boolean);

      if (recipients.length === 0) {
        return NextResponse.json({ error: 'No valid selected recipients found' }, { status: 400 });
      }
    } else {
      const users = await User.find({ role: 'student' }).select('email name').lean();
      const intakes = await HealthIntake.find({}).select('userEmail userName').lean();

      const emailMap = new Map();
      users.forEach((u) => {
        if (u.email) {
          emailMap.set(u.email.toLowerCase(), { email: u.email, name: u.name || 'Student' });
        }
      });

      intakes.forEach((i) => {
        if (i.userEmail) {
          const key = i.userEmail.toLowerCase();
          if (!emailMap.has(key)) {
            emailMap.set(key, { email: i.userEmail, name: i.userName || 'Student' });
          }
        }
      });

      recipients = Array.from(emailMap.values());
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    const logoAttachment = await loadCompanyLogoAttachment();

    // Separate images from file attachments and add CID to images
    const inlineImages = attachments.filter(isInlineImage).map((file, idx) => ({
      ...file,
      cid: `image-${idx}@innerlight`,
    }));
    
    const fileAttachments = attachments.filter((f) => !isInlineImage(f));

    const emailBatch = recipients.map((recipient) => {
      const personalizedSubject = personalizeTextForRecipient(subject.trim(), recipient.name);
      const personalizedContent = personalizeTextForRecipient(content.trim(), recipient.name);

      // Combine inline images and file attachments for Resend
      const allAttachments = [
        ...(logoAttachment ? [logoAttachment] : []),
        ...inlineImages.map((img) => ({
          filename: img.filename,
          content: Buffer.from(img.content, 'base64'),
          contentId: img.cid,
        })),
        ...fileAttachments.map((file) => ({
          filename: file.filename,
          content: Buffer.from(file.content, 'base64'),
        })),
      ];

      return {
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: recipient.email,
        subject: personalizedSubject,
        html: appendBrandLogo(
          buildCustomEmailHtml({
            userName: recipient.name,
            content: personalizedContent,
            logoUrl: getCompanyLogoUrl(),
            inlineImages,
            fileAttachments,
          }),
          undefined
        ),
        replyTo: COMPANY_EMAIL,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
      };
    });

    if (testEmail) {
      const { data, error } = await resend.batch.send(emailBatch);
      if (error) {
        const message = withResendGuidance(extractErrorMessage(error));
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
        ids: Array.isArray(data) ? data.map((item) => item?.id).filter(Boolean) : [data?.id].filter(Boolean),
      });
    }

    let totalSent = 0;
    const errors = [];

    for (let i = 0; i < emailBatch.length; i += BATCH_SIZE) {
      const chunk = emailBatch.slice(i, i + BATCH_SIZE);
      try {
        const { data, error } = await resend.batch.send(chunk);
        if (error) {
          errors.push(`Chunk ${i / BATCH_SIZE + 1}: ${withResendGuidance(extractErrorMessage(error))}`);
          continue;
        }
        totalSent += Array.isArray(data) ? data.length : chunk.length;
      } catch (err) {
        errors.push(`Chunk ${i / BATCH_SIZE + 1}: ${withResendGuidance(extractErrorMessage(err))}`);
      }
    }

    if (totalSent === 0) {
      const firstError = errors[0] ? ` ${errors[0]}` : '';
      return NextResponse.json(
        {
          success: false,
          error: `All deliveries failed.${firstError}`,
          errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: errors.length === 0,
      partialSuccess: errors.length > 0,
      sent: totalSent,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send custom email', detail: error.message },
      { status: 500 }
    );
  }
}
