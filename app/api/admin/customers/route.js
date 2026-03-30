import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';

const PACKAGE_TOTAL_CLASSES = 5;

export async function GET(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const intakes = await HealthIntake.find({})
      .populate({
        path: 'userId',
        select: 'name email role classCredits',
      })
      .sort({ createdAt: -1 })
      .lean();

    const customers = intakes.map((intake) => {
      const fallbackRemaining = Number.isFinite(Number(intake.remainingClassCredits))
        ? Number(intake.remainingClassCredits)
        : PACKAGE_TOTAL_CLASSES;
      const remainingClassCredits = Math.min(
        PACKAGE_TOTAL_CLASSES,
        Math.max(0, intake.userId?.classCredits ?? fallbackRemaining)
      );

      return {
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
        totalPackageClasses: PACKAGE_TOTAL_CLASSES,
        remainingClassCredits,
        usedPackageClasses: Math.max(0, PACKAGE_TOTAL_CLASSES - remainingClassCredits),
        createdAt: intake.createdAt,
        updatedAt: intake.updatedAt,
      };
    });

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
