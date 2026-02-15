// Email utility functions for booking operations

// Detect if running locally or in production
const isLocal = process.env.NODE_ENV === 'development' || 
  process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost');

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 
  (isLocal ? 'http://localhost:3000' : 'https://your-production-domain.com');

// Internal API key for server-to-server communication
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

// Get appropriate sender based on environment
const getSender = () => {
  if (isLocal) {
    return process.env.EMAIL_FROM_LOCAL || 'onboarding@resend.dev';
  }
  return process.env.EMAIL_FROM_PRODUCTION || 'contact@innerlight.co.nz';
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
  const { userEmail, userName, className, classDate, classTime, location, amount, bookingId } = bookingData;

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
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Failed to send booking confirmation email:', result);
    throw new Error(result.error || 'Failed to send email');
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
    throw new Error(result.error || 'Failed to send email');
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
      to: process.env.ADMIN_EMAIL || 'contact@innerlight.co.nz',
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
    throw new Error(result.error || 'Failed to send email');
  }

  return result;
}

