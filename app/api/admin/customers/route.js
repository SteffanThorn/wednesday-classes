import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';
import User from '@/lib/models/User';
import { getSpendByUser, EMPTY_SPEND } from '@/lib/customer-spend';

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

    // Some intakes aren't linked to an account yet; match those by email.
    const unlinkedEmails = intakes
      .filter((intake) => !intake.userId?._id && intake.userEmail)
      .map((intake) => intake.userEmail.toLowerCase());
    const usersByEmail = new Map(
      (unlinkedEmails.length
        ? await User.find({ email: { $in: unlinkedEmails } }).select('email classCredits').lean()
        : []
      ).map((u) => [u.email, u])
    );
    const accountFor = (intake) => intake.userId?._id
      ? intake.userId
      : usersByEmail.get(intake.userEmail?.toLowerCase()) || null;

    // Students who registered on the website but haven't filled in a health
    // intake form yet. Without this they would not appear in Customer Data at all.
    const intakeUserIds = new Set(intakes.map((i) => accountFor(i)?._id?.toString()).filter(Boolean));
    const intakeEmails = new Set(intakes.map((i) => i.userEmail?.toLowerCase()).filter(Boolean));
    const accountOnlyUsers = (await User.find({ role: { $ne: 'admin' } })
      .select('name email phone classCredits')
      .lean())
      .filter((u) => !intakeUserIds.has(u._id.toString()) && !intakeEmails.has(u.email?.toLowerCase()));

    const spendByUser = await getSpendByUser([
      ...intakes.map((intake) => {
        const account = accountFor(intake);
        return { userId: account?._id, remainingCredits: account?.classCredits ?? 0 };
      }),
      ...accountOnlyUsers.map((u) => ({ userId: u._id, remainingCredits: u.classCredits ?? 0 })),
    ]);

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
        // Also use the account matched by email, so admin actions work for unlinked intakes.
        userId: accountFor(intake)?._id?.toString() || '',
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
        spend: spendByUser.get(accountFor(intake)?._id?.toString()) || EMPTY_SPEND,
        createdAt: intake.createdAt,
        updatedAt: intake.updatedAt,
      };
    });

    for (const user of accountOnlyUsers) {
      const remainingClassCredits = Math.max(0, Math.floor(Number(user.classCredits) || 0));
      customers.push({
        id: `account-${user._id.toString()}`,
        accountOnly: true,
        userId: user._id.toString(),
        userName: user.name || '',
        userEmail: user.email || '',
        phone: user.phone || '',
        healthNotes: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        waiverAccepted: false,
        comments: '',
        signatureName: '',
        signedAt: null,
        totalPackageClasses: remainingClassCredits,
        remainingClassCredits,
        usedPackageClasses: 0,
        spend: spendByUser.get(user._id.toString()) || EMPTY_SPEND,
        // Users have no createdAt field; the record id carries its creation time.
        createdAt: user._id.getTimestamp(),
        updatedAt: user._id.getTimestamp(),
      });
    }

    // Newest first, so fresh sign-ups show at the top.
    customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
