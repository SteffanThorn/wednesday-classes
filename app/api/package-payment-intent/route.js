import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Stripe from 'stripe';
import { FIVE_CLASS_PACKAGE_PRICE, FIVE_CLASS_PACKAGE_SIZE } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to purchase class packages' },
        { status: 401 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(FIVE_CLASS_PACKAGE_PRICE * 100),
      currency: 'nzd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        purchaseType: 'class_package',
        packageClasses: String(FIVE_CLASS_PACKAGE_SIZE),
        packagePrice: String(FIVE_CLASS_PACKAGE_PRICE),
        userEmail: session.user.email,
        userId: session.user.id || 'unknown',
      },
      description: `${FIVE_CLASS_PACKAGE_SIZE}-Class Package`,
      receipt_email: session.user.email,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency?.toUpperCase(),
    });
  } catch (error) {
    console.error('Error creating package payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to initialize package payment' },
      { status: 500 }
    );
  }
}
