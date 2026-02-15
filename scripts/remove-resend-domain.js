// One-time script to remove a domain from Resend
// Run with: node scripts/remove-resend-domain.js

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Domain ID to remove (replace with your domain ID)
const DOMAIN_ID = '4137d93a-7595-43b2-b839-21eb6119e451';

async function removeDomain() {
  if (!RESEND_API_KEY) {
    console.error('Error: RESEND_API_KEY not found in .env.local');
    process.exit(1);
  }

  const resend = new Resend(RESEND_API_KEY);

  console.log(`Attempting to remove domain: ${DOMAIN_ID}`);
  console.log('---');

  try {
    const { data, error } = await resend.domains.remove(DOMAIN_ID);

    if (error) {
      console.error('Error removing domain:', error);
      process.exit(1);
    }

    console.log('Domain removed successfully!');
    console.log('Response:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

removeDomain();

