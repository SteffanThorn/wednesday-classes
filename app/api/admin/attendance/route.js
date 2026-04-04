import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import ClassAttendance from '@/lib/models/ClassAttendance';
import { inferDayFromClassName, getClassNameForDay, getClassTimeForDay } from '@/lib/class-schedule';

const DEFAULT_CLASS_LOCATION = 'Village Valley Centre, Ashhurst';
const SLOT_ORDER = {
  'wednesday-morning': 1,
  'wednesday-evening': 2,
  'thursday-evening': 3,
};

const SLOT_CONFIG = [
  {
    scheduleKey: 'wednesday-morning',
    dayIndex: 3,
  },
  {
    scheduleKey: 'wednesday-evening',
    dayIndex: 3,
  },
  {
    scheduleKey: 'thursday-evening',
    dayIndex: 4,
  },
];

function toDateKey(date) {
  return new Date(date).toISOString().split('T')[0];
}

function getDayRange(classDate) {
  const dayStart = new Date(classDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(classDate);
  dayEnd.setHours(23, 59, 59, 999);

  return { dayStart, dayEnd };
}

function getTimeSortValue(label = '') {
  const normalized = String(label || '').trim().toUpperCase();
  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hour = Number(match[1] || 0);
  const minute = Number(match[2] || 0);
  const period = match[3] || null;

  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour < 12) hour += 12;

  return hour * 60 + minute;
}

function getScheduleKeyFromDateTime(classDate, classTime) {
  if (!classDate || !classTime) return null;
  return getScheduleKey({
    classDate,
    classTime,
    className: '',
  });
}

function buildGeneratedSessions(startDate, endDate) {
  const sessions = [];

  SLOT_CONFIG.forEach(({ scheduleKey, dayIndex }) => {
    const classTime = getClassTimeForDay(scheduleKey);
    const className = getClassNameForDay(scheduleKey);

    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);

    const offset = (dayIndex - cursor.getDay() + 7) % 7;
    cursor.setDate(cursor.getDate() + offset);

    while (cursor <= endDate) {
      const classDate = toDateKey(cursor);
      const { labelZh, labelEn } = getSlotLabels(scheduleKey, cursor, classTime);

      sessions.push({
        key: `${classDate}|${classTime}`,
        classDate,
        classTime,
        className,
        scheduleKey,
        location: DEFAULT_CLASS_LOCATION,
        label: `${classDate} · ${classTime}`,
        labelZh,
        labelEn,
        bookings: [],
      });

      cursor.setDate(cursor.getDate() + 7);
    }
  });

  return sessions;
}

function getScheduleKey(booking) {
  const inferred = inferDayFromClassName(booking.className || '');
  if (inferred) return inferred;

  const classTime = String(booking.classTime || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const compactTime = classTime.replace(/\s+/g, '');
  const weekday = new Date(booking.classDate).getDay();

  if (weekday === 3 && (classTime.includes('9:15') || classTime.includes('09:15'))) {
    return 'wednesday-morning';
  }

  if (
    weekday === 3 &&
    (
      classTime.includes('6:00') ||
      classTime.includes('18:00') ||
      compactTime.includes('6pm') ||
      compactTime.includes('6:00pm') ||
      compactTime.includes('18:00')
    )
  ) {
    return 'wednesday-evening';
  }

  if (
    weekday === 4 &&
    (
      classTime.includes('5:30') ||
      classTime.includes('17:30') ||
      classTime.includes('5.30') ||
      compactTime.includes('5:30pm') ||
      compactTime.includes('17:30')
    )
  ) {
    return 'thursday-evening';
  }

  return null;
}

function getSlotLabels(scheduleKey, classDate, fallbackTime) {
  const date = new Date(classDate);
  const formattedDateZh = date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });
  const formattedDateEn = date.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
  });

  const toZhTime = (timeLabel = '') => {
    const normalized = String(timeLabel).trim().toUpperCase();
    if (!normalized) return '';
    if (normalized.endsWith('AM')) {
      return `上午 ${normalized.replace(/\s*AM$/, '')}`;
    }
    if (normalized.endsWith('PM')) {
      return `下午 ${normalized.replace(/\s*PM$/, '')}`;
    }
    return normalized;
  };

  const slotMap = {
    'wednesday-morning': {
      zh: `周三${toZhTime(getClassTimeForDay('wednesday-morning'))}`,
      en: `Wednesday ${getClassTimeForDay('wednesday-morning')}`,
    },
    'wednesday-evening': {
      zh: `周三${toZhTime(getClassTimeForDay('wednesday-evening'))}`,
      en: `Wednesday ${getClassTimeForDay('wednesday-evening')}`,
    },
    'thursday-evening': {
      zh: `周四${toZhTime(getClassTimeForDay('thursday-evening'))}`,
      en: `Thursday ${getClassTimeForDay('thursday-evening')}`,
    },
  };

  const slot = slotMap[scheduleKey] || {
    zh: fallbackTime || '未分类场次',
    en: fallbackTime || 'Unclassified slot',
  };

  return {
    labelZh: `${formattedDateZh} · ${slot.zh}`,
    labelEn: `${formattedDateEn} · ${slot.en}`,
  };
}

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 }) };
  }

  return { session };
}

