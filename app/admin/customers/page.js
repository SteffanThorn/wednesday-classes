'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, ChevronRight, Eye, Download, UserPlus } from 'lucide-react';

const PACKAGE_TOTAL_CLASSES = 5;

export const dynamic = 'force-dynamic';

export default function AdminCustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
      fetchCustomers();
    }
  }, [status, session]);

  useEffect(() => {
    const queryFilter = searchParams.get('filter');
    if (queryFilter === 'low' || queryFilter === 'empty' || queryFilter === 'all') {
      setCourseFilter(queryFilter);
    }
  }, [searchParams]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/customers');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch customers');

      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      customer.userName.toLowerCase().includes(query) ||
      customer.userEmail.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    );

    const remainingCredits = customer.remainingClassCredits ?? 0;
    const matchesFilter =
      courseFilter === 'all' ||
      (courseFilter === 'low' && remainingCredits > 0 && remainingCredits <= 2) ||
      (courseFilter === 'empty' && remainingCredits === 0);

    return matchesSearch && matchesFilter;
  });

  const lowCreditCount = customers.filter((customer) => {
    const remainingCredits = customer.remainingClassCredits ?? 0;
    return remainingCredits > 0 && remainingCredits <= 2;
  }).length;

  const emptyCreditCount = customers.filter((customer) => (customer.remainingClassCredits ?? 0) === 0).length;

  const downloadCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Health Notes',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Waiver Accepted',
      'Total Classes',
      'Remaining Classes',
      'Used Classes',
      'Signed Date',
      'Comments',
      'Created At',
    ];

    const rows = filteredCustomers.map((customer) => [
      `"${customer.userName}"`,
      customer.userEmail,
      customer.phone,
      `"${customer.healthNotes}"`,
      customer.emergencyContactName,
      customer.emergencyContactPhone,
      customer.waiverAccepted ? 'Yes' : 'No',
      customer.totalPackageClasses ?? PACKAGE_TOTAL_CLASSES,
      customer.remainingClassCredits ?? 0,
      customer.usedPackageClasses ?? Math.max(0, (customer.totalPackageClasses ?? PACKAGE_TOTAL_CLASSES) - (customer.remainingClassCredits ?? 0)),
      customer.signedAt ? new Date(customer.signedAt).toLocaleDateString() : '',
      `"${customer.comments}"`,
      new Date(customer.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
          <div className="max-w-7xl mx-auto">
            {/* Back Link & Title */}
            <div className="mb-6 flex items-center gap-2">
              <Link href="/admin" className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                管理后台 / Admin Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan text-sm">客户资料 / Customer Data</span>
            </div>

            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-2">
                客户健康问卷资料 / Customer Health Intake Data
              </h1>
              <p className="text-muted-foreground">
                查看并管理所有客户健康问卷与资料。/ View and manage all customer health questionnaire responses and information.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Controls */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="text"
                placeholder="按姓名、邮箱或电话搜索... / Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm"
              />
              <Link
                href="/admin/students"
                className="px-4 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 flex items-center gap-2 justify-center transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                添加客户 / Add Customer
              </Link>
              <button
                onClick={downloadCSV}
                disabled={filteredCustomers.length === 0}
                className="px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 flex items-center gap-2 justify-center transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                导出 CSV / Export CSV
              </button>
            </div>

            <div className="mb-6 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCourseFilter('all')}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${courseFilter === 'all' ? 'bg-glow-cyan/20 border-glow-cyan/40 text-glow-cyan' : 'bg-card/60 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40 hover:text-glow-cyan'}`}
                >
                  全部客户 / All Customers ({customers.length})
                </button>
                <button
                  onClick={() => setCourseFilter('low')}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${courseFilter === 'low' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-card/60 border-yellow-500/20 text-muted-foreground hover:border-yellow-500/40 hover:text-yellow-300'}`}
                >
                  课次偏低 / Low Credits ({lowCreditCount})
                </button>
                <button
                  onClick={() => setCourseFilter('empty')}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${courseFilter === 'empty' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-card/60 border-red-500/20 text-muted-foreground hover:border-red-500/40 hover:text-red-300'}`}
                >
                  课次为零 / No Credits ({emptyCreditCount})
                </button>
              </div>

              <div className="flex flex-wrap gap-3 text-xs">
                <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
                  提醒 Reminder: 剩余 1-2 节 / 1-2 classes left
                </div>
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                  需要处理 Action needed: 剩余 0 节 / 0 classes left
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-glow-cyan/20 bg-card/60 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-glow-cyan animate-spin" />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? '没有符合搜索条件的客户。/ No customers match your search.' : '暂无客户资料。/ No customer data found.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glow-cyan/20 bg-glow-cyan/5">
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">姓名 / Name</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">邮箱 / Email</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">电话 / Phone</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">免责协议 / Waiver</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">课程包 / Package</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">剩余课次 / Remaining</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">签署日期 / Signed Date</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">录入日期 / Added</th>
                        <th className="px-4 py-3 text-center font-medium text-glow-cyan">操作 / Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer, idx) => {
                        const remainingCredits = customer.remainingClassCredits ?? 0;
                        const isEmpty = remainingCredits === 0;
                        const isLow = remainingCredits > 0 && remainingCredits <= 2;

                        return (
                          <tr
                            key={customer.id}
                            className={`border-b border-glow-cyan/10 hover:bg-glow-cyan/5 transition-colors ${
                              isEmpty
                                ? 'bg-red-500/5'
                                : isLow
                                  ? 'bg-yellow-500/5'
                                  : idx % 2 === 0
                                    ? 'bg-transparent'
                                    : 'bg-glow-cyan/2'
                            }`}
                          >
                            <td className="px-4 py-3 text-foreground">{customer.userName}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs break-all">{customer.userEmail}</td>
                            <td className="px-4 py-3 text-foreground">{customer.phone || '-'}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                  customer.waiverAccepted
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                {customer.waiverAccepted ? '已签署 / Accepted' : '待确认 / Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-foreground text-xs">
                              {(customer.totalPackageClasses ?? PACKAGE_TOTAL_CLASSES)} 节 / classes
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex w-fit px-2 py-1 rounded text-xs font-medium ${isEmpty ? 'bg-red-500/20 text-red-400' : isLow ? 'bg-yellow-500/20 text-yellow-300' : 'bg-glow-cyan/10 text-glow-cyan'}`}>
                                  剩余 {remainingCredits} / {remainingCredits} left
                                </span>
                                {isEmpty && <span className="text-[11px] text-red-300">需补课次 / Needs top-up</span>}
                                {isLow && <span className="text-[11px] text-yellow-300">课次偏低 / Low balance</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {customer.signedAt ? new Date(customer.signedAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {new Date(customer.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Link
                                href={`/admin/customers/${customer.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-colors text-xs"
                              >
                                <Eye className="w-3 h-3" />
                                查看 / View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary */}
            {!loading && (
              <div className="mt-6 p-4 rounded-lg bg-glow-cyan/5 border border-glow-cyan/20 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  显示 <span className="text-glow-cyan font-medium">{filteredCustomers.length}</span> /{' '}
                  <span className="text-glow-cyan font-medium">{customers.length}</span> 位客户（Showing customers）
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-yellow-300">课次偏低 Low credits: {lowCreditCount}</span>
                  <span className="text-red-300">课次为零 No credits: {emptyCreditCount}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
