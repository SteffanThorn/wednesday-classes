// Maps each booking slot key to its weekday index (0=Sun … 6=Sat)
const SLOT_DAY_INDEX = {
  'wednesday-morning': 3,
  'wednesday-evening': 3,
  'thursday-evening': 4,
};

const DAY_TIME = {
  'wednesday-morning': '9:15 AM',
  'wednesday-evening': '6:00 PM',
  'thursday-evening': '5:30 PM',
};

const DAY_CUTOFF_HOUR = {
  'wednesday-morning': 9,
  'wednesday-evening': 18,
  'thursday-evening': 17,
};

const DAY_CLASS_NAME = {
  'wednesday-morning': 'Beginner Yoga - Wednesday 9:15AM',
  'wednesday-evening': 'Beginner Yoga - Wednesday 6PM',
  'thursday-evening': 'Beginner Yoga - Thursday 5:30PM',
};

function normalizeToIsoDate(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function getTodayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export function getClassNameForDay(day) {
  return DAY_CLASS_NAME[day] || 'Beginner Yoga';
}

export function getClassTimeForDay(day) {
  return DAY_TIME[day] || '6:00 PM';
}

export function inferDayFromClassName(className = '') {
  const lower = className.toLowerCase();
  if (lower.includes('wednesday') && lower.includes('9:15')) return 'wednesday-morning';
  if (lower.includes('wednesday') && lower.includes('6pm')) return 'wednesday-evening';
  if (lower.includes('thursday') && lower.includes('5:30')) return 'thursday-evening';
  // Fallback for old/generic class names
  if (lower.includes('wednesday')) return 'wednesday-evening';
  if (lower.includes('thursday')) return 'thursday-evening';
  return null;
}

export function isAllowedClassDate(day, dateInput) {
  const isoDate = normalizeToIsoDate(dateInput);
  if (!isoDate) return false;

  const dayIndex = SLOT_DAY_INDEX[day];
  if (dayIndex === undefined) return false;

  const d = new Date(isoDate);
  return d.getDay() === dayIndex;
}

export function getAvailableDatesByDay(day, weeksAhead = 12) {
  const dayIndex = SLOT_DAY_INDEX[day];
  if (dayIndex === undefined) return [];

  const dates = [];
  const today = new Date();
  const currentDay = today.getDay();
  const cutoffHour = DAY_CUTOFF_HOUR[day] ?? 0;

  let daysUntilTarget = (dayIndex - currentDay + 7) % 7;
  if (currentDay === dayIndex && today.getHours() >= cutoffHour) {
    daysUntilTarget = 7;
  }

  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysUntilTarget);

  for (let i = 0; i < weeksAhead; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i * 7);
    const iso = date.toISOString().split('T')[0];
    dates.push({
      date: iso,
      displayDate: date.toLocaleDateString('en-NZ', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      fullDate: date.toLocaleDateString('en-NZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    });
  }

  return dates;
}
