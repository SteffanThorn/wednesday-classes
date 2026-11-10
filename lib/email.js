import { escapeHtml } from './html-escape';

// Email utility functions for booking operations

const resolvedBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'http://localhost:3000';

const API_URL = resolvedBaseUrl.replace(/\/$/, '');

// Detect if running locally or in production
const isLocal =
  process.env.NODE_ENV === 'development' ||
  API_URL.includes('localhost') ||
  API_URL.includes('127.0.0.1');

// Internal API key for server-to-server communication
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'innerlightyuki@gmail.com';

// Get appropriate sender
const getSender = () => {
  if (process.env.EMAIL_FROM_PRODUCTION) {
    return process.env.EMAIL_FROM_PRODUCTION;
  }
  return process.env.EMAIL_FROM_LOCAL || 'onboarding@resend.dev';
};

// Get sender name
const getSenderName = () => {
  if (isLocal) {
    return 'INNER LIGHT Yoga (Test)';
  }
  return 'INNER LIGHT Yoga';
};

// Common headers for API calls
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  // Add internal API key for server-to-server calls
  if (INTERNAL_API_KEY) {
    headers['x-internal-api-key'] = INTERNAL_API_KEY;
  }
  return headers;
};

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(bookingData) {
  const { userEmail, userName, className, classDate, classTime, location, amount, bookingId, remainingClasses, preferredLanguage } = bookingData;

  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to: userEmail,
      emailType: 'booking-confirmation',
      data: {
        userName,
        className,
        classDate,
        classTime,
        location,
        amount,
        bookingId,
        remainingClasses: remainingClasses ?? null,
        preferredLanguage: preferredLanguage || 'en',
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send booking confirmation email:', result);
    const detail = result?.details ? ` (${result.details})` : '';
    const statusPrefix = response?.status ? `[${response.status}] ` : '';
    throw new Error(`${statusPrefix}${result.error || 'Failed to send email'}${detail}`);
  }

  return result;
}

/**
 * Send booking cancellation email
 */
export async function sendCancellationEmail(bookingData) {
  const { userEmail, userName, className, classDate, classTime, bookingId } = bookingData;

  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to: userEmail,
      emailType: 'booking-cancelled',
      data: {
        userName,
        className,
        classDate,
        classTime,
        bookingId,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send cancellation email:', result);
    const detail = result?.details ? ` (${result.details})` : '';
    const statusPrefix = response?.status ? `[${response.status}] ` : '';
    throw new Error(`${statusPrefix}${result.error || 'Failed to send email'}${detail}`);
  }

  return result;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userData) {
  const { email, name } = userData;

  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to: email,
      emailType: 'welcome',
      data: {
        userName: name,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send welcome email:', result);
    // Don't throw - welcome email failure shouldn't block signup
    return result;
  }

  return result;
}

/**
 * Send first class inquiry confirmation to user
 */
export async function sendFirstClassInquiryConfirmation(inquiryData) {
  const { email, name, classType, preferredDate, preferredTime } = inquiryData;

  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to: email,
      emailType: 'first-class-inquiry',
      data: {
        userName: name,
        classType,
        preferredDate,
        preferredTime,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send inquiry confirmation email:', result);
    return result;
  }

  return result;
}

/**
 * Send first class inquiry notification to admin
 */