export async function GET(request) {
  try {
    const { session, error } = await ensureAdmin();
    if (error) return error;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const selectedDate = searchParams.get('classDate');
    const selectedTime = searchParams.get('classTime');

    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setDate(end.getDate() + 60);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      classDate: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    })
      .sort({ classDate: -1, classTime: 1, createdAt: -1 })
      .lean();

    const sessionMap = new Map();

    bookings.forEach((booking) => {
      const classDateKey = toDateKey(booking.classDate);
      const scheduleKey = getScheduleKey(booking);
      const normalizedTime = scheduleKey ? getClassTimeForDay(scheduleKey) : booking.classTime;
      const normalizedClassName = scheduleKey ? getClassNameForDay(scheduleKey) : booking.className;
      const key = `${classDateKey}|${normalizedTime}`;
      const { labelZh, labelEn } = getSlotLabels(scheduleKey, booking.classDate, normalizedTime);

      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          key,
          classDate: classDateKey,
          classTime: normalizedTime,
          className: normalizedClassName,
          scheduleKey,
          location: booking.location || DEFAULT_CLASS_LOCATION,
          label: `${classDateKey} · ${normalizedTime}`,
          labelZh,
          labelEn,
          bookings: [],
        });
      }

      sessionMap.get(key).bookings.push({
        bookingId: booking._id.toString(),
        userEmail: booking.userEmail,
        userName: booking.userName,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
      });
    });

    const generatedSessions = buildGeneratedSessions(start, end);
    generatedSessions.forEach((sessionItem) => {
      if (!sessionMap.has(sessionItem.key)) {
        sessionMap.set(sessionItem.key, sessionItem);
        return;
      }

      const existing = sessionMap.get(sessionItem.key);
      existing.className = existing.className || sessionItem.className;
      existing.scheduleKey = existing.scheduleKey || sessionItem.scheduleKey;
      existing.location = existing.location || sessionItem.location;
      existing.labelZh = existing.labelZh || sessionItem.labelZh;
      existing.labelEn = existing.labelEn || sessionItem.labelEn;
    });

    const classSessions = Array.from(sessionMap.values()).sort((a, b) => {
      const dateCompare = b.classDate.localeCompare(a.classDate);
      if (dateCompare !== 0) return dateCompare;

      const orderA = SLOT_ORDER[a.scheduleKey] || 99;
      const orderB = SLOT_ORDER[b.scheduleKey] || 99;
      if (orderA !== orderB) return orderA - orderB;

      return getTimeSortValue(a.classTime) - getTimeSortValue(b.classTime);
    });

    const selectedScheduleKey = getScheduleKeyFromDateTime(selectedDate, selectedTime);

    const effectiveSession = classSessions.find(
      (s) =>
        s.classDate === selectedDate &&
        (s.classTime === selectedTime ||
          (selectedScheduleKey && s.scheduleKey === selectedScheduleKey))
    ) || classSessions[0] || null;

    let attendance = [];

    if (effectiveSession) {
      const { dayStart, dayEnd } = getDayRange(effectiveSession.classDate);
      attendance = await ClassAttendance.find({
        classDate: { $gte: dayStart, $lte: dayEnd },
        classTime: effectiveSession.classTime,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    const students = await User.find({ role: 'student' })
      .select('name email classCredits')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      classSessions,
      selectedSession: effectiveSession,
      attendance: attendance.map((a) => ({
        id: a._id.toString(),
        userEmail: a.userEmail,
        userName: a.userName,
        status: a.status || 'attended',
        usedCredit: a.usedCredit,
        bookingId: a.bookingId ? a.bookingId.toString() : null,
        createdAt: a.createdAt,
      })),
      students: students.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        classCredits: s.classCredits || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { session, error } = await ensureAdmin();
    if (error) return error;

    const body = await request.json();
    const {
      classDate,
      classTime,
      className,
      location,
      studentEmail,
      bookingId,
    } = body;

    if (!classDate || !classTime || !className || !studentEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: classDate, classTime, className, studentEmail' },
        { status: 400 }
      );
    }

    await dbConnect();

    const normalizedEmail = studentEmail.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: 'Student not found. Please add student first.' },
        { status: 404 }
      );
    }

    const { dayStart, dayEnd } = getDayRange(classDate);

    const existingAttendance = await ClassAttendance.findOne({
      userEmail: normalizedEmail,
      classDate: { $gte: dayStart, $lte: dayEnd },
      classTime,
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked for this student in this class session' },
        { status: 400 }
      );
    }

    let usedCredit = false;
    const currentCredits = user.classCredits || 0;

    if (currentCredits > 0) {
      user.classCredits = currentCredits - 1;
      user.classCreditHistory = user.classCreditHistory || [];
      user.classCreditHistory.push({
        change: -1,
        type: 'used',
        description: `Class attended: ${className} (${toDateKey(classDate)} ${classTime})`,
        bookingId: bookingId || undefined,
      });
      usedCredit = true;
      await user.save();
    }

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.status = 'completed';
        booking.updatedAt = new Date();
        await booking.save();
      }
    }

    const attendanceRecord = new ClassAttendance({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      className,
      classDate: dayStart,
      classTime,
      location: location || '',
      bookingId: bookingId || undefined,
      status: 'attended',
      usedCredit,
      markedByAdminId: session.user.id,
      markedByAdminEmail: session.user.email,
    });

    await attendanceRecord.save();

    return NextResponse.json({
      message: usedCredit
        ? 'Attendance marked and 1 class credit used.'
        : 'Attendance marked. Student had no class credits.',
      usedCredit,
      student: {
        name: user.name,
        email: user.email,
        classCredits: user.classCredits || 0,
      },
      attendance: {
        id: attendanceRecord._id.toString(),
        classDate: dayStart,
        classTime,
      },
    });
  } catch (error) {
    console.error('Error marking attendance:', error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'Attendance already marked for this student in this class session' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { session, error } = await ensureAdmin();
    if (error) return error;

    const body = await request.json();
    const {
      classDate,
      classTime,
      className,
      location,
      studentEmail,
      bookingId,
    } = body;

    if (!classDate || !classTime || !className || !studentEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: classDate, classTime, className, studentEmail' },
        { status: 400 }
      );
    }

    await dbConnect();

    const normalizedEmail = studentEmail.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const { dayStart, dayEnd } = getDayRange(classDate);

    const existingAttendance = await ClassAttendance.findOne({
      userEmail: normalizedEmail,
      classDate: { $gte: dayStart, $lte: dayEnd },
      classTime,
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance outcome already marked for this student in this class session' },
        { status: 400 }
      );
    }

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.noShow = true;
        booking.noShowAt = new Date();
        booking.updatedAt = new Date();
        await booking.save();
      }
    }

    const noShowRecord = new ClassAttendance({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      className,
      classDate: dayStart,
      classTime,
      location: location || '',
      bookingId: bookingId || undefined,
      status: 'no-show',
      usedCredit: false,
      markedByAdminId: session.user.id,
      markedByAdminEmail: session.user.email,
    });

    await noShowRecord.save();

    return NextResponse.json({
      message: 'No-show marked for student.',
      student: {
        name: user.name,
        email: user.email,
      },
      attendance: {
        id: noShowRecord._id.toString(),
        classDate: dayStart,
        classTime,
      },
    });
  } catch (error) {
    console.error('Error marking no-show:', error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'Attendance outcome already marked for this student in this class session' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to mark no-show' }, { status: 500 });
  }
}
