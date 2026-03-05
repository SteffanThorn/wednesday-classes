import { Resend } from 'resend';

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
      from: 'Motherscope <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Motherscope Waitlist - Choose Your Preferred Time',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #be185d; margin: 0; font-size: 28px;">Welcome to Motherscope</h1>
            <p style="color: #a30f4e; margin: 10px 0 0 0; font-size: 14px;">A postpartum wellness circle for mothers</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hi there! 👋
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Thank you for your interest in joining our Motherscope community circle! We're excited to connect with mothers like you and create a supportive space for postpartum wellness.
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              <strong>Motherscope is about:</strong>
            </p>
            <ul style="color: #555; font-size: 15px; line-height: 1.8; margin: 10px 0 20px 20px;">
              <li>Connecting with other mothers in the postpartum journey</li>
              <li>Holistic wellness practices and support</li>
              <li>Building a community of understanding and care</li>
            </ul>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6; font-weight: bold; margin: 20px 0 15px 0;">
              Which time works best for you?
            </p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
              <a href="mailto:innerlightyuki@gmail.com?subject=Motherscope%20Interest%20-%20Wednesday%2011am&body=I%20would%20like%20to%20join%20Motherscope%20at%20the%20Wednesday%2011am%20time." style="background: #fbbf24; color: #78350f; padding: 15px; border-radius: 6px; text-decoration: none; text-align: center; font-weight: bold; display: block; transition: background 0.3s;">
                ☀️ Wednesday 11am
              </a>
              <a href="mailto:innerlightyuki@gmail.com?subject=Motherscope%20Interest%20-%20Thursday%201pm&body=I%20would%20like%20to%20join%20Motherscope%20at%20the%20Thursday%201pm%20time." style="background: #fbbf24; color: #78350f; padding: 15px; border-radius: 6px; text-decoration: none; text-align: center; font-weight: bold; display: block; transition: background 0.3s;">
                🌙 Thursday 1pm
              </a>
            </div>
            
            <p style="color: #777; font-size: 14px; line-height: 1.6; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              Once you reply with your preferred time, we'll confirm the details and get you ready to start your Motherscope journey with us.
            </p>
            
            <p style="color: #777; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
              Questions? Feel free to reach out to us at <a href="mailto:innerlightyuki@gmail.com" style="color: #be185d; text-decoration: none;">innerlightyuki@gmail.com</a>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Yuki's Wellness. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
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
      message: 'Welcome email sent! Check your inbox and reply to let us know which time works best for you.',
      emailSent: true
    });
  } catch (error) {
    console.error('Motherscope waitlist error:', error);
    return Response.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
