import mongoose from 'mongoose';

const HealthIntakeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    userName: { type: String, required: true },
    phone: { type: String, default: '' },
    healthNotes: { type: String, default: '' },
    emergencyContactName: { type: String, default: '' },
    emergencyContactPhone: { type: String, default: '' },
    waiverAccepted: { type: Boolean, default: false },
    comments: { type: String, default: '' },
    signatureDataUrl: { type: String, default: '' },
    signatureName: { type: String, default: '' },
    totalPackageClasses: { type: Number, default: 5, min: 1 },
    remainingClassCredits: { type: Number, default: 5, min: 0, max: 5 },
    signedAt: { type: Date, default: Date.now },
    profileType: {
      type: String,
      enum: ['customer', 'potential'],
      default: 'customer',
      index: true,
    },
  },
  { timestamps: true }
);

HealthIntakeSchema.index({ userEmail: 1 });
HealthIntakeSchema.index({ userId: 1 });

export default mongoose.models.HealthIntake ||
  mongoose.model('HealthIntake', HealthIntakeSchema);
