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

/**
 * Send admin notification for a new member signup
 */
export async function sendAdminNewMemberNotification(userData) {
  const { userId, name, email, phone, preferredLanguage } = userData;

  const adminEmail = process.env.ADMIN_EMAIL || COMPANY_EMAIL;
  const safeName = name || 'Unknown';
  const safeEmail = email || 'Unknown';
  const safePhone = phone || 'Not provided';
  const safeLanguage = preferredLanguage || 'en';
  const now = new Date().toLocaleString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return sendEmail({
    to: adminEmail,
    subject: 'New Member Registration - INNER LIGHT Yoga',
    html: `
      <h2>New member registered</h2>
      <p>A new member has created an account.</p>
      <ul>
        <li><strong>Name:</strong> ${safeName}</li>
        <li><strong>Email:</strong> ${safeEmail}</li>
        <li><strong>Phone:</strong> ${safePhone}</li>
        <li><strong>Preferred Language:</strong> ${safeLanguage}</li>
        <li><strong>User ID:</strong> ${userId || 'Not available'}</li>
        <li><strong>Registered At:</strong> ${now}</li>
      </ul>
    `.trim(),
    text: [
      'New member registered',
      '',
      'A new member has created an account.',
      `Name: ${safeName}`,
      `Email: ${safeEmail}`,
      `Phone: ${safePhone}`,
      `Preferred Language: ${safeLanguage}`,
      `User ID: ${userId || 'Not available'}`,
      `Registered At: ${now}`,
    ].join('\n'),
  });
}

/**
 * Send admin notification for a new booking
 */
export async function sendAdminNewBookingNotification(bookingData) {
  const {
    bookingId,
    userName,
    userEmail,
    className,
    classDate,
    classTime,
    amount,
  } = bookingData;

  const adminEmail = process.env.ADMIN_EMAIL || COMPANY_EMAIL;
  const formattedAmount = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(Number(amount) || 0);

  return sendEmail({
    to: adminEmail,
    subject: 'New Class Booking - INNER LIGHT Yoga',
    html: `
      <h2>New class booking confirmed</h2>
      <p>A member has successfully booked a class.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingId || 'Not available'}</li>
        <li><strong>Member Name:</strong> ${userName || 'Unknown'}</li>
        <li><strong>Member Email:</strong> ${userEmail || 'Unknown'}</li>
        <li><strong>Class:</strong> ${className || 'Unknown'}</li>
        <li><strong>Date:</strong> ${classDate || 'Unknown'}</li>
        <li><strong>Time:</strong> ${classTime || 'Unknown'}</li>
        <li><strong>Amount:</strong> ${formattedAmount}</li>
      </ul>
    `.trim(),
    text: [
      'New class booking confirmed',
      '',
      'A member has successfully booked a class.',
      `Booking ID: ${bookingId || 'Not available'}`,
      `Member Name: ${userName || 'Unknown'}`,
      `Member Email: ${userEmail || 'Unknown'}`,
      `Class: ${className || 'Unknown'}`,
      `Date: ${classDate || 'Unknown'}`,
      `Time: ${classTime || 'Unknown'}`,
      `Amount: ${formattedAmount}`,
    ].join('\n'),
  });
}

