'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, ChevronRight, Eye, Download, UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminCustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
    return (
      customer.userName.toLowerCase().includes(query) ||
      customer.userEmail.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
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

    const rows = filteredCustomers.map((customer) => [
      `"${customer.userName}"`,
      customer.userEmail,
      customer.phone,
      `"${customer.healthNotes}"`,
      customer.emergencyContactName,
      customer.emergencyContactPhone,
      customer.waiverAccepted ? 'Yes' : 'No',
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
                Admin Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan text-sm">Customer Data</span>
            </div>

            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-2">
                Customer Health Intake Data
              </h1>
              <p className="text-muted-foreground">
                View and manage all customer health questionnaire responses and information.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Controls */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm"
              />
              <Link
                href="/admin/students"
                className="px-4 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 flex items-center gap-2 justify-center transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                添加新的客户信息
              </Link>
              <button
                onClick={downloadCSV}
                disabled={filteredCustomers.length === 0}
                className="px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 flex items-center gap-2 justify-center transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
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
                    {searchQuery ? 'No customers match your search.' : 'No customer data found.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glow-cyan/20 bg-glow-cyan/5">
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">Email</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">Phone</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">Waiver</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">Signed Date</th>
                        <th className="px-4 py-3 text-left font-medium text-glow-cyan">Added</th>
                        <th className="px-4 py-3 text-center font-medium text-glow-cyan">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer, idx) => (
                        <tr
                          key={customer.id}
                          className={`border-b border-glow-cyan/10 hover:bg-glow-cyan/5 transition-colors ${
                            idx % 2 === 0 ? 'bg-transparent' : 'bg-glow-cyan/2'
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
                              {customer.waiverAccepted ? 'Accepted' : 'Pending'}
                            </span>
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
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary */}
            {!loading && (
              <div className="mt-6 p-4 rounded-lg bg-glow-cyan/5 border border-glow-cyan/20">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-glow-cyan font-medium">{filteredCustomers.length}</span> of{' '}
                  <span className="text-glow-cyan font-medium">{customers.length}</span> customers
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
