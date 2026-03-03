import mongoose from 'mongoose';
import Coupon from '../lib/models/Coupon.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createTestCoupon() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or update the coupon
    const coupon = await Coupon.findOneAndUpdate(
      { code: 'LIVETESTING1' },
      {
        code: 'LIVETESTING1',
        description: 'Test coupon for live environment testing - $14 discount (brings $15 to $1)',
        discountType: 'fixed',
        discountValue: 14,
        minClasses: 1,
        maxUses: 50, // Limited uses for testing
        currentUses: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
        active: true,
        applicableTo: 'all',
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log('✅ Test coupon created/updated successfully:');
    console.log(`   Code: ${coupon.code}`);
    console.log(`   Discount: $${coupon.discountValue} fixed`);
    console.log(`   Result: $15 class → $${15 - coupon.discountValue}`);
    console.log(`   Max Uses: ${coupon.maxUses}`);
    console.log(`   Valid Until: ${coupon.validUntil.toISOString().split('T')[0]}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating coupon:', error.message);
    process.exit(1);
  }
}

createTestCoupon();
