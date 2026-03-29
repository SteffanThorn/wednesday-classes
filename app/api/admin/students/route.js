import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import HealthIntake from '@/lib/models/HealthIntake';

const PACKAGE_TOTAL_CLASSES = 5;
async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 }) };
  }

  return { session };
}

export async function GET(request) {
  try {
    const { error } = await ensureAdmin();
    if (error) return error;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    const query = { role: 'student' };
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .select('name email phone classCredits')
      .sort({ name: 1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      students: students.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        phone: s.phone || '',
        classCredits: s.classCredits || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { error } = await ensureAdmin();
    if (error) return error;

    const body = await request.json();
    const {
      name,
      email,
      phone,
      classCredits,
      healthNotes,
      emergencyContactName,
      emergencyContactPhone,
      waiverAccepted,
      comments,
      signatureName,
      signedAt,
    } = body;

    if (
      !name ||
      !email
    ) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const shouldSaveIntake =
      !!healthNotes?.trim() ||
      !!emergencyContactName?.trim() ||
      !!emergencyContactPhone?.trim() ||
      typeof waiverAccepted === 'boolean' ||
      !!comments?.trim() ||
      !!signatureName?.trim() ||
      !!signedAt;

    const normalizedEmail = email.toLowerCase().trim();
    const parsedClassCredits = Number.isFinite(Number(classCredits))
      ? Math.min(PACKAGE_TOTAL_CLASSES, Math.max(0, Number(classCredits)))
      : null;
    const effectiveClassCredits = parsedClassCredits ?? PACKAGE_TOTAL_CLASSES;

    await dbConnect();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.role === 'admin') {
        return NextResponse.json(
          { error: 'This email belongs to an admin account and cannot be updated as a student' },
          { status: 409 }
        );
      }

      existing.name = name.trim();
      existing.phone = phone?.trim() || '';
      existing.role = 'student';
      if (parsedClassCredits !== null) {
        existing.classCredits = parsedClassCredits;
      } else if (typeof existing.classCredits !== 'number') {
        existing.classCredits = PACKAGE_TOTAL_CLASSES;
      }
      if (!Array.isArray(existing.classCreditHistory)) {
        existing.classCreditHistory = [];
      }
      if (parsedClassCredits !== null) {
        existing.classCreditHistory.push({
          change: parsedClassCredits,
          type: 'adjustment',
          description: 'Migration opening balance set by admin',
          createdAt: new Date(),
        });
      }
      existing.updatedAt = new Date();
      await existing.save();

      if (shouldSaveIntake) {
        await HealthIntake.findOneAndUpdate(
          { userEmail: normalizedEmail },
          {
            userId: existing._id,
            userEmail: normalizedEmail,
            userName: existing.name,
            phone: phone?.trim() || '',
            healthNotes: healthNotes?.trim() || '',
            emergencyContactName: emergencyContactName?.trim() || '',
            emergencyContactPhone: emergencyContactPhone?.trim() || '',
            waiverAccepted: typeof waiverAccepted === 'boolean' ? waiverAccepted : false,
            comments: comments?.trim() || '',
            signatureName: signatureName?.trim() || '',
            totalPackageClasses: PACKAGE_TOTAL_CLASSES,
            remainingClassCredits: existing.classCredits,
            signedAt: signedAt ? new Date(signedAt) : new Date(),
            signatureDataUrl: '',
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      return NextResponse.json({
        message: 'Existing student and intake details updated successfully',
        student: {
          id: existing._id.toString(),
          name: existing.name,
          email: existing.email,
          phone: existing.phone || '',
          classCredits: existing.classCredits || 0,
        },
        emailSent: false,
      });
    }

    const temporaryPassword = `${crypto.randomBytes(8).toString('hex')}Aa1!`;

    const student = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      role: 'student',
      password: temporaryPassword,
      classCredits: effectiveClassCredits,
      classCreditHistory: parsedClassCredits !== null ? [{
        change: parsedClassCredits,
        type: 'adjustment',
        description: 'Migration opening balance set by admin',
        createdAt: new Date(),
      }] : [],
    });

    await student.save();

    if (shouldSaveIntake) {
      await HealthIntake.create({
        userId: student._id,
        userEmail: normalizedEmail,
        userName: student.name,
        phone: phone?.trim() || '',
        healthNotes: healthNotes?.trim() || '',
        emergencyContactName: emergencyContactName?.trim() || '',
        emergencyContactPhone: emergencyContactPhone?.trim() || '',
        waiverAccepted: typeof waiverAccepted === 'boolean' ? waiverAccepted : false,
        comments: comments?.trim() || '',
        signatureName: signatureName?.trim() || '',
        totalPackageClasses: PACKAGE_TOTAL_CLASSES,
        remainingClassCredits: effectiveClassCredits,
        signedAt: signedAt ? new Date(signedAt) : new Date(),
        signatureDataUrl: '',
      });
    }

    return NextResponse.json(
      {
        message: 'Student and intake details added successfully',
        student: {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          phone: student.phone || '',
          classCredits: student.classCredits || 0,
        },
        emailSent: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
