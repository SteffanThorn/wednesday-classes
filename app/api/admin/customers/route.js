import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';

const DEFAULT_PACKAGE_TOTAL_CLASSES = 5;
const MAX_PACKAGE_TOTAL_CLASSES = 20;

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
      const storedTotalClasses = Number.isFinite(Number(intake.totalPackageClasses))
        ? Math.floor(Number(intake.totalPackageClasses))
        : DEFAULT_PACKAGE_TOTAL_CLASSES;
      const fallbackRemaining = Number.isFinite(Number(intake.remainingClassCredits))
        ? Math.floor(Number(intake.remainingClassCredits))
        : storedTotalClasses;
      const rawRemainingClassCredits = Math.max(0, Math.floor(Number(intake.userId?.classCredits ?? fallbackRemaining)));
      const totalPackageClasses = Math.min(
        MAX_PACKAGE_TOTAL_CLASSES,
        Math.max(1, storedTotalClasses, rawRemainingClassCredits)
      );
      const remainingClassCredits = Math.min(totalPackageClasses, rawRemainingClassCredits);

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
        totalPackageClasses,
        remainingClassCredits,
        usedPackageClasses: Math.max(0, totalPackageClasses - remainingClassCredits),
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
