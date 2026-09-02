import { escapeHtml } from './html-escape';

// Whitelist-based sanitizer for the blog rich-text editor's output. Input only ever comes
// from our own contentEditable toolbar (bold/underline/color), so this is deliberately a
// small, tightly scoped allowlist rather than a general-purpose HTML sanitizer library -
// anything outside {b, strong, i, em, u, br, span[style=color only]} is stripped.
const ALLOWED_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 'br', 'span']);
const COLOR_VALUE_RE = /^#[0-9a-fA-F]{3,8}$|^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;

function sanitizeStyleAttr(styleValue) {
  const match = /^\s*color\s*:\s*([^;]+?)\s*;?\s*$/i.exec(styleValue || '');
  if (!match) return null;
  const color = match[1].trim();
  return COLOR_VALUE_RE.test(color) ? `color: ${color}` : null;
}

export function sanitizeRichText(html) {
  if (typeof html !== 'string' || !html) return '';

  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  cleaned = cleaned.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (fullMatch, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    const isClosing = fullMatch.startsWith('</');

    if (!ALLOWED_TAGS.has(tag)) return '';
    if (tag === 'br') return '<br>';
    if (isClosing) return `</${tag}>`;

    if (tag === 'span') {
      const styleMatch = /style\s*=\s*"([^"]*)"|style\s*=\s*'([^']*)'/i.exec(rawAttrs);
      const rawStyle = styleMatch ? (styleMatch[1] ?? styleMatch[2]) : '';
      const safeStyle = sanitizeStyleAttr(rawStyle);
      return safeStyle ? `<span style="${safeStyle}">` : '<span>';
    }

    return `<${tag}>`;
  });

  return cleaned;
}

// Converts stored article content to a safe HTML string ready for dangerouslySetInnerHTML.
// Content written before the rich-text editor existed is plain text (may contain literal
// '<'/'>' that must NOT be treated as markup), so it's escaped and its newlines converted
// to <br> first. Content that already contains tags is assumed to be rich-editor output
// and just gets sanitized.
export function toSafeArticleHtml(content) {
  const text = typeof content === 'string' ? content : '';
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(text);
  const html = looksLikeHtml ? text : escapeHtml(text).replace(/\n/g, '<br>');
  return sanitizeRichText(html);
}

// Plain-text approximation of rich content, for contexts that can't render HTML
// (article list previews, the plain-text newsletter share composer).
export function stripHtmlToPlainText(html) {
  if (typeof html !== 'string' || !html) return '';

  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
