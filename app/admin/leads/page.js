'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, ChevronRight, Eye, Download, UserRoundSearch, UserPlus, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function AdminLeadsPageFallback() {
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

function AdminLeadsPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [movingLeadId, setMovingLeadId] = useState('');
  const [deletingLeadId, setDeletingLeadId] = useState('');

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
      fetchLeads();
    }
  }, [status, session]);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/customers?profileType=potential');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch potential leads');

      setLeads(data.customers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch potential leads');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.userName.toLowerCase().includes(query) ||
      lead.userEmail.toLowerCase().includes(query) ||
      lead.phone.toLowerCase().includes(query)
    );
  });

  const downloadCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Health Notes',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Waiver Accepted',
      'Signed Date',
      'Comments',
      'Created At',
    ];

    const rows = filteredLeads.map((lead) => [
      `"${lead.userName}"`,
      lead.userEmail,
      lead.phone,
      `"${lead.healthNotes}"`,
      lead.emergencyContactName,
      lead.emergencyContactPhone,
      lead.waiverAccepted ? 'Yes' : 'No',
      lead.signedAt ? new Date(lead.signedAt).toLocaleDateString() : '',
      `"${lead.comments}"`,
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `potential-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleMoveBackToCustomers = async (lead) => {
    const confirmed = window.confirm(
      `将该潜在客户移回正式客户名单？\n\n${lead.userName} (${lead.userEmail})`
    );

    if (!confirmed) return;

    setMovingLeadId(lead.id);
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileType: 'customer' }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to move lead back to customers');

      setLeads((prev) => prev.filter((item) => item.id !== lead.id));
    } catch (err) {
      setError(err.message || 'Failed to move lead back to customers');
    } finally {
      setMovingLeadId('');
    }
  };

  const handleDeleteLead = async (lead) => {
    const confirmed = window.confirm(
      `确定删除该潜在客户资料吗？\n\n${lead.userName} (${lead.userEmail})\n\n此操作不可撤销。`
    );

    if (!confirmed) return;

    setDeletingLeadId(lead.id);
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${lead.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to delete potential lead');

      setLeads((prev) => prev.filter((item) => item.id !== lead.id));
    } catch (err) {
      setError(err.message || 'Failed to delete potential lead');
    } finally {
      setDeletingLeadId('');
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
              <Link href="/admin" className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                管理后台 / Admin Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan text-sm">潜在客户名单 / Potential Leads</span>
            </div>

            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-2">
                潜在客户名单 / Potential Leads
              </h1>
              <p className="text-muted-foreground">
                查看已从正式客户中转移出的潜在客户资料。/ View lead profiles moved out of the main customer list.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="text"
                placeholder="按姓名、邮箱或电话搜索... / Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm"
              />
              <Link
                href="/admin/students?profileType=potential"
                className="px-4 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 flex items-center gap-2 justify-center transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                添加新潜在客户 / Add Lead
              </Link>
              <button
                onClick={downloadCSV}
                disabled={filteredLeads.length === 0}
                className="px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 flex items-center gap-2 justify-center transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                导出 CSV / Export CSV
              </button>
            </div>

            <div className="rounded-lg border border-glow-cyan/20 bg-card/60 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-glow-cyan animate-spin" />
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? '没有符合搜索条件的潜在客户。/ No leads match your search.' : '暂无潜在客户资料。/ No potential leads found.'}
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
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">签署日期 / Signed Date</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">录入日期 / Added</th>
                        <th className="px-4 py-3 text-center font-medium text-glow-cyan">操作 / Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead, idx) => (
                        <tr
                          key={lead.id}
                          className={`border-b border-glow-cyan/10 hover:bg-glow-cyan/5 transition-colors ${
                            idx % 2 === 0 ? 'bg-transparent' : 'bg-glow-cyan/2'
                          }`}
                        >
                          <td className="px-4 py-3 text-foreground">{lead.userName}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs break-all">{lead.userEmail}</td>
                          <td className="px-4 py-3 text-foreground">{lead.phone || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                lead.waiverAccepted
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {lead.waiverAccepted ? '已签署 / Accepted' : '待确认 / Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {lead.signedAt ? new Date(lead.signedAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-2 flex-wrap justify-center">
                              <Link
                                href={`/admin/customers/${lead.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-colors text-xs"
                              >
                                <Eye className="w-3 h-3" />
                                查看 / View
                              </Link>
                              <button
                                onClick={() => handleMoveBackToCustomers(lead)}
                                disabled={movingLeadId === lead.id || deletingLeadId === lead.id}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 transition-colors text-xs disabled:opacity-50"
                              >
                                {movingLeadId === lead.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserRoundSearch className="w-3 h-3" />
                                )}
                                移回客户名单 / Move Back
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead)}
                                disabled={deletingLeadId === lead.id || movingLeadId === lead.id}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors text-xs disabled:opacity-50"
                              >
                                {deletingLeadId === lead.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                删除 / Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!loading && (
              <div className="mt-6 p-4 rounded-lg bg-glow-cyan/5 border border-glow-cyan/20">
                <p className="text-sm text-muted-foreground">
                  显示 <span className="text-glow-cyan font-medium">{filteredLeads.length}</span> /{' '}
                  <span className="text-glow-cyan font-medium">{leads.length}</span> 位潜在客户（Showing potential leads）
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<AdminLeadsPageFallback />}>
      <AdminLeadsPageContent />
    </Suspense>
  );
}
