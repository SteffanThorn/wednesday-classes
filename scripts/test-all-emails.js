// Test all email types to nzsteffan@gmail.com
// Run with: node scripts/test-all-emails.js

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const emailTests = [
  {
    name: 'Welcome Email',
    body: {
      to: 'nzsteffan@gmail.com',
      emailType: 'welcome',
      data: { userName: 'Steffan' },
    },
  },
  {
    name: 'Booking Confirmation',
    body: {
      to: 'nzsteffan@gmail.com',
      emailType: 'booking-confirmation',
      data: {
        userName: 'Steffan',
        className: 'Mindfulness Yoga',
        classDate: 'Friday, 25 July 2025',
        classTime: '6:00 PM',
        location: 'Mount Roskill, Auckland',
        amount: 25,
        bookingId: 'test-123',
      },
    },
  },
  {
    name: 'Booking Cancelled',
    body: {
      to: 'nzsteffan@gmail.com',
      emailType: 'booking-cancelled',
      data: {
        userName: 'Steffan',
        className: 'Mindfulness Yoga',
        classDate: 'Friday, 25 July 2025',
        classTime: '6:00 PM',
        bookingId: 'test-123',
      },
    },
  },
  {
    name: 'Payment Failed',
    body: {
      to: 'nzsteffan@gmail.com',
      emailType: 'payment-failed',
      data: {
        userName: 'Steffan',
        className: 'Mindfulness Yoga',
        classDate: 'Friday, 25 July 2025',
        classTime: '6:00 PM',
        amount: 25,
        bookingId: 'test-123',
      },
    },
  },
  {
    name: 'Refund',
    body: {
      to: 'nzsteffan@gmail.com',
      emailType: 'refund',
      data: {
        userName: 'Steffan',
        className: 'Mindfulness Yoga',
        classDate: 'Friday, 25 July 2025',
        classTime: '6:00 PM',
        amount: 25,
        refundAmount: 25,
        bookingId: 'test-123',
      },
    },
  },
  {
    name: 'First Class Inquiry',
    body: {
      to: 'nzsteffan@gmail.com',
      emailType: 'first-class-inquiry',
      data: {
        userName: 'Steffan',
        classType: 'General Yoga',
        preferredDate: 'Next week',
        preferredTime: 'Evening',
      },
    },
  },
];

async function sendTestEmail(test) {
  try {
    const response = await fetch(`${API_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test.body),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ ${test.name}: FAILED -`, result);
      return false;
    }

    console.log(`✅ ${test.name}: Sent (ID: ${result.id})`);
    return true;
  } catch (error) {
    console.error(`❌ ${test.name}: ERROR -`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Testing all email types...\n');

  let passed = 0;
  let failed = 0;

  for (const test of emailTests) {
    const success = await sendTestEmail(test);
    if (success) passed++;
    else failed++;
    
    // Small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Results:');
  console.log(`   Passed: ${passed}/${emailTests.length}`);
  console.log(`   Failed: ${failed}/${emailTests.length}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();

