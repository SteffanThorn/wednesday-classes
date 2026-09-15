import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import GuestbookMessage from '@/lib/models/GuestbookMessage';

/**
 * GET /api/admin/guestbook
 * Admin-only moderation list. Query: ?status=pending|approved|rejected|all (default 'pending').
 */
export async function GET(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const filter = status === 'all' ? {} : { status };

    const [items, counts] = await Promise.all([
      GuestbookMessage.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
      GuestbookMessage.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const countsByStatus = { pending: 0, approved: 0, rejected: 0 };
    counts.forEach((c) => {
      if (c._id in countsByStatus) countsByStatus[c._id] = c.count;
    });

    return NextResponse.json({
      success: true,
      counts: countsByStatus,
      items: items.map((m) => ({
        id: m._id.toString(),
        userName: m.userName,
        userEmail: m.userEmail,
        message: m.message,
        status: m.status,
        createdAt: m.createdAt,
        moderatedAt: m.moderatedAt,
        moderatedByEmail: m.moderatedByEmail,
      })),
    });
  } catch (error) {
    console.error('GET /api/admin/guestbook error:', error);
    return NextResponse.json({ error: 'Failed to load guestbook messages' }, { status: 500 });
  }
}
