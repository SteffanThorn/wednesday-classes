/**
 * Migration script to normalize paymentStatus from 'canceled' to 'cancelled'
 * 
 * Run this script to fix any inconsistent paymentStatus values in the database.
 * The schema expects 'cancelled' but some records may have 'canceled'.
 * 
 * Usage:
 *   node scripts/migrate-payment-status.js
 * 
 * Or with npx:
 *   npx node scripts/migrate-payment-status.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Import the Booking model
const Booking = (await import('../lib/models/Booking.js')).default;

async function migratePaymentStatus() {
  console.log('🔄 Starting paymentStatus migration...\n');
  
  // Check for MongoDB connection string
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI not found in environment variables');
    console.log('\nPlease add MONGODB_URI to your .env.local file');
    process.exit(1);
  }
  
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Find bookings with paymentStatus: 'canceled' (incorrect spelling)
    const canceledBookings = await Booking.find({ paymentStatus: 'canceled' });
    
    if (canceledBookings.length === 0) {
      console.log('✅ No records found with paymentStatus: "canceled"');
      console.log('   All records already use the correct spelling: "cancelled"');
      console.log('\n✨ Migration complete - no changes needed!');
      await mongoose.disconnect();
      process.exit(0);
    }
    
    console.log(`📊 Found ${canceledBookings.length} booking(s) with paymentStatus: "canceled"`);
    
    // Update all records
    const result = await Booking.updateMany(
      { paymentStatus: 'canceled' },
      { $set: { paymentStatus: 'cancelled' } }
    );
    
    console.log(`✅ Successfully updated ${result.modifiedCount} record(s)`);
    
    // Verify the migration
    const remainingCanceled = await Booking.countDocuments({ paymentStatus: 'canceled' });
    const cancelledCount = await Booking.countDocuments({ paymentStatus: 'cancelled' });
    
    console.log('\n📈 Migration Summary:');
    console.log(`   - Records with paymentStatus: "cancelled": ${cancelledCount}`);
    console.log(`   - Records with paymentStatus: "canceled": ${remainingCanceled}`);
    
    if (remainingCanceled === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Warning: Some records still have incorrect spelling');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n📦 Disconnected from MongoDB');
  }
}

// Run the migration
migratePaymentStatus();

