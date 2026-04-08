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

const sourceDateStr = '2026-03-24';
const targetDateStr = '2026-03-25';

const sourceStart = new Date(`${sourceDateStr}T00:00:00.000Z`);
const sourceEnd = new Date(`${sourceDateStr}T23:59:59.999Z`);

const targetDate = new Date(`${targetDateStr}T00:00:00.000Z`);
const targetDayStart = new Date(targetDate);
targetDayStart.setHours(0, 0, 0, 0);
const targetDayEnd = new Date(targetDate);
targetDayEnd.setHours(23, 59, 59, 999);

const targetClassTime = getClassTimeForDay('wednesday-morning');
const targetClassName = getClassNameForDay('wednesday-morning');
const location = 'Village Valley Centre, Ashhurst';
const classPrice = 15;

const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
if (!admin) throw new Error('No admin user found');

const sourceAttendance = await ClassAttendance.find({
  classDate: { $gte: sourceStart, $lte: sourceEnd },
  status: 'attended',
})
  .sort({ createdAt: 1 })
  .lean();

const uniqueByEmail = new Map();
for (const record of sourceAttendance) {
  const email = String(record.userEmail || '').toLowerCase().trim();
  if (!email) continue;
  if (!uniqueByEmail.has(email)) uniqueByEmail.set(email, record);
}

const sourceRoster = Array.from(uniqueByEmail.values());
const moved = [];

for (const record of sourceRoster) {
  const email = String(record.userEmail || '').toLowerCase().trim();
  let user = await User.findOne({ email });
  if (!user) {
    moved.push({ email, status: 'user_not_found' });
    continue;
  }

  let booking = await Booking.findOne({
    userEmail: email,
    classDate: targetDate,
    classTime: targetClassTime,
  });

  if (!booking) {
    booking = await Booking.create({
      userId: user._id,
      userEmail: email,
      userName: user.name || record.userName || email,
      className: targetClassName,
      classDate: targetDate,
      classTime: targetClassTime,
      location: record.location || location,
      status: 'completed',
      paymentStatus: 'completed',
      paymentMethod: 'admin_assisted',
      paidAt: targetDate,
      amount: classPrice,
      notes: `Moved from ${sourceDateStr} to ${targetDateStr} ${targetClassTime}`,
    });
  } else {
    booking.userName = user.name || booking.userName;
    booking.className = targetClassName;
    booking.classDate = targetDate;
    booking.classTime = targetClassTime;
    booking.location = booking.location || record.location || location;
    booking.status = 'completed';
    booking.paymentStatus = 'completed';
    booking.paymentMethod = booking.paymentMethod || 'admin_assisted';
    booking.paidAt = booking.paidAt || targetDate;
    if (!Number.isFinite(Number(booking.amount)) || Number(booking.amount) <= 0) booking.amount = classPrice;
    booking.notes = booking.notes
      ? `${booking.notes} | Moved from ${sourceDateStr}`
      : `Moved from ${sourceDateStr} to ${targetDateStr} ${targetClassTime}`;
    await booking.save();
  }

  let attendance = await ClassAttendance.findOne({
    userEmail: email,
    classDate: { $gte: targetDayStart, $lte: targetDayEnd },
    classTime: targetClassTime,
  });

  if (!attendance) {
    attendance = await ClassAttendance.create({
      userId: user._id,
      userEmail: email,
      userName: user.name || record.userName || email,
      className: targetClassName,
      classDate: targetDayStart,
      classTime: targetClassTime,
      location: record.location || location,
      bookingId: booking._id,
      status: 'attended',
      usedCredit: false,
      markedByAdminId: admin._id,
      markedByAdminEmail: admin.email,
      createdAt: targetDate,
    });
  } else {
    attendance.userName = user.name || attendance.userName;
    attendance.className = targetClassName;
    attendance.classDate = targetDayStart;
    attendance.classTime = targetClassTime;
    attendance.location = attendance.location || record.location || location;
    attendance.status = 'attended';
    attendance.bookingId = attendance.bookingId || booking._id;
    await attendance.save();
  }

  moved.push({
    name: user.name || record.userName || email,
    email,
    bookingId: booking._id.toString(),
    attendanceId: attendance._id.toString(),
    status: 'moved',
  });
}

const beforeDeleteBookings = await Booking.countDocuments({ classDate: { $gte: sourceStart, $lte: sourceEnd } });
const beforeDeleteAttendance = await ClassAttendance.countDocuments({ classDate: { $gte: sourceStart, $lte: sourceEnd } });

const deletedBookings = await Booking.deleteMany({ classDate: { $gte: sourceStart, $lte: sourceEnd } });
const deletedAttendance = await ClassAttendance.deleteMany({ classDate: { $gte: sourceStart, $lte: sourceEnd } });

const afterDeleteBookings = await Booking.countDocuments({ classDate: { $gte: sourceStart, $lte: sourceEnd } });
const afterDeleteAttendance = await ClassAttendance.countDocuments({ classDate: { $gte: sourceStart, $lte: sourceEnd } });

const targetBookingCount = await Booking.countDocuments({
  classDate: targetDate,
  classTime: targetClassTime,
  status: { $in: ['confirmed', 'completed', 'pending'] },
});

const targetAttendanceCount = await ClassAttendance.countDocuments({
  classDate: { $gte: targetDayStart, $lte: targetDayEnd },
  classTime: targetClassTime,
  status: 'attended',
});

console.log(JSON.stringify({
  success: true,
  sourceDate: sourceDateStr,
  targetDate: targetDateStr,
  targetClassTime,
  sourceRosterCount: sourceRoster.length,
  moved,
  sourceDeleted: {
    before: { bookings: beforeDeleteBookings, attendance: beforeDeleteAttendance },
    deleted: { bookings: deletedBookings.deletedCount || 0, attendance: deletedAttendance.deletedCount || 0 },
    after: { bookings: afterDeleteBookings, attendance: afterDeleteAttendance },
  },
  targetVerification: {
    bookingCount: targetBookingCount,
    attendedCount: targetAttendanceCount,
  },
}, null, 2));
