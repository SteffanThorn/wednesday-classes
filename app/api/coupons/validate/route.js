import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/lib/models/Coupon';

/**
 * Validate Coupon API
 * 
 * Validates a coupon code and returns discount information
 * Authentication required to prevent brute-force attacks
 * 
 * POST /api/coupons/validate
 * Body: {
 *   code: string,
 *   numClasses: number (optional - for checking minClasses requirement)
 * }
 */
export async function POST(request) {
  console.log('=== /api/coupons/validate called ===');
  
  try {
    // SECURITY: Require authentication to prevent brute-force attacks
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to validate coupons' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { code, numClasses = 1 } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Find the coupon (case-insensitive)
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    
    if (!coupon) {
      console.log(`Coupon not found: ${code}`);
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      );
    }
    
    // Check if coupon is active
    if (!coupon.active) {
      console.log(`Coupon inactive: ${code}`);
      return NextResponse.json(
        { error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }
    
    // Check if coupon has expired
    const now = new Date();
    if (coupon.validUntil && now > new Date(coupon.validUntil)) {
      console.log(`Coupon expired: ${code}`);
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      );
    }
    
    // Check if coupon is not yet valid
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      console.log(`Coupon not yet valid: ${code}`);
      return NextResponse.json(
        { error: 'This coupon is not yet valid' },
        { status: 400 }
      );
    }
    
    // Check max uses
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      console.log(`Coupon max uses reached: ${code}`);
      return NextResponse.json(
        { error: 'This coupon has reached its maximum number of uses' },
        { status: 400 }
      );
    }
    
    // Check minimum classes requirement
    if (coupon.minClasses && numClasses < coupon.minClasses) {
      console.log(`Coupon min classes not met: ${code} (need ${coupon.minClasses}, have ${numClasses})`);
      return NextResponse.json(
        { 
          error: `This coupon requires at least ${coupon.minClasses} class(es)`,
          minClasses: coupon.minClasses 
        },
        { status: 400 }
      );
    }
    
    // Coupon is valid - return discount info
    console.log(`Coupon valid: ${code}`, {
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
    
    return NextResponse.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minClasses: coupon.minClasses,
    });
    
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

