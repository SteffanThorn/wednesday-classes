import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const [{ default: dbConnect }, { default: Booking }, { default: ClassAttendance }] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/Booking.js'),
  import('../lib/models/ClassAttendance.js'),
]);

await dbConnect();

const classDateStr = '2026-04-08';
const dayStart = new Date(`${classDateStr}T00:00:00.000Z`);
const dayEnd = new Date(`${classDateStr}T23:59:59.999Z`);

function normalizeName(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const [bookings, attendance] = await Promise.all([
  Booking.find({ classDate: { $gte: dayStart, $lte: dayEnd }, status: { $ne: 'cancelled' } })
    .select('userName userEmail classTime status paymentStatus createdAt updatedAt')
    .lean(),
  ClassAttendance.find({ classDate: { $gte: dayStart, $lte: dayEnd } })
    .select('userName userEmail classTime status createdAt')
    .lean(),
]);

const personMap = new Map();

for (const b of bookings) {
  const email = String(b.userEmail || '').toLowerCase().trim();
  const displayName = String(b.userName || '').trim() || email;
  const nameKey = normalizeName(displayName);
  if (!nameKey) continue;

  if (!personMap.has(nameKey)) {
    personMap.set(nameKey, {
      nameKey,
      displayNames: new Set(),
      emails: new Set(),
      bookings: [],
      attendance: [],
    });
  }

  const bucket = personMap.get(nameKey);
  bucket.displayNames.add(displayName);
  if (email) bucket.emails.add(email);
  bucket.bookings.push({
    email,
    classTime: b.classTime,
    status: b.status,
    paymentStatus: b.paymentStatus,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  });
}

for (const a of attendance) {
  const email = String(a.userEmail || '').toLowerCase().trim();
  const displayName = String(a.userName || '').trim() || email;
  const nameKey = normalizeName(displayName);
  if (!nameKey) continue;

  if (!personMap.has(nameKey)) {
    personMap.set(nameKey, {
      nameKey,
      displayNames: new Set(),
      emails: new Set(),
      bookings: [],
      attendance: [],
    });
  }

  const bucket = personMap.get(nameKey);
  bucket.displayNames.add(displayName);
  if (email) bucket.emails.add(email);
  bucket.attendance.push({
    email,
    classTime: a.classTime,
    status: a.status,
    createdAt: a.createdAt,
  });
}

const suspectedDuplicates = [];

for (const bucket of personMap.values()) {
  const emailList = Array.from(bucket.emails);
  if (emailList.length <= 1) continue;

  const emailStats = emailList.map((email) => {
    const bookingCount = bucket.bookings.filter((b) => b.email === email).length;
    const attendedCount = bucket.attendance.filter((a) => a.email === email && String(a.status || '').toLowerCase() === 'attended').length;
    const noShowCount = bucket.attendance.filter((a) => a.email === email && String(a.status || '').toLowerCase() === 'no-show').length;
    const latestTouch = [
      ...bucket.bookings.filter((b) => b.email === email).map((b) => new Date(b.updatedAt || b.createdAt || 0).getTime()),
      ...bucket.attendance.filter((a) => a.email === email).map((a) => new Date(a.createdAt || 0).getTime()),
    ].reduce((m, v) => (v > m ? v : m), 0);

    return {
      email,
      bookingCount,
      attendedCount,
      noShowCount,
      latestTouch,
    };
  });

  emailStats.sort((a, b) => {
    const aScore = a.attendedCount * 100 + a.bookingCount * 10 + a.latestTouch / 1e12;
    const bScore = b.attendedCount * 100 + b.bookingCount * 10 + b.latestTouch / 1e12;
    return bScore - aScore;
  });

  suspectedDuplicates.push({
    name: Array.from(bucket.displayNames)[0],
    nameVariants: Array.from(bucket.displayNames),
    candidateEmails: emailStats,
    suggestedKeepEmail: emailStats[0]?.email || null,
  });
}

suspectedDuplicates.sort((a, b) => a.name.localeCompare(b.name));

console.log(
  JSON.stringify(
    {
      success: true,
      classDate: classDateStr,
      totalBookings: bookings.length,
      totalAttendance: attendance.length,
      suspectedDuplicateGroups: suspectedDuplicates.length,
      groups: suspectedDuplicates,
    },
    null,
    2
  )
);