import mongoose from 'mongoose';

/**
 * GuestbookMessage — a free-text note a logged-in student leaves on the
 * homepage guestbook, sharing their experience of the classes.
 *
 * Every message starts 'pending' and stays invisible to the public until an
 * admin approves it (see /admin/guestbook), since this is unmoderated
 * user-submitted content shown on the public homepage.
 */
const GuestbookMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Snapshot of the student's name/email at submission time.
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, trim: true, lowercase: true },

    message: { type: String, required: true, trim: true, maxlength: 800 },

    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    moderatedAt: { type: Date, default: null },
    moderatedByEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

GuestbookMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.GuestbookMessage ||
  mongoose.model('GuestbookMessage', GuestbookMessageSchema);
