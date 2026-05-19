import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { getCapacityForSlot, getClassTimeForDay } from '@/lib/class-schedule';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slot = searchParams.get('slot');
    const datesParam = searchParams.get('dates');

    if (!slot || !datesParam) {
      return NextResponse.json({ error: 'slot and dates are required' }, { status: 400 });
    }

    const capacity = getCapacityForSlot(slot);
    if (!capacity) {
      return NextResponse.json({ capacities: {}, capacity: null });
    }

    const classTime = getClassTimeForDay(slot);
    const dates = datesParam.split(',').filter(Boolean);

    await dbConnect();

    const capacities = {};
    for (const dateStr of dates) {
      const d = new Date(dateStr);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await Booking.countDocuments({
        classDate: { $gte: dayStart, $lte: dayEnd },
        classTime,
        status: { $ne: 'cancelled' },
        paymentStatus: { $nin: ['failed', 'canceled', 'refunded'] },
      });

      capacities[dateStr] = Math.max(0, capacity - count);
    }

    return NextResponse.json({ capacities, capacity });
  } catch (err) {
    console.error('GET /api/class-capacity error:', err);
    return NextResponse.json({ error: 'Failed to load capacity' }, { status: 500 });
  }
}
