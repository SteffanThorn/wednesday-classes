'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import {
  Loader2,
  ChevronLeft,
  Mail,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// ── Status label + colour for a single recipient row ─────────────────────────
const STATUS_META = {
  delivered: { label: '已送达', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  accepted: { label: '处理中', cls: 'bg-white/5 text-muted-foreground border-white/10' },
  sent: { label: '已发出', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/25' },
  delivery_delayed: { label: '投递延迟', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  bounced: { label: '退信', cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  complained: { label: '标记垃圾', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  failed: { label: '发送失败', cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.accepted;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function fmtDateTime(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('en-NZ', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function KindBadge({ log }) {
  if (log.kind === 'weekly') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border border-violet-500/25 bg-violet-500/15 text-violet-300">
        周报{log.weekNumber ? ` · W${log.weekNumber}` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border border-glow-cyan/25 bg-glow-cyan/10 text-glow-cyan">
      自定义邮件
    </span>
  );
}

// ── Small count summary shown on each list row ───────────────────────────────
function CountsLine({ counts }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1 text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {counts.delivered} 送达
      </span>
      {counts.pending > 0 && (
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {counts.pending} 处理中
        </span>
      )}
      {counts.bounced > 0 && (
        <span className="inline-flex items-center gap-1 text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          {counts.bounced} 退信
        </span>
      )}
      {counts.failed > 0 && (
        <span className="inline-flex items-center gap-1 text-red-400">
          <XCircle className="w-3.5 h-3.5" />
          {counts.failed} 失败
        </span>
      )}
      {counts.complained > 0 && (
        <span className="inline-flex items-center gap-1 text-amber-400">
          {counts.complained} 标记垃圾
        </span>
      )}
      <span className="text-muted-foreground/60">共 {counts.total}</span>
    </div>
  );
}

function SendLogsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusId = searchParams.get('id');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/send-logs');
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const openDetail = useCallback(async (id) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/send-logs/${id}`);
      const data = await res.json();
      if (data.success) setDetail(data.log);
    } catch {
      /* ignore */
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (focusId) openDetail(focusId);
  }, [focusId, openDetail]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-glow-cyan animate-spin" />
      </div>
    );
  }
  if (!session?.user || session.user.role !== 'admin') return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />
        <section className="px-6 pt-8 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Page header */}
            <div className="mb-8 flex items-center gap-4">
              <a
                href="/admin/newsletter"
                className="p-2 rounded-xl border border-white/10 hover:border-glow-cyan/30
                  text-muted-foreground hover:text-glow-cyan transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </a>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-glow-cyan" />
                  <h1 className="font-display text-3xl font-light text-glow-subtle">发送记录</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  每次群发的收件人与投递状态（送达 / 退信 / 失败）
                </p>
              </div>
              <button
                onClick={() => {
                  fetchList();
                  if (detail) openDetail(detail.id);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground
                  border border-white/10 hover:text-foreground hover:border-white/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            </div>

            {/* Detail view */}
            {(detail || detailLoading) && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-card/70 backdrop-blur-sm p-5">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 text-glow-cyan animate-spin" />
                  </div>
                ) : (
                  detail && (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <KindBadge log={detail} />
                            <span className="text-xs text-muted-foreground">
                              {detail.mode === 'selected' ? '选定客户' : '全部客户'}
                            </span>
                          </div>
                          <h2 className="text-lg font-medium text-foreground">{detail.subject}</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {fmtDateTime(detail.createdAt)}
                            {detail.sentByName ? ` · ${detail.sentByName}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setDetail(null);
                            if (focusId) router.replace('/admin/send-logs');
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          收起
                        </button>
                      </div>

                      <div className="mb-4">
                        <CountsLine counts={detail.counts} />
                      </div>

                      <div className="rounded-xl border border-white/10 overflow-hidden">
                        <div className="max-h-[420px] overflow-y-auto divide-y divide-white/5">
                          {detail.recipients.map((r, i) => (
                            <div
                              key={`${r.email}-${i}`}
                              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="text-foreground/90 truncate">
                                  {r.name ? `${r.name} · ` : ''}
                                  {r.email}
                                </p>
                                {r.error && (
                                  <p className="text-[11px] text-red-300/80 truncate">{r.error}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {r.openedAt && (
                                  <span className="text-[11px] text-glow-cyan">已打开</span>
                                )}
                                <StatusPill status={r.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                )}
              </div>
            )}

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 text-glow-cyan animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">还没有发送记录。</p>
            ) : (
              <div className="space-y-2">
                {items.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => openDetail(log.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all
                      hover:border-glow-cyan/30 hover:bg-card/60
                      ${detail?.id === log.id ? 'border-glow-cyan/40 bg-card/60' : 'border-white/8 bg-card/40'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <KindBadge log={log} />
                      <span className="text-xs text-muted-foreground">
                        {log.mode === 'selected' ? '选定客户' : '全部客户'}
                      </span>
                      <span className="text-xs text-muted-foreground/60 ml-auto">
                        {fmtDateTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1.5 truncate">{log.subject}</p>
                    <CountsLine counts={log.counts} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SendLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 text-glow-cyan animate-spin" />
        </div>
      }
    >
      <SendLogsContent />
    </Suspense>
  );
}
