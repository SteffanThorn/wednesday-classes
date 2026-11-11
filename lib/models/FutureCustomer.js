import mongoose from 'mongoose';

const FutureCustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    // Classes they still have left; used in newsletters ({{remainingClasses}}).
    remainingClasses: { type: Number, min: 0, default: 0 },
    source: { type: String, trim: true, default: 'manual-import' },
    addedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    addedByAdminEmail: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

FutureCustomerSchema.index({ email: 1 });
FutureCustomerSchema.index({ phone: 1 });
FutureCustomerSchema.index({ createdAt: -1 });

export default mongoose.models.FutureCustomer ||
  mongoose.model('FutureCustomer', FutureCustomerSchema);
