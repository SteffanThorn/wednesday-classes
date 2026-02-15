import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';

// PUT /api/bookings/cancel-update - Cancel a booking with the new policy
export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, cancellationType } = body;

    if (!bookingId || !cancellationType) {
      return NextResponse.json(
        { error: 'Booking ID and cancellation type are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find booking and verify ownership
    const booking = await Booking.findOne({
      _id: bookingId,
      userEmail: session.user.email
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed booking' },
        { status: 400 }
      );
    }

    // Calculate time until class
    const classDate = new Date(booking.classDate);
    const now = new Date();
    const hoursUntilClass = (classDate - now) / (1000 * 60 * 60);

    // Cancellation policy:
    // - Within 24 hours of class: 50% refund (no credit option)
    // - Outside 24 hours: Option of 90% refund OR 100% credit
    
    let refundAmount = 0;
    let creditAmount = 0;
    let cancellationMessage = '';

    if (hoursUntilClass <= 24) {
      // Within 24 hours - 50% refund only
      refundAmount = booking.amount * 0.5;
      cancellationMessage = `Cancelled within 24 hours of class. 50% refund ($${refundAmount.toFixed(2)}) will be processed.`;
    } else {
      // Outside 24 hours - user chooses
      if (cancellationType === 'refund') {
        // 90% refund
        refundAmount = booking.amount * 0.9;
        cancellationMessage = `Cancelled outside 24 hours. 90% refund ($${refundAmount.toFixed(2)}) will be processed.`;
      } else if (cancellationType === 'credit') {
        // 100% credit
        creditAmount = booking.amount;
        cancellationMessage = `Cancelled outside 24 hours. $${creditAmount.toFixed(2)} credit added to your account for future bookings.`;
        
        // Add credit to user's balance
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          user.creditBalance = (user.creditBalance || 0) + creditAmount;
          user.creditHistory = user.creditHistory || [];
          user.creditHistory.push({
            amount: creditAmount,
            type: 'earned',
            description: `Credit for cancelled booking: ${booking.className} on ${new Date(booking.classDate).toLocaleDateString()}`,
          });
          await user.save();
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid cancellation type. Use "refund" or "credit"' },
          { status: 400 }
        );
      }
    }

    // Update booking status with cancellation details
    booking.status = 'cancelled';
    booking.cancellationFee = booking.amount - refundAmount;
    booking.cancellationReason = cancellationMessage;
    booking.cancelledAt = new Date();
    booking.updatedAt = new Date();
    await booking.save();

    // Return cancellation details
    return NextResponse.json(
      { 
        message: 'Booking cancelled successfully',
        bookingId: bookingId,
        cancellationType: cancellationType,
        refundAmount: refundAmount,
        creditAmount: creditAmount,
        originalAmount: booking.amount,
        hoursUntilClass: hoursUntilClass,
      }
    );
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

// GET /api/bookings/cancel-update - Get cancellation preview (what options are available)
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const booking = await Booking.findOne({
      _id: bookingId,
      userEmail: session.user.email
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate time until class
    const classDate = new Date(booking.classDate);
    const now = new Date();
    const hoursUntilClass = (classDate - now) / (1000 * 60 * 60);
    const isWithin24Hours = hoursUntilClass <= 24;

    // Return cancellation options based on timing
    const cancellationOptions = {
      bookingId: bookingId,
      className: booking.className,
      classDate: booking.classDate,
      originalAmount: booking.amount,
      hoursUntilClass: Math.round(hoursUntilClass * 10) / 10,
      isWithin24Hours: isWithin24Hours,
      options: isWithin24Hours 
        ? [
            {
              type: 'refund',
              label: '50% Refund',
              description: `Get $${(booking.amount * 0.5).toFixed(2)} back (50% of original price)`,
            }
          ]
        : [
            {
              type: 'refund',
              label: '90% Refund',
              description: `Get $${(booking.amount * 0.9).toFixed(2)} back (90% of original price)`,
            },
            {
              type: 'credit',
              label: '100% Credit',
              description: `Get $${booking.amount.toFixed(2)} credit for future bookings`,
            }
          ]
    };

    return NextResponse.json(cancellationOptions);
  } catch (error) {
    console.error('Error getting cancellation options:', error);
    return NextResponse.json(
      { error: 'Failed to get cancellation options' },
      { status: 500 }
    );
  }
}

