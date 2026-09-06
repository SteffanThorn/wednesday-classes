import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import SendLog, { summarizeSendLog } from '@/lib/models/SendLog';

/**
 * GET /api/admin/send-logs
 * Recent email send runs (newest first) with rolled-up delivery counts,
 * for the admin "发送记录" history page. Admin only.
 *
 * Query: ?limit=<n>  (default 50, max 200)
 */
export async function GET(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 200);

    const logs = await SendLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();

    const items = logs.map((log) => ({
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
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('GET /api/admin/send-logs error:', error);
    return NextResponse.json({ error: 'Failed to load send logs' }, { status: 500 });
  }
}
