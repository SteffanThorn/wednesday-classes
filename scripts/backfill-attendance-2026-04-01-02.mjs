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

const location = 'Village Valley Centre, Ashhurst';
const classPrice = 15;

const targetEntries = [
  {
    raw: 'Rubben and kate',
    lookup: /rubben\s*and\s*kate|rubben|ruben/i,
    classDateStr: '2026-04-01',
    scheduleKey: 'wednesday-evening',
  },
  {
    raw: 'Deb',
    lookup: /deb/i,
    classDateStr: '2026-04-02',
    scheduleKey: 'thursday-evening',
  },
];

const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
if (!admin) throw new Error('No admin user found');

const allStudents = await User.find({ role: 'student' }).sort({ createdAt: 1 });
const summary = [];

for (const entry of targetEntries) {
  const user = allStudents.find((u) => entry.lookup.test(String(u.name || '')) || entry.lookup.test(String(u.email || '')));

  if (!user) {
    summary.push({
      requestedName: entry.raw,
      classDate: entry.classDateStr,
      status: 'user_not_found',
    });
    continue;
  }

  const classDate = new Date(`${entry.classDateStr}T00:00:00.000Z`);
  const classTime = getClassTimeForDay(entry.scheduleKey);
  const className = getClassNameForDay(entry.scheduleKey);

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
      notes: `Manual backfill for ${entry.classDateStr}`,
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
      ? `${booking.notes} | Manual backfill ${entry.classDateStr}`
      : `Manual backfill for ${entry.classDateStr}`;

    await booking.save();
  }

  const dayStart = new Date(classDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(classDate);
  dayEnd.setHours(23, 59, 59, 999);

  let attendance = await ClassAttendance.findOne({
    userEmail: user.email.toLowerCase().trim(),
    classDate: { $gte: dayStart, $lte: dayEnd },
    classTime,
  });

  if (!attendance) {
    let usedCredit = false;
    const currentCredits = Math.max(0, Number(user.classCredits || 0));

    if (currentCredits > 0) {
      user.classCredits = currentCredits - 1;
      user.classCreditHistory = Array.isArray(user.classCreditHistory) ? user.classCreditHistory : [];
      user.classCreditHistory.push({
        change: -1,
        type: 'used',
        description: `Manual backfill attendance for ${className} on ${entry.classDateStr} (${classTime})`,
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
  }

  summary.push({
    requestedName: entry.raw,
    matchedUser: user.name,
    email: user.email,
    classDate: entry.classDateStr,
    classTime,
    className,
    bookingId: booking._id.toString(),
    attendanceId: attendance._id.toString(),
    usedCredit: !!attendance.usedCredit,
  });
}

const verification = await Promise.all(
  targetEntries.map(async (entry) => {
    const classDate = new Date(`${entry.classDateStr}T00:00:00.000Z`);
    const classTime = getClassTimeForDay(entry.scheduleKey);
    const dayStart = new Date(classDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(classDate);
    dayEnd.setHours(23, 59, 59, 999);

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

    return {
      classDate: entry.classDateStr,
      classTime,
      bookingCount,
      checkedInCount,
    };
  })
);

console.log(
  JSON.stringify(
    {
      success: true,
      summary,
      verification,
    },
    null,
    2
  )
);
