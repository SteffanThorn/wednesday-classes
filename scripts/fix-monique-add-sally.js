// Fix Monique Knowles: remove duplicate monique@live.com, update moandmike@live.com
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const now = new Date();

  // 1. Delete the wrong duplicate user entry (monique@live.com)
  const delUserResult = await db.collection('users').deleteOne({ email: 'monique@live.com' });
  console.log('Deleted monique@live.com user:', delUserResult.deletedCount);

  // 2. Delete the wrong duplicate healthintake entry (monique@live.com)
  const delIntakeResult = await db.collection('healthintakes').deleteOne({ userEmail: 'monique@live.com' });
  console.log('Deleted monique@live.com healthintake:', delIntakeResult.deletedCount);

  // 3. Update moandmike@live.com user with correct info
  await db.collection('users').updateOne(
    { email: 'moandmike@live.com' },
    {
      $set: {
        name: 'Monique Knowles',
        phone: '027 849 4237',
        role: 'student',
        updatedAt: now,
      },
    }
  );
  console.log('Updated moandmike@live.com user ✅');

  // 4. Upsert healthintake for moandmike@live.com
  const moUser = await db.collection('users').findOne({ email: 'moandmike@live.com' });
  await db.collection('healthintakes').updateOne(
    { userEmail: 'moandmike@live.com' },
    {
      $set: {
        userId: moUser._id,
        userEmail: 'moandmike@live.com',
        userName: 'Monique Knowles',
        phone: '027 849 4237',
        healthNotes: 'Right wrist injury',
        emergencyContactName: 'Michael Knowles',
        emergencyContactPhone: '022 024 8156',
        waiverAccepted: false,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now, signatureDataUrl: '', signatureName: '', signedAt: now, comments: '' },
    },
    { upsert: true }
  );
  console.log('Upserted moandmike@live.com healthintake ✅');

  // 5. Add new customer: Sally Cooper
  const sallyEmail = 'nesty_the_gardener@gmail.com';
  const existingSally = await db.collection('users').findOne({ email: sallyEmail });
  if (!existingSally) {
    const passwordHash = await bcrypt.hash(`${Math.random().toString(36).slice(2)}Aa1!`, 12);
    const sallyUser = await db.collection('users').insertOne({
      email: sallyEmail,
      password: passwordHash,
      name: 'Sally Cooper',
      phone: '021 106 7658',
      role: 'student',
      classCredits: 0,
      classCreditHistory: [],
      creditBalance: 0,
      creditHistory: [],
      accountSetupToken: null,
      accountSetupExpires: null,
      createdAt: now,
      updatedAt: now,
    });
    await db.collection('healthintakes').updateOne(
      { userEmail: sallyEmail },
      {
        $set: {
          userId: sallyUser.insertedId,
          userEmail: sallyEmail,
          userName: 'Sally Cooper',
          phone: '021 106 7658',
          healthNotes: 'Arthritis; Back surgery (ligament/disc related)',
          emergencyContactName: 'Ari Cooper',
          emergencyContactPhone: '021 024 2456',
          waiverAccepted: false,
          comments: 'Email slightly unclear in source handwriting.',
          signatureDataUrl: '',
          signatureName: '',
          signedAt: now,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    console.log('Added Sally Cooper ✅');
  } else {
    console.log('Sally Cooper already exists, skipping.');
  }

  await mongoose.disconnect();
  console.log('\n✅ All done.');
})().catch(e => { console.error('❌', e.message); process.exit(1); });
