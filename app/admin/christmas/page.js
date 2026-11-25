'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { ChevronRight, Copy, Check, ExternalLink, Loader2, Trash2, TreePine } from 'lucide-react';

const OPTIONS = [
  { value: 'dec16', label: '12月16日（周三）/ Dec 16', tone: 'text-glow-cyan border-glow-cyan/30 bg-glow-cyan/10' },
  { value: 'dec23', label: '12月23日（周三）/ Dec 23', tone: 'text-purple-300 border-purple-400/30 bg-purple-500/10' },
  { value: 'either', label: '两天都可以 / Either date', tone: 'text-green-300 border-green-400/30 bg-green-500/10' },
  { value: 'no', label: '这次不能参加 / Can’t join', tone: 'text-muted-foreground border-glow-cyan/15 bg-card/40' },
];
const LABEL = Object.fromEntries(OPTIONS.map((o) => [o.value, o.label]));
const ATTENDANCE_LABEL = {
  gathering: '只参加圣诞活动（10:30–11:00）',
  'yoga-and-gathering': '瑜伽课 + 圣诞活动',
};

export default function AdminChristmasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [origin, setOrigin] = useState('https://www.innerlight.co.nz');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/christmas-rsvp');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load replies');
      setData(json);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      setOrigin(window.location.origin);
      load();
    }
  }, [status, session, load]);

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      window.prompt('复制这个链接 / Copy this link:', text);
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`删除 ${name} 的回复吗？`)) return;
    await fetch(`/api/christmas-rsvp?id=${id}`, { method: 'DELETE' });
    load();
  };

  if (status === 'loading' || !session?.user || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-glow-cyan animate-spin" />
      </div>
    );
  }

  const pageUrl = `${origin}/christmas`;
  const counts = data?.counts || {};
  const total = data?.replies?.length || 0;
  const coming16 = (counts.dec16 || 0) + (counts.either || 0);
  const coming23 = (counts.dec23 || 0) + (counts.either || 0);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />
        <section className="px-4 sm:px-6 pt-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-glow-cyan">管理后台</Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan">圣诞聚会意向</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle flex items-center gap-3">
              <TreePine className="w-7 h-7 text-glow-cyan" /> 圣诞聚会意向 / Christmas RSVPs
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">学员不需要注册，打开链接填名字和选择即可。同一个名字再次提交会更新之前的回复。</p>

            {/* Links to share */}
            <div className="mt-6 rounded-2xl border border-glow-cyan/20 bg-card/60 p-4 space-y-2 text-sm">
              <p className="font-medium text-foreground">分享链接 / Links to share</p>
              {[{ key: 'page', label: '调查页面 / Poll page', url: pageUrl },
                ...OPTIONS.map((o) => ({ key: o.value, label: `直接选好「${o.label}」`, url: `${pageUrl}?choice=${o.value}` }))].map((l) => (
                <div key={l.key} className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground min-w-[11rem]">{l.label}</span>
                  <code className="text-xs text-foreground break-all flex-1">{l.url}</code>
                  <button type="button" onClick={() => copy(l.url, l.key)} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-glow-cyan/30 text-glow-cyan text-xs hover:bg-glow-cyan/10">
                    {copied === l.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied === l.key ? '已复制' : '复制'}
                  </button>
                  <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded border border-glow-cyan/20 text-muted-foreground text-xs hover:text-glow-cyan">
                    <ExternalLink className="w-3 h-3" /> 打开
                  </a>
                </div>
              ))}
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            {/* Totals */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {OPTIONS.map((o) => (
                <div key={o.value} className={`rounded-xl border p-4 ${o.tone}`}>
                  <p className="text-xs">{o.label}</p>
                  <p className="text-3xl font-light mt-1">{data ? counts[o.value] || 0 : '–'}</p>
                </div>
              ))}
            </div>
            {data && (
              <p className="mt-3 text-sm text-muted-foreground">
                共 {total} 人回复。可以来 12月16日：<span className="text-glow-cyan">{coming16}</span> 人 · 可以来 12月23日：<span className="text-purple-300">{coming23}</span> 人（都包含“两天都可以”的人）
              </p>
            )}
            {data && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {Object.entries(ATTENDANCE_LABEL).map(([value, label]) => (
                  <div key={value} className="rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 p-4">
                    <p className="text-xs">{label}</p>
                    <p className="text-3xl font-light mt-1">{data.attendanceCounts?.[value] || 0}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Replies */}
            <div className="mt-6 rounded-2xl border border-glow-cyan/20 bg-card/60 overflow-x-auto">
              {!data ? (
                <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 text-glow-cyan animate-spin" /></div>
              ) : total === 0 ? (
                <p className="py-10 text-center text-muted-foreground text-sm">还没有回复 / No replies yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-glow-cyan/20 bg-glow-cyan/5 text-left text-glow-cyan">
                      <th className="px-4 py-3 font-medium">姓名 / Name</th>
                      <th className="px-4 py-3 font-medium">选择 / Answer</th>
                      <th className="px-4 py-3 font-medium">参加方式 / Joining</th>
                      <th className="px-4 py-3 font-medium">邮箱 / Email</th>
                      <th className="px-4 py-3 font-medium">留言 / Note</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">时间 / When</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.replies.map((r) => (
                      <tr key={r.id} className="border-b border-glow-cyan/10">
                        <td className="px-4 py-3 text-foreground">{r.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{LABEL[r.choice]}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{ATTENDANCE_LABEL[r.attendance] || '-'}</td>
                        <td className="px-4 py-3 text-xs break-all">
                          {r.email ? <a href={`mailto:${r.email}`} className="text-glow-cyan hover:underline">{r.email}</a> : '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs">{r.note || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(r.updatedAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" onClick={() => remove(r.id, r.name)} className="text-muted-foreground hover:text-red-400" aria-label={`Delete ${r.name}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
