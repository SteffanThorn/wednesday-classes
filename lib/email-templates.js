// Email templates for booking confirmations

/**
 * Generate HTML content for booking confirmation email
 */
export function getBookingConfirmationEmail({ 
  userName, 
  className, 
  classDate, 
  classTime, 
  location, 
  amount,
  bookingId,
  remainingClasses = null
}) {
  const formattedDate = new Date(classDate).toLocaleDateString('en-NZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <tr>
      <td style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #ff8a80 0%, #ffcc80 16.66%, #fff9c4 33.33%, #a5d6a7 50%, #81d4fa 66.66%, #9fa8da 83.33%, #ce93d8 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">INNER LIGHT</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Yoga & Meditation</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 500;">Booking Confirmed! ✨</h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
          Hi ${userName},
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for booking your yoga class! Your payment has been received and your spot is confirmed.
        </p>
        
        <!-- Booking Details Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Class</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 18px; font-weight: 500;">${className}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0; border-top: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 50%;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                    <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">${formattedDate}</p>
                  </td>
                  <td style="width: 50%;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</p>
                    <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">${classTime}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Location</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">${location}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">课程剩余 / Classes Remaining</p>
              <p style="margin: 4px 0 0; color: #0ea5e9; font-size: 24px; font-weight: 600;">${remainingClasses !== null && remainingClasses !== undefined ? `${remainingClasses} 节 / ${remainingClasses} class${remainingClasses === 1 ? '' : 'es'}` : 'N/A'}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
              <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px; font-family: monospace;">${bookingId}</p>
            </td>
          </tr>
        </table>
        
        <!-- What to Bring -->
        <h3 style="margin: 0 0 12px; color: #1f2937; font-size: 18px; font-weight: 500;">What to Bring</h3>
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
          <li>Your yoga mat</li>
          <li>Comfortable clothing</li>
          <li>Water bottle</li>
          <li>Small towel (optional)</li>
        </ul>
        
        <!-- Important Notes -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
          <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 500;">Important Notes:</p>
          <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
            <li>Please arrive 5 minutes early</li>
            <li>If you need to cancel, do so at least 24 hours in advance</li>
            <li>Let Yuki know if you have any injuries or health concerns</li>
          </ul>
        </div>
        
        <!-- Closing -->
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
          We look forward to seeing you on the mat!
        </p>
        
        <p style="margin: 0; color: #9ca3af; font-size: 14px;">
          With warmth,<br>
          <strong style="color: #1f2937;">Yuki</strong>
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">INNER LIGHT · Palmerston North, New Zealand</p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">Breathe deeply. Move gently. Live fully.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of booking confirmation
 */
export function getBookingConfirmationText({ 
  userName, 
  className, 
  classDate, 
  classTime, 
  location, 
  amount,
  bookingId,
  remainingClasses = null
}) {
  const formattedDate = new Date(classDate).toLocaleDateString('en-NZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
BOOKING CONFIRMED! ✨

Hi ${userName},

Thank you for booking your yoga class! Your payment has been received and your spot is confirmed.

CLASS DETAILS
=============
Class: ${className}
Date: ${formattedDate}
Time: ${classTime}
Location: ${location}
课程剩余 / Classes Remaining: ${remainingClasses !== null && remainingClasses !== undefined ? `${remainingClasses} 节 / ${remainingClasses} class${remainingClasses === 1 ? '' : 'es'}` : 'N/A'}
Booking Reference: ${bookingId}

WHAT TO BRING
=============
- Your yoga mat
- Comfortable clothing
- Water bottle
- Small towel (optional)

IMPORTANT NOTES
===============
- Please arrive 5 minutes early
- If you need to cancel, do so at least 24 hours in advance
- Let Yuki know if you have any injuries or health concerns

We look forward to seeing you on the mat!

With warmth,
Yuki

---
INNER LIGHT · Palmerston North, New Zealand
Breathe deeply. Move gently. Live fully.
  `.trim();
}

/**
 * Generate booking cancellation email
 */
export function getCancellationEmail({ 
  userName, 
  className, 
  classDate, 
  classTime,
  bookingId 
}) {
  const formattedDate = new Date(classDate).toLocaleDateString('en-NZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
      <td style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #ff8a80 0%, #ffcc80 16.66%, #fff9c4 33.33%, #a5d6a7 50%, #81d4fa 66.66%, #9fa8da 83.33%, #ce93d8 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">INNER LIGHT</h1>
      </td>
    </tr>
    <tr>
      <td style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Booking Cancelled</h2>
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
          Hi ${userName},
        </p>
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px;">
          Your booking has been cancelled as requested.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px;">
          <tr>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">CLASS</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 18px;">${className}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">DATE & TIME</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px;">${formattedDate} at ${classTime}</p>
            </td>
          </tr>
        </table>
        <p style="margin: 30px 0 0; color: #9ca3af; font-size: 14px;">
          Hope to see you in a future class!<br>
          <strong>Yuki</strong>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate password reset email
 */
export function getPasswordResetEmail({ 
  userName, 
  resetUrl,
  expiresInMinutes 
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <tr>
      <td style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #ff8a80 0%, #ffcc80 16.66%, #fff9c4 33.33%, #a5d6a7 50%, #81d4fa 66.66%, #9fa8da 83.33%, #ce93d8 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">INNER LIGHT</h1>
        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Yoga & Meditation</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 500;">Reset Your Password 🔐</h2>
        
        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
          Hi ${userName},
        </p>
        
        <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
          You requested to reset your password. Click the button below to set a new one. This link will expire in ${expiresInMinutes} minutes.
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align: center; padding: 20px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500;">
                Reset Password
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Warning Box -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
            <strong>Security Note:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <!-- Alternative Link -->
        <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <p style="margin: 0 0 30px; color: #0ea5e9; font-size: 13px; word-break: break-all; font-family: monospace; background-color: #f9fafb; padding: 12px; border-radius: 6px;">
          ${resetUrl}
        </p>
        
        <!-- Closing -->
        <p style="margin: 0; color: #9ca3af; font-size: 14px;">
          With warmth,<br>
          <strong style="color: #1f2937;">Yuki</strong>
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 14px;">INNER LIGHT · Palmerston North, New Zealand</p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">Breathe deeply. Move gently. Live fully.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of password reset email
 */
export function getPasswordResetText({ 
  userName, 
  resetUrl,
  expiresInMinutes 
}) {
  return `
RESET YOUR PASSWORD 🔐

Hi ${userName},

You requested to reset your password. Click the link below to set a new one. This link will expire in ${expiresInMinutes} minutes.

Reset Password: ${resetUrl}

If you did not request this password reset, please ignore this email. Your password will remain unchanged.

With warmth,
Yuki

---
INNER LIGHT · Palmerston North, New Zealand
Breathe deeply. Move gently. Live fully.
  `.trim();
}

