import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { name, email, password, phone } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
    });

    // Send welcome email (non-blocking - don't wait for it)
    sendWelcomeEmail({ email: user.email, name: user.name }).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}

