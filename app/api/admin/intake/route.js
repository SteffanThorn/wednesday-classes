import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';

export async function GET(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  const query = email ? { userEmail: email.toLowerCase() } : {};

  const intakes = await HealthIntake.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    intakes: intakes.map((i) => ({
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
      createdAt: i.createdAt,
    })),
  });
}
