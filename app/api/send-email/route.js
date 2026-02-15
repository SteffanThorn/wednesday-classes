import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Resend } from 'resend';
import { getBookingConfirmationEmail, getBookingConfirmationText, getCancellationEmail } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

// Allow these email types to be sent by authenticated users (for transactional emails)
const userAllowedEmailTypes = [
  'booking-confirmation',
  'booking-cancelled',
  'payment-failed',
  'refund',
  'welcome',
  'first-class-inquiry',
  'first-class-notification',
];

// Only admin can send custom emails
const adminOnlyEmailTypes = ['custom'];

// Email types and their templates
const emailTemplates = {
  'booking-confirmation': {
    getHtml: getBookingConfirmationEmail,
    getText: getBookingConfirmationText,
    subject: 'Your Yoga Class Booking is Confirmed! ✨',
  },
  'booking-cancelled': {
    getHtml: getCancellationEmail,
    getText: (data) => `Booking Cancelled\n\nHi ${data.userName},\n\nYour booking has been cancelled.\n\nClass: ${data.className}\nDate: ${data.classDate}\nTime: ${data.classTime}\n\nHope to see you in a future class!\n\nYuki`,
    subject: 'Booking Cancelled',
  },
  'payment-failed': {
    subject: 'Payment Failed - INNER LIGHT Yoga',
    isCustomContent: true,
  },
  'refund': {
    subject: 'Refund Processed - INNER LIGHT Yoga',
    isCustomContent: true,
  },
  'welcome': {
    subject: 'Welcome to INNER LIGHT Yoga! 🧘‍♀️',
    isCustomContent: true,
  },
  'first-class-inquiry': {
    subject: 'We Received Your Inquiry - INNER LIGHT Yoga',
    isCustomContent: true,
  },
  'first-class-notification': {
    subject: 'New First Class Inquiry - INNER LIGHT Yoga',
    isCustomContent: true,
  },
  'custom': {
    subject: '',
    isCustomContent: true,
  },
};

