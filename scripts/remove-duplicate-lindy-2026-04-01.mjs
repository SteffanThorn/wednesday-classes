import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const [{ default: dbConnect }, { default: Booking }, { default: ClassAttendance }, { getClassTimeForDay }] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/Booking.js'),
  import('../lib/models/ClassAttendance.js'),
  import('../lib/class-schedule.js'),
]);

await dbConnect();

const classDate = new Date('2026-04-01T00:00:00.000Z');
const classTime = getClassTimeForDay('wednesday-morning');
const dayStart = new Date('2026-04-01T00:00:00.000Z');
const dayEnd = new Date('2026-04-01T23:59:59.999Z');

const keepEmail = '000000@gmail.com';
const removeEmail = '1010298267@qq.com';

const removedBookings = await Booking.deleteMany({
  userEmail: removeEmail,
  classDate,
  classTime,
});

const removedAttendance = await ClassAttendance.deleteMany({
  userEmail: removeEmail,
  classDate: { $gte: dayStart, $lte: dayEnd },
  classTime,
});

const roster = await ClassAttendance.find({
  classDate: { $gte: dayStart, $lte: dayEnd },
  classTime,
  status: 'attended',
})
  .select('userName userEmail')
  .sort({ userName: 1 })
  .lean();

const keepExists = roster.some((r) => String(r.userEmail).toLowerCase().trim() === keepEmail);
const removeExists = roster.some((r) => String(r.userEmail).toLowerCase().trim() === removeEmail);

console.log(
  JSON.stringify(
    {
      success: true,
      removed: {
        removeEmail,
        bookingCount: removedBookings.deletedCount || 0,
        attendanceCount: removedAttendance.deletedCount || 0,
      },
      keep: {
        keepEmail,
        keepExists,
        removeStillExists: removeExists,
      },
      rosterCount: roster.length,
      roster: roster.map((r) => `${r.userName} <${r.userEmail}>`),
    },
    null,
    2
  )
);
