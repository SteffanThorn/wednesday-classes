const DEFAULT_BASE_URL = 'https://www.innerlight.co.nz';

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/$/, '');
}

function getPublicBaseUrl() {
  // For email images, always use a publicly accessible URL (never localhost).
  // Falls back to the production domain so images load in all email clients.
  const url = (process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  if (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('innerlightyoga.co.nz')
  ) {
    return DEFAULT_BASE_URL;
  }
  return url;
}

export function getCompanyLogoUrl() {
  return `${getPublicBaseUrl()}/innerlight-logo.png`;
}

export function appendBrandLogo(html, options = {}) {
  if (!html) return html;

  const logoSrc = options.logoSrc || getCompanyLogoUrl();

  // Avoid adding duplicate logo footer
  if (
    html.includes('cid:innerlight-logo-footer') ||
    html.includes('innerlight-logo.png') ||
    html.includes('Innerlight%20Logo.png') ||
    html.includes('Innerlight Logo.png')
  ) {
    return html;
  }

  const brandFooter = `
  <div style="text-align:center; padding: 18px 0 6px;">
    <img
      src="${logoSrc}"
      alt="INNER LIGHT Yoga"
      width="140"
      style="display:inline-block; height:auto; max-width:140px; opacity:0.95;"
    />
  </div>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${brandFooter}</body>`);
  }

  if (html.includes('</html>')) {
    return html.replace('</html>', `${brandFooter}</html>`);
  }

  return `${html}${brandFooter}`;
}
