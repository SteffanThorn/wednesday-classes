import mongoose from 'mongoose';

/**
 * One payment from a student: a single class ($15) or a 5-class pack ($65).
 * This is the record the spending report and customer totals are built from.
 */
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  userName: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['single', 'package'],
    required: true,
  },
  // Classes bought with this payment (1 for a single class, 5 for a pack)
  classes: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'paid',
  },
  // When it was paid. Empty when the date isn't known (some imported history).
  paidAt: {
    type: Date,
    index: true,
  },
  // For payments with no known date: the year they belong to.
  year: {
    type: Number,
  },
  method: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    enum: ['import', 'check-in', 'admin', 'stripe'],
    required: true,
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassAttendance',
  },
  paymentIntentId: {
    type: String,
  },
  note: {
    type: String,
    default: '',
  },
  createdByEmail: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.index({ attendanceId: 1 }, { unique: true, partialFilterExpression: { attendanceId: { $exists: true } } });
paymentSchema.index({ paymentIntentId: 1 }, { unique: true, partialFilterExpression: { paymentIntentId: { $exists: true } } });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
