import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const [
  { default: dbConnect },
  { default: Booking },
  { default: ClassAttendance },
  { inferDayFromClassName, getClassTimeForDay },
] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/Booking.js'),
  import('../lib/models/ClassAttendance.js'),
  import('../lib/class-schedule.js'),
]);

await dbConnect();

const classDateStr = process.argv[2] || '2026-04-01';
const dayStart = new Date(`${classDateStr}T00:00:00.000Z`);
const dayEnd = new Date(`${classDateStr}T23:59:59.999Z`);

function normalizeClassTime(classDate, classTime, className) {
  const inferred = inferDayFromClassName(className || '');
  if (inferred) return getClassTimeForDay(inferred);

  const weekday = new Date(classDate).getDay();
  const raw = String(classTime || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const compact = raw.replace(/\s+/g, '');

  if (weekday === 3 && (raw.includes('9:15') || compact.includes('915'))) {
    return getClassTimeForDay('wednesday-morning');
  }
  if (weekday === 3 && (raw.includes('6:00') || compact.includes('6pm') || compact.includes('600pm') || compact.includes('18:00'))) {
    return getClassTimeForDay('wednesday-evening');
  }
  if (weekday === 4 && (raw.includes('5:30') || compact.includes('530pm') || compact.includes('17:30'))) {
    return getClassTimeForDay('thursday-evening');
  }

  return String(classTime || '').trim();
}

function bookingPriority(record) {
  const status = String(record.status || '').toLowerCase();
  const payment = String(record.paymentStatus || '').toLowerCase();
  let score = 0;
  if (status === 'completed' || payment === 'completed' || payment === 'paid') score += 100;
  else if (status === 'confirmed' || payment === 'processing') score += 80;
  else if (status === 'pending' || payment === 'pending') score += 60;
  else if (status === 'cancelled') score += 10;
  score += Number(new Date(record.updatedAt || record.createdAt || 0).getTime() || 0) / 1e12;
  return score;
}

function attendancePriority(record) {
  const status = String(record.status || '').toLowerCase();
  let score = status === 'attended' ? 100 : status === 'no-show' ? 80 : 0;
  score += Number(new Date(record.createdAt || 0).getTime() || 0) / 1e12;
  return score;
}

const bookings = await Booking.find({ classDate: { $gte: dayStart, $lte: dayEnd } }).lean();
const attendance = await ClassAttendance.find({ classDate: { $gte: dayStart, $lte: dayEnd } }).lean();

const bookingGroups = new Map();
for (const b of bookings) {
  const email = String(b.userEmail || '').toLowerCase().trim();
  if (!email) continue;
  const normalizedTime = normalizeClassTime(b.classDate, b.classTime, b.className);
  const key = `${email}|${normalizedTime}`;
  if (!bookingGroups.has(key)) bookingGroups.set(key, []);
  bookingGroups.get(key).push(b);
}

const bookingDeleteIds = [];
const bookingKeepBySessionEmail = new Map();

for (const [key, group] of bookingGroups.entries()) {
  if (group.length <= 1) {
    const only = group[0];
    bookingKeepBySessionEmail.set(key, only?._id?.toString());
    continue;
  }

  const sorted = [...group].sort((a, b) => bookingPriority(b) - bookingPriority(a));
  const keeper = sorted[0];
  bookingKeepBySessionEmail.set(key, keeper._id.toString());

  for (const duplicate of sorted.slice(1)) {
    bookingDeleteIds.push(duplicate._id.toString());
  }
}

const attendanceGroups = new Map();
for (const a of attendance) {
  const email = String(a.userEmail || '').toLowerCase().trim();
  if (!email) continue;
  const normalizedTime = normalizeClassTime(a.classDate, a.classTime, a.className);
  const key = `${email}|${normalizedTime}`;
  if (!attendanceGroups.has(key)) attendanceGroups.set(key, []);
  attendanceGroups.get(key).push(a);
}

const attendanceDeleteIds = [];
const attendanceKeepers = [];

for (const group of attendanceGroups.values()) {
  if (group.length <= 1) {
    attendanceKeepers.push(group[0]);
    continue;
  }

  const sorted = [...group].sort((a, b) => attendancePriority(b) - attendancePriority(a));
  const keeper = sorted[0];
  attendanceKeepers.push(keeper);

  for (const duplicate of sorted.slice(1)) {
    attendanceDeleteIds.push(duplicate._id.toString());
  }
}

if (bookingDeleteIds.length > 0) {
  await Booking.deleteMany({ _id: { $in: bookingDeleteIds } });
}

if (attendanceDeleteIds.length > 0) {
  await ClassAttendance.deleteMany({ _id: { $in: attendanceDeleteIds } });
}

for (const record of attendanceKeepers) {
  const email = String(record.userEmail || '').toLowerCase().trim();
  const normalizedTime = normalizeClassTime(record.classDate, record.classTime, record.className);
  const key = `${email}|${normalizedTime}`;
  const keepBookingId = bookingKeepBySessionEmail.get(key);
  if (!keepBookingId) continue;

  await ClassAttendance.updateOne(
    { _id: record._id },
    {
      $set: {
        classTime: normalizedTime,
        bookingId: record.bookingId || keepBookingId,
      },
    }
  );
}

const finalBookings = await Booking.find({ classDate: { $gte: dayStart, $lte: dayEnd } })
  .select('userName userEmail classTime status paymentStatus')
  .sort({ classTime: 1, userName: 1 })
  .lean();

const finalAttendance = await ClassAttendance.find({ classDate: { $gte: dayStart, $lte: dayEnd } })
  .select('userName userEmail classTime status')
  .sort({ classTime: 1, userName: 1 })
  .lean();

console.log(
  JSON.stringify(
    {
      success: true,
      classDate: classDateStr,
      removedDuplicates: {
        bookingRecords: bookingDeleteIds.length,
        attendanceRecords: attendanceDeleteIds.length,
      },
      finalCounts: {
        bookings: finalBookings.length,
        attendance: finalAttendance.length,
      },
      finalAttendanceRoster: finalAttendance.map((r) => `${r.classTime} | ${r.userName} <${r.userEmail}> [${r.status}]`),
    },
    null,
    2
  )
);