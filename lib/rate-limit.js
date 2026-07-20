// In-memory fixed-window rate limiter. Not distributed across serverless
// instances/cold starts, but still blocks basic scripted abuse on a warm
// instance without needing an external store (Redis/Upstash).
const buckets = new Map();

export function checkRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, retryAfterMs: windowMs - (now - entry.windowStart) };
  }
  return { allowed: true };
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
