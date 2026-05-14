import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const [{ default: dbConnect }, { default: FutureCustomer }] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/FutureCustomer.js'),
]);

try {
  await dbConnect();
  console.log('✓ Connected to MongoDB');

  const newCustomer = {
    name: 'lu',
    email: 'luyan0203yysd@gmail.com',
    phone: '',
    notes: '',
    source: 'manual-add-2026-05-10',
    addedByAdminEmail: 'manual-script',
  };

  const result = await FutureCustomer.create(newCustomer);
  console.log('✓ Successfully added future customer:');
  console.log('  ID:', result._id.toString());
  console.log('  Name:', result.name);
  console.log('  Email:', result.email);
  console.log('  Created at:', result.createdAt);

  process.exit(0);
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}
