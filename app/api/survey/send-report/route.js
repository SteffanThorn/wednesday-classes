import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { classifyBodyType, getRiskAreas, BODY_TYPES } from '@/lib/body-assessment';

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Email HTML builders ────────────────────────────────────────────

function buildUserEmail({ name, bodyTypeName, bodyType, riskAreas }) {
  const typeColor = bodyType.color;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    <tr>
      <td style="text-align:center;padding:30px 20px;background:linear-gradient(135deg,#0ea5e9 0%,#8b5cf6 100%);border-radius:12px 12px 0 0;">
        <h1 style="margin:0;color:white;font-size:28px;font-weight:300;letter-spacing:0.1em;">INNER LIGHT</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Yoga &amp; Mindful Movement</p>
      </td>
    </tr>
    <tr>
      <td style="background:#fff;padding:40px 32px;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">Level 1 Body Assessment</p>
        <h2 style="margin:0 0 24px;color:#111827;font-size:26px;font-weight:400;">Hi ${name} 🌿</h2>
        <p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.7;">
          Thank you for completing your New Student Survey. Based on your responses, here is your personalised Level 1 Body Assessment Report.
        </p>

        <!-- Body Type -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="background:${bodyType.bg};border:1px solid ${bodyType.border};border-radius:12px;padding:24px;margin-bottom:28px;">
          <tr>
            <td>
              <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${typeColor};">Body Type</p>
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:${typeColor};">${bodyTypeName}</p>
              <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">${bodyType.tagline}</p>
            </td>
          </tr>
        </table>

        <!-- Risk Areas -->
        <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#9ca3af;">Risk Areas</p>
        <ul style="margin:0 0 28px;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
          ${riskAreas.map((r) => `<li>${r}</li>`).join('')}
        </ul>

        <!-- Recommendation -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="background:#f8fafc;border-left:3px solid ${typeColor};border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:32px;">
          <tr>
            <td>
              <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${typeColor};">Training Recommendation</p>
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">${bodyType.recommendation.replace(/\s+/g, ' ').trim()}</p>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 6px;color:#4b5563;font-size:14px;line-height:1.7;">
          Please <strong>let your teacher know before class begins</strong> so we can support you safely.
          We look forward to welcoming you to the mat.
        </p>

        <p style="margin:28px 0 0;color:#9ca3af;font-size:14px;">
          With warmth,<br>
          <strong style="color:#111827;">Yuki</strong><br>
          <span style="font-size:12px;">Inner Light Yoga</span>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:center;padding:24px 20px;">
        <p style="margin:0 0 4px;color:#9ca3af;font-size:13px;">INNER LIGHT · New Zealand</p>
        <p style="margin:0;color:#6b7280;font-size:11px;">Breathe deeply. Move gently. Live fully.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAdminEmail({ name, email, phone, answers, bodyTypeName, bodyType, riskAreas }) {
  const typeColor = bodyType.color;
  const fmt = (val) => (Array.isArray(val) ? val.join(', ') || '—' : val || '—');

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || '—'],
    ['Age Range', fmt(answers.ageRange)],
    ['Body Type', bodyTypeName],
    ['Risk Areas', riskAreas.join(', ')],
    ['Pain Areas', fmt(answers.painAreas)],
    ['Pain Frequency', fmt(answers.painFrequency)],
    ['Pain Detail', fmt(answers.painDetail)],
    ['Injury History', fmt(answers.injuries)],
    ['Injury Detail', fmt(answers.injuryDetail)],
    ['Lifestyle', fmt(answers.lifestyle)],
    ['Body Feel', fmt(answers.bodyFeel)],
    ['Goals', fmt(answers.goals)],
    ['Waiver Accepted', answers.waiverAccepted ? 'Yes' : 'No'],
  ];

  const rowsHtml = rows.map(([label, val], i) => `
    <tr>
      <td style="padding:${i === 0 ? '10px' : '14px'} 0 10px;${i > 0 ? 'border-top:1px solid #e5e7eb;' : ''}">
        <p style="margin:0 0 3px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">${label}</p>
        <p style="margin:0;color:#111827;font-size:14px;">${val}</p>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    <tr>
      <td style="text-align:center;padding:24px 20px;background:linear-gradient(135deg,#0ea5e9 0%,#8b5cf6 100%);border-radius:12px 12px 0 0;">
        <h1 style="margin:0;color:white;font-size:22px;font-weight:300;">INNER LIGHT — Admin</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">New Student Body Assessment</p>
      </td>
    </tr>
    <tr>
      <td style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;">
        <div style="display:inline-block;padding:4px 14px;border-radius:20px;background:${bodyType.bg};border:1px solid ${bodyType.border};margin-bottom:20px;">
          <span style="font-size:13px;font-weight:600;color:${typeColor};">${bodyTypeName}</span>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:4px;">
          ${rowsHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Route handler ──────────────────────────────────────────────────

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { answers, emailConsent } = body;

    if (!emailConsent) {
      return NextResponse.json({ error: 'Email consent is required' }, { status: 400 });
    }

    const name  = String(answers?.name  || '').trim();
    const email = String(answers?.email || '').trim().toLowerCase();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid name and email are required' }, { status: 400 });
    }

    const bodyTypeName = classifyBodyType(answers);
    const bodyType     = BODY_TYPES[bodyTypeName];
    const riskAreas    = getRiskAreas(answers);

    const adminEmail = process.env.COMPANY_EMAIL || 'innerlightyuki@gmail.com';
    const senderEmail = (process.env.EMAIL_FROM_PRODUCTION || '').trim()
      || (process.env.EMAIL_FROM_LOCAL || '').trim()
      || 'onboarding@resend.dev';
    const senderLabel = process.env.EMAIL_FROM_PRODUCTION
      ? 'INNER LIGHT Yoga'
      : 'INNER LIGHT Yoga (Test)';
    const from = `${senderLabel} <${senderEmail}>`;

    // Send to user
    const { error: userError } = await resend.emails.send({
      from,
      to: [email],
      subject: `Your Level 1 Body Assessment — Inner Light Yoga 🧠`,
      html: buildUserEmail({ name, bodyTypeName, bodyType, riskAreas }),
      replyTo: adminEmail,
    });

    if (userError) {
      console.error('Resend user email error:', JSON.stringify(userError));
      return NextResponse.json(
        { error: userError?.message || userError?.name || JSON.stringify(userError) },
        { status: 500 }
      );
    }

    // Send copy to admin (fire and forget)
    resend.emails.send({
      from,
      to: [adminEmail],
      subject: `New Body Assessment — ${name} <${email}>`,
      html: buildAdminEmail({ name, email, phone: answers.phone, answers, bodyTypeName, bodyType, riskAreas }),
      replyTo: email,
    }).catch((err) => console.error('Admin email error:', err));

    return NextResponse.json({ success: true, bodyTypeName, riskAreas });
  } catch (err) {
    console.error('POST /api/survey/send-report error:', err);
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 });
  }
}
