import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import HealthIntake from '@/lib/models/HealthIntake';
import { sendBookingConfirmationEmail } from '@/lib/email';

const MAX_STUDENTS_PER_CLASS = 10;

// Helper to get the Wednesday of the week for a given date
function getWednesday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 3); // Adjust when day is Sunday
  const wednesday = new Date(d.setDate(diff));
  wednesday.setHours(0, 0, 0, 0);
  return wednesday;
}

// Helper to format week range
function formatWeekRange(wednesday) {
  const endOfWeek = new Date(wednesday);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const options = { month: 'short', day: 'numeric' };
  return `${wednesday.toLocaleDateString('en-NZ', options)} - ${endOfWeek.toLocaleDateString('en-NZ', options)}`;
}

// GET - Fetch all bookings (admin only)
export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is admin
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const db = await dbConnect();
    
    // Check if database connection is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available. Please configure MONGODB_URI.' },
        { status: 503 }
      );
    }

    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fetch only future bookings (class date >= today) sorted by date
    const bookings = await Booking.find({
      classDate: { $gte: today }
    })
      .sort({ classDate: 1, createdAt: -1 })
      .lean();

    // Convert MongoDB _id to string id
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      id: booking._id.toString(),
    }));

    // Calculate weekly capacity summary
    const weeklyCapacity = {};
    
    // Group bookings by week (Wednesday)
    formattedBookings.forEach(booking => {
      // Skip cancelled bookings - they don't count toward capacity
      if (booking.status === 'cancelled') return;
      
      const weekStart = getWednesday(booking.classDate);
      const weekKey = weekStart.toISOString();
      
      if (!weeklyCapacity[weekKey]) {
        weeklyCapacity[weekKey] = {
          weekStart,
          weekLabel: formatWeekRange(weekStart),
          bookedCount: 0,
          pendingCount: 0,
          students: [],
          maxStudents: MAX_STUDENTS_PER_CLASS,
        };
      }
      
      // Only count paid/booked bookings toward capacity (not cancelled/failed)
      const isPaid = booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid';
      
      if (isPaid || booking.status === 'confirmed') {
        // Successful payment = "booked"
        weeklyCapacity[weekKey].bookedCount++;
        weeklyCapacity[weekKey].students.push({
          name: booking.userName,
          email: booking.userEmail,
          status: 'booked', // Display as "booked" for successful payments
          paymentStatus: booking.paymentStatus,
        });
      } else if (booking.status === 'pending' || booking.paymentStatus === 'processing') {
        // Pending/processing = "pending"
        weeklyCapacity[weekKey].pendingCount++;
        weeklyCapacity[weekKey].students.push({
          name: booking.userName,
          email: booking.userEmail,
          status: 'pending',
          paymentStatus: booking.paymentStatus,
        });
      }
    });

    // Convert to array and sort by week (most recent first)
    const weeklySummary = Object.values(weeklyCapacity)
      .sort((a, b) => b.weekStart - a.weekStart);

    return NextResponse.json({ 
      bookings: formattedBookings,
      weeklyCapacity: weeklySummary,
      maxStudentsPerClass: MAX_STUDENTS_PER_CLASS,
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Admin create booking for a customer (assisted booking)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const {
      intakeId,
      userEmail,
      className,
      classDate,
      classTime,
      location,
      sendEmail = true,
    } = body;

    if (!className || !classDate || !classTime || !location || (!intakeId && !userEmail)) {
      return NextResponse.json(
        { error: 'Missing required fields: className, classDate, classTime, location and intakeId/userEmail' },
        { status: 400 }
      );
    }

    let intake = null;
    if (intakeId) {
      intake = await HealthIntake.findById(intakeId).lean();
    }

    const normalizedEmail = (userEmail || intake?.userEmail || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'Student not found. Please add customer/student profile first.' },
        { status: 404 }
      );
    }

    const normalizedClassDate = new Date(classDate);
    if (Number.isNaN(normalizedClassDate.getTime())) {
      return NextResponse.json({ error: 'Invalid class date' }, { status: 400 });
    }

    const dayStart = new Date(normalizedClassDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(normalizedClassDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      userEmail: normalizedEmail,
      classDate: { $gte: dayStart, $lte: dayEnd },
      classTime,
      status: { $ne: 'cancelled' },
    }).lean();

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This customer already has a booking for this class session.' },
        { status: 409 }
      );
    }

    const booking = new Booking({
      userId: user._id,
      userEmail: normalizedEmail,
      userName: intake?.userName || user.name || 'Student',
      className,
      classDate: normalizedClassDate,
      classTime,
      location,
      amount: 0,
      notes: 'Admin assisted booking from Booking Management',
      status: 'confirmed',
      paymentStatus: 'completed',
      paymentMethod: 'admin_assisted',
      paidAt: new Date(),
    });

    await booking.save();

    const formattedDate = new Date(booking.classDate).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (sendEmail) {
      sendBookingConfirmationEmail({
        userEmail: booking.userEmail,
        userName: booking.userName,
        className: booking.className,
        classDate: formattedDate,
        classTime: booking.classTime,
        location: booking.location,
        amount: booking.amount,
        bookingId: booking._id.toString(),
      }).catch((err) => console.error('Failed to send booking confirmation email:', err));
    }

    return NextResponse.json({
      success: true,
      message: sendEmail
        ? 'Booking created and confirmation email sent.'
        : 'Booking created without sending confirmation email.',
      booking: {
        id: booking._id.toString(),
        userEmail: booking.userEmail,
        userName: booking.userName,
        className: booking.className,
        classDate: booking.classDate,
        classTime: booking.classTime,
        location: booking.location,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
      remainingClassCredits: Math.max(0, Number(user.classCredits || 0)),
      note: 'Class credits are deducted when attendance is marked.',
    });
  } catch (error) {
    console.error('Error creating admin booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

