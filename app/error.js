'use client';

import { useEffect } from 'react';

// After a new deploy, a phone that still has the old page open can fail to
// load the old JS files. Reloading once fetches the new version.
const isChunkLoadError = (error) =>
  /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    `${error?.name || ''} ${error?.message || ''}`
  );

const RELOAD_FLAG = 'chunk-error-reloaded';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
    if (!isChunkLoadError(error)) return;
    try {
      if (!window.sessionStorage.getItem(RELOAD_FLAG)) {
        window.sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
      }
    } catch {
      // Storage blocked: skip the auto-reload, the buttons below still work.
    }
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>页面出错了 / Something went wrong</h2>
        <p style={{ opacity: 0.8, marginBottom: 16 }}>
          请先点“刷新页面”。如果还是不行，请把下面的错误信息截图发给网站管理员。
          <br />
          Please tap “Reload”. If it keeps happening, screenshot the details below.
        </p>
        <pre
          style={{
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: 12,
            padding: 12,
            borderRadius: 8,
            background: 'rgba(127,127,127,0.15)',
            marginBottom: 16,
          }}
        >
          {`${error?.name || 'Error'}: ${error?.message || 'Unknown error'}${error?.digest ? `\nDigest: ${error.digest}` : ''}\nPage: ${typeof window !== 'undefined' ? window.location.pathname : ''}\nBrowser: ${typeof navigator !== 'undefined' ? navigator.userAgent : ''}`}
        </pre>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid currentColor' }}>
            刷新页面 / Reload
          </button>
          <button onClick={() => reset()} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid currentColor' }}>
            重试 / Try again
          </button>
        </div>
      </div>
    </div>
  );
}
