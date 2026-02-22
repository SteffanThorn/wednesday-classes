import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import ResetToken from '@/lib/models/ResetToken';
import { sendEmail } from '@/lib/email';
import { getPasswordResetEmail, getPasswordResetText } from '@/lib/email-templates';

// Config
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MINUTES = parseInt(process.env.RESET_TOKEN_TTL_MINUTES || '30', 10);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success regardless to prevent email enumeration
      return NextResponse.json({ message: 'If an account exists, a reset email will be sent' });
    }

    // Create secure random token and hash it
    const tokenRaw = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');

    // Compute expiry
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    // Optionally: Invalidate prior unconsumed tokens for this user to enforce one active token policy
    await ResetToken.deleteMany({ userId: user._id, consumedAt: null, expiresAt: { $gt: new Date() } });

    // Save token
    await ResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    // Build reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(tokenRaw)}&email=${encodeURIComponent(user.email)}`;

    // Get user's name for the email
    const userName = user.name || 'there';

    // Send reset email using the styled template
    await sendEmail({
      to: user.email,
      subject: 'Reset your INNER LIGHT Yoga password',
      html: getPasswordResetEmail({
        userName,
        resetUrl,
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES
      }),
      text: getPasswordResetText({
        userName,
        resetUrl,
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES
      }),
    });

    return NextResponse.json({ message: 'If an account exists, a reset email will be sent' });
  } catch (err) {
    console.error('request-password-reset error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

