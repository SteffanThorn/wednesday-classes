import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';
import User from '@/lib/models/User';
import { getSpendByUser, EMPTY_SPEND } from '@/lib/customer-spend';
import mongoose from 'mongoose';

const DEFAULT_PACKAGE_TOTAL_CLASSES = 5;
const MAX_PACKAGE_TOTAL_CLASSES = 20;

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

  // Some intakes aren't linked to an account yet; match those by email.
  const unlinkedEmails = intakes
    .filter((i) => !i.userId?._id && i.userEmail)
    .map((i) => i.userEmail.toLowerCase());
  const usersByEmail = new Map(
    (unlinkedEmails.length
      ? await User.find({ email: { $in: unlinkedEmails } }).select('email classCredits').lean()
      : []
    ).map((u) => [u.email, u])
  );
  const accountFor = (i) => i.userId?._id ? i.userId : usersByEmail.get(i.userEmail?.toLowerCase()) || null;
  const spendByUser = await getSpendByUser(
    intakes.map((i) => {
      const account = accountFor(i);
      return { userId: account?._id, remainingCredits: account?.classCredits ?? 0 };
    })
  );

  return NextResponse.json({
    intakes: intakes.map((i) => {
      const storedTotalClasses = Number.isFinite(Number(i.totalPackageClasses))
        ? Math.floor(Number(i.totalPackageClasses))
        : DEFAULT_PACKAGE_TOTAL_CLASSES;
      const fallbackRemaining = Number.isFinite(Number(i.remainingClassCredits))
        ? Math.floor(Number(i.remainingClassCredits))
        : storedTotalClasses;
      const rawRemainingClassCredits = Math.max(0, Math.floor(Number(i.userId?.classCredits ?? fallbackRemaining)));
      const totalPackageClasses = Math.min(
        MAX_PACKAGE_TOTAL_CLASSES,
        Math.max(1, storedTotalClasses, rawRemainingClassCredits)
      );
      const remainingClassCredits = Math.min(totalPackageClasses, rawRemainingClassCredits);

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
        totalPackageClasses,
        remainingClassCredits,
        usedPackageClasses: Math.max(0, totalPackageClasses - remainingClassCredits),
        spend: spendByUser.get(accountFor(i)?._id?.toString()) || EMPTY_SPEND,
        createdAt: i.createdAt,
      };
    }),
  });
}
