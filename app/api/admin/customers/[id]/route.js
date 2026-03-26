import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';
import mongoose from 'mongoose';

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const id = params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid intake ID' }, { status: 400 });
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
    } = body;

    // Validate required fields
    if (!userName?.trim() || !userEmail?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const intake = await HealthIntake.findByIdAndUpdate(
      id,
      {
        userName: userName.trim(),
        userEmail: userEmail.toLowerCase().trim(),
        phone: phone?.trim() || '',
        healthNotes: healthNotes?.trim() || '',
        emergencyContactName: emergencyContactName?.trim() || '',
        emergencyContactPhone: emergencyContactPhone?.trim() || '',
        waiverAccepted: waiverAccepted || false,
        comments: comments?.trim() || '',
        signatureName: signatureName?.trim() || '',
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

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
