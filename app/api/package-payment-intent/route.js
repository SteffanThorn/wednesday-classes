import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Stripe from 'stripe';
import { FIVE_CLASS_PACKAGE_PRICE, FIVE_CLASS_PACKAGE_SIZE } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ADMIN_TEST_PACKAGE_COUPON = 'ADMINTEST1NZD';
const ADMIN_TEST_PACKAGE_PRICE = 1;

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to purchase class packages' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const couponCode = String(body?.couponCode || '').trim().toUpperCase();

    const isAdmin = session?.user?.role === 'admin';
    const useAdminTestCoupon = couponCode === ADMIN_TEST_PACKAGE_COUPON && isAdmin;
    const payableAmount = useAdminTestCoupon ? ADMIN_TEST_PACKAGE_PRICE : FIVE_CLASS_PACKAGE_PRICE;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payableAmount * 100),
      currency: 'nzd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        purchaseType: 'class_package',
        packageClasses: String(FIVE_CLASS_PACKAGE_SIZE),
        packagePrice: String(FIVE_CLASS_PACKAGE_PRICE),
        payableAmount: String(payableAmount),
        couponCode: useAdminTestCoupon ? ADMIN_TEST_PACKAGE_COUPON : '',
        userEmail: session.user.email,
        userId: session.user.id || 'unknown',
      },
      description: useAdminTestCoupon
        ? `${FIVE_CLASS_PACKAGE_SIZE}-Class Package (Admin Test Coupon)`
        : `${FIVE_CLASS_PACKAGE_SIZE}-Class Package`,
      receipt_email: session.user.email,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency?.toUpperCase(),
      appliedCoupon: useAdminTestCoupon
        ? {
            code: ADMIN_TEST_PACKAGE_COUPON,
            description: 'Admin-only $1 package test coupon',
            finalAmount: ADMIN_TEST_PACKAGE_PRICE,
          }
        : null,
    });
  } catch (error) {
    console.error('Error creating package payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to initialize package payment' },
      { status: 500 }
    );
  }
}
