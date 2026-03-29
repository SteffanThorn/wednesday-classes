export function getRecipientNameParts(name) {
  const fullName = (name || '').trim() || 'Friend';
  const firstName = fullName.split(' ')[0] || 'Friend';
  return { fullName, firstName };
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
 *
 * Also auto-fixes greeting typo/use:
 * - "Deer" or "Dear" at the start of a line becomes "Dear {firstName},"
 */
export function personalizeTextForRecipient(input, recipientName) {
  if (!input) return input;

  const { fullName, firstName } = getRecipientNameParts(recipientName);

  let output = String(input)
    .replace(/{{\s*name\s*}}/gi, fullName)
    .replace(/{{\s*firstName\s*}}/gi, firstName)
    .replace(/\/name\//gi, fullName)
    .replace(/\/firstName\//gi, firstName)
    .replace(/\/first-name\//gi, firstName)
    .replace(/\/first\s+name\//gi, firstName);

  // Replace "Hi [Name]," greeting at the start of a line with "Hi [firstName],"
  // e.g. "Hi Yuki," → "Hi Linda,"  (only matches a single capitalized word after Hi)
  output = output.replace(/^([ \t]*Hi,?\s+)([A-Z][a-z'\-]+)([,!]?\s*)$/gm, `$1${firstName}$3`);

  // Replace greeting line starts like "Deer" / "Dear" / "Deer," with recipient name
  output = output.replace(/(^|\n)\s*(deer|dear)\b\s*[,:-]?\s*/gi, `$1Dear ${firstName}, `);

  return output;
}
