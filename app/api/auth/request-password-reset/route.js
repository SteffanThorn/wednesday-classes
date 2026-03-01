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
  console.log('Starting password reset request...');
  
  try {
    const body = await request.json();
    const { email } = body || {};

    console.log('Received email:', email);

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');

    console.log('Looking for user:', email.toLowerCase().trim());
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('User not found, returning success');
      // Return success regardless to prevent email enumeration
      return NextResponse.json({ message: 'If an account exists, a reset email will be sent' });
    }

    console.log('User found:', user._id);

    // Create secure random token and hash it
    const tokenRaw = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');

    // Compute expiry
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    console.log('Deleting old tokens...');
    // Optionally: Invalidate prior unconsumed tokens for this user to enforce one active token policy
    await ResetToken.deleteMany({ userId: user._id, consumedAt: null, expiresAt: { $gt: new Date() } });

    console.log('Creating new token...');
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

    console.log('Sending reset email...');
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

    console.log('Password reset email sent successfully');
    return NextResponse.json({ message: 'If an account exists, a reset email will be sent' });
  } catch (err) {
    console.error('request-password-reset error:', err);
    console.error('Error name:', err?.name);
    console.error('Error message:', err?.message);
    console.error('Error cause:', err?.cause);
    console.error('Error stack:', err?.stack);
    
    // Provide more specific error messages for common issues
    let errorMessage = 'Internal server error';
    const errorStr = String(err?.message || err || '');
    
    if (errorStr.includes('fetch failed') || errorStr.includes('ECONNREFUSED') || errorStr.includes('NetworkError')) {
      errorMessage = 'Unable to connect to email service. Please try again later.';
    } else if (errorStr.includes('Failed to send email')) {
      errorMessage = 'Failed to send reset email. Please try again later.';
    } else if (errorStr.includes('Authentication required') || errorStr.includes('Internal API key') || errorStr.includes('x-internal-api-key')) {
      errorMessage = 'Email service is not configured. Please contact the administrator.';
    } else if (errorStr.includes('Invalid email type')) {
      errorMessage = 'Email service configuration error. Please contact support.';
    } else if (errorStr.includes('MONGODB_URI') || errorStr.includes('MongoServerError')) {
      errorMessage = 'Database connection error. Please try again later.';
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

