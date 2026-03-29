'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, ChevronRight, ChevronDown, ChevronUp, Mail, Phone, Calendar, FileText, Edit2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CustomerDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    health: true,
    emergency: true,
    waiver: true,
    other: false,
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
    if (status === 'authenticated' && session?.user?.role === 'admin' && customerId) {
      fetchCustomer();
    }
  }, [status, session, customerId]);

  const fetchCustomer = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/intake?id=${customerId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch customer');

      // Since the API returns an array of intakes, get the first one
      if (data.intakes && data.intakes.length > 0) {
        setCustomer(data.intakes[0]);
      } else {
        throw new Error('No intake data found for this customer');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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

  if (loading) {
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

  if (error || !customer) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <section className="px-6 pt-8 pb-12">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex items-center gap-2">
                <Link href="/admin/customers" className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                  客户资料 / Customer Data
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-red-400 text-sm">错误 / Error</span>
              </div>
              <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                {error || '未找到客户资料。/ Customer not found'}
              </div>
              <Link href="/admin/customers" className="mt-4 inline-block px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30">
                返回客户列表 / Back to Customers
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />

        <section className="px-6 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2">
              <Link href="/admin" className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                管理后台 / Admin Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Link href="/admin/customers" className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                客户资料 / Customer Data
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan text-sm">{customer.userName}</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-2">
                  {customer.userName}
                </h1>
                <p className="text-muted-foreground">客户健康问卷信息 / Customer health intake information</p>
              </div>
              <Link
                href={`/admin/customers/${customer.id}/edit`}
                className="px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Edit2 className="w-4 h-4" />
                编辑 / Edit
              </Link>
            </div>

            {/* Contact Info Card */}
            <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-glow-cyan" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">邮箱 / Email</p>
                  <p className="text-foreground break-all">{customer.userEmail}</p>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-glow-cyan" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">电话 / Phone</p>
                    <p className="text-foreground">{customer.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-glow-cyan" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">提交时间 / Submitted</p>
                  <p className="text-foreground">{new Date(customer.createdAt).toLocaleDateString()} at {new Date(customer.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 mb-6">
              <h2 className="font-semibold text-foreground mb-4">课程包 / Course Package</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-glow-cyan/20 bg-glow-cyan/5 p-4">
                  <p className="text-xs text-muted-foreground mb-1">总课次 / Total Classes</p>
                  <p className="text-2xl font-light text-foreground">{customer.totalPackageClasses ?? 5}</p>
                </div>
                <div className="rounded-lg border border-glow-cyan/20 bg-glow-cyan/5 p-4">
                  <p className="text-xs text-muted-foreground mb-1">剩余课次 / Remaining Classes</p>
                  <p className="text-2xl font-light text-glow-cyan">{customer.remainingClassCredits ?? 0}</p>
                </div>
                <div className="rounded-lg border border-glow-cyan/20 bg-glow-cyan/5 p-4">
                  <p className="text-xs text-muted-foreground mb-1">已用课次 / Used Classes</p>
                  <p className="text-2xl font-light text-foreground">{customer.usedPackageClasses ?? Math.max(0, (customer.totalPackageClasses ?? 5) - (customer.remainingClassCredits ?? 0))}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">每完成 1 节课会自动扣除 1 节剩余课次。/ Each completed class automatically deducts 1 remaining class.</p>
            </div>

            {/* Health Notes Section */}
            <div className="rounded-lg border border-glow-cyan/20 bg-card/60 overflow-hidden mb-4">
              <button
                onClick={() => toggleSection('health')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-glow-cyan/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-glow-cyan" />
                  <h2 className="font-semibold text-foreground">健康与医疗备注 / Health & Medical Notes</h2>
                </div>
                {expandedSections.health ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {expandedSections.health && (
                <div className="px-6 py-4 border-t border-glow-cyan/20 bg-glow-cyan/2">
                  <div className="space-y-3">
                    {customer.healthNotes ? (
                      <div className="p-3 rounded bg-glow-cyan/10 text-foreground whitespace-pre-wrap break-words">
                        {customer.healthNotes}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">未提供健康备注。/ No health notes provided</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact Section */}
            <div className="rounded-lg border border-glow-cyan/20 bg-card/60 overflow-hidden mb-4">
              <button
                onClick={() => toggleSection('emergency')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-glow-cyan/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-glow-cyan" />
                  <h2 className="font-semibold text-foreground">紧急联系人 / Emergency Contact</h2>
                </div>
                {expandedSections.emergency ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {expandedSections.emergency && (
                <div className="px-6 py-4 border-t border-glow-cyan/20 bg-glow-cyan/2">
                  <div className="space-y-3">
                    {customer.emergencyContactName ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">姓名 / Name</p>
                          <p className="text-foreground">{customer.emergencyContactName}</p>
                        </div>
                        {customer.emergencyContactPhone && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">电话 / Phone</p>
                            <p className="text-foreground">{customer.emergencyContactPhone}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">未提供紧急联系人信息。/ No emergency contact provided</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Waiver & Signature Section */}
            <div className="rounded-lg border border-glow-cyan/20 bg-card/60 overflow-hidden mb-4">
              <button
                onClick={() => toggleSection('waiver')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-glow-cyan/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-glow-cyan" />
                  <h2 className="font-semibold text-foreground">免责协议与签名 / Waiver & Signature</h2>
                </div>
                {expandedSections.waiver ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {expandedSections.waiver && (
                <div className="px-6 py-4 border-t border-glow-cyan/20 bg-glow-cyan/2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">免责协议状态 / Waiver Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${customer.waiverAccepted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {customer.waiverAccepted ? '已同意 / Accepted' : '未同意 / Not Accepted'}
                      </span>
                    </div>
                    {customer.signedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">签署日期 / Signed Date</p>
                        <p className="text-foreground">{new Date(customer.signedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {customer.signatureName && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">签名姓名 / Signature Name</p>
                        <p className="text-foreground">{customer.signatureName}</p>
                      </div>
                    )}
                    {customer.signatureDataUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">签名图片 / Signature Image</p>
                        <img src={customer.signatureDataUrl} alt="签名 / Signature" className="max-w-xs border border-glow-cyan/20 rounded" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Comments Section */}
            {customer.comments && (
              <div className="rounded-lg border border-glow-cyan/20 bg-card/60 overflow-hidden mb-4">
                <button
                  onClick={() => toggleSection('other')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-glow-cyan/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-glow-cyan" />
                    <h2 className="font-semibold text-foreground">补充备注 / Additional Comments</h2>
                  </div>
                  {expandedSections.other ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.other && (
                  <div className="px-6 py-4 border-t border-glow-cyan/20 bg-glow-cyan/2">
                    <div className="p-3 rounded bg-glow-cyan/10 text-foreground whitespace-pre-wrap break-words">
                      {customer.comments}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Back Button */}
            <Link
              href="/admin/customers"
              className="inline-block mt-8 px-6 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 transition-colors"
            >
              返回客户列表 / Back to Customers
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
