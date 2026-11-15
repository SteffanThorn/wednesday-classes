// Plain-text version of an HTML email. Mail with both an HTML and a text
// part looks less like bulk advertising to spam filters, and some readers
// (and smart watches) only show the text part.

const ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&lsquo;': "'",
  '&rsquo;': "'",
  '&middot;': '·',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
};

export function htmlToText(html) {
  if (!html) return '';
  let text = String(html)
    .replace(/<(head|style|script|title)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Links: keep the words and show where they go
    .replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
      const label = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!label || href.startsWith('mailto:') || label === href) return label || href;
      return `${label} (${href})`;
    })
    .replace(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|tr|table|ul|ol)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, '');

  text = text.replace(/&[a-z#0-9]+;/gi, (entity) => {
    if (ENTITIES[entity]) return ENTITIES[entity];
    const num = /^&#(\d+);$/.exec(entity);
    return num ? String.fromCodePoint(Number(num[1])) : entity;
  });

  return text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
