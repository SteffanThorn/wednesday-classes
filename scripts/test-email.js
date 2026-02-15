// Test email script to send a test email to nzsteffan@gmail.com
// Run with: node scripts/test-email.js

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function sendTestEmail() {
  console.log('Sending test email to nzsteffan@gmail.com...');
  
  try {
    const response = await fetch(`${API_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'nzsteffan@gmail.com',
        emailType: 'welcome',
        data: {
          userName: 'Steffan',
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to send email:', result);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.id);
    console.log('Message:', result.message);
  } catch (error) {
    console.error('Error sending email:', error);
    process.exit(1);
  }
}

sendTestEmail();

