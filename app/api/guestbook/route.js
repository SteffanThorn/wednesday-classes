import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import GuestbookMessage from '@/lib/models/GuestbookMessage';

const MAX_MESSAGE_LENGTH = 800;

/**
 * GET /api/guestbook
 * Public — returns approved guestbook messages for the homepage, newest first.
 */
export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100);

    const messages = await GuestbookMessage.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('userName message createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      messages: messages.map((m) => ({
        id: m._id.toString(),
        name: m.userName,
        message: m.message,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/guestbook error:', error);
    return NextResponse.json({ error: 'Failed to load guestbook messages' }, { status: 500 });
  }
}

/**
 * POST /api/guestbook
 * Any logged-in student may post. Body: { message }.
 * New messages start as 'pending' and only appear publicly once an admin
 * approves them via /admin/guestbook.
 */
export async function POST(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') {
    return NextResponse.json({ error: '请先以学生账号登录后再留言' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const message = String(body?.message || '').trim();

    if (!message) {
      return NextResponse.json({ error: '留言内容不能为空' }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `留言不能超过 ${MAX_MESSAGE_LENGTH} 字` }, { status: 400 });
    }

    const doc = await GuestbookMessage.create({
      userId: session.user.id,
      userName: session.user.name || 'Student',
      userEmail: session.user.email || '',
      message,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      id: doc._id.toString(),
      message: '留言已提交，审核通过后会显示在首页',
    });
  } catch (error) {
    console.error('POST /api/guestbook error:', error);
    return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 });
  }
}
