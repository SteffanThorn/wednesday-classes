'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, ChevronRight, ArrowLeft, UserSearch } from 'lucide-react';

export const dynamic = 'force-dynamic';

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export default function EditCustomerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    phone: '',
    healthNotes: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    waiverAccepted: false,
    comments: '',
    signatureName: '',
    remainingClassCredits: 0,
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

      if (data.intakes && data.intakes.length > 0) {
        const customerData = data.intakes[0];
        setCustomer(customerData);
        setFormData({
          userName: customerData.userName || '',
          userEmail: customerData.userEmail || '',
          phone: customerData.phone || '',
          healthNotes: customerData.healthNotes || '',
          emergencyContactName: customerData.emergencyContactName || '',
          emergencyContactPhone: customerData.emergencyContactPhone || '',
          waiverAccepted: customerData.waiverAccepted || false,
          comments: customerData.comments || '',
          signatureName: customerData.signatureName || '',
          remainingClassCredits: customerData.remainingClassCredits ?? 0,
        });
      } else {
        throw new Error('No intake data found for this customer');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMoveToLeads = async () => {
    const confirmed = window.confirm(
      `将此客户移至潜在客户列表？\n\n${customer?.userName} (${customer?.userEmail})\n\n该操作可在潜在客户页面撤销。`
    );
    if (!confirmed) return;

    setMoving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileType: 'potential' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to move customer');

      setSuccess('已成功移至潜在客户列表，正在跳转... / Moved to potential leads. Redirecting...');
      setTimeout(() => {
        router.push('/admin/customers');
      }, 1500);
    } catch (err) {
      setError(err.message || '操作失败，请重试。/ Failed to move customer');
    } finally {
      setMoving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.userName.trim() || !formData.userEmail.trim()) {
        setError('姓名和邮箱为必填。/ Name and email are required');
        setSaving(false);
        return;
      }

      if (!customerId || typeof customerId !== 'string' || !OBJECT_ID_REGEX.test(customerId)) {
        setError('客户记录 ID 无效，请从客户列表重新进入编辑页。/ Invalid customer record ID, please reopen this page from Customer Data.');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data?.code === 'INVALID_INTAKE_ID') {
          throw new Error('客户记录 ID 无效，请从客户列表重新进入编辑页。/ Invalid intake ID, please reopen from Customer Data.');
        }
        throw new Error(data.error || 'Failed to update customer');
      }

      setSuccess('客户信息更新成功！/ Customer information updated successfully!');
      setTimeout(() => {
        router.push(`/admin/customers/${customerId}`);
      }, 1500);
    } catch (err) {
      setError(err.message || '更新客户失败。/ Failed to update customer');
    } finally {
      setSaving(false);
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

  if (error && !customer) {
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
                {error}
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
              <Link href={`/admin/customers/${customerId}`} className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                {customer.userName}
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan text-sm">编辑 / Edit</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-2">
                编辑客户信息 / Edit Customer Information
              </h1>
              <p className="text-muted-foreground">更新 {customer.userName} 的健康问卷信息 / Update {customer.userName}'s health intake information</p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 space-y-4">
                <h2 className="font-semibold text-foreground mb-4">基础信息 / Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      姓名 * / Name *
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      邮箱 * / Email *
                    </label>
                    <input
                      type="email"
                      name="userEmail"
                      value={formData.userEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      电话 / Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      签名姓名 / Signature Name
                    </label>
                    <input
                      type="text"
                      name="signatureName"
                      value={formData.signatureName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Course Package */}
              <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 space-y-4">
                <h2 className="font-semibold text-foreground mb-4">课程包 / Course Package</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      课程包规格 / Package Size
                    </label>
                    <input
                      type="text"
                      value="5 节 / 5 classes"
                      readOnly
                      className="w-full px-3 py-2 rounded-lg bg-card/40 border border-glow-cyan/10 text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      剩余课次 / Remaining Classes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="1"
                      name="remainingClassCredits"
                      value={formData.remainingClassCredits}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  该客户课程包总数固定为 5 节；每次上课出勤会自动扣 1 节。/ This customer package always starts with 5 classes. Each attended class automatically deducts 1 remaining class.
                </p>
              </div>

              {/* Health Information */}
              <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 space-y-4">
                <h2 className="font-semibold text-foreground mb-4">健康信息 / Health Information</h2>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    健康备注 / Health Notes
                  </label>
                  <textarea
                    name="healthNotes"
                    value={formData.healthNotes}
                    onChange={handleChange}
                    placeholder="总体健康、受伤、手术、安全备注... / General health, injuries, surgeries, safety notes..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    免责协议已同意 / Waiver Accepted
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="waiverAccepted"
                      checked={formData.waiverAccepted}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-glow-cyan/20 text-glow-cyan cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">已确认同意健康免责协议 / Health waiver has been accepted</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 space-y-4">
                <h2 className="font-semibold text-foreground mb-4">紧急联系人 / Emergency Contact</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      紧急联系人姓名 / Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      紧急联系人电话 / Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Comments */}
              <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 space-y-4">
                <h2 className="font-semibold text-foreground mb-4">补充信息 / Additional Information</h2>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    备注 / Comments
                  </label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    placeholder="其他补充备注... / Any additional notes or comments..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground resize-none"
                  />
                </div>
              </div>

              {/* Move to Potential Leads */}
              <div className="p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <UserSearch className="w-4 h-4 text-yellow-400" />
                  <h2 className="font-semibold text-yellow-300">移至潜在客户 / Move to Potential Leads</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  将该客户从正式客户列表移至潜在客户档案。可在管理后台"潜在客户"页面查看与撤销。<br />
                  Move this customer to the potential leads archive. You can reverse this from the Potential Leads page in admin.
                </p>
                <button
                  type="button"
                  onClick={handleMoveToLeads}
                  disabled={moving || saving}
                  className="px-5 py-2 rounded-lg bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/25 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {moving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      移动中... / Moving...
                    </>
                  ) : (
                    <>
                      <UserSearch className="w-4 h-4" />
                      移至潜在客户列表 / Move to Potential Leads
                    </>
                  )}
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 transition-colors font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      保存中... / Saving...
                    </>
                  ) : (
                    '保存修改 / Save Changes'
                  )}
                </button>

                <Link
                  href={`/admin/customers/${customerId}`}
                  className="flex-1 px-6 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 text-foreground hover:bg-card transition-colors font-medium text-center flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  取消 / Cancel
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
