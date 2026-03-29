import { Resend } from 'resend';
import { appendBrandLogo } from '@/lib/email-branding';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: 'Yuki <onboarding@resend.dev>',
      to: email,
      subject: 'One-on-One Personal Yoga Sessions - Let\'s Work Together',
      html: appendBrandLogo(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #0369a1; margin: 0; font-size: 28px;">One-on-One Personal Sessions</h1>
            <p style="color: #0284c7; margin: 10px 0 0 0; font-size: 14px;">Personalized yoga tailored just for you</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hi there! 👋
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Thank you for your interest in one-on-one personal yoga sessions! We're excited to work with you on your personalized wellness journey.
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              <strong>What to expect:</strong>
            </p>
            <ul style="color: #555; font-size: 15px; line-height: 1.8; margin: 10px 0 20px 20px;">
              <li>Completely personalized sessions tailored to your goals and needs</li>
              <li>Flexible scheduling that works with your lifestyle</li>
              <li>Deep focus on your specific concerns and aspirations</li>
              <li>One-on-one attention from Yuki</li>
            </ul>
            
            <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0;">
              <p style="color: #0369a1; font-weight: bold; margin: 0 0 5px 0;">Investment:</p>
              <p style="color: #0284c7; font-size: 20px; font-weight: bold; margin: 0;">$100 per 60-minute session</p>
            </div>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-top: 20px;">
              <strong>Next Steps:</strong><br/>
              Please reply to this email with your preferred:
            </p>
            <ul style="color: #555; font-size: 15px; line-height: 1.8; margin: 10px 0 20px 20px;">
              <li>Days and times that work best for you</li>
              <li>Your specific goals or areas of focus</li>
              <li>Any previous yoga experience</li>
              <li>Whether you prefer in-person or online sessions</li>
            </ul>
            
            <p style="color: #777; font-size: 14px; line-height: 1.6; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              Looking forward to connecting with you!<br/>
              <strong style="color: #0369a1;">Yuki</strong>
            </p>
            
            <p style="color: #777; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
              Questions? Feel free to reach out to us at <a href="mailto:innerlightyuki@gmail.com" style="color: #0284c7; text-decoration: none;">innerlightyuki@gmail.com</a>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Yuki's Wellness. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `),
      reply_to: 'innerlightyuki@gmail.com'
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return Response.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Welcome email sent! Check your inbox and reply with your preferred session times and goals.',
      emailSent: true
    });
  } catch (error) {
    console.error('One-on-one waitlist error:', error);
    return Response.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
