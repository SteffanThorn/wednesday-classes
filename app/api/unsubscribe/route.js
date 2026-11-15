import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { isValidUnsubscribeToken, normalizeEmail, recordOptOut } from '@/lib/newsletter-unsubscribe';

function readParams(request) {
  const { searchParams } = new URL(request.url);
  return { email: normalizeEmail(searchParams.get('e')), token: searchParams.get('t') || '' };
}

/**
 * POST /api/unsubscribe?e=...&t=...
 * Called by the mail app's built-in Unsubscribe button (body "List-Unsubscribe=One-Click")
 * and by the confirm button on /unsubscribe (body { source: 'link' }).
 */
export async function POST(request) {
  const { email, token } = readParams(request);
  if (!email || !isValidUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 });
  }

  let source = 'one-click';
  if ((request.headers.get('content-type') || '').includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    if (body?.source === 'link') source = 'link';
  }

  try {
    await dbConnect();
    await recordOptOut(email, source);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/unsubscribe error:', err);
    return NextResponse.json({ error: 'Could not unsubscribe. Please try again.' }, { status: 500 });
  }
}

// Opening the one-click URL in a browser shows the confirm page instead of unsubscribing
// straight away (link scanners open URLs automatically).
export async function GET(request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/unsubscribe${url.search}`, url.origin));
}
