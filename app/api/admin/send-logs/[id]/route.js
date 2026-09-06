import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import SendLog, { summarizeSendLog } from '@/lib/models/SendLog';

/**
 * GET /api/admin/send-logs/[id]
 * One send run with its full per-recipient status list. Admin only.
 * The newsletter results panel polls this for a few minutes after a send so the
 * delivered / bounced counts update live as Resend webhooks arrive.
 */

// Sort so the rows that need attention float to the top.
const STATUS_ORDER = {
  bounced: 0,
  complained: 1,
  failed: 2,
  delivery_delayed: 3,
  accepted: 4,
  sent: 5,
  delivered: 6,
};

export async function GET(request, context) {
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
      return NextResponse.json({ error: 'Invalid send log id' }, { status: 400 });
    }

    const log = await SendLog.findById(id).lean();
    if (!log) {
      return NextResponse.json({ error: 'Send log not found' }, { status: 404 });
    }

    const recipients = [...log.recipients]
      .sort((a, b) => {
        const rank = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
        if (rank !== 0) return rank;
        return String(a.email).localeCompare(String(b.email));
      })
      .map((r) => ({
        email: r.email,
        name: r.name || '',
        status: r.status,
        error: r.error || '',
        openedAt: r.openedAt || null,
        lastEventAt: r.lastEventAt || null,
      }));

    return NextResponse.json({
      success: true,
      log: {
        id: log._id.toString(),
        kind: log.kind,
        subject: log.subject,
        weekNumber: log.weekNumber ?? null,
        mode: log.mode,
        sentByName: log.sentByName || '',
        sentByEmail: log.sentByEmail || '',
        createdAt: log.createdAt,
        totalRecipients: log.totalRecipients,
        counts: summarizeSendLog(log),
        recipients,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/send-logs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to load send log' }, { status: 500 });
  }
}
