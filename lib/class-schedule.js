const THURSDAY_FIXED_DATES_2026 = [
  '2026-03-12', '2026-03-19', '2026-03-26',
  '2026-04-09', '2026-04-16', '2026-04-23', '2026-04-30',
  '2026-05-14', '2026-05-21', '2026-05-28',
];

const FRIDAY_FIXED_DATES_2026 = [
  '2026-03-13', '2026-03-20',
  '2026-04-10', '2026-04-17',
  '2026-05-08', '2026-05-15', '2026-05-29',
];

export const FIXED_CLASS_DATES = {
  thursday: THURSDAY_FIXED_DATES_2026,
  friday: FRIDAY_FIXED_DATES_2026,
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
  thursday: '12:00 PM',
  friday: '6:00 PM',
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
  return DAY_TIME[day] || '12:00 PM';
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

  if (day === 'wednesday') {
    const d = new Date(isoDate);
    return d.getDay() === DAY_TO_INDEX.wednesday;
  }

  if (day === 'thursday' || day === 'friday') {
    return FIXED_CLASS_DATES[day]?.includes(isoDate) || false;
  }

  return false;
}

export function getAvailableDatesByDay(day, weeksAhead = 12) {
  const todayIso = getTodayIsoDate();

  if (day === 'thursday' || day === 'friday') {
    return (FIXED_CLASS_DATES[day] || [])
      .filter((d) => d >= todayIso)
      .map((d) => {
        const dateObj = new Date(d);
        return {
          date: d,
          displayDate: dateObj.toLocaleDateString('en-NZ', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }),
          fullDate: dateObj.toLocaleDateString('en-NZ', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        };
      });
  }

  // Wednesday remains weekly recurring
  const dates = [];
  const today = new Date();
  const currentDay = today.getDay();
  const targetDay = DAY_TO_INDEX.wednesday;
  const cutoffHour = 18;

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
