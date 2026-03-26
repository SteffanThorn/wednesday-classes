import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ hasIntake: false });
  }

  await dbConnect();

  const intake = await HealthIntake.findOne({ userEmail: session.user.email.toLowerCase() })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    hasIntake: !!intake,
    intake: intake
      ? {
          id: intake._id.toString(),
          userName: intake.userName,
          userEmail: intake.userEmail,
          phone: intake.phone,
          healthNotes: intake.healthNotes,
          emergencyContactName: intake.emergencyContactName,
          emergencyContactPhone: intake.emergencyContactPhone,
          waiverAccepted: intake.waiverAccepted,
          comments: intake.comments,
          signedAt: intake.signedAt,
        }
      : null,
  });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await request.json();
  const {
    phone,
    healthNotes,
    emergencyContactName,
    emergencyContactPhone,
    waiverAccepted,
    comments,
    signatureDataUrl,
  } = body;

  if (
    !healthNotes?.trim() ||
    !emergencyContactName?.trim() ||
    !emergencyContactPhone?.trim() ||
    !waiverAccepted ||
    !signatureDataUrl
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await dbConnect();

  const intake = new HealthIntake({
    userId: session.user.id,
    userEmail: session.user.email.toLowerCase(),
    userName: session.user.name,
    phone: phone?.trim() || '',
    healthNotes: healthNotes.trim(),
    emergencyContactName: emergencyContactName.trim(),
    emergencyContactPhone: emergencyContactPhone.trim(),
    waiverAccepted: true,
    comments: comments?.trim() || '',
    signatureDataUrl,
    signedAt: new Date(),
  });

  await intake.save();

  return NextResponse.json({ success: true, intakeId: intake._id.toString() });
}
