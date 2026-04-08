import mongoose from 'mongoose';

const DEFAULT_PACKAGE_TOTAL_CLASSES = 5;
const MAX_PACKAGE_TOTAL_CLASSES = 20;

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
    totalPackageClasses: {
      type: Number,
      default: DEFAULT_PACKAGE_TOTAL_CLASSES,
      min: 1,
      max: MAX_PACKAGE_TOTAL_CLASSES,
    },
    remainingClassCredits: {
      type: Number,
      default: DEFAULT_PACKAGE_TOTAL_CLASSES,
      min: 0,
      max: MAX_PACKAGE_TOTAL_CLASSES,
    },
    signedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

HealthIntakeSchema.index({ userEmail: 1 });
HealthIntakeSchema.index({ userId: 1 });

export default mongoose.models.HealthIntake ||
  mongoose.model('HealthIntake', HealthIntakeSchema);
