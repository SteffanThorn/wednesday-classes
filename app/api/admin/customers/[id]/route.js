import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

const PACKAGE_TOTAL_CLASSES = 5;

export async function PUT(request, context) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const resolvedParams = await context?.params;
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: '无效的客户档案ID（Intake ID）。/ Invalid intake ID.',
          code: 'INVALID_INTAKE_ID',
          details: 'The URL customer record ID is missing or malformed.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      userName,
      userEmail,
      phone,
      healthNotes,
      emergencyContactName,
      emergencyContactPhone,
      waiverAccepted,
      comments,
      signatureName,
      remainingClassCredits,
    } = body;

    if (!userName?.trim() || !userEmail?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    const parsedRemainingClassCredits = Number.isFinite(Number(remainingClassCredits))
      ? Math.min(PACKAGE_TOTAL_CLASSES, Math.max(0, Math.floor(Number(remainingClassCredits))))
      : 0;

    const intake = await HealthIntake.findById(id);
    if (!intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

    let linkedUser = null;

    if (intake.userId && mongoose.Types.ObjectId.isValid(intake.userId)) {
      linkedUser = await User.findById(intake.userId);
    }

    if (!linkedUser) {
      linkedUser = await User.findOne({ email: intake.userEmail.toLowerCase() });
    }

    if (linkedUser && linkedUser.email !== normalizedEmail) {
      const emailInUse = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: linkedUser._id },
      }).lean();

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Another user already uses this email address' },
          { status: 409 }
        );
      }
    }

    if (linkedUser) {
      const previousCredits = Math.max(0, linkedUser.classCredits || 0);
      linkedUser.name = userName.trim();
      linkedUser.email = normalizedEmail;
      linkedUser.phone = phone?.trim() || '';
      linkedUser.classCredits = parsedRemainingClassCredits;
      linkedUser.classCreditHistory = Array.isArray(linkedUser.classCreditHistory)
        ? linkedUser.classCreditHistory
        : [];

      if (previousCredits !== parsedRemainingClassCredits) {
        linkedUser.classCreditHistory.push({
          change: parsedRemainingClassCredits - previousCredits,
          type: 'adjustment',
          description: `Admin updated remaining classes from customer management (${previousCredits} → ${parsedRemainingClassCredits})`,
          createdAt: new Date(),
        });
      }

      linkedUser.updatedAt = new Date();
      await linkedUser.save();
      intake.userId = linkedUser._id;
    }

    intake.userName = userName.trim();
    intake.userEmail = normalizedEmail;
    intake.phone = phone?.trim() || '';
    intake.healthNotes = healthNotes?.trim() || '';
    intake.emergencyContactName = emergencyContactName?.trim() || '';
    intake.emergencyContactPhone = emergencyContactPhone?.trim() || '';
    intake.waiverAccepted = !!waiverAccepted;
    intake.comments = comments?.trim() || '';
    intake.signatureName = signatureName?.trim() || '';
    intake.updatedAt = new Date();
    await intake.save();

    const effectiveRemainingClassCredits = linkedUser
      ? Math.max(0, linkedUser.classCredits || 0)
      : parsedRemainingClassCredits;

    return NextResponse.json({
      success: true,
      intake: {
        id: intake._id.toString(),
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
        remainingClassCredits: effectiveRemainingClassCredits,
        usedPackageClasses: Math.max(0, PACKAGE_TOTAL_CLASSES - effectiveRemainingClassCredits),
        createdAt: intake.createdAt,
        updatedAt: intake.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating intake:', error);
    return NextResponse.json(
      { error: 'Failed to update intake' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const resolvedParams = await context?.params;
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: '无效的客户档案ID（Intake ID）。/ Invalid intake ID.',
          code: 'INVALID_INTAKE_ID',
        },
        { status: 400 }
      );
    }

    const intake = await HealthIntake.findById(id);
    if (!intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

    await HealthIntake.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      deletedId: id,
      message: 'Customer profile deleted',
    });
  } catch (error) {
    console.error('Error deleting intake:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer profile' },
      { status: 500 }
    );
  }
}
