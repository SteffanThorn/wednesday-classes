import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import dbConnect from '@/lib/mongodb';
import SendLog, { STATUS_RANK } from '@/lib/models/SendLog';

/**
 * POST /api/webhooks/resend
 *
 * Public endpoint that receives Resend delivery events and updates the matching
 * SendLog recipient's status. Configure it in the Resend dashboard
 * (Webhooks → Add Endpoint) pointing at https://www.innerlight.co.nz/api/webhooks/resend
 * subscribed to the email.* events, then put the signing secret in
 * RESEND_WEBHOOK_SECRET.
 *
 * Until RESEND_WEBHOOK_SECRET is set this endpoint processes nothing and just
 * acknowledges, so the rest of the send flow keeps working (you still get the
 * "accepted by Resend" confirmation and the failed-address list).
 */

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || '';

// Resend event type → the recipient status it implies.
const EVENT_STATUS = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delivery_delayed',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.failed': 'failed',
};

function extractEventError(type, data) {
  if (type === 'email.bounced') {
    return data?.bounce?.message || data?.bounce?.subType || data?.reason || 'Bounced';
  }
  if (type === 'email.failed') {
    return data?.failed?.reason || data?.reason || 'Delivery failed';
  }
  if (type === 'email.complained') {
    return 'Recipient marked the email as spam';
  }
  return '';
}

export async function POST(request) {
  const rawBody = await request.text();

  if (!WEBHOOK_SECRET) {
    console.warn('Resend webhook received but RESEND_WEBHOOK_SECRET is not set — ignoring.');
    return NextResponse.json({ ok: true, skipped: 'no secret configured' });
  }

  // ── Verify the Svix signature Resend attaches ────────────────────────────────
  let event;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(rawBody, {
      'svix-id': request.headers.get('svix-id') || '',
      'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': request.headers.get('svix-signature') || '',
    });
  } catch (err) {
    console.error('Resend webhook signature verification failed:', err?.message || err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const type = event?.type;
  const data = event?.data || {};
  const emailId = data?.email_id || data?.id;

  if (!type || !emailId) {
    return NextResponse.json({ ok: true, ignored: 'missing type or email id' });
  }

  const eventTime = event?.created_at ? new Date(event.created_at) : new Date();

  try {
    await dbConnect();

    const log = await SendLog.findOne({ 'recipients.resendId': emailId });
    if (!log) {
      // Not one of ours (or sent before this feature shipped).
      return NextResponse.json({ ok: true, ignored: 'no matching send log' });
    }

    const recipient = log.recipients.find((r) => r.resendId === emailId);
    if (!recipient) {
      return NextResponse.json({ ok: true, ignored: 'no matching recipient' });
    }

    let changed = false;

    if (type === 'email.opened') {
      if (!recipient.openedAt) {
        recipient.openedAt = eventTime;
        changed = true;
      }
    } else {
      const nextStatus = EVENT_STATUS[type];
      if (nextStatus) {
        const currentRank = STATUS_RANK[recipient.status] ?? 0;
        const nextRank = STATUS_RANK[nextStatus] ?? 0;
        // Only move the status forward; ignore stale / out-of-order events.
        if (nextRank >= currentRank && recipient.status !== nextStatus) {
          recipient.status = nextStatus;
          recipient.lastEventAt = eventTime;
          const errMsg = extractEventError(type, data);
          if (errMsg) recipient.error = errMsg;
          changed = true;
        }
      }
    }

    if (changed) {
      await log.save();
    }

    return NextResponse.json({ ok: true, updated: changed });
  } catch (err) {
    console.error('Resend webhook processing error:', err);
    // 500 tells Resend to retry later.
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
