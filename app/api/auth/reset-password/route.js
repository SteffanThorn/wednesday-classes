import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import ResetToken from '@/lib/models/ResetToken';

function validatePassword(pw) {
  if (typeof pw !== 'string') return false;
  return pw.length >= 8; // reuse model-level min-length
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body || {};

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'email, token and newPassword are required' }, { status: 400 });
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'No account found for this email' }, { status: 404 });
    }

    // Hash incoming token for comparison
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');

    // Find a valid, unconsumed token for this user
    const now = new Date();
    const resetToken = await ResetToken.findOne({
      userId: user._id,
      tokenHash,
      consumedAt: null,
      expiresAt: { $gt: now },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Set new password (pre-save hook will hash)
    user.password = newPassword;
    await user.save();

    // Mark token as consumed
    resetToken.consumedAt = new Date();
    await resetToken.save();

    // Optional: cleanup other expired tokens for this user (best-effort)
    await ResetToken.deleteMany({ userId: user._id, expiresAt: { $lte: new Date() } }).catch(() => {});

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('reset-password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
