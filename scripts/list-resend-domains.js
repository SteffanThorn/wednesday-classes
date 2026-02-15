// Script to list all domains in Resend account
// Run with: node scripts/list-resend-domains.js

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function listDomains() {
  if (!RESEND_API_KEY) {
    console.error('Error: RESEND_API_KEY not found in .env.local');
    process.exit(1);
  }

  const resend = new Resend(RESEND_API_KEY);

  console.log('Fetching domains from Resend account...');
  console.log('---');

  try {
    const { data, error } = await resend.domains.list();

    if (error) {
      console.error('Error fetching domains:', error);
      process.exit(1);
    }

    console.log('Domains found:', data.data.length);
    console.log('');

    data.data.forEach((domain) => {
      console.log(`Domain: ${domain.name}`);
      console.log(`  ID: ${domain.id}`);
      console.log(`  Status: ${domain.status}`);
      console.log(`  Created at: ${domain.created_at}`);
      console.log('');
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

listDomains();