// Generate HTML for welcome email
function getWelcomeEmail({ userName }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">INNER LIGHT</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Yoga & Meditation</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Welcome to INNER LIGHT Yoga! 🧘‍♀️</h2>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Hi ${userName},
        </p>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Thank you for joining our yoga community. We're thrilled to have you on this journey of mindfulness and movement.
        </p>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Here's what you can expect:
        </p>
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
          <li>Weekly class updates and scheduling</li>
          <li>Special offers for members</li>
          <li>Tips for your yoga practice</li>
        </ul>
        <p style="margin: 0; color: #9ca3af; font-size: 14px;">
          With warmth,<br>
          <strong style="color: #1f2937;">Yuki</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">INNER LIGHT · Auckland, New Zealand</p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">Breathe deeply. Move gently. Live fully.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate HTML for first class inquiry confirmation
function getFirstClassInquiryEmail({ userName, classType, preferredDate, preferredTime }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">INNER LIGHT</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Yoga & Meditation</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">We Received Your Inquiry! 🙌</h2>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Hi ${userName},
        </p>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Thank you for your interest in our yoga classes. We've received your inquiry and will be in touch shortly!
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Class Type</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${classType || 'Not specified'}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Preferred Date</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${preferredDate || 'Flexible'}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Preferred Time</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${preferredTime || 'Flexible'}</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          We look forward to welcoming you to the mat!
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 14px;">
          With warmth,<br>
          <strong style="color: #1f2937;">Yuki</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">INNER LIGHT · Auckland, New Zealand</p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">Breathe deeply. Move gently. Live fully.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate HTML for first class inquiry notification to admin
function getFirstClassAdminNotification({ userName, userEmail, userPhone, classType, preferredDate, preferredTime, notes }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">INNER LIGHT</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Yoga & Meditation</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">New First Class Inquiry! 📬</h2>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          You have received a new inquiry for first class booking.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Name</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${userName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${userEmail}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${userPhone}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Class Type</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${classType || 'Not specified'}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Preferred Date</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${preferredDate || 'Flexible'}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Preferred Time</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${preferredTime || 'Flexible'}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Notes</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${notes}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate HTML for payment failed email
function getPaymentFailedEmail({ userName, className, classDate, classTime, amount, bookingId }) {
  const formattedAmount = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(amount);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">INNER LIGHT</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Yoga & Meditation</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 20px; color: #dc2626; font-size: 24px;">Payment Failed ⚠️</h2>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Hi ${userName},
        </p>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Unfortunately, the payment for your yoga class booking could not be processed.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Class</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${className}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${classDate}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${classTime}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${formattedAmount}</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Please try again or contact us if you need assistance.
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 14px;">
          With warmth,<br>
          <strong style="color: #1f2937;">Yuki</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">INNER LIGHT · Auckland, New Zealand</p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">Breathe deeply. Move gently. Live fully.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate HTML for refund email
function getRefundEmail({ userName, className, classDate, classTime, amount, refundAmount, bookingId }) {
  const formattedAmount = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(amount);
  
  const formattedRefundAmount = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(refundAmount);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">INNER LIGHT</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Yoga & Meditation</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Refund Processed 💰</h2>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Hi ${userName},
        </p>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Your refund has been processed successfully.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Class</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${className}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${classDate}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${classTime}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Original Amount</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${formattedAmount}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Refund Amount</p>
              <p style="margin: 4px 0 0; color: #10b981; font-size: 16px; font-weight: bold;">${formattedRefundAmount}</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          The refund should appear in your account within 5-10 business days.
        </p>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          We hope to see you in a future class!
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 14px;">
          With warmth,<br>
          <strong style="color: #1f2937;">Yuki</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">INNER LIGHT · Auckland, New Zealand</p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">Breathe deeply. Move gently. Live fully.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Get template HTML based on type
function getTemplateHtml(emailType, data) {
  switch (emailType) {
    case 'welcome':
      return getWelcomeEmail(data);
    case 'first-class-inquiry':
      return getFirstClassInquiryEmail(data);
    case 'first-class-notification':
      return getFirstClassAdminNotification(data);
    case 'payment-failed':
      return getPaymentFailedEmail(data);
    case 'refund':
      return getRefundEmail(data);
    case 'custom':
      return data.html || '';
    default:
      return '';
  }
}

// Get template subject based on type
function getTemplateSubject(emailType, data) {
  switch (emailType) {
    case 'custom':
      return data.subject || '';
    default:
      return emailTemplates[emailType]?.subject || '';
  }
}

export async function POST(request) {
  try {
    // SECURITY: Check for internal API key (for server-to-server communication)
    const internalApiKey = request.headers.get('x-internal-api-key');
    const validInternalKey = process.env.INTERNAL_API_KEY;
    
    // Check if this is an internal call
    const isInternalCall = internalApiKey === validInternalKey && validInternalKey;
    
    // If not internal call, require user authentication
    if (!isInternalCall) {
      const session = await auth();
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { 
      to, 
      emailType = 'booking-confirmation', 
      data,
      replyTo 
    } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email (to) is required' },
        { status: 400 }
      );
    }

    if (!emailType || !emailTemplates[emailType]) {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      );
    }

    // SECURITY: Check authorization based on email type
    // Custom emails require admin role
    if (adminOnlyEmailTypes.includes(emailType)) {
      if (session.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required for custom emails' },
          { status: 403 }
        );
      }
    }

    // For user-allowed email types, verify user owns the email or is admin
    if (userAllowedEmailTypes.includes(emailType)) {
      // Users can only send to their own email (or admin can send to any)
      if (session.user.role !== 'admin' && to !== session.user.email) {
        return NextResponse.json(
          { error: 'You can only send emails to your own email address' },
          { status: 403 }
        );
      }
    }

    const template = emailTemplates[emailType];
    
    // Generate email content
    let html, subject, text;
    
    if (template.isCustomContent) {
      html = getTemplateHtml(emailType, data);
      subject = getTemplateSubject(emailType, data);
      text = data.text || undefined;
    } else {
      html = template.getHtml(data);
      text = template.getText ? template.getText(data) : undefined;
      subject = template.subject;
    }

    // Use Resend's test domain for local development
    const isLocal = process.env.NODE_ENV === 'development';
    const senderEmail = isLocal ? 'onboarding@resend.dev' : 'contact@innerlightyoga.co.nz';
    const senderName = isLocal ? 'INNER LIGHT Yoga (Test)' : 'INNER LIGHT Yoga';

    // Send email via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: [to],
      subject,
      html,
      text,
      replyTo: replyTo || 'contact@innerlightyoga.co.nz',
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Email sent successfully',
      id: emailData?.id,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

