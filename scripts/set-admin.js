// This script sets a user to admin role
// Run with: node scripts/set-admin.js

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

async function setAdmin() {
  if (!MONGODB_URI || MONGODB_URI === 'your-mongodb-uri-here') {
    console.error('Please set MONGODB_URI environment variable');
    console.log('Example: MONGODB_URI=mongodb://localhost:27017/yukiswebsite node scripts/set-admin.js');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  // User schema (simplified)
  const userSchema = new mongoose.Schema({
    email: String,
    role: String
  });
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const email = process.argv[2] || 'innerlightyuki@gmail.com';
  
  const result = await User.findOneAndUpdate(
    { email: email },
    { $set: { role: 'admin' } },
    { new: true }
  );

  if (result) {
    console.log(`✅ User ${email} is now an admin!`);
  } else {
    console.log(`❌ User ${email} not found`);
  }

  await mongoose.disconnect();
}

setAdmin().catch(console.error);

