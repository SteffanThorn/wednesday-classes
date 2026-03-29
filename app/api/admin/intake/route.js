import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';
import mongoose from 'mongoose';

const PACKAGE_TOTAL_CLASSES = 5;

export async function GET(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const id = searchParams.get('id');

  let query = {};

  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: '无效的客户档案ID（Intake ID）。/ Invalid intake ID.',
          code: 'INVALID_INTAKE_ID',
        },
        { status: 400 }
      );
    }
    query = { _id: id };
  } else if (email) {
    query = { userEmail: email.toLowerCase() };
  }

  const intakes = await HealthIntake.find(query)
    .populate({
      path: 'userId',
      select: 'classCredits',
    })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    intakes: intakes.map((i) => {
      const fallbackRemaining = Number.isFinite(Number(i.remainingClassCredits))
        ? Number(i.remainingClassCredits)
        : PACKAGE_TOTAL_CLASSES;
      const remainingClassCredits = Math.min(
        PACKAGE_TOTAL_CLASSES,
        Math.max(0, i.userId?.classCredits ?? fallbackRemaining)
      );

      return {
        id: i._id.toString(),
        userName: i.userName,
        userEmail: i.userEmail,
        phone: i.phone,
        healthNotes: i.healthNotes,
        emergencyContactName: i.emergencyContactName,
        emergencyContactPhone: i.emergencyContactPhone,
        waiverAccepted: i.waiverAccepted,
        comments: i.comments,
        signatureDataUrl: i.signatureDataUrl,
        signatureName: i.signatureName || '',
        signedAt: i.signedAt,
        totalPackageClasses: i.totalPackageClasses || PACKAGE_TOTAL_CLASSES,
        remainingClassCredits,
        usedPackageClasses: Math.max(0, PACKAGE_TOTAL_CLASSES - remainingClassCredits),
        createdAt: i.createdAt,
      };
    }),
  });
}
