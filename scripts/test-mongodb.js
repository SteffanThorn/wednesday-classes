// MongoDB connection test script
// Run with: node scripts/test-mongodb.js

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'NOT SET');

if (!process.env.MONGODB_URI) {
  console.error('\n❌ MONGODB_URI is not set in .env.local');
  console.log('\nPlease add to your .env.local:');
  console.log('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('\nAttempting to connect...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB Connected successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 This usually means:');
      console.log('   - The cluster DNS is not resolving');
      console.log('   - Check if your cluster is running');
      console.log('   - Verify your cluster name is correct');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 This usually means:');
      console.log('   - Username or password is incorrect');
      console.log('   - User may not have access to this database');
    }
    
    process.exit(1);
  }
}

testConnection();

