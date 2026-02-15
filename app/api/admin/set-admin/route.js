import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

// POST - Make the current user an admin (secret key required for security)
export async function POST(request) {
  try {
    // SECURITY: Require ADMIN_SECRET_KEY to be set in environment
    // Never use default/fallback keys in production
    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

    if (!ADMIN_SECRET) {
      console.error('ADMIN_SECRET_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Admin functionality is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { secretKey } = body;

    if (secretKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 401 }
      );
    }

    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const result = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (result) {
      return NextResponse.json({
        success: true,
        message: `You are now an admin! Your email: ${result.email}`
      });
    } else {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error setting admin:', error);
    return NextResponse.json(
      { error: 'Failed to set admin' },
      { status: 500 }
    );
  }
}

