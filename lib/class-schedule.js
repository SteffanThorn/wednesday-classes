export const FIXED_CLASS_DATES = {
  thursday: [],
  friday: [],
};

const DAY_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const DAY_TIME = {
  wednesday: '6:00 PM',
  friday: '2:00 PM',
};

const DAY_CUTOFF_HOUR = {
  wednesday: 18,
  friday: 14,
};

const DAY_CLASS_NAME = {
  wednesday: 'Beginner Yoga - Wednesday',
  thursday: 'Beginner Yoga - Thursday',
  friday: 'Beginner Yoga - Friday',
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
  if (lower.includes('wednesday')) return 'wednesday';
  if (lower.includes('thursday')) return 'thursday';
  if (lower.includes('friday')) return 'friday';
  return null;
}

export function isAllowedClassDate(day, dateInput) {
  const isoDate = normalizeToIsoDate(dateInput);
  if (!isoDate) return false;

  if (day === 'thursday') {
    return false;
  }

  if (day === 'wednesday' || day === 'friday') {
    const d = new Date(isoDate);
    return d.getDay() === DAY_TO_INDEX[day];
  }

  return false;
}

export function getAvailableDatesByDay(day, weeksAhead = 12) {
  if (day === 'thursday') {
    return [];
  }

  if (day !== 'wednesday' && day !== 'friday') {
    return [];
  }

  const dates = [];
  const today = new Date();
  const currentDay = today.getDay();
  const targetDay = DAY_TO_INDEX[day];
  const cutoffHour = DAY_CUTOFF_HOUR[day] ?? 0;

  let daysUntilTarget = (targetDay - currentDay + 7) % 7;
  if (currentDay === targetDay && today.getHours() >= cutoffHour) {
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
