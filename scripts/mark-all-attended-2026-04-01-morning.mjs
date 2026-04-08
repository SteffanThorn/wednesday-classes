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

const classDate = new Date('2026-04-01T00:00:00.000Z');
const dayStart = new Date('2026-04-01T00:00:00.000Z');
const dayEnd = new Date('2026-04-01T23:59:59.999Z');
const classTime = getClassTimeForDay('wednesday-morning');
const className = getClassNameForDay('wednesday-morning');
const location = 'Village Valley Centre, Ashhurst';

const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).lean();
if (!admin) throw new Error('No admin user found');

const bookings = await Booking.find({
  classDate,
  classTime,
  status: { $in: ['confirmed', 'completed', 'pending'] },
})
  .sort({ userName: 1 })
  .lean();

let created = 0;
let updated = 0;

for (const b of bookings) {
  const email = String(b.userEmail || '').toLowerCase().trim();
  if (!email) continue;

  const existing = await ClassAttendance.findOne({
    userEmail: email,
    classDate: { $gte: dayStart, $lte: dayEnd },
    classTime,
  });

  if (!existing) {
    await ClassAttendance.create({
      userId: b.userId,
      userEmail: email,
      userName: b.userName || email,
      className,
      classDate,
      classTime,
      location: b.location || location,
      bookingId: b._id,
      status: 'attended',
      usedCredit: false,
      markedByAdminId: admin._id,
      markedByAdminEmail: admin.email,
      createdAt: new Date(),
    });
    created += 1;
  } else {
    existing.userName = b.userName || existing.userName;
    existing.className = className;
    existing.classDate = classDate;
    existing.classTime = classTime;
    existing.location = existing.location || b.location || location;
    existing.status = 'attended';
    existing.bookingId = existing.bookingId || b._id;
    await existing.save();
    updated += 1;
  }
}

const attended = await ClassAttendance.find({
  classDate: { $gte: dayStart, $lte: dayEnd },
  classTime,
  status: 'attended',
})
  .select('userName userEmail')
  .sort({ userName: 1 })
  .lean();

console.log(JSON.stringify({
  success: true,
  classDate: '2026-04-01',
  classTime,
  bookingsFound: bookings.length,
  attendanceUpsert: { created, updated },
  attendedCount: attended.length,
  roster: attended.map((r) => `${r.userName} <${r.userEmail}>`),
}, null, 2));
