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
  'thursday-evening': 2,
};

function getScheduleKeysForWeekday(weekday) {
  if (weekday === 3) return ['wednesday-morning'];
  if (weekday === 4) return ['thursday-evening'];
  return [];
}

function getBookingPriority(booking = {}) {
  const status = String(booking.status || '').toLowerCase();
  const paymentStatus = String(booking.paymentStatus || '').toLowerCase();

  if (status === 'completed' || paymentStatus === 'completed' || paymentStatus === 'paid') return 5;
  if (status === 'confirmed' || paymentStatus === 'processing') return 4;
  if (status === 'booked') return 3;
  if (status === 'pending' || paymentStatus === 'pending') return 2;
  if (status === 'cancelled' || paymentStatus === 'canceled' || paymentStatus === 'failed') return 1;
  return 0;
}


function toDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

  const weekDayZhMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDayEnMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekDayIndex = date.getDay();

  const slotMap = {
    'wednesday-morning': {
      zh: `${weekDayZhMap[weekDayIndex]}${toZhTime(getClassTimeForDay('wednesday-morning'))}`,
      en: `${weekDayEnMap[weekDayIndex]} ${getClassTimeForDay('wednesday-morning')}`,
    },
    'thursday-evening': {
      zh: `${weekDayZhMap[weekDayIndex]}${toZhTime(getClassTimeForDay('thursday-evening'))}`,
      en: `${weekDayEnMap[weekDayIndex]} ${getClassTimeForDay('thursday-evening')}`,
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

    const normalizedSessionMap = new Map();

    Array.from(sessionMap.values()).forEach((sessionItem) => {
      const resolvedScheduleKey =
        sessionItem.scheduleKey ||
        getScheduleKeyFromDateTime(sessionItem.classDate, sessionItem.classTime);
      const canonicalTime = resolvedScheduleKey
        ? getClassTimeForDay(resolvedScheduleKey)
        : String(sessionItem.classTime || '').trim();
      const canonicalClassName = resolvedScheduleKey
        ? getClassNameForDay(resolvedScheduleKey)
        : sessionItem.className;
      const canonicalKey = `${sessionItem.classDate}|${canonicalTime}`;
      const { labelZh, labelEn } = getSlotLabels(
        resolvedScheduleKey,
        sessionItem.classDate,
        canonicalTime
      );

      if (!normalizedSessionMap.has(canonicalKey)) {
        normalizedSessionMap.set(canonicalKey, {
          ...sessionItem,
          key: canonicalKey,
          classTime: canonicalTime,
          className: canonicalClassName,
          scheduleKey: resolvedScheduleKey,
          label: `${sessionItem.classDate} · ${canonicalTime}`,
          labelZh,
          labelEn,
          bookings: [...(sessionItem.bookings || [])],
        });
        return;
      }

      const existing = normalizedSessionMap.get(canonicalKey);
      const mergedBookings = [...(existing.bookings || []), ...(sessionItem.bookings || [])];
      const dedupByEmail = new Map();

      mergedBookings.forEach((b) => {
        const emailKey = String(b.userEmail || '').toLowerCase().trim();
        const identity = emailKey || String(b.bookingId || '').trim();
        if (!identity) return;

        const prev = dedupByEmail.get(identity);
        if (!prev || getBookingPriority(b) > getBookingPriority(prev)) {
          dedupByEmail.set(identity, b);
        }
      });

      existing.bookings = Array.from(dedupByEmail.values());
      existing.className = existing.className || canonicalClassName;
      existing.scheduleKey = existing.scheduleKey || resolvedScheduleKey;
      existing.location = existing.location || sessionItem.location;
      existing.labelZh = existing.labelZh || labelZh;
      existing.labelEn = existing.labelEn || labelEn;
    });

    const todayKey = toDateKey(new Date());

    const sortSessions = (a, b) => {
      const aIsUpcoming = a.classDate >= todayKey;
      const bIsUpcoming = b.classDate >= todayKey;

      if (aIsUpcoming !== bIsUpcoming) {
        return aIsUpcoming ? -1 : 1;
      }

      if (a.classDate !== b.classDate) {
        return aIsUpcoming
          ? a.classDate.localeCompare(b.classDate)
          : b.classDate.localeCompare(a.classDate);
      }

      const orderA = SLOT_ORDER[a.scheduleKey] || 99;
      const orderB = SLOT_ORDER[b.scheduleKey] || 99;
      if (orderA !== orderB) return orderA - orderB;

      return getTimeSortValue(a.classTime) - getTimeSortValue(b.classTime);
    };

    const classSessions = Array.from(normalizedSessionMap.values()).sort(sortSessions);

    const attendanceWindow = await ClassAttendance.find({
      classDate: { $gte: start, $lte: end },
    })
      .select('_id classDate classTime status userEmail userName bookingId')
      .lean();

    const attendanceCountMap = new Map();
    const attendanceParticipantMap = new Map();
    const attendanceStatusMap = new Map();

    attendanceWindow.forEach((record) => {
      const classDateKey = toDateKey(record.classDate);
      const rawClassTime = String(record.classTime || '').trim();
      if (!classDateKey || !rawClassTime) return;

      const resolvedScheduleKey = getScheduleKeyFromDateTime(classDateKey, rawClassTime);
      const classTime = resolvedScheduleKey
        ? getClassTimeForDay(resolvedScheduleKey)
        : rawClassTime;

      const key = `${classDateKey}|${classTime}`;
      if (!attendanceCountMap.has(key)) {
        attendanceCountMap.set(key, { checkedInCount: 0, noShowCount: 0 });
      }
      if (!attendanceParticipantMap.has(key)) {
        attendanceParticipantMap.set(key, new Map());
      }
      if (!attendanceStatusMap.has(key)) {
        attendanceStatusMap.set(key, new Map());
      }

      const status = String(record.status || 'attended').toLowerCase();
      const normalizedEmail = String(record.userEmail || '').toLowerCase().trim();
      const identity = normalizedEmail || `record:${String(record._id || '').trim()}`;
      const normalizedStatus = status === 'no-show' ? 'no-show' : 'attended';
      const statusBucket = attendanceStatusMap.get(key);
      const previousStatus = statusBucket.get(identity);

      // If duplicate records exist for one student/session, attended wins over no-show.
      if (!previousStatus || (previousStatus === 'no-show' && normalizedStatus === 'attended')) {
        statusBucket.set(identity, normalizedStatus);
      }

      if (normalizedEmail) {
        const participantBucket = attendanceParticipantMap.get(key);
        if (!participantBucket.has(normalizedEmail)) {
          participantBucket.set(normalizedEmail, {
            bookingId: record.bookingId ? record.bookingId.toString() : null,
            userEmail: record.userEmail,
            userName: record.userName || record.userEmail,
            status: 'completed',
            paymentStatus: 'completed',
          });
        } else {
          const existingParticipant = participantBucket.get(normalizedEmail);
          if (!existingParticipant.userName && record.userName) {
            existingParticipant.userName = record.userName;
          }
        }
      }
    });

    attendanceStatusMap.forEach((statusBucket, key) => {
      let checkedInCount = 0;
      let noShowCount = 0;

      statusBucket.forEach((status) => {
        if (status === 'no-show') noShowCount += 1;
        else checkedInCount += 1;
      });

      attendanceCountMap.set(key, { checkedInCount, noShowCount });
    });

    const sessionsWithCounts = classSessions.map((sessionItem) => {
      const counts = attendanceCountMap.get(sessionItem.key) || { checkedInCount: 0, noShowCount: 0 };
      const attendanceParticipants = Array.from(
        (attendanceParticipantMap.get(sessionItem.key) || new Map()).values()
      );

      const mergedBookings = [
        ...(sessionItem.bookings || []),
        ...attendanceParticipants,
      ];
      const bookingDedup = new Map();

      mergedBookings.forEach((booking) => {
        const emailKey = String(booking.userEmail || '').toLowerCase().trim();
        const identity = emailKey || String(booking.bookingId || '').trim();
        if (!identity) return;

        if (!bookingDedup.has(identity)) {
          bookingDedup.set(identity, booking);
          return;
        }

        const prev = bookingDedup.get(identity);
        if (getBookingPriority(booking) > getBookingPriority(prev)) {
          bookingDedup.set(identity, booking);
        }
      });

      return {
        ...sessionItem,
        bookings: Array.from(bookingDedup.values()),
        checkedInCount: counts.checkedInCount,
        noShowCount: counts.noShowCount,
      };
    });

    const sessionsByKey = new Map(sessionsWithCounts.map((s) => [s.key, s]));

    attendanceParticipantMap.forEach((participantMap, key) => {
      if (sessionsByKey.has(key)) return;

      const [classDateKey, classTime] = key.split('|');
      const scheduleKey = getScheduleKeyFromDateTime(classDateKey, classTime);
      const { labelZh, labelEn } = getSlotLabels(scheduleKey, classDateKey, classTime);
      const counts = attendanceCountMap.get(key) || { checkedInCount: 0, noShowCount: 0 };

      sessionsByKey.set(key, {
        key,
        classDate: classDateKey,
        classTime,
        className: scheduleKey ? getClassNameForDay(scheduleKey) : 'Functional Integrative Yoga',
        scheduleKey,
        location: DEFAULT_CLASS_LOCATION,
        label: `${classDateKey} · ${classTime}`,
        labelZh,
        labelEn,
        bookings: Array.from(participantMap.values()),
        checkedInCount: counts.checkedInCount,
        noShowCount: counts.noShowCount,
      });
    });

    // Keep today's standard class slots visible so on-site staff can take attendance
    // even when there are no pre-bookings yet (e.g. walk-in heavy sessions).
    const today = new Date();
    const todayDateKey = toDateKey(today);
    const todayWeekday = today.getDay();
    const todayScheduleKeys = getScheduleKeysForWeekday(todayWeekday);

    todayScheduleKeys.forEach((scheduleKey) => {
      const classTime = getClassTimeForDay(scheduleKey);
      const key = `${todayDateKey}|${classTime}`;
      if (sessionsByKey.has(key)) return;

      const { labelZh, labelEn } = getSlotLabels(scheduleKey, todayDateKey, classTime);

      sessionsByKey.set(key, {
        key,
        classDate: todayDateKey,
        classTime,
        className: getClassNameForDay(scheduleKey),
        scheduleKey,
        location: DEFAULT_CLASS_LOCATION,
        label: `${todayDateKey} · ${classTime}`,
        labelZh,
        labelEn,
        bookings: [],
        checkedInCount: 0,
        noShowCount: 0,
      });
    });

    const finalSessions = Array.from(sessionsByKey.values()).sort(sortSessions);

    const selectedScheduleKey = getScheduleKeyFromDateTime(selectedDate, selectedTime);

    const effectiveSession = finalSessions.find(
      (s) =>
        s.classDate === selectedDate &&
        (s.classTime === selectedTime ||
          (selectedScheduleKey && s.scheduleKey === selectedScheduleKey))
    ) || finalSessions[0] || null;

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
      classSessions: finalSessions,
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
