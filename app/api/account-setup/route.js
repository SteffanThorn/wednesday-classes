import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

// GET /api/account-setup?token=xxx  — validate token, return name/email
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findOne({
    accountSetupToken: token,
    accountSetupExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'This link has expired or is invalid. Please contact your instructor.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ name: user.name, email: user.email });
}

// POST /api/account-setup  — set password and clear token
export async function POST(request) {
  const body = await request.json();
  const { token, password } = body;

  if (!token || !password) {
    return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  await dbConnect();

  const user = await User.findOne({
    accountSetupToken: token,
    accountSetupExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'This link has expired or is invalid. Please contact your instructor.' },
      { status: 400 }
    );
  }

  user.password = password; // will be hashed by pre-save hook
  user.accountSetupToken = null;
  user.accountSetupExpires = null;
  user.updatedAt = new Date();
  await user.save();

  return NextResponse.json({ success: true, email: user.email });
}
