'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import {
  Loader2,
  ChevronLeft,
  MessageCircle,
  Check,
  X,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
  { key: 'all', label: '全部' },
];

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

export default function GuestbookAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  const fetchItems = useCallback(async (statusFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/guestbook?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setCounts(data.counts);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(tab);
  }, [tab, fetchItems]);

  async function moderate(id, nextStatus) {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/guestbook/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== id));
        setCounts((prev) => ({
          ...prev,
          pending: tab === 'pending' ? Math.max(0, prev.pending - 1) : prev.pending,
          [nextStatus]: (prev[nextStatus] || 0) + 1,
        }));
      }
    } finally {
      setActingId(null);
    }
  }

  async function remove(id) {
    if (!confirm('永久删除这条留言？此操作无法撤回。')) return;
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/guestbook/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }
    } finally {
      setActingId(null);
    }
  }

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
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
              <a
                href="/admin"
                className="p-2 rounded-xl border border-white/10 hover:border-glow-cyan/30
                  text-muted-foreground hover:text-glow-cyan transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </a>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-5 h-5 text-glow-cyan" />
                  <h1 className="font-display text-3xl font-light text-glow-subtle">留言板审核</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  审核学生在首页留言板提交的留言，通过后才会公开显示。
                </p>
              </div>
              <button
                onClick={() => fetchItems(tab)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground
                  border border-white/10 hover:text-foreground hover:border-white/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3.5 py-1.5 rounded-full text-sm border transition-all ${
                    tab === t.key
                      ? 'border-glow-cyan/40 bg-glow-cyan/10 text-glow-cyan'
                      : 'border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
                  }`}
                >
                  {t.label}
                  {t.key !== 'all' && (
                    <span className="ml-1.5 text-xs text-muted-foreground/70">
                      {counts[t.key] ?? 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 text-glow-cyan animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">
                {tab === 'pending' ? '没有待审核的留言。' : '这里还没有记录。'}
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.userEmail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground/70 shrink-0">
                        {fmtDateTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line mb-3">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2">
                      {item.status !== 'approved' && (
                        <button
                          onClick={() => moderate(item.id, 'approved')}
                          disabled={actingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10
                            transition-all disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          通过
                        </button>
                      )}
                      {item.status !== 'rejected' && (
                        <button
                          onClick={() => moderate(item.id, 'rejected')}
                          disabled={actingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            border border-amber-400/30 text-amber-400 hover:bg-amber-400/10
                            transition-all disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          拒绝
                        </button>
                      )}
                      <button
                        onClick={() => remove(item.id)}
                        disabled={actingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                          border border-red-400/30 text-red-400 hover:bg-red-400/10
                          transition-all disabled:opacity-50 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
