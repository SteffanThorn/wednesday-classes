import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';
import User from '@/lib/models/User';

export async function GET(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    // Get all health intakes with user information
    const intakes = await HealthIntake.find({})
      .populate({
        path: 'userId',
        select: 'name email role'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform data for the admin dashboard
    const customers = intakes.map((intake) => ({
      id: intake._id.toString(),
      userId: intake.userId?._id?.toString() || '',
      userName: intake.userName,
      userEmail: intake.userEmail,
      phone: intake.phone || '',
      healthNotes: intake.healthNotes || '',
      emergencyContactName: intake.emergencyContactName || '',
      emergencyContactPhone: intake.emergencyContactPhone || '',
      waiverAccepted: intake.waiverAccepted || false,
      comments: intake.comments || '',
      signatureName: intake.signatureName || '',
      signedAt: intake.signedAt || null,
      createdAt: intake.createdAt,
      updatedAt: intake.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
