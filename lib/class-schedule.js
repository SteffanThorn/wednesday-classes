// Maps each booking slot key to its weekday index (0=Sun … 6=Sat)
const SLOT_DAY_INDEX = {
  'wednesday-morning': 3,
  'thursday-evening': 4,
  'friday-morning': 5,
  'friday-afternoon': 5,
  'saturday-morning': 6,
  'saturday-afternoon': 6,
};

const DAY_TIME = {
  'wednesday-morning': '9:15 AM',
  'thursday-evening': '5:30 PM',
  'friday-morning': '10:30 AM',
  'friday-afternoon': '1:30 PM',
  'saturday-morning': '10:30 AM',
  'saturday-afternoon': '1:30 PM',
};

const DAY_CUTOFF_HOUR = {
  'wednesday-morning': 9,
  'thursday-evening': 17,
  'friday-morning': 10,
  'friday-afternoon': 13,
  'saturday-morning': 10,
  'saturday-afternoon': 13,
};

const DAY_CLASS_NAME = {
  'wednesday-morning': 'Functional Integrative Yoga - Wednesday 9:15AM',
  'thursday-evening': 'Functional Integrative Yoga - Thursday 5:30PM',
  'friday-morning': 'Beginner Yoga - Friday 10:30AM',
  'friday-afternoon': 'Pilates Mat / Pilates Sculpt - Friday 1:30PM',
  'saturday-morning': 'Beginner Yoga - Saturday 10:30AM',
  'saturday-afternoon': 'Pilates Mat / Pilates Sculpt - Saturday 1:30PM',
};

function normalizeToIsoDate(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}


export function getClassNameForDay(day) {
  return DAY_CLASS_NAME[day] || 'Functional Integrative Yoga';
}

export function getClassTimeForDay(day) {
  return DAY_TIME[day] || '9:15 AM';
}

export function inferDayFromClassName(className = '') {
  const lower = className.toLowerCase();
  if (lower.includes('wednesday') && lower.includes('9:15')) return 'wednesday-morning';
  if (lower.includes('thursday') && lower.includes('5:30')) return 'thursday-evening';
  if (lower.includes('friday') && (lower.includes('10:30') || lower.includes('1030'))) return 'friday-morning';
  if (lower.includes('friday') && (lower.includes('1:30') || lower.includes('13:30') || lower.includes('130'))) return 'friday-afternoon';
  if (lower.includes('saturday') && (lower.includes('10:30') || lower.includes('1030'))) return 'saturday-morning';
  if (lower.includes('saturday') && (lower.includes('1:30') || lower.includes('13:30') || lower.includes('130'))) return 'saturday-afternoon';
  // Fallback for old/generic class names
  if (lower.includes('wednesday')) return 'wednesday-morning';
  if (lower.includes('thursday')) return 'thursday-evening';
  if (lower.includes('friday')) return 'friday-morning';
  if (lower.includes('saturday')) return 'saturday-morning';
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
