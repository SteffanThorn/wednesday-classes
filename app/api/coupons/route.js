import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/lib/models/Coupon';

/**
 * Coupon Management API (Admin)
 * 
 * GET /api/coupons - List all coupons
 * POST /api/coupons - Create a new coupon
 * PUT /api/coupons - Update a coupon
/coupons - * DELETE /api Delete a coupon
 */

// GET - List all coupons
export async function GET(request) {
  console.log('=== /api/coupons GET called ===');
  
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin role
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      coupons,
    });
    
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon
export async function POST(request) {
  console.log('=== /api/coupons POST called ===');
  
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin role
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minClasses,
      maxUses,
      validFrom,
      validUntil,
      active,
      applicableTo,
    } = body;
    
    // Validate required fields
    if (!code || !discountType || discountValue === undefined || !validUntil) {
      return NextResponse.json(
        { error: 'Missing required fields: code, discountType, discountValue, validUntil' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }
    
    // Validate discount value
    if (discountType === 'percentage' && discountValue > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }
    
    // Create the coupon
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      description: description || '',
      discountType,
      discountValue,
      minClasses: minClasses || 1,
      maxUses: maxUses || null,
      validFrom: validFrom || new Date(),
      validUntil: new Date(validUntil),
      active: active !== false,
      applicableTo: applicableTo || 'all',
    });
    
    await coupon.save();
    
    console.log('Coupon created: ' + coupon.code);
    
    return NextResponse.json({
      success: true,
      coupon,
    });
    
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

// PUT - Update a coupon
export async function PUT(request) {
  console.log('=== /api/coupons PUT called ===');
  
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin role
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      id,
      code,
      description,
      discountType,
      discountValue,
      minClasses,
      maxUses,
      currentUses,
      validFrom,
      validUntil,
      active,
      applicableTo,
    } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find the coupon
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    // Update fields if provided
    if (code) coupon.code = code.toUpperCase().trim();
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minClasses !== undefined) coupon.minClasses = minClasses;
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (currentUses !== undefined) coupon.currentUses = currentUses;
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (active !== undefined) coupon.active = active;
    if (applicableTo) coupon.applicableTo = applicableTo;
    
    // Validate discount value
    if (coupon.discountType === 'percentage' && coupon.discountValue > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }
    
    await coupon.save();
    
    console.log('Coupon updated: ' + coupon.code);
    
    return NextResponse.json({
      success: true,
      coupon,
    });
    
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon
export async function DELETE(request) {
  console.log('=== /api/coupons DELETE called ===');
  
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin role
    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    console.log('Coupon deleted: ' + coupon.code);
    
    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
    
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
