// "Letter style" newsletter layout: plain black text on white, no banner,
// buttons or logo, signed by Yuki. It reads like a personal email, which
// Gmail is much more likely to put in Primary than a designed template.

import { getPublicBaseUrl } from '@/lib/email-branding';
import { escapeHtml } from '@/lib/html-escape';

const TEXT = 'margin:0 0 14px;';

/** Newsletter greeting: "Kia ora Sarah," or just "Kia ora," when there's no name. */
export function kiaOra(firstName) {
  const name = String(firstName || '').trim();
  return name ? `Kia ora ${name},` : 'Kia ora,';
}

/** Paragraph per blank-line-separated block; single line breaks kept. Content is admin-written HTML-safe text. */
export function letterParagraphs(content, { splitOnSingleNewline = false } = {}) {
  const blocks = splitOnSingleNewline
    ? String(content || '').split('\n')
    : String(content || '').split(/\n\s*\n/);
  return blocks
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p style="${TEXT}">${block.replace(/\n/g, '<br />')}</p>`)
    .join('\n');
}

/**
 * Full letter-style email.
 * bodyHtml: the middle of the letter (already built paragraphs / lists).
 */
export function buildLetterHtml({ firstName, bodyHtml, unsubscribeUrl }) {
  const site = getPublicBaseUrl();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>INNER LIGHT Yoga</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:24px 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222222;">
    <p style="${TEXT}">${kiaOra(firstName)}</p>
    ${bodyHtml}
    <p style="margin:24px 0 0;">Warmly,<br />Yuki<br />INNER LIGHT Yoga &middot; <a href="${site}/classes" style="color:#1a56db;">innerlight.co.nz</a></p>
    ${unsubscribeUrl
      ? `<p style="margin:32px 0 0;font-size:12px;color:#888888;">Don&rsquo;t want these emails? <a href="${unsubscribeUrl}" style="color:#888888;">Unsubscribe</a></p>`
      : ''}
  </div>
</body>
</html>`;
}

const SLOT_LABELS = {
  'Wed 9:15': 'Wednesday 9:15am',
  'Thu 17:30': 'Thursday 5:30pm',
  'Fri 18:00': 'Friday 6pm',
};

// Letter-style weekly email: Yuki's message, this week's classes as a short
// list, practice points and her note, without the designed template.
export function buildWeeklyLetterHtml({ userName, classSummaries, mainContent, practiceHighlights, instructorNote, unsubscribeUrl }) {
  const parts = [letterParagraphs(mainContent, { splitOnSingleNewline: true })];

  const classes = (classSummaries || []).filter((c) => c?.topic);
  if (classes.length) {
    parts.push(`<p style="margin:0 0 6px;">This week&rsquo;s classes:</p>
<ul style="margin:0 0 14px;padding-left:20px;">
${classes.map((c) => `  <li style="margin:0 0 6px;"><strong>${SLOT_LABELS[c.slot] || c.slot}</strong> &ndash; ${c.topic}${c.summary ? `. ${c.summary}` : ''}</li>`).join('\n')}
</ul>`);
  }

  const highlights = (practiceHighlights || []).filter((h) => String(h || '').trim());
  if (highlights.length) {
    parts.push(`<p style="margin:0 0 6px;">What we&rsquo;ll practise:</p>
<ul style="margin:0 0 14px;padding-left:20px;">
${highlights.map((h) => `  <li style="margin:0 0 4px;">${h}</li>`).join('\n')}
</ul>`);
  }

  if (String(instructorNote || '').trim()) {
    parts.push(letterParagraphs(instructorNote));
  }

  return buildLetterHtml({
    firstName: userName?.split(' ')[0] || '',
    bodyHtml: parts.join('\n'),
    unsubscribeUrl,
  });
}

// Letter-style version of a custom email: just the text, a plain video link,
// any uploaded images (small) and the attachment names, signed by Yuki.
export function buildCustomLetterHtml({ userName, content, inlineImages = [], fileAttachments = [], videoUrl = null, unsubscribeUrl = '' }) {
  const parts = [letterParagraphs(content)];
  if (videoUrl) {
    parts.push(`<p style="margin:0 0 14px;">Video: <a href="${escapeHtml(videoUrl)}" style="color:#1a56db;">${escapeHtml(videoUrl)}</a></p>`);
  }
  inlineImages.forEach((file) => {
    parts.push(`<p style="margin:0 0 14px;"><img src="cid:${file.cid}" alt="${escapeHtml(file.filename)}" style="max-width:100%;width:320px;height:auto;border-radius:6px;" /></p>`);
  });
  if (fileAttachments.length) {
    parts.push(`<p style="margin:0 0 14px;">Attached: ${fileAttachments.map((f) => escapeHtml(f.filename)).join(', ')}</p>`);
  }
  return buildLetterHtml({
    firstName: userName?.split(' ')[0] || '',
    bodyHtml: parts.join('\n'),
    unsubscribeUrl,
  });
}
