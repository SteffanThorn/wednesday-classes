import mongoose from 'mongoose';

/**
 * SendLog — one document per admin email send run (custom composer email or a
 * weekly newsletter). Records every recipient, the Resend message id we got back,
 * and the latest delivery status reported by Resend webhooks.
 *
 * Status lifecycle for a recipient:
 *   accepted          → Resend accepted the send request (API returned an id)
 *   failed            → Resend rejected the send request (no id; see `error`)
 *   sent              → webhook: email.sent
 *   delivery_delayed  → webhook: email.delivery_delayed
 *   delivered         → webhook: email.delivered   (reached the mailbox)
 *   bounced           → webhook: email.bounced     (see `error`)
 *   complained        → webhook: email.complained  (marked as spam)
 */

const RECIPIENT_STATUSES = [
  'accepted',
  'failed',
  'sent',
  'delivery_delayed',
  'delivered',
  'bounced',
  'complained',
];

// Higher rank = later / more final. A webhook only upgrades status, never
// downgrades (webhooks can arrive out of order). `failed` / `bounced` /
// `complained` are terminal and always win once set.
export const STATUS_RANK = {
  accepted: 0,
  sent: 1,
  delivery_delayed: 1,
  delivered: 2,
  failed: 5,
  bounced: 5,
  complained: 5,
};

const SendLogRecipientSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, default: '' },
    // Resend message id (data.id from emails.send / batch.send). Null when the
    // send request itself failed.
    resendId: { type: String, default: null, index: true },
    status: { type: String, enum: RECIPIENT_STATUSES, default: 'accepted' },
    // API rejection reason, bounce message, etc.
    error: { type: String, default: '' },
    // Set once we receive an email.opened webhook (informational only).
    openedAt: { type: Date, default: null },
    // Timestamp of the most recent status change.
    lastEventAt: { type: Date, default: null },
  },
  { _id: false }
);

const SendLogSchema = new mongoose.Schema(
  {
    // 'custom'  → the "写邮件" composer
    // 'weekly'  → the 12-week newsletter series
    kind: { type: String, enum: ['custom', 'weekly'], required: true },

    subject: { type: String, required: true, trim: true },

    // Only set for kind === 'weekly'
    weekNumber: { type: Number, default: null },

    // Who triggered the send
    sentByEmail: { type: String, default: '' },
    sentByName: { type: String, default: '' },

    // 'all'      → sent to every known student/customer
    // 'selected' → sent to a hand-picked subset
    mode: { type: String, enum: ['all', 'selected'], default: 'all' },

    totalRecipients: { type: Number, default: 0 },

    recipients: { type: [SendLogRecipientSchema], default: [] },
  },
  { timestamps: true }
);

SendLogSchema.index({ createdAt: -1 });
SendLogSchema.index({ 'recipients.resendId': 1 });

/**
 * Roll the per-recipient statuses up into the counts the UI shows.
 */
export function summarizeSendLog(doc) {
  const counts = {
    total: doc.recipients.length,
    accepted: 0,
    failed: 0,
    sent: 0,
    delivery_delayed: 0,
    delivered: 0,
    bounced: 0,
    complained: 0,
    opened: 0,
  };

  for (const r of doc.recipients) {
    counts[r.status] = (counts[r.status] || 0) + 1;
    if (r.openedAt) counts.opened += 1;
  }

  // "Still in flight" = accepted/sent/delayed with no final signal yet.
  counts.pending = counts.accepted + counts.sent + counts.delivery_delayed;
  // Anything Resend told us went wrong.
  counts.problems = counts.failed + counts.bounced + counts.complained;

  return counts;
}

export default mongoose.models.SendLog || mongoose.model('SendLog', SendLogSchema);
