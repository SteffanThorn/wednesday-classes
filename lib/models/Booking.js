import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
  },
  className: {
    type: String,
    required: [true, 'Class name is required'],
  },
  classDate: {
    type: Date,
    required: [true, 'Class date is required'],
  },
  classTime: {
    type: String,
    required: [true, 'Class time is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'refunded', 'failed', 'canceled'],
    default: 'pending',
  },
  paymentIntentId: {
    type: String,
  },
  stripePaymentId: {
    type: String,
  },
  checkoutSessionId: {
    type: String,
  },
  stripeCustomerId: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  paymentError: {
    type: String,
  },
  paidAt: {
    type: Date,
  },
  refundedAt: {
    type: Date,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  // Cancellation fee tracking
  cancellationFee: {
    type: Number,
    default: 0,
  },
  cancellationReason: {
    type: String,
  },
  cancelledAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
bookingSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

// Index for efficient queries
bookingSchema.index({ userId: 1, classDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;

