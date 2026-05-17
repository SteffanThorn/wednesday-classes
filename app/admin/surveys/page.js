'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { ChevronRight, Loader2, Search, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Parse "Key: Value | Key: Value | ..." notes string into an array of {label, value} pairs
function parseNotes(notes) {
  if (!notes) return [];
  return notes.split(' | ').map((part) => {
    const idx = part.indexOf(': ');
    if (idx === -1) return { label: part, value: '' };
    return { label: part.slice(0, idx).trim(), value: part.slice(idx + 2).trim() };
  }).filter((p) => p.value && p.value !== '—');
}

function SurveyCard({ survey }) {
  const [expanded, setExpanded] = useState(false);
  const fields = parseNotes(survey.notes);

  // Always show these top fields
  const topKeys = ['Age', 'Gender', 'Body Type', 'Risk Areas', 'Goals'];
  const topFields = fields.filter((f) => topKeys.some((k) => f.label.toLowerCase().includes(k.toLowerCase())));
  const restFields = fields.filter((f) => !topKeys.some((k) => f.label.toLowerCase().includes(k.toLowerCase())));

  return (
    <div className="rounded-2xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-glow-cyan/10 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{survey.name}</p>
          <div className="flex flex-wrap gap-3 mt-0.5 text-sm text-muted-foreground">
            {survey.email && <span>{survey.email}</span>}
            {survey.phone && <span>{survey.phone}</span>}
          </div>
        </div>
        <span className="text-xs text-muted-foreground/60 shrink-0">
          {new Date(survey.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Top fields summary */}
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {topFields.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-0.5">{label}</p>
            <p className="text-sm text-foreground leading-snug">{value}</p>
          </div>
        ))}
      </div>

      {/* Expandable full details */}
      {restFields.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full px-5 py-2.5 border-t border-glow-cyan/10 text-xs text-muted-foreground/60
                       hover:text-glow-cyan hover:bg-glow-cyan/5 transition-all flex items-center justify-center gap-1.5"
          >
            {expanded ? (
              <><ChevronUp className="w-3.5 h-3.5" /> 收起详情</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> 查看全部 {restFields.length} 项详情</>
            )}
          </button>

          {expanded && (
            <div className="px-5 py-4 border-t border-glow-cyan/10 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-glow-cyan/5">
              {restFields.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-0.5">{label}</p>
                  <p className="text-sm text-foreground leading-snug">{value}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminSurveysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/signin'); return; }
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchSurveys(debouncedSearch);
    }
  }, [status, session, debouncedSearch]);

  async function fetchSurveys(q) {
    setLoading(true);
    setError('');
    try {
      const url = q ? `/api/admin/surveys?search=${encodeURIComponent(q)}` : '/api/admin/surveys';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load');
      setSurveys(data.surveys || []);
    } catch (err) {
      setError(err.message || 'Failed to load survey submissions');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-glow-cyan animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />

        <section className="px-6 pt-8 pb-12">
          <div className="max-w-5xl mx-auto">

            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-glow-cyan transition-colors">
                Admin Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan">问卷调查记录</span>
            </div>

            {/* Title */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-1 flex items-center gap-3">
                  <ClipboardList className="w-7 h-7 text-glow-cyan" />
                  问卷调查记录
                </h1>
                <p className="text-muted-foreground text-sm">
                  已提交新学员问卷的学员填写情况（共 {surveys.length} 份）
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="按姓名、邮箱、电话或内容搜索…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card/60 border border-glow-cyan/20
                           focus:outline-none focus:border-glow-cyan/50 text-sm text-foreground
                           placeholder:text-muted-foreground/40"
              />
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-glow-cyan animate-spin" />
              </div>
            ) : surveys.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground text-sm">
                {search ? '没有找到匹配的问卷记录。' : '暂无问卷提交记录。'}
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.map((s) => (
                  <SurveyCard key={s.id} survey={s} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
