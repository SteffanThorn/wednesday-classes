import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import AuditLog from '@/lib/models/AuditLog';

// PUT /api/admin/bookings/confirm-bring-friend
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

    if (!booking.bringAFriend) {
      return NextResponse.json({ error: 'This booking did not use Bring a Friend' }, { status: 400 });
    }

    if (booking.bringAFriendConfirmed) {
      return NextResponse.json({ error: 'Bring a Friend already confirmed for this booking' }, { status: 400 });
    }

    booking.bringAFriendConfirmed = true;
    booking.bringAFriendConfirmedAt = new Date();
    booking.updatedAt = new Date();

    await booking.save();

    try {
      const log = new AuditLog({
        type: 'confirm_bring_a_friend',
        adminId: session.user.id,
        adminEmail: session.user.email,
        bookingId: booking._id,
        details: `Bring a Friend confirmed by admin ${session.user.email}`,
      });
      await log.save();
    } catch (logErr) {
      console.error('Failed to write audit log for bring-a-friend confirmation:', logErr);
    }

    return NextResponse.json({
      message: 'Bring a Friend confirmed',
      bookingId: booking._id.toString(),
    });
  } catch (error) {
    console.error('Error confirming bring-a-friend:', error);
    return NextResponse.json({ error: 'Failed to confirm Bring a Friend' }, { status: 500 });
  }
}
