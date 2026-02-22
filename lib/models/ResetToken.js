import mongoose from 'mongoose';

// ResetToken schema for password reset flows (Option B)
// - Stores a hashed token to avoid leaking raw tokens if DB is compromised
// - Associates with a user and has an expiry time
// - Supports auditing via createdAt/consumedAt and can be extended later

const resetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  consumedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Useful compound index: one active token per user (optional policy)
// You can uncomment to enforce uniqueness for non-consumed, non-expired tokens per user
// resetTokenSchema.index({ userId: 1, consumedAt: 1, expiresAt: 1 });

const ResetToken = mongoose.models.ResetToken || mongoose.model('ResetToken', resetTokenSchema);

export default ResetToken;
