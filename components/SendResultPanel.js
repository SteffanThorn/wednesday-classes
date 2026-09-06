'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  X,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react';

/**
 * Persistent confirmation panel shown after an admin email send.
 *
 * `result` = { logId, kind: 'custom'|'weekly', sent, total, failures: [{email,message}] }
 *
 * Immediately shows how many messages Resend accepted and lists every address
 * that failed at the API call. Then it polls /api/admin/send-logs/<logId> for a
 * few minutes so the delivered / bounced counts fill in as Resend webhooks
 * arrive (needs RESEND_WEBHOOK_SECRET configured — otherwise those stay at 0 and
 * the note below says so).
 */

const POLL_INTERVAL_MS = 8000;
const MAX_POLLS = 24; // ~3 minutes

function StatChip({ label, value, tone }) {
  const tones = {
    good: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
    bad: 'text-red-400 border-red-500/25 bg-red-500/10',
    warn: 'text-amber-400 border-amber-500/25 bg-amber-500/10',
    muted: 'text-muted-foreground border-white/10 bg-white/5',
    info: 'text-glow-cyan border-glow-cyan/25 bg-glow-cyan/10',
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border px-3 py-2 ${tones[tone] || tones.muted}`}>
      <span className="text-lg font-semibold leading-none">{value}</span>
      <span className="mt-1 text-[11px] leading-none">{label}</span>
    </div>
  );
}

export default function SendResultPanel({ result, onClose }) {
  const { logId, sent = 0, total = 0, failures = [] } = result || {};

  const [counts, setCounts] = useState(null);
  const [polling, setPolling] = useState(Boolean(logId));
  const [lastCheck, setLastCheck] = useState(null);
  const pollCountRef = useRef(0);
  const timerRef = useRef(null);

  const fetchLog = useCallback(async () => {
    if (!logId) return;
    try {
      const res = await fetch(`/api/admin/send-logs/${logId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCounts(data.log.counts);
        setLastCheck(new Date());
        // Stop once nothing is still in flight.
        if (data.log.counts.pending === 0) {
          setPolling(false);
        }
      }
    } catch {
      /* transient — keep polling */
    }
  }, [logId]);

  useEffect(() => {
    if (!logId || !polling) return undefined;

    // Kick the first poll on the next tick (not synchronously in the effect body).
    const kick = setTimeout(fetchLog, 0);
    timerRef.current = setInterval(() => {
      pollCountRef.current += 1;
      if (pollCountRef.current >= MAX_POLLS) {
        setPolling(false);
        return;
      }
      fetchLog();
    }, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(kick);
      clearInterval(timerRef.current);
    };
  }, [logId, polling, fetchLog]);

  const manualRefresh = () => {
    pollCountRef.current = 0;
    setPolling(true);
    fetchLog();
  };

  const copyFailures = () => {
    const text = failures.map((f) => `${f.email} — ${f.message}`).join('\n');
    navigator.clipboard?.writeText(text);
  };

  const allAccepted = failures.length === 0 && sent > 0;
  const noneSent = sent === 0;

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-card/70 backdrop-blur-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {noneSent ? (
            <XCircle className="w-5 h-5 text-red-400" />
          ) : allAccepted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400" />
          )}
          <h3 className="text-base font-medium text-foreground">发送结果</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Acceptance line */}
      <p
        className={`text-sm font-medium ${
          noneSent ? 'text-red-300' : allAccepted ? 'text-emerald-300' : 'text-amber-300'
        }`}
      >
        {noneSent
          ? `没有邮件被发送成功（0 / ${total}）`
          : `${sent} / ${total} 封已被 Resend 接收${allAccepted ? ' ✓' : ''}`}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        “已接收”表示 Resend 已收到发送请求。下方“投递状态”会显示邮件是否真正送达收件人邮箱。
      </p>

      {/* Failures */}
      {failures.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-500/25 bg-red-950/15 p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-semibold text-red-300 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              {failures.length} 封发送失败
            </p>
            <button
              onClick={copyFailures}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-3 h-3" />
              复制清单
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {failures.map((f, i) => (
              <div key={`${f.email}-${i}`} className="text-xs text-red-200/90">
                <span className="font-medium">{f.email}</span>
                <span className="text-red-300/70"> — {f.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery status */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-xs font-semibold text-foreground/80">投递状态</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {polling ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                实时更新中…
              </span>
            ) : (
              <button
                onClick={manualRefresh}
                className="inline-flex items-center gap-1 hover:text-foreground"
                disabled={!logId}
              >
                <RefreshCw className="w-3 h-3" />
                刷新
              </button>
            )}
            {lastCheck && <span>{lastCheck.toLocaleTimeString('en-NZ')}</span>}
          </div>
        </div>

        {counts ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <StatChip label="已送达" value={counts.delivered} tone="good" />
            <StatChip label="退信" value={counts.bounced} tone={counts.bounced > 0 ? 'bad' : 'muted'} />
            <StatChip
              label="标记垃圾"
              value={counts.complained}
              tone={counts.complained > 0 ? 'warn' : 'muted'}
            />
            <StatChip
              label="延迟"
              value={counts.delivery_delayed}
              tone={counts.delivery_delayed > 0 ? 'warn' : 'muted'}
            />
            <StatChip label="处理中" value={counts.pending} tone="muted" />
            <StatChip label="已打开" value={counts.opened} tone={counts.opened > 0 ? 'info' : 'muted'} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {logId ? '正在读取投递状态…' : '此次发送没有生成记录 ID，无法追踪投递状态。'}
          </p>
        )}

        {counts && counts.delivered === 0 && counts.problems === 0 && !polling && (
          <p className="mt-2 text-[11px] text-muted-foreground/80">
            还没有收到投递回执。如果尚未在 Resend 后台配置 Webhook（RESEND_WEBHOOK_SECRET），
            这里会一直显示“处理中”。可稍后在“发送记录”中再次查看。
          </p>
        )}
      </div>

      {/* Footer */}
      {logId && (
        <div className="mt-4 flex items-center justify-end">
          <a
            href={`/admin/send-logs?id=${logId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-glow-cyan hover:underline"
          >
            查看完整记录
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
