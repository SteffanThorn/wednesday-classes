import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0,
  },
  // Minimum number of classes required to use this coupon
  minClasses: {
    type: Number,
    default: 1,
  },
  // Maximum number of uses (null = unlimited)
  maxUses: {
    type: Number,
    default: null,
  },
  // Current number of uses
  currentUses: {
    type: Number,
    default: 0,
  },
  // Coupon validity period
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required'],
  },
  // Whether the coupon is active
  active: {
    type: Boolean,
    default: true,
  },
  // Which booking types this coupon applies to
  applicableTo: {
    type: String,
    enum: ['all', 'single-date', 'multi-date'],
    default: 'all',
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

// Validate that discount value is valid for the type
couponSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    throw new Error('Percentage discount cannot exceed 100%');
  }
  
  next();
});

// Index for efficient queries
couponSchema.index({ code: 1 });
couponSchema.index({ active: 1, validUntil: 1 });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export default Coupon;

