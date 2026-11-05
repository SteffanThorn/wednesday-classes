'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, ChevronRight, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

const PERIODS = [
  { key: 'month', label: '月度 / Monthly' },
  { key: 'quarter', label: '季度 / Quarterly' },
  { key: 'year', label: '年度 / Yearly' },
  { key: 'all', label: '累计 / All Time' },
];

const formatMoney = (value) => `$${(Number(value) || 0).toLocaleString('en-NZ')}`;

function currentNZ() {
  const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit' })
    .format(new Date())
    .split('-');
  return { year: Number(y), month: Number(m) };
}

function periodLabel(period, year, month, quarter) {
  if (period === 'month') return `${year}年${month}月 / ${new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-NZ', { month: 'long', timeZone: 'UTC' })} ${year}`;
  if (period === 'quarter') return `${year}年第${quarter}季度 / Q${quarter} ${year}`;
  if (period === 'year') return `${year}年 / ${year}`;
  return '累计 / All time';
}

export default function AdminSpendingReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const now = currentNZ();

  const [period, setPeriod] = useState('month');
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);
  const [quarter, setQuarter] = useState(Math.floor((now.month - 1) / 3) + 1);
  // The last finished request: { key, data, error }. Loading while it's for an older key.
  const [result, setResult] = useState({ key: '', data: null, error: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  const value = period === 'month'
    ? `${year}-${String(month).padStart(2, '0')}`
    : period === 'quarter'
      ? `${year}-Q${quarter}`
      : period === 'year'
        ? String(year)
        : '';

  const requestKey = `${period}|${value}`;

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'admin') return;
    let cancelled = false;
    fetch(`/api/admin/reports/spending?period=${period}&value=${encodeURIComponent(value)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load report');
        if (!cancelled) setResult({ key: requestKey, data: json, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: requestKey, data: null, error: err.message || 'Failed to load report' });
      });
    return () => {
      cancelled = true;
    };
  }, [status, session, period, value, requestKey]);

  const loading = result.key !== requestKey;
  const data = result.data;
  const error = loading ? '' : result.error;

  const years = useMemo(() => {
    const list = new Set([...(data?.years || []), now.year]);
    return [...list].sort((a, b) => b - a);
  }, [data, now.year]);

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (data?.rows || []).filter((r) => !q || r.userName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q));
  }, [data, search]);

  const totals = useMemo(() => rows.reduce((t, r) => {
    for (const k of ['singleCount', 'singleAmount', 'packageCount', 'packageAmount', 'classesBought', 'amount', 'attended', 'owed', 'undatedAmount', 'undatedClasses']) t[k] += r[k] || 0;
    return t;
  }, { singleCount: 0, singleAmount: 0, packageCount: 0, packageAmount: 0, classesBought: 0, amount: 0, attended: 0, owed: 0, undatedAmount: 0, undatedClasses: 0 }), [rows]);

  const label = periodLabel(period, year, month, quarter);
  const showUndatedNote = (period === 'month' || period === 'quarter') && totals.undatedAmount > 0;

  const downloadCSV = () => {
    const quote = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Name', 'Email', 'Single classes', 'Single amount (NZD)', '5-class packs', 'Pack amount (NZD)', 'Classes bought', 'Total paid (NZD)', 'Classes attended', 'Yet to pay (NZD)'];
    const lines = rows.map((r) => [r.userName, r.userEmail, r.singleCount, r.singleAmount, r.packageCount, r.packageAmount, r.classesBought, r.amount, r.attended, r.owed]);
    lines.push(['Total', '', totals.singleCount, totals.singleAmount, totals.packageCount, totals.packageAmount, totals.classesBought, totals.amount, totals.attended, totals.owed]);
    const csv = '﻿' + [header, ...lines].map((line) => line.map(quote).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `spending-${period}${value ? `-${value}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'loading' || !session?.user || session.user.role !== 'admin') {
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

  const selectClass = 'px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />

        <section className="px-4 sm:px-6 pt-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
              <Link href="/admin" className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                管理后台 / Admin Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan text-sm">消费统计 / Spending Report</span>
            </div>

            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-2">
                学生消费统计 / Student Spending
              </h1>
              <p className="text-muted-foreground text-sm">
                每位学生在所选时间内的缴费金额、购买课时和上课次数。单次课 $15，课包 5 节 $65。/ What each student paid, the classes they bought, and the classes they attended in the chosen period.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${period === p.key ? 'bg-glow-cyan/20 border-glow-cyan/40 text-glow-cyan' : 'bg-card/60 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40 hover:text-glow-cyan'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
              {period !== 'all' && (
                <div className="flex gap-2">
                  <select aria-label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))} className={selectClass}>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {period === 'month' && (
                    <select aria-label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={selectClass}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>{m}月 / {new Date(Date.UTC(2026, m - 1, 1)).toLocaleString('en-NZ', { month: 'short', timeZone: 'UTC' })}</option>
                      ))}
                    </select>
                  )}
                  {period === 'quarter' && (
                    <select aria-label="Quarter" value={quarter} onChange={(e) => setQuarter(Number(e.target.value))} className={selectClass}>
                      {[1, 2, 3, 4].map((q) => <option key={q} value={q}>第{q}季度 / Q{q}</option>)}
                    </select>
                  )}
                </div>
              )}
              <input
                type="text"
                placeholder="按姓名或邮箱搜索... / Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={downloadCSV}
                disabled={rows.length === 0}
                className="px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 flex items-center gap-2 justify-center text-sm"
              >
                <Download className="w-4 h-4" />
                导出 CSV / Export CSV
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg border border-glow-cyan/40 bg-glow-cyan/10 p-4">
                <p className="text-xs text-muted-foreground mb-1">总金额 / Total Paid</p>
                <p className="text-2xl font-light text-glow-cyan">{formatMoney(totals.amount)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
              </div>
              <div className="rounded-lg border border-glow-cyan/20 bg-card/60 p-4">
                <p className="text-xs text-muted-foreground mb-1">购买课时 / Classes Bought</p>
                <p className="text-2xl font-light text-foreground">{totals.classesBought}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{totals.singleCount} 单次 · {totals.packageCount} 课包</p>
              </div>
              <div className="rounded-lg border border-glow-cyan/20 bg-card/60 p-4">
                <p className="text-xs text-muted-foreground mb-1">上课次数 / Classes Attended</p>
                <p className="text-2xl font-light text-foreground">{totals.attended}</p>
                <p className="text-[11px] text-muted-foreground mt-1">按签到记录 / From check-ins</p>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-xs text-muted-foreground mb-1">待付 / Yet to Pay</p>
                <p className="text-2xl font-light text-red-300">{formatMoney(totals.owed)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">当前欠款 / Owed now</p>
              </div>
            </div>

            {showUndatedNote && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                {year} 年另有 {formatMoney(totals.undatedAmount)}（{totals.undatedClasses} 课时）缴费日期未知，未计入本期，已计入年度和累计。
                / {formatMoney(totals.undatedAmount)} ({totals.undatedClasses} classes) paid in {year} has no known date, so it is counted in the yearly and all-time totals but not here.
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <div className="rounded-lg border border-glow-cyan/20 bg-card/60 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-glow-cyan animate-spin" />
                </div>
              ) : rows.length === 0 ? (
                <p className="px-6 py-12 text-center text-muted-foreground">本期没有缴费或上课记录。/ No payments or classes in this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glow-cyan/20 bg-glow-cyan/5 text-left">
                        <th className="px-4 py-3 font-medium text-glow-cyan">学生 / Student</th>
                        <th className="px-4 py-3 font-medium text-glow-cyan text-right">单次课 / Singles</th>
                        <th className="px-4 py-3 font-medium text-glow-cyan text-right">课包 / Packs</th>
                        <th className="px-4 py-3 font-medium text-glow-cyan text-right">购买课时 / Bought</th>
                        <th className="px-4 py-3 font-medium text-glow-cyan text-right">上课次数 / Attended</th>
                        <th className="px-4 py-3 font-medium text-glow-cyan text-right">总金额 / Total</th>
                        <th className="px-4 py-3 font-medium text-glow-cyan text-right">待付 / Owes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.userId} className="border-b border-glow-cyan/10 hover:bg-glow-cyan/5">
                          <td className="px-4 py-3">
                            <p className="text-foreground">{r.userName || '-'}</p>
                            <p className="text-[11px] text-muted-foreground break-all">{r.userEmail}</p>
                            {showUndatedNote && r.undatedAmount > 0 && (
                              <p className="text-[11px] text-yellow-300">日期未知 / Date unknown: {formatMoney(r.undatedAmount)}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {r.singleCount} <span className="text-muted-foreground text-xs">({formatMoney(r.singleAmount)})</span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {r.packageCount} <span className="text-muted-foreground text-xs">({formatMoney(r.packageAmount)})</span>
                          </td>
                          <td className="px-4 py-3 text-right">{r.classesBought}</td>
                          <td className="px-4 py-3 text-right">{r.attended}</td>
                          <td className="px-4 py-3 text-right font-medium text-foreground">{formatMoney(r.amount)}</td>
                          <td className={`px-4 py-3 text-right ${r.owed > 0 ? 'text-red-300' : 'text-muted-foreground'}`}>{r.owed > 0 ? formatMoney(r.owed) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-glow-cyan/5 font-medium">
                        <td className="px-4 py-3 text-glow-cyan">合计 / Total ({rows.length})</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">{totals.singleCount} <span className="text-muted-foreground text-xs">({formatMoney(totals.singleAmount)})</span></td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">{totals.packageCount} <span className="text-muted-foreground text-xs">({formatMoney(totals.packageAmount)})</span></td>
                        <td className="px-4 py-3 text-right">{totals.classesBought}</td>
                        <td className="px-4 py-3 text-right">{totals.attended}</td>
                        <td className="px-4 py-3 text-right text-glow-cyan">{formatMoney(totals.amount)}</td>
                        <td className="px-4 py-3 text-right text-red-300">{totals.owed > 0 ? formatMoney(totals.owed) : '-'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              缴费来自缴费记录（导入的会员名单、签到时的单次课、后台记录或网站购买的课包）。没有缴费记录的学生（如 Rebecca 转来的学生）金额为 $0。/ Totals come from payment records. Students with no payments (such as those transferred from Rebecca) show $0.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
