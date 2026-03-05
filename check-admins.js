const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkAdmins() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const userSchema = new mongoose.Schema({
      email: String,
      name: String,
      role: String
    });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('❌ No admin users found');
    } else {
      console.log('✅ Admin users:');
      admins.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.name})`);
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAdmins();
