'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, CalendarCheck2, TicketPercent, UserPlus, ChevronRight, Users, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const { language, mounted } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const isZh = language !== 'en';
  const txt = (zh, en) => (isZh ? zh : en);
  const [creditSummary, setCreditSummary] = useState({
    total: 0,
    low: 0,
    empty: 0,
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchCreditSummary();
    }
  }, [status, session]);

  const fetchCreditSummary = async () => {
    setCreditSummary((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await fetch('/api/admin/customers');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load class-credit summary');
      }

      const customers = data.customers || [];
      const low = customers.filter((c) => {
        const remaining = c.remainingClassCredits ?? 0;
        return remaining > 0 && remaining <= 2;
      }).length;
      const empty = customers.filter((c) => (c.remainingClassCredits ?? 0) === 0).length;

      setCreditSummary({
        total: customers.length,
        low,
        empty,
        loading: false,
        error: '',
      });
    } catch (err) {
      setCreditSummary((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load class-credit summary',
      }));
    }
  };

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

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />

        <section className="px-6 pt-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle">
                {txt('管理后台', 'Admin Dashboard')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {txt('管理预约、学员、客户资料与优惠券。', 'Manage bookings, students, customer data, and coupons.')}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Link
                href="/admin/bookings"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck2 className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">{txt('预约管理', 'Bookings')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>

              <Link
                href="/admin/students"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">{txt('录入学员', 'Add Student')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>

              <Link
                href="/admin/coupons"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <TicketPercent className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">{txt('优惠券', 'Coupons')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>

              <Link
                href="/admin/customers"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">{txt('客户资料', 'Customer Data')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>

              <Link
                href="/admin/newsletter"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">{txt('邮件通讯', 'Newsletter')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>
            </div>

            <div className="mt-6 p-5 rounded-2xl border border-glow-cyan/20 bg-card/60">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{txt('课次提醒', 'Class Credit Reminder')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {txt('每次进入后台时查看剩余课次不足或为 0 的客户。', 'See customers with low or empty remaining classes every time you open admin.')}
                  </p>
                </div>

                {creditSummary.loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {txt('加载中...', 'Loading...')}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 rounded-lg bg-glow-cyan/10 border border-glow-cyan/20 text-glow-cyan">
                      {txt('总数', 'Total')}: {creditSummary.total}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
                      {txt('偏低 (1-2)', 'Low (1-2)')}: {creditSummary.low}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                      {txt('已空 (0)', 'Empty (0)')}: {creditSummary.empty}
                    </span>
                  </div>
                )}
              </div>

              {creditSummary.error && (
                <p className="mt-3 text-sm text-red-400">{creditSummary.error}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/admin/customers?filter=all"
                  className="px-3 py-2 rounded-lg bg-glow-cyan/15 border border-glow-cyan/30 text-glow-cyan text-sm hover:bg-glow-cyan/25 transition-colors"
                >
                  {txt('查看全部客户', 'Open all customers')}
                </Link>
                <Link
                  href="/admin/customers?filter=low"
                  className="px-3 py-2 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 text-sm hover:bg-yellow-500/25 transition-colors"
                >
                  {txt('查看低课次客户', 'Check low-credit customers')}
                </Link>
                <Link
                  href="/admin/customers?filter=empty"
                  className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-sm hover:bg-red-500/25 transition-colors"
                >
                  {txt('查看零课次客户', 'Check empty-credit customers')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
