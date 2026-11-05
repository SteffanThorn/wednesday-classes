/**
 * Dates for payment records are stored as midnight UTC of the New Zealand
 * calendar day (the same way class dates are stored), so a payment always
 * lands in the month the studio saw it in.
 */
export function nzDay(date = new Date()) {
  const key = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return dayFromKey(key);
}

/** "2026-05-14" -> Date at 2026-05-14T00:00:00Z, or null if invalid. */
export function dayFromKey(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || '').trim());
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Turn a report period into a [start, end) date range.
 * period: 'month' (value "2026-11"), 'quarter' ("2026-Q4"), 'year' ("2026") or 'all'.
 */
export function periodRange(period, value) {
  const v = String(value || '');
  if (period === 'month') {
    const m = /^(\d{4})-(\d{2})$/.exec(v);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    return { year: y, start: new Date(Date.UTC(y, mo, 1)), end: new Date(Date.UTC(y, mo + 1, 1)) };
  }
  if (period === 'quarter') {
    const m = /^(\d{4})-Q([1-4])$/.exec(v);
    if (!m) return null;
    const y = Number(m[1]);
    const q = Number(m[2]) - 1;
    return { year: y, start: new Date(Date.UTC(y, q * 3, 1)), end: new Date(Date.UTC(y, q * 3 + 3, 1)) };
  }
  if (period === 'year') {
    const m = /^(\d{4})$/.exec(v);
    if (!m) return null;
    const y = Number(m[1]);
    return { year: y, start: new Date(Date.UTC(y, 0, 1)), end: new Date(Date.UTC(y + 1, 0, 1)) };
  }
  if (period === 'all') {
    return { year: null, start: null, end: null };
  }
  return null;
}
