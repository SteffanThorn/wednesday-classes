import mongoose from 'mongoose';

const packagePurchaseSchema = new mongoose.Schema({
  paymentIntentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  packageSize: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

const PackagePurchase = mongoose.models.PackagePurchase || mongoose.model('PackagePurchase', packagePurchaseSchema);

export default PackagePurchase;
