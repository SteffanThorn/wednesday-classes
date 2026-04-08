import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const [
  { default: dbConnect },
  { default: User },
  { default: Booking },
  { default: ClassAttendance },
  { getClassNameForDay, getClassTimeForDay },
] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/User.js'),
  import('../lib/models/Booking.js'),
  import('../lib/models/ClassAttendance.js'),
  import('../lib/class-schedule.js'),
]);

await dbConnect();

const classDateStr = '2026-04-08';
const classDate = new Date(`${classDateStr}T00:00:00.000Z`);
const dayStart = new Date(`${classDateStr}T00:00:00.000Z`);
const dayEnd = new Date(`${classDateStr}T23:59:59.999Z`);
const classTime = getClassTimeForDay('wednesday-morning');
const className = getClassNameForDay('wednesday-morning');
const location = 'Village Valley Centre, Ashhurst';
const classPrice = 15;

const targets = [
  { raw: 'Linda shannon', lookup: /linda\s*shannon/i },
  { raw: 'Dianne atthoow', lookup: /dianne\s*attwood|dianne\s*attho+w|dianne\s*atthow/i },
  { raw: 'Lindy', lookup: /lindy\s*rell|lindy/i },
  { raw: 'glenys', lookup: /glenys/i },
  { raw: 'deb', lookup: /deb/i },
  { raw: 'linda macknight', lookup: /linda\s*macknight/i },
  { raw: 'Linda Shannon (duplicate)', lookup: /linda\s*shannon/i },
  { raw: 'Pamela', lookup: /pamela/i },
  { raw: 'Rosemry', lookup: /rosemary|rosemary|rosemry/i },
  { raw: 'Terasa', lookup: /terasa|teresa/i },
];

const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
if (!admin) throw new Error('No admin user found');

const allStudents = await User.find({ role: 'student' }).sort({ createdAt: 1 });

const matched = [];
const unmatched = [];

for (const target of targets) {
  const user = allStudents.find(
    (u) =>
      target.lookup.test(String(u.name || '')) ||
      target.lookup.test(String(u.email || ''))
  );

  if (!user) {
    unmatched.push({ requested: target.raw, status: 'user_not_found' });
    continue;
  }

  matched.push({ requested: target.raw, user });
}

const dedupByEmail = new Map();
for (const item of matched) {
  const email = String(item.user.email || '').toLowerCase().trim();
  if (!email) continue;
  if (!dedupByEmail.has(email)) {
    dedupByEmail.set(email, item);
  }
}

const results = [];

for (const [, item] of dedupByEmail) {
  const user = item.user;

  let booking = await Booking.findOne({
    userEmail: user.email,
    classDate,
    classTime,
  });

  if (!booking) {
    booking = await Booking.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      className,
      classDate,
      classTime,
      location,
      status: 'completed',
      paymentStatus: 'completed',
      paymentMethod: 'admin_assisted',
      paidAt: classDate,
      amount: classPrice,
      notes: `Manual backfill for ${classDateStr} ${classTime}`,
    });
  } else {
    booking.userName = user.name;
    booking.className = className;
    booking.location = booking.location || location;
    booking.status = 'completed';
    booking.paymentStatus = 'completed';
    booking.paymentMethod = booking.paymentMethod || 'admin_assisted';
    booking.paidAt = booking.paidAt || classDate;
    if (!Number.isFinite(Number(booking.amount)) || Number(booking.amount) <= 0) {
      booking.amount = classPrice;
    }
    booking.notes = booking.notes
      ? `${booking.notes} | Manual backfill ${classDateStr} ${classTime}`
      : `Manual backfill for ${classDateStr} ${classTime}`;
    await booking.save();
  }

  let attendance = await ClassAttendance.findOne({
    userEmail: String(user.email || '').toLowerCase().trim(),
    classDate: { $gte: dayStart, $lte: dayEnd },
    classTime,
  });

  let usedCredit = false;

  if (!attendance) {
    const currentCredits = Math.max(0, Number(user.classCredits || 0));
    if (currentCredits > 0) {
      user.classCredits = currentCredits - 1;
      user.classCreditHistory = Array.isArray(user.classCreditHistory)
        ? user.classCreditHistory
        : [];
      user.classCreditHistory.push({
        change: -1,
        type: 'used',
        description: `Manual backfill attendance for ${className} on ${classDateStr} (${classTime})`,
        bookingId: booking._id,
        createdAt: classDate,
      });
      await user.save();
      usedCredit = true;
    }

    attendance = await ClassAttendance.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      className,
      classDate: dayStart,
      classTime,
      location,
      bookingId: booking._id,
      status: 'attended',
      usedCredit,
      markedByAdminId: admin._id,
      markedByAdminEmail: admin.email,
      createdAt: classDate,
    });
  } else {
    attendance.userName = user.name;
    attendance.className = className;
    attendance.location = attendance.location || location;
    attendance.status = 'attended';
    attendance.bookingId = attendance.bookingId || booking._id;
    await attendance.save();
    usedCredit = !!attendance.usedCredit;
  }

  results.push({
    requested: item.requested,
    matchedName: user.name,
    email: user.email,
    bookingId: booking._id.toString(),
    attendanceId: attendance._id.toString(),
    usedCredit,
  });
}

const bookingCount = await Booking.countDocuments({
  classDate,
  classTime,
  status: { $in: ['confirmed', 'completed', 'pending', 'booked'] },
});

const checkedInCount = await ClassAttendance.countDocuments({
  classDate: { $gte: dayStart, $lte: dayEnd },
  classTime,
  status: 'attended',
});

const roster = await ClassAttendance.find({
  classDate: { $gte: dayStart, $lte: dayEnd },
  classTime,
  status: 'attended',
})
  .select('userName userEmail')
  .sort({ userName: 1 })
  .lean();

console.log(
  JSON.stringify(
    {
      success: true,
      classDate: classDateStr,
      classTime,
      className,
      inputCount: targets.length,
      dedupMatchedCount: dedupByEmail.size,
      processed: results,
      unmatched,
      verification: { bookingCount, checkedInCount },
      roster: roster.map((r) => `${r.userName} <${r.userEmail}>`),
    },
    null,
    2
  )
);