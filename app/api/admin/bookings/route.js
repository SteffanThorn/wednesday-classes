import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

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

    await dbConnect();

    // Fetch all bookings sorted by date (most recent first)
    const bookings = await Booking.find({})
      .sort({ classDate: -1, createdAt: -1 })
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

