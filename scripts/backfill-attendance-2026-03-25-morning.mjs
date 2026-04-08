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

const classDateStr = '2026-03-25';
const classDate = new Date(`${classDateStr}T00:00:00.000Z`);
const classTime = getClassTimeForDay('wednesday-morning');
const className = getClassNameForDay('wednesday-morning');
const location = 'Village Valley Centre, Ashhurst';
const classPrice = 15;

const targets = [
  { raw: 'Lindy', lookup: /lindy/i },
  { raw: 'glenys', lookup: /glenys/i },
  { raw: 'ann', lookup: /^ann$/i, allowCreate: true },
  { raw: 'yvette', lookup: /yvette/i },
  { raw: 'deb', lookup: /deb/i },
  { raw: 'linda macknight', lookup: /linda\s*macknight/i },
  { raw: 'Linda Shannon', lookup: /linda\s*shannon/i },
];

const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
if (!admin) throw new Error('No admin user found');

const allStudents = await User.find({ role: 'student' }).sort({ createdAt: 1 });
const dayStart = new Date(classDate); dayStart.setHours(0, 0, 0, 0);
const dayEnd = new Date(classDate); dayEnd.setHours(23, 59, 59, 999);

const results = [];

for (const target of targets) {
  let user = allStudents.find((u) => target.lookup.test(String(u.name || '')) || target.lookup.test(String(u.email || '')));

  if (!user && target.allowCreate) {
    const annEmail = 'ann-cash-2026-03-25@placeholder.local';
    user = await User.findOne({ email: annEmail });
    if (!user) {
      user = await User.create({
        name: 'Ann',
        email: annEmail,
        password: 'TempPass#2026!Ann',
        role: 'student',
        classCredits: 0,
      });
    }
  }

  if (!user) {
    results.push({ requested: target.raw, status: 'user_not_found' });
    continue;
  }

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
    if (!Number.isFinite(Number(booking.amount)) || Number(booking.amount) <= 0) booking.amount = classPrice;
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
      user.classCreditHistory = Array.isArray(user.classCreditHistory) ? user.classCreditHistory : [];
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
    requested: target.raw,
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
  status: { $in: ['confirmed', 'completed', 'pending'] },
});
const checkedInCount = await ClassAttendance.countDocuments({
  classDate: { $gte: dayStart, $lte: dayEnd },
  classTime,
  status: 'attended',
});

console.log(JSON.stringify({
  success: true,
  classDate: classDateStr,
  classTime,
  className,
  results,
  verification: { bookingCount, checkedInCount },
}, null, 2));
