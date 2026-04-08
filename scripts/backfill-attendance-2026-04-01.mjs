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

const classDateStr = '2026-04-01';
const classDate = new Date(`${classDateStr}T00:00:00.000Z`);
const classTime = getClassTimeForDay('wednesday-morning');
const className = getClassNameForDay('wednesday-morning');
const location = 'Village Valley Centre, Ashhurst';
const classPrice = 15;

const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
if (!admin) throw new Error('No admin user found');

const targetEntries = [
  { raw: 'Lindy relling', lookup: /lindy\s*rell/i },
  { raw: 'Linda macknight', lookup: /linda\s*macknight/i },
  { raw: 'Linda shannon', lookup: /linda\s*shannon/i },
  { raw: 'Glenys', lookup: /glenys/i },
  { raw: 'Ann', lookup: /^ann$/i, cash: true },
  { raw: 'Yvette', lookup: /yvette/i },
  { raw: 'Deb', lookup: /deb/i },
];

const allStudents = await User.find({ role: 'student' }).sort({ createdAt: 1 });

async function resolveStudent(entry) {
  let user = allStudents.find((u) => entry.lookup.test(String(u.name || '')));

  if (!user && entry.raw.toLowerCase() === 'ann') {
    const annEmail = 'ann-cash-2026-04-01@placeholder.local';
    user = await User.findOne({ email: annEmail });
    if (!user) {
      user = await User.create({
        email: annEmail,
        password: 'TempPass#2026!Ann',
        name: 'Ann',
        role: 'student',
        classCredits: 0,
      });
    }
  }

  return user || null;
}

const summary = [];

for (const entry of targetEntries) {
  const user = await resolveStudent(entry);

  if (!user) {
    summary.push({ name: entry.raw, status: 'user_not_found' });
    continue;
  }

  const paymentMethod = entry.cash ? 'cash' : 'admin_assisted';

  let booking = await Booking.findOne({ userEmail: user.email, classDate, classTime });

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
      paymentMethod,
      paidAt: classDate,
      amount: classPrice,
      notes: entry.cash ? 'Cash paid (manual backfill: Ann)' : 'Manual backfill for 2026-04-01 attendance',
    });
  } else {
    booking.userName = user.name;
    booking.className = className;
    booking.location = booking.location || location;
    booking.status = 'completed';
    booking.paymentStatus = 'completed';
    booking.paymentMethod = paymentMethod;
    booking.paidAt = booking.paidAt || classDate;

    if (!Number.isFinite(Number(booking.amount)) || Number(booking.amount) <= 0) {
      booking.amount = classPrice;
    }

    if (entry.cash) {
      booking.notes = booking.notes ? `${booking.notes} | Cash paid` : 'Cash paid';
    }

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
  }

  summary.push({
    name: user.name,
    email: user.email,
    bookingId: booking._id.toString(),
    attendanceId: attendance._id.toString(),
    cash: !!entry.cash,
    usedCredit: !!attendance.usedCredit,
  });
}

const verifyBookings = await Booking.countDocuments({
  classDate,
  classTime,
  status: { $in: ['completed', 'confirmed', 'pending'] },
});

const verifyAttendance = await ClassAttendance.countDocuments({
  classDate: {
    $gte: new Date('2026-04-01T00:00:00.000Z'),
    $lte: new Date('2026-04-01T23:59:59.999Z'),
  },
  classTime,
  status: 'attended',
});

console.log(
  JSON.stringify(
    {
      classDate: classDateStr,
      classTime,
      className,
      summary,
      verify: {
        bookedCount: verifyBookings,
        attendedCount: verifyAttendance,
      },
    },
    null,
    2
  )
);
