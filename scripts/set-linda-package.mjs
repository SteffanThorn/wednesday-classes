import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const [{ default: dbConnect }, { default: User }, { default: HealthIntake }] = await Promise.all([
  import('../lib/mongodb.js'),
  import('../lib/models/User.js'),
  import('../lib/models/HealthIntake.js'),
]);

await dbConnect();

const email = 'shannon@inspire.net.nz';
const totalPackageClasses = 10;
const remainingClassCredits = 7;

const user = await User.findOneAndUpdate(
  { email },
  {
    $set: {
      classCredits: remainingClassCredits,
      updatedAt: new Date(),
    },
    $push: {
      classCreditHistory: {
        change: 0,
        type: 'adjustment',
        description: 'Admin set package to 10 total / 7 remaining from customer page request',
        createdAt: new Date(),
      },
    },
  },
  { new: true }
);

const intake = await HealthIntake.findOneAndUpdate(
  { userEmail: email },
  {
    $set: {
      totalPackageClasses,
      remainingClassCredits,
      updatedAt: new Date(),
    },
  },
  { new: true }
);

console.log(
  JSON.stringify(
    {
      success: !!user && !!intake,
      email,
      userClassCredits: user?.classCredits ?? null,
      intakeTotal: intake?.totalPackageClasses ?? null,
      intakeRemaining: intake?.remainingClassCredits ?? null,
    },
    null,
    2
  )
);