export async function sendFirstClassAdminNotification(inquiryData) {
  const { name, email, phone, classType, preferredDate, preferredTime, notes } = inquiryData;

  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to: process.env.ADMIN_EMAIL || COMPANY_EMAIL,
      emailType: 'first-class-notification',
      data: {
        userName: name,
        userEmail: email,
        userPhone: phone || 'Not provided',
        classType,
        preferredDate: preferredDate || 'Flexible',
        preferredTime: preferredTime || 'Flexible',
        notes: notes || 'No notes provided',
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send admin notification email:', result);
    return result;
  }

  return result;
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail(bookingData) {
  const { userEmail, userName, className, classDate, classTime, amount, bookingId } = bookingData;

  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to: userEmail,
      emailType: 'payment-failed',
      data: {
        userName,
        className,
        classDate,
        classTime,
        amount,
        bookingId,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send payment failed email:', result);
    return result;
  }

  return result;
}

/**
 * Send refund notification
 */
export async function sendRefundEmail(bookingData) {
  const { userEmail, userName, className, classDate, classTime, amount, refundAmount, bookingId } = bookingData;

  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to: userEmail,
      emailType: 'refund',
      data: {
        userName,
        className,
        classDate,
        classTime,
        amount,
        refundAmount,
        bookingId,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send refund email:', result);
    return result;
  }

  return result;
}

/**
 * Send custom email
 */
export async function sendEmail({ to, subject, html, text }) {
  const response = await fetch(`${API_URL}/api/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to,
      emailType: 'custom',
      data: { subject, html, text },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send email:', result);
    const detail = result?.details ? ` (${result.details})` : '';
    const statusPrefix = response?.status ? `[${response.status}] ` : '';
    throw new Error(`${statusPrefix}${result.error || 'Failed to send email'}${detail}`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Admin activity alerts (sent to ADMIN_EMAIL, e.g. new signups and bookings)
// ---------------------------------------------------------------------------

const getAdminEmail = () => process.env.ADMIN_EMAIL || COMPANY_EMAIL;

const nzNow = () =>
  new Date().toLocaleString('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatNzd = (amount) =>
  new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(Number(amount) || 0);

// Builds and sends a simple "label: value" alert email to the admin.
// Values come from student input, so they are HTML-escaped.
function sendAdminAlert({ subject, heading, intro, rows }) {
  const filled = rows.map(([label, value]) => [label, value == null || value === '' ? 'Not provided' : String(value)]);
  const adminLink = `${API_URL}/admin`;

  return sendEmail({
    to: getAdminEmail(),
    subject,
    html: `
      <h2>${escapeHtml(heading)}</h2>
      <p>${escapeHtml(intro)}</p>
      <ul>
        ${filled.map(([label, value]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`).join('\n        ')}
      </ul>
      <p><a href="${adminLink}">Open the admin dashboard</a></p>
    `.trim(),
    text: [heading, '', intro, ...filled.map(([label, value]) => `${label}: ${value}`), '', adminLink].join('\n'),
  });
}

/**
 * Send admin notification for a new member signup
 */
export async function sendAdminNewMemberNotification(userData) {
  const { userId, name, email, phone, preferredLanguage } = userData;

  return sendAdminAlert({
    subject: `New student signed up: ${name || email || 'Unknown'}`,
    heading: 'New student signed up',
    intro: 'A new student has created an account on the website.',
    rows: [
      ['Name', name],
      ['Email', email],
      ['Phone', phone],
      ['Preferred Language', preferredLanguage || 'en'],
      ['User ID', userId],
      ['Registered At', nzNow()],
    ],
  });
}

/**
 * Send admin notification for a new booking.
 * `kind` is 'paid' (default) or 'interested'; `paymentLabel` overrides the Payment line.
 */
export { formatNzd };

export async function sendAdminNewBookingNotification(bookingData) {
  const {
    bookingId,
    userName,
    userEmail,
    className,
    classDate,
    classTime,
    location,
    amount,
    kind = 'paid',
    paymentLabel,
    notes,
  } = bookingData;

  const isInterest = kind === 'interested';
  const heading = isInterest ? 'Student registered interest in a class' : 'New class booking';
  const intro = isInterest
    ? 'A student registered interest in a class (no payment yet).'
    : 'A student has booked a class.';

  const rows = [
    ['Student', userName],
    ['Email', userEmail],
    ['Class', className],
    ['Date', classDate],
    ['Time', classTime],
  ];
  if (location) rows.push(['Location', location]);
  if (!isInterest) {
    rows.push(['Payment', paymentLabel || `${formatNzd(amount)} paid online`]);
  }
  if (notes) rows.push(['Notes', notes]);
  rows.push(['Booking ID', bookingId], ['Booked At', nzNow()]);

  return sendAdminAlert({
    subject: `${isInterest ? 'Class interest' : 'New booking'}: ${userName || userEmail || 'Unknown'} – ${className || 'class'}${classDate ? `, ${classDate}` : ''}`,
    heading,
    intro,
    rows,
  });
}

/**
 * Send admin notification for a class package purchase
 */
export async function sendAdminPackagePurchaseNotification(purchaseData) {
  const { userName, userEmail, classes, amount, creditsBalance, paymentIntentId } = purchaseData;

  return sendAdminAlert({
    subject: `Class package purchased: ${userName || userEmail || 'Unknown'}`,
    heading: 'Class package purchased',
    intro: `A student bought a ${classes}-class package.`,
    rows: [
      ['Student', userName],
      ['Email', userEmail],
      ['Package', `${classes} classes`],
      ['Amount', formatNzd(amount)],
      ['Credits Balance Now', creditsBalance],
      ['Stripe Payment', paymentIntentId],
      ['Purchased At', nzNow()],
    ],
  });
}
