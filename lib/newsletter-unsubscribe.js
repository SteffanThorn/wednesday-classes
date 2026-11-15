// Newsletter unsubscribe links and headers.
//
// Each link carries the email plus a signature, so nobody can unsubscribe
// someone else by editing the URL. The List-Unsubscribe headers give Gmail,
// Outlook and Apple Mail their built-in "Unsubscribe" button; bulk mail
// without them is more likely to land in spam.

import crypto from 'node:crypto';
import EmailOptOut from '@/lib/models/EmailOptOut';
import { getPublicBaseUrl } from '@/lib/email-branding';

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error('AUTH_SECRET / NEXTAUTH_SECRET is required for unsubscribe links');
  return value;
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function unsubscribeToken(email) {
  return crypto
    .createHmac('sha256', secret())
    .update(`newsletter-unsubscribe:${normalizeEmail(email)}`)
    .digest('base64url')
    .slice(0, 32);
}

export function isValidUnsubscribeToken(email, token) {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(String(token || ''));
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

function query(email) {
  const e = normalizeEmail(email);
  return `e=${encodeURIComponent(e)}&t=${unsubscribeToken(e)}`;
}

/** Page with a confirm button: used for the visible link in the email footer. */
export function unsubscribePageUrl(email) {
  return `${getPublicBaseUrl()}/unsubscribe?${query(email)}`;
}

/** Endpoint the mail app POSTs to when the reader taps its Unsubscribe button. */
export function unsubscribeOneClickUrl(email) {
  return `${getPublicBaseUrl()}/api/unsubscribe?${query(email)}`;
}

/** Headers for Resend's `headers` field (RFC 8058 one-click unsubscribe). */
export function unsubscribeHeaders(email, replyToEmail) {
  const links = [`<${unsubscribeOneClickUrl(email)}>`];
  if (replyToEmail) links.push(`<mailto:${replyToEmail}?subject=Unsubscribe>`);
  return {
    'List-Unsubscribe': links.join(', '),
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

/** Lowercased emails (from the given list) that have unsubscribed. */
export async function getOptedOutEmails(emails) {
  const list = [...new Set((emails || []).map(normalizeEmail).filter(Boolean))];
  if (!list.length) return new Set();
  const docs = await EmailOptOut.find({ email: { $in: list } }).select('email').lean();
  return new Set(docs.map((d) => d.email));
}

export async function recordOptOut(email, source) {
  const e = normalizeEmail(email);
  await EmailOptOut.updateOne(
    { email: e },
    { $setOnInsert: { email: e, source } },
    { upsert: true }
  );
}
