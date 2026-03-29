import mongoose from 'mongoose';

/**
 * NewsletterCampaign — stores the content and send history for each
 * week of the 12-week yoga course newsletter series (April 2026).
 *
 * One document per week (weekNumber 1–12), upserted via the admin panel.
 */
const NewsletterCampaignSchema = new mongoose.Schema(
  {
    // Week number within the 12-week course (1–12)
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      unique: true,
    },

    // Email subject line (editable by admin)
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // Main greeting / body of the email (plain text with line breaks)
    mainContent: {
      type: String,
      required: true,
      trim: true,
    },

    // Up to 5 bullet-point highlights for the week
    practiceHighlights: {
      type: [String],
      default: [],
    },

    // Personal note from Yuki shown at the bottom of the email
    instructorNote: {
      type: String,
      default: '',
      trim: true,
    },

    // Campaign status
    status: {
      type: String,
      enum: ['draft', 'sent'],
      default: 'draft',
    },

    // When the email was sent to students
    sentAt: {
      type: Date,
      default: null,
    },

    // How many emails were delivered in the send run
    recipientCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

NewsletterCampaignSchema.index({ weekNumber: 1 });
NewsletterCampaignSchema.index({ status: 1 });

export default mongoose.models.NewsletterCampaign ||
  mongoose.model('NewsletterCampaign', NewsletterCampaignSchema);
