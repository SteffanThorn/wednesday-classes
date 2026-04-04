import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const [{ default: dbConnect }, { default: User }, { default: HealthIntake }] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/User.js'),
  import('../lib/models/HealthIntake.js'),
]);

await dbConnect();

const PACKAGE_TOTAL_CLASSES = 5;
const records = [
  {
    name: 'Raewyn Moar',
    email: 'g.r.moar@inspire.net.nz',
    phone: '',
    healthNotes: '',
    emergencyContactName: '',
    emergencyContactPhone: '0276365446',
  },
  {
    name: 'Karen Yule',
    email: 'stormlilly101@gmail.com',
    phone: '',
    healthNotes: '手腕有伤，用护腕保持',
    emergencyContactName: 'Hermann',
    emergencyContactPhone: '0274464564',
  },
  {
    name: 'Linda Shannon',
    email: 'shannon@inspire.net.nz',
    phone: '',
    healthNotes: '膝盖有问题',
    emergencyContactName: 'Tom',
    emergencyContactPhone: '0274348700',
  },
];

const output = [];

for (const item of records) {
  const normalizedEmail = item.email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const tempPassword = `${crypto.randomBytes(8).toString('hex')}Aa1!`;
    user = await User.create({
      name: item.name,
      email: normalizedEmail,
      phone: item.phone || '',
      role: 'student',
      password: tempPassword,
      classCredits: PACKAGE_TOTAL_CLASSES,
    });
  } else {
    if (user.role === 'admin') {
      output.push({ email: normalizedEmail, status: 'skipped-admin-email' });
      continue;
    }

    user.name = item.name;
    user.phone = item.phone || user.phone || '';
    user.role = 'student';
    if (typeof user.classCredits !== 'number') {
      user.classCredits = PACKAGE_TOTAL_CLASSES;
    }
    await user.save();
  }

  const intake = await HealthIntake.findOneAndUpdate(
    { userEmail: normalizedEmail },
    {
      userId: user._id,
      userEmail: normalizedEmail,
      userName: item.name,
      phone: item.phone || '',
      healthNotes: item.healthNotes || '',
      emergencyContactName: item.emergencyContactName || '',
      emergencyContactPhone: item.emergencyContactPhone || '',
      waiverAccepted: false,
      comments: '',
      signatureName: '',
      totalPackageClasses: PACKAGE_TOTAL_CLASSES,
      remainingClassCredits:
        typeof user.classCredits === 'number' ? user.classCredits : PACKAGE_TOTAL_CLASSES,
      signedAt: new Date(),
      signatureDataUrl: '',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  output.push({
    email: normalizedEmail,
    status: 'upserted',
    userId: String(user._id),
    intakeId: String(intake._id),
    name: item.name,
  });
}

console.log(JSON.stringify({ success: true, count: output.length, output }, null, 2));
process.exit(0);
