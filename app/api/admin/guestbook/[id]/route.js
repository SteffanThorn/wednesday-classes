import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import GuestbookMessage from '@/lib/models/GuestbookMessage';

/**
 * PATCH /api/admin/guestbook/[id]
 * Body: { status: 'approved' | 'rejected' } — moderates one message.
 */
export async function PATCH(request, context) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const resolvedParams = await context?.params;
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid guestbook message id' }, { status: 400 });
    }

    const body = await request.json();
    const nextStatus = body?.status;
    if (!['approved', 'rejected'].includes(nextStatus)) {
      return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
    }

    const doc = await GuestbookMessage.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    doc.status = nextStatus;
    doc.moderatedAt = new Date();
    doc.moderatedByEmail = session.user.email || '';
    await doc.save();

    return NextResponse.json({ success: true, id: doc._id.toString(), status: doc.status });
  } catch (error) {
    console.error('PATCH /api/admin/guestbook/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/guestbook/[id]
 * Permanently removes a message (any status).
 */
export async function DELETE(request, context) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const resolvedParams = await context?.params;
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid guestbook message id' }, { status: 400 });
    }

    const result = await GuestbookMessage.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/guestbook/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
