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
  const { userEmail, userName, className, classDate, classTime, location, amount, bookingId, remainingClasses } = bookingData;

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

