import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import ClassAttendance from '@/lib/models/ClassAttendance';
import User from '@/lib/models/User';
import { periodRange, nzDay } from '@/lib/nz-date';

/**
 * GET /api/admin/reports/spending?period=month|quarter|year|all&value=2026-11|2026-Q4|2026
 *
 * Per student, for the chosen period:
 * - single classes and 5-class packs paid, classes bought, and total amount
 * - classes attended (from check-ins)
 * - payments with no known date are listed separately ("date unknown"):
 *   they count in their year and in "all time", but not in a month or quarter.
 */
export async function GET(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';
  const today = nzDay();
  const defaultValue = {
    month: today.toISOString().slice(0, 7),
    quarter: `${today.getUTCFullYear()}-Q${Math.floor(today.getUTCMonth() / 3) + 1}`,
    year: String(today.getUTCFullYear()),
    all: '',
  }[period];
  const value = searchParams.get('value') || defaultValue;
  const range = periodRange(period, value);

  if (!range) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
  }

  try {
    await dbConnect();

    const datedMatch = range.start
      ? { paidAt: { $gte: range.start, $lt: range.end } }
      : { paidAt: { $ne: null } };
    // Undated payments belong to a whole year: include them in that year and in "all time".
    const includeUndated = period === 'year' || period === 'all';
    const undatedMatch = { paidAt: null, ...(period === 'all' ? {} : { year: range.year }) };

    const groupStage = {
      $group: {
        _id: '$userId',
        userName: { $last: '$userName' },
        userEmail: { $last: '$userEmail' },
        singleCount: { $sum: { $cond: [{ $eq: ['$type', 'single'] }, 1, 0] } },
        singleAmount: { $sum: { $cond: [{ $eq: ['$type', 'single'] }, '$amount', 0] } },
        packageCount: { $sum: { $cond: [{ $eq: ['$type', 'package'] }, 1, 0] } },
        packageAmount: { $sum: { $cond: [{ $eq: ['$type', 'package'] }, '$amount', 0] } },
        classesBought: { $sum: '$classes' },
        amount: { $sum: '$amount' },
      },
    };

    const [paid, undated, owed, attended] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'paid', ...datedMatch } },
        groupStage,
      ]),
      Payment.aggregate([{ $match: { status: 'paid', ...undatedMatch } }, groupStage]),
      Payment.aggregate([
        { $match: { status: 'unpaid' } },
        { $group: { _id: '$userId', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      ClassAttendance.aggregate([
        { $match: { status: 'attended', ...(range.start ? { classDate: { $gte: range.start, $lt: range.end } } : {}) } },
        { $group: { _id: '$userId', count: { $sum: 1 }, userName: { $last: '$userName' }, userEmail: { $last: '$userEmail' } } },
      ]),
    ]);

    const rows = new Map();
    const blank = (id, name, email) => ({
      userId: id,
      userName: name || '',
      userEmail: email || '',
      singleCount: 0,
      singleAmount: 0,
      packageCount: 0,
      packageAmount: 0,
      classesBought: 0,
      amount: 0,
      undatedAmount: 0,
      undatedClasses: 0,
      attended: 0,
      owed: 0,
    });
    const rowFor = (id, name, email) => {
      if (!rows.has(id)) rows.set(id, blank(id, name, email));
      return rows.get(id);
    };

    for (const r of paid) {
      const id = r._id.toString();
      const row = rowFor(id, r.userName, r.userEmail);
      row.singleCount += r.singleCount;
      row.singleAmount += r.singleAmount;
      row.packageCount += r.packageCount;
      row.packageAmount += r.packageAmount;
      row.classesBought += r.classesBought;
      row.amount += r.amount;
    }

    for (const r of undated) {
      const id = r._id.toString();
      const row = rowFor(id, r.userName, r.userEmail);
      row.undatedAmount += r.amount;
      row.undatedClasses += r.classesBought;
      if (includeUndated) {
        row.singleCount += r.singleCount;
        row.singleAmount += r.singleAmount;
        row.packageCount += r.packageCount;
        row.packageAmount += r.packageAmount;
        row.classesBought += r.classesBought;
        row.amount += r.amount;
      }
    }

    for (const r of attended) {
      if (!r._id) continue;
      rowFor(r._id.toString(), r.userName, r.userEmail).attended = r.count;
    }

    for (const r of owed) {
      const id = r._id.toString();
      if (rows.has(id)) rows.get(id).owed = r.amount;
    }

    // Use current names/emails from the student accounts.
    const users = await User.find({ _id: { $in: [...rows.keys()] } }).select('name email').lean();
    for (const u of users) {
      const row = rows.get(u._id.toString());
      row.userName = u.name || row.userName;
      row.userEmail = u.email || row.userEmail;
    }

    const list = [...rows.values()]
      .filter((r) => r.amount > 0 || r.attended > 0 || r.undatedAmount > 0)
      .sort((a, b) => b.amount - a.amount || a.userName.localeCompare(b.userName));

    const totals = list.reduce(
      (t, r) => {
        for (const k of ['singleCount', 'singleAmount', 'packageCount', 'packageAmount', 'classesBought', 'amount', 'undatedAmount', 'undatedClasses', 'attended', 'owed']) {
          t[k] += r[k];
        }
        return t;
      },
      { singleCount: 0, singleAmount: 0, packageCount: 0, packageAmount: 0, classesBought: 0, amount: 0, undatedAmount: 0, undatedClasses: 0, attended: 0, owed: 0 }
    );

    // Years that have any payments, for the period picker.
    const yearRows = await Payment.aggregate([
      { $project: { y: { $ifNull: [{ $year: '$paidAt' }, '$year'] } } },
      { $group: { _id: '$y' } },
    ]);
    const years = yearRows.map((r) => r._id).filter(Boolean).sort((a, b) => b - a);

    return NextResponse.json({
      period,
      value,
      includeUndated,
      years: years.length ? years : [today.getUTCFullYear()],
      rows: list,
      totals,
    });
  } catch (error) {
    console.error('GET /api/admin/reports/spending error:', error);
    return NextResponse.json({ error: 'Failed to build spending report' }, { status: 500 });
  }
}
