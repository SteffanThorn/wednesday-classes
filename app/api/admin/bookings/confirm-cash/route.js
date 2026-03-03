import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

// PUT /api/admin/bookings/confirm-cash
export async function PUT(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    await dbConnect();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only allow confirming cash payments that are pending
    if (booking.paymentMethod !== 'cash' || booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Booking is not eligible for cash confirmation' }, { status: 400 });
    }

    booking.paymentStatus = 'completed';
    booking.paymentMethod = 'cash';
    booking.paidAt = new Date();
    booking.status = 'confirmed';
    booking.updatedAt = new Date();

    await booking.save();

    return NextResponse.json({ message: 'Booking marked as paid (cash)', bookingId: booking._id.toString() });
  } catch (error) {
    console.error('Error confirming cash payment:', error);
    return NextResponse.json({ error: 'Failed to confirm cash payment' }, { status: 500 });
  }
}
