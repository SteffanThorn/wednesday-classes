export function getRecipientNameParts(name) {
  const fullName = (name || '').trim() || 'Friend';
  const firstName = fullName.split(' ')[0] || 'Friend';
  return { fullName, firstName };
}

function normalizeRemainingClasses(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

/**
 * Personalize text content with customer names.
 *
 * Supported placeholders:
 * - {{name}} => full name
 * - {{firstName}} => first name
 * - /name/ => full name
 * - /firstName/ => first name
 * - /first-name/ => first name
 * - /remainingClasses/ => remaining classes count
 * - /remainingClassCredits/ => remaining classes count
 * - /剩余课程/ => remaining classes count
 * - 关键词 "剩余课程" => remaining classes count
 *
 * Also auto-fixes greeting typo/use:
 * - "Deer" or "Dear" at the start of a line becomes "Dear {firstName},"
 */
export function personalizeTextForRecipient(input, recipientName, options = {}) {
  if (!input) return input;

  const { fullName, firstName } = getRecipientNameParts(recipientName);
  const remainingClasses = normalizeRemainingClasses(options.remainingClasses);

  let output = String(input)
    .replace(/{{\s*name\s*}}/gi, fullName)
    .replace(/{{\s*firstName\s*}}/gi, firstName)
    .replace(/{{\s*remainingClasses\s*}}/gi, String(remainingClasses))
    .replace(/{{\s*remainingClassCredits\s*}}/gi, String(remainingClasses))
    .replace(/\/name\//gi, fullName)
    .replace(/\/firstName\//gi, firstName)
    .replace(/\/first-name\//gi, firstName)
    .replace(/\/first\s+name\//gi, firstName)
    .replace(/\/remainingClasses\//gi, String(remainingClasses))
    .replace(/\/remainingClassCredits\//gi, String(remainingClasses))
    .replace(/\/剩余课程\//g, String(remainingClasses))
    .replace(/剩余课程/g, `${remainingClasses}节`);

  // Replace "Hi [Name]," greeting at the start of a line with "Hi [firstName],"
  // e.g. "Hi Yuki," → "Hi Linda,"  (only matches a single capitalized word after Hi)
  output = output.replace(/^([ \t]*Hi,?\s+)([A-Z][a-z'\-]+)([,!]?\s*)$/gm, `$1${firstName}$3`);

  // Replace greeting line starts like "Deer" / "Dear" / "Deer," with recipient name
  output = output.replace(/(^|\n)\s*(deer|dear)\b\s*[,:-]?\s*/gi, `$1Dear ${firstName}, `);

  return output;
}
