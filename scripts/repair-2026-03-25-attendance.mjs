import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const [{ default: dbConnect }, { default: User }, { default: Booking }, { default: ClassAttendance }, { getClassNameForDay, getClassTimeForDay }] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/User.js'),
  import('../lib/models/Booking.js'),
  import('../lib/models/ClassAttendance.js'),
  import('../lib/class-schedule.js'),
]);

await dbConnect();

const sourceStart = new Date('2026-03-24T00:00:00.000Z');
const sourceEnd = new Date('2026-03-24T23:59:59.999Z');
const targetDate = new Date('2026-03-25T00:00:00.000Z');
const targetStart = new Date('2026-03-25T00:00:00.000Z');
const targetEnd = new Date('2026-03-25T23:59:59.999Z');
const classTime = getClassTimeForDay('wednesday-morning');
const className = getClassNameForDay('wednesday-morning');
const location = 'Village Valley Centre, Ashhurst';

const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).lean();
if (!admin) throw new Error('No admin user found');

const bookings = await Booking.find({
  classDate: targetDate,
  classTime,
  status: { $in: ['confirmed', 'completed', 'pending'] },
}).lean();

let created = 0;
let updated = 0;
for (const b of bookings) {
  const email = String(b.userEmail || '').toLowerCase().trim();
  if (!email) continue;

  const existing = await ClassAttendance.findOne({
    userEmail: email,
    classDate: { $gte: targetStart, $lte: targetEnd },
    classTime,
  });

  if (!existing) {
    await ClassAttendance.create({
      userId: b.userId,
      userEmail: email,
      userName: b.userName || email,
      className,
      classDate: targetDate,
      classTime,
      location: b.location || location,
      bookingId: b._id,
      status: 'attended',
      usedCredit: false,
      markedByAdminId: admin._id,
      markedByAdminEmail: admin.email,
      createdAt: targetDate,
    });
    created += 1;
  } else {
    existing.userName = b.userName || existing.userName;
    existing.className = className;
    existing.classDate = targetDate;
    existing.classTime = classTime;
    existing.location = existing.location || b.location || location;
    existing.status = 'attended';
    existing.bookingId = existing.bookingId || b._id;
    await existing.save();
    updated += 1;
  }
}

const sourceBookings = await Booking.countDocuments({ classDate: { $gte: sourceStart, $lte: sourceEnd } });
const sourceAttendance = await ClassAttendance.countDocuments({ classDate: { $gte: sourceStart, $lte: sourceEnd } });
const targetBookings = await Booking.countDocuments({ classDate: targetDate, classTime, status: { $in: ['confirmed', 'completed', 'pending'] } });
const targetAttendance = await ClassAttendance.countDocuments({ classDate: { $gte: targetStart, $lte: targetEnd }, classTime, status: 'attended' });

const roster = await ClassAttendance.find({ classDate: { $gte: targetStart, $lte: targetEnd }, classTime, status: 'attended' })
  .select('userName userEmail')
  .sort({ userName: 1 })
  .lean();

console.log(JSON.stringify({
  success: true,
  attendanceUpsert: { created, updated },
  verify: {
    source_2026_03_24: { bookings: sourceBookings, attendance: sourceAttendance },
    target_2026_03_25_0915: { bookings: targetBookings, attendance: targetAttendance },
  },
  roster: roster.map((r) => `${r.userName} <${r.userEmail}>`),
}, null, 2));
