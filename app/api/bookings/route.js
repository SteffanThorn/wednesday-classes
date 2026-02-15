import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { sendBookingConfirmationEmail, sendCancellationEmail } from '@/lib/email';

// GET - Fetch user's bookings
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const bookings = await Booking.find({ userEmail: session.user.email })
      .sort({ classDate: 1 })
      .lean();

    // Convert MongoDB _id to string id
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      id: booking._id.toString(),
    }));

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to book a class' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      className,
      classDate,
      classTime,
      location,
      amount,
      notes
    } = body;

    // Validate required fields
    if (!className || !classDate || !classTime || !location || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create booking with pending status
    const booking = new Booking({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name || 'Guest',
      className,
      classDate: new Date(classDate),
      classTime,
      location,
      amount,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    await booking.save();

    // Send booking confirmation email (non-blocking)
    const formattedDate = new Date(booking.classDate).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    sendBookingConfirmationEmail({
      userEmail: booking.userEmail,
      userName: booking.userName,
      className: booking.className,
      classDate: formattedDate,
      classTime: booking.classTime,
      location: booking.location,
      amount: booking.amount,
      bookingId: booking._id.toString()
    }).catch(err => console.error('Failed to send booking confirmation email:', err));

    // Return the created booking
    const formattedBooking = {
      ...booking.toObject(),
      _id: booking._id.toString(),
      id: booking._id.toString(),
    };

    return NextResponse.json(
      { 
        message: 'Booking created successfully',
        booking: formattedBooking
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a booking with fee policy
export async function DELETE(request) {
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

    // Calculate cancellation fee based on policy
    // Cancellation policy:
    // - Within 24 hours of class: 50% fee
    // - Within 1 week (7 days) of class: 10% fee
    // - More than 1 week before class: 0% fee (full refund)
    const classDate = new Date(booking.classDate);
    const now = new Date();
    const hoursUntilClass = (classDate - now) / (1000 * 60 * 60);
    const daysUntilClass = hoursUntilClass / 24;

    let cancellationFee = 0;
    let feePercentage = 0;

    if (hoursUntilClass <= 24) {
      // Within 24 hours - 50% fee
      cancellationFee = booking.amount * 0.5;
      feePercentage = 50;
    } else if (daysUntilClass <= 7) {
      // Within 1 week - 10% fee
      cancellationFee = booking.amount * 0.1;
      feePercentage = 10;
    } else {
      // More than 1 week - no fee
      cancellationFee = 0;
      feePercentage = 0;
    }

    // Update booking status with cancellation details
    booking.status = 'cancelled';
    booking.cancellationFee = cancellationFee;
    booking.cancellationReason = feePercentage > 0 
      ? `Cancelled with ${feePercentage}% cancellation fee` 
      : 'Cancelled (no fee - more than 7 days before class)';
    booking.cancelledAt = new Date();
    booking.updatedAt = new Date();
    await booking.save();

    // Send cancellation email (non-blocking)
    const formattedDate = new Date(booking.classDate).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    sendCancellationEmail({
      userEmail: booking.userEmail,
      userName: booking.userName,
      className: booking.className,
      classDate: formattedDate,
      classTime: booking.classTime,
      bookingId: booking._id.toString()
    }).catch(err => console.error('Failed to send cancellation email:', err));

    // Return cancellation details
    return NextResponse.json(
      { 
        message: 'Booking cancelled successfully',
        bookingId: bookingId,
        cancellationFee: cancellationFee,
        originalAmount: booking.amount,
        feePercentage: feePercentage,
        refundAmount: booking.amount - cancellationFee
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

// POST /api/bookings/checkout - Create bookings and initiate checkout
export async function POST_checkout(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to book classes' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { classes } = body;

    if (!classes || !Array.isArray(classes) || classes.length === 0) {
      return NextResponse.json(
        { error: 'At least one class is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create all pending bookings
    const bookings = [];
    
    for (const cls of classes) {
      const {
        className,
        classDate,
        classTime,
        location,
        amount,
        notes
      } = cls;

      // Validate required fields
      if (!className || !classDate || !classTime || !location || amount === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields for one or more classes' },
          { status: 400 }
        );
      }

      const booking = new Booking({
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name || 'Guest',
        className,
        classDate: new Date(classDate),
        classTime,
        location,
        amount: parseFloat(amount),
        notes: notes || '',
        status: 'pending',
        paymentStatus: 'pending',
      });

      await booking.save();
      bookings.push({
        id: booking._id.toString(),
        ...booking.toObject(),
      });
    }

    // Return the created bookings
    return NextResponse.json(
      { 
        message: `${bookings.length} booking(s) created successfully`,
        bookings: bookings.map(b => ({
          id: b._id.toString(),
          className: b.className,
          classDate: b.classDate,
          classTime: b.classTime,
          location: b.location,
          amount: b.amount,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating bookings:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create bookings' },
      { status: 500 }
    );
  }
}

