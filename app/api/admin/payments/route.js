import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Payment from '@/lib/models/Payment';
import { SINGLE_CLASS_PRICE, FIVE_CLASS_PACKAGE_SIZE, FIVE_CLASS_PACKAGE_PRICE } from '@/lib/pricing';
import { nzDay, dayFromKey } from '@/lib/nz-date';

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session };
}

function serialize(p) {
  return {
    id: p._id.toString(),
    type: p.type,
    classes: p.classes,
    amount: p.amount,
    status: p.status,
    paidAt: p.paidAt || null,
    year: p.year || null,
    method: p.method || '',
    source: p.source,
    note: p.note || '',
    createdAt: p.createdAt,
  };
}

/** GET /api/admin/payments?userId=... — a student's payment records, newest first. */
export async function GET(request) {
  const { error } = await ensureAdmin();
  if (error) return error;

  const userId = new URL(request.url).searchParams.get('userId');
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
  }

  await dbConnect();
  const payments = await Payment.find({ userId }).sort({ paidAt: -1, createdAt: -1 }).lean();
  return NextResponse.json({ payments: payments.map(serialize) });
}

/**
 * POST /api/admin/payments — record a payment.
 * Body: { userId, type: 'package' | 'single', paidAt: 'YYYY-MM-DD', method, status, note }
 * A paid 5-class pack also adds 5 class credits to the student.
 */
export async function POST(request) {
  const { session, error } = await ensureAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { userId, type, method = '', note = '' } = body || {};
    const status = body?.status === 'unpaid' ? 'unpaid' : 'paid';

    if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !['package', 'single'].includes(type)) {
      return NextResponse.json({ error: 'userId and type (package or single) are required' }, { status: 400 });
    }

    const paidAt = body?.paidAt ? dayFromKey(body.paidAt) : nzDay();
    if (!paidAt) {
      return NextResponse.json({ error: 'paidAt must be a date like 2026-11-06' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const isPackage = type === 'package';
    const payment = await Payment.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      type,
      classes: isPackage ? FIVE_CLASS_PACKAGE_SIZE : 1,
      amount: isPackage ? FIVE_CLASS_PACKAGE_PRICE : SINGLE_CLASS_PRICE,
      status,
      paidAt: status === 'paid' ? paidAt : undefined,
      year: paidAt.getUTCFullYear(),
      method: String(method).slice(0, 40),
      source: 'admin',
      note: String(note).slice(0, 300),
      createdByEmail: session.user.email,
    });

    if (isPackage) {
      user.classCredits = (user.classCredits || 0) + FIVE_CLASS_PACKAGE_SIZE;
      user.classCreditHistory = user.classCreditHistory || [];
      user.classCreditHistory.push({
        change: FIVE_CLASS_PACKAGE_SIZE,
        type: 'purchase',
        description: `${FIVE_CLASS_PACKAGE_SIZE}-class package recorded by admin${status === 'unpaid' ? ' (yet to pay)' : ''}`,
      });
      await user.save();
    }

    return NextResponse.json({
      message: isPackage
        ? `Recorded a 5-class pack ($${FIVE_CLASS_PACKAGE_PRICE}) and added ${FIVE_CLASS_PACKAGE_SIZE} classes.`
        : `Recorded a single class ($${SINGLE_CLASS_PRICE}).`,
      payment: serialize(payment),
      classCredits: user.classCredits || 0,
    });
  } catch (err) {
    console.error('POST /api/admin/payments error:', err);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}

/** PATCH /api/admin/payments — { id, status: 'paid' | 'unpaid', paidAt? } */
export async function PATCH(request) {
  const { error } = await ensureAdmin();
  if (error) return error;

  try {
    const { id, status, paidAt } = await request.json();
    if (!id || !mongoose.Types.ObjectId.isValid(id) || !['paid', 'unpaid'].includes(status)) {
      return NextResponse.json({ error: 'id and status (paid or unpaid) are required' }, { status: 400 });
    }

    const date = paidAt ? dayFromKey(paidAt) : nzDay();
    if (!date) {
      return NextResponse.json({ error: 'paidAt must be a date like 2026-11-06' }, { status: 400 });
    }

    await dbConnect();
    const update = status === 'paid'
      ? { $set: { status, paidAt: date, year: date.getUTCFullYear() } }
      : { $set: { status }, $unset: { paidAt: '' } };
    const payment = await Payment.findByIdAndUpdate(id, update, { new: true });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment: serialize(payment) });
  } catch (err) {
    console.error('PATCH /api/admin/payments error:', err);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/payments — { id }
 * Removes a payment record entered by mistake. Class credits are not changed.
 */
export async function DELETE(request) {
  const { error } = await ensureAdmin();
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid id is required' }, { status: 400 });
    }

    await dbConnect();
    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    if (payment.attendanceId) {
      return NextResponse.json(
        { error: 'This single class comes from a check-in. Cancel the check-in or change its payment status instead.' },
        { status: 400 }
      );
    }

    await payment.deleteOne();
    return NextResponse.json({ message: 'Payment record deleted. Remaining classes were not changed.' });
  } catch (err) {
    console.error('DELETE /api/admin/payments error:', err);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
