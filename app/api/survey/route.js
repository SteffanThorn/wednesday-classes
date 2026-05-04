import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import dbConnect from '@/lib/mongodb';
import FutureCustomer from '@/lib/models/FutureCustomer';
import { classifyBodyType, getRiskAreas, BODY_TYPES } from '@/lib/body-assessment';

const resend = new Resend(process.env.RESEND_API_KEY);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  const input = String(value || '').trim();
  if (!input) return '';
  const keepPlus = input.startsWith('+');
  const digits = input.replace(/\D/g, '');
  return keepPlus ? `+${digits}` : digits;
}

function fmt(val) {
  return Array.isArray(val) ? val.join(', ') || '—' : String(val || '') || '—';
}

function buildAdminNotificationEmail({ name, email, phone, answers, bodyTypeName, bodyType, riskAreas }) {
  const c = bodyType.color;

  const rows = [
    ['Name',            name],
    ['Email',           email],
    ['Phone',           phone || '—'],
    ['Age Range',       fmt(answers.ageRange)],
    ['Body Type',       bodyTypeName],
    ['Risk Areas',      riskAreas.join(', ')],
    ['Pain Areas',      fmt(answers.painAreas)],
    ['Pain Frequency',  fmt(answers.painFrequency)],
    ['Pain Detail',     fmt(answers.painDetail)],
    ['Injury History',  fmt(answers.injuries)],
    ['Injury Detail',   fmt(answers.injuryDetail)],
    ['Lifestyle',       fmt(answers.lifestyle)],
    ['Body Feel',       fmt(answers.bodyFeel)],
    ['Goals',           fmt(answers.goals)],
    ['Waiver Accepted', answers.waiverAccepted ? 'Yes' : 'No'],
  ];

  const rowsHtml = rows.map(([label, val], i) => `
    <tr>
      <td style="padding:${i === 0 ? '8px' : '12px'} 0 8px;${i > 0 ? 'border-top:1px solid #e5e7eb;' : ''}">
        <p style="margin:0 0 2px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">${label}</p>
        <p style="margin:0;color:#111827;font-size:14px;line-height:1.5;">${val}</p>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    <tr>
      <td style="text-align:center;padding:22px 20px;background:linear-gradient(135deg,#0ea5e9 0%,#8b5cf6 100%);border-radius:12px 12px 0 0;">
        <h1 style="margin:0;color:white;font-size:20px;font-weight:300;letter-spacing:0.08em;">INNER LIGHT</h1>
        <p style="margin:5px 0 0;color:rgba(255,255,255,0.75);font-size:12px;">New Student Survey Submission</p>
      </td>
    </tr>
    <tr>
      <td style="background:#fff;padding:28px 24px;border-radius:0 0 12px 12px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;">
          <strong>${name}</strong> just completed the New Student Survey.
        </p>
        <!-- Body type badge -->
        <div style="display:inline-block;padding:5px 14px;border-radius:20px;background:${bodyType.bg};border:1px solid ${bodyType.border};margin-bottom:20px;">
          <span style="font-size:13px;font-weight:600;color:${c};">🧠 ${bodyTypeName}</span>
          <span style="font-size:12px;color:${c};margin-left:6px;">— ${bodyType.tagline}</span>
        </div>
        <!-- Survey data table -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="background:#f9fafb;border-radius:10px;padding:14px 18px;">
          ${rowsHtml}
        </table>
        <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">
          Reply to this email to contact ${name} directly.
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:center;padding:18px 20px;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">INNER LIGHT · New Zealand</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name, email, phone,
      ageRange, painAreas, painFrequency, painDetail,
      injuries, injuryDetail, lifestyle, bodyFeel, goals, waiverAccepted,
    } = body;

    const trimmedName     = String(name || '').trim();
    const normalizedEmail = normalizeEmail(email);

    if (!trimmedName || !normalizedEmail) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await dbConnect();

    // Build notes string for FutureCustomer record
    const parts = [];
    if (ageRange)                              parts.push(`Age: ${ageRange}`);
    if (Array.isArray(painAreas)  && painAreas.length)   parts.push(`Pain areas: ${painAreas.join(', ')}`);
    if (painFrequency)                         parts.push(`Pain frequency: ${painFrequency}`);
    if (painDetail?.trim())                    parts.push(`Pain detail: ${painDetail.trim()}`);
    if (Array.isArray(injuries)   && injuries.length)    parts.push(`Injury history: ${injuries.join(', ')}`);
    if (injuryDetail?.trim())                  parts.push(`Injury detail: ${injuryDetail.trim()}`);
    if (lifestyle)                             parts.push(`Lifestyle: ${lifestyle}`);
    if (Array.isArray(bodyFeel)   && bodyFeel.length)    parts.push(`Body feel: ${bodyFeel.join(', ')}`);
    if (Array.isArray(goals)      && goals.length)       parts.push(`Goals: ${goals.join(', ')}`);
    if (waiverAccepted !== null && waiverAccepted !== undefined)
                                               parts.push(`Waiver accepted: ${waiverAccepted ? 'yes' : 'no'}`);

    // Classify body type for the notification
    const answers = { painAreas, injuries, painFrequency, lifestyle, bodyFeel };
    const bodyTypeName = classifyBodyType(answers);
    const bodyType     = BODY_TYPES[bodyTypeName];
    const riskAreas    = getRiskAreas({ painAreas, injuries });

    // Save to database
    await FutureCustomer.create({
      name: trimmedName,
      email: normalizedEmail,
      phone: normalizePhone(phone),
      notes: parts.join(' | '),
      source: 'questionnaire',
    });

    // Send admin notification (fire and forget — don't block the response)
    const adminEmail  = process.env.COMPANY_EMAIL || 'innerlightyuki@gmail.com';
    const senderEmail = (process.env.EMAIL_FROM_PRODUCTION || '').trim()
      || (process.env.EMAIL_FROM_LOCAL || '').trim()
      || 'onboarding@resend.dev';
    const senderLabel = process.env.EMAIL_FROM_PRODUCTION ? 'INNER LIGHT Yoga' : 'INNER LIGHT Yoga (Test)';

    resend.emails.send({
      from:    `${senderLabel} <${senderEmail}>`,
      to:      [adminEmail],
      subject: `📋 New Survey — ${trimmedName} (${bodyTypeName})`,
      html:    buildAdminNotificationEmail({
        name: trimmedName, email: normalizedEmail, phone,
        answers: body, bodyTypeName, bodyType, riskAreas,
      }),
      replyTo: normalizedEmail,
    }).catch((err) => console.error('Admin survey notification error:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/survey error:', err);
    return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 });
  }
}
