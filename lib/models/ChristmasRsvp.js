import mongoose from 'mongoose';

export const CHRISTMAS_CHOICES = ['dec16', 'dec23', 'either', 'no'];

// One reply per person to the 2026 Christmas gathering date poll (no login needed).
const ChristmasRsvpSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // Lowercased name: the same person replying again updates their answer
    nameKey: { type: String, required: true, unique: true },
    choice: { type: String, enum: CHRISTMAS_CHOICES, required: true },
    note: { type: String, trim: true, default: '', maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.models.ChristmasRsvp || mongoose.model('ChristmasRsvp', ChristmasRsvpSchema);
