import mongoose from 'mongoose';

// People who unsubscribed from newsletters. Booking and account emails still go out.
const EmailOptOutSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // 'one-click' = the mail app's built-in Unsubscribe button, 'link' = the link in the email footer
    source: { type: String, enum: ['one-click', 'link'], default: 'link' },
  },
  { timestamps: true }
);

export default mongoose.models.EmailOptOut || mongoose.model('EmailOptOut', EmailOptOutSchema);
