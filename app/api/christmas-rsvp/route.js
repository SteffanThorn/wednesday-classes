import { NextResponse, after } from 'next/server';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import ChristmasRsvp, { CHRISTMAS_CHOICES } from '@/lib/models/ChristmasRsvp';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/html-escape';
import { getPublicBaseUrl } from '@/lib/email-branding';

const nameKey = (name) => name.toLowerCase().replace(/\s+/g, ' ').trim();

const CHOICE_LABEL = {
  dec16: '12月16日（周三）/ December 16',
  dec23: '12月23日（周三）/ December 23',
  either: '两天都可以 / Either date',
  no: '这次不能参加 / Can’t join this time',
};

// Email Yuki as soon as someone replies, with the running totals.
async function notifyAdmin({ name, choice, note, updated }) {
  const to = process.env.ADMIN_EMAIL || process.env.COMPANY_EMAIL || 'innerlightyuki@gmail.com';
  const sender = (process.env.EMAIL_FROM_PRODUCTION || '').trim() || (process.env.EMAIL_FROM_LOCAL || '').trim() || 'onboarding@resend.dev';

  const docs = await ChristmasRsvp.find({}).select('choice').lean();
  const counts = Object.fromEntries(CHRISTMAS_CHOICES.map((c) => [c, 0]));
  docs.forEach((d) => { counts[d.choice] += 1; });
  const totals = `12月16日 ${counts.dec16} · 12月23日 ${counts.dec23} · 两天都可以 ${counts.either} · 不能参加 ${counts.no}（共 ${docs.length} 人）`;
  const adminUrl = `${getPublicBaseUrl()}/admin/christmas`;
  const when = new Date().toLocaleString('zh-CN', { timeZone: 'Pacific/Auckland', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const rows = [
    ['姓名 / Name', name],
    ['选择 / Answer', CHOICE_LABEL[choice]],
    ['留言 / Note', note || '-'],
    ['提交时间 / Time', `${when}${updated ? '（更新了之前的回复）' : ''}`],
    ['目前统计 / Totals', totals],
  ];

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222;max-width:560px;">
  <p style="margin:0 0 12px;">${updated ? '有人更新了圣诞聚会问卷的回复：' : '有新的圣诞聚会问卷提交：'}</p>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
    ${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#666;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`).join('')}
  </table>
  <p style="margin:16px 0 0;"><a href="${adminUrl}" style="color:#1a56db;">打开后台查看全部回复</a></p>
</div>`;
  const text = [updated ? '有人更新了圣诞聚会问卷的回复：' : '有新的圣诞聚会问卷提交：', '', ...rows.map(([k, v]) => `${k}: ${v}`), '', adminUrl].join('\n');

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: `INNER LIGHT Website <${sender}>`,
    to: [to],
    subject: `圣诞节🎄问卷提交：${name}`,
    html,
    text,
  });
  if (error) throw new Error(error.message || 'Resend error');
}

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

/**
 * POST /api/christmas-rsvp — public, no login.
 * Body: { name, choice: 'dec16' | 'dec23' | 'either' | 'no', note? }
 * Replying again with the same name updates the earlier answer.
 */
export async function POST(request) {
  const limit = checkRateLimit(`christmas-rsvp:${getClientIp(request)}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many replies from this device. Please try again in a few minutes.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const name = String(body?.name || '').replace(/\s+/g, ' ').trim();
    const choice = String(body?.choice || '');
    const note = String(body?.note || '').trim().slice(0, 300);

    if (!name || name.length > 80) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!CHRISTMAS_CHOICES.includes(choice)) {
      return NextResponse.json({ error: 'Please choose one of the options.' }, { status: 400 });
    }

    await dbConnect();
    const existing = await ChristmasRsvp.findOne({ nameKey: nameKey(name) }).lean();
    await ChristmasRsvp.updateOne(
      { nameKey: nameKey(name) },
      { $set: { name, choice, note } },
      { upsert: true }
    );

    // Sent after the reply is saved; after() keeps it running on Vercel once the response is out
    after(() => notifyAdmin({ name, choice, note, updated: Boolean(existing) })
      .catch((err) => console.error('Christmas RSVP admin email failed:', err)));

    return NextResponse.json({ success: true, updated: Boolean(existing) });
  } catch (err) {
    console.error('POST /api/christmas-rsvp error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/** GET /api/christmas-rsvp — admin only: all replies and totals. */
export async function GET() {
  const denied = await ensureAdmin();
  if (denied) return denied;

  await dbConnect();
  const docs = await ChristmasRsvp.find({}).sort({ updatedAt: -1 }).lean();
  const counts = Object.fromEntries(CHRISTMAS_CHOICES.map((c) => [c, 0]));
  docs.forEach((d) => { counts[d.choice] += 1; });

  return NextResponse.json({
    success: true,
    counts,
    replies: docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      choice: d.choice,
      note: d.note || '',
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
  });
}

/** DELETE /api/christmas-rsvp?id=... — admin only, e.g. to remove a test or duplicate. */
export async function DELETE(request) {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get('id');
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Valid id is required' }, { status: 400 });
  }
  await dbConnect();
  await ChristmasRsvp.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}
