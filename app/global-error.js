'use client';

import ErrorPage from './error';

// Catches errors in the root layout itself (e.g. the language or login providers).
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0b0f14', color: '#e6edf3' }}>
        <ErrorPage error={error} reset={reset} />
      </body>
    </html>
  );
}
