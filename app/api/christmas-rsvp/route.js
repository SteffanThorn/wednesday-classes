import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import ChristmasRsvp, { CHRISTMAS_CHOICES } from '@/lib/models/ChristmasRsvp';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const nameKey = (name) => name.toLowerCase().replace(/\s+/g, ' ').trim();

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
