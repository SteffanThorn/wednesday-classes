'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, ChevronRight, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function EditCustomerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.userName.trim() || !formData.userEmail.trim()) {
        setError('Name and email are required');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update customer');

      setSuccess('Customer information updated successfully!');
      setTimeout(() => {
        router.push(`/admin/customers/${customerId}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update customer');
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
                  Customer Data
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-red-400 text-sm">Error</span>
              </div>
              <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
              <Link href="/admin/customers" className="mt-4 inline-block px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30">
                Back to Customers
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
                Admin Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Link href="/admin/customers" className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                Customer Data
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Link href={`/admin/customers/${customerId}`} className="text-muted-foreground hover:text-glow-cyan transition-colors text-sm">
                {customer.userName}
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-glow-cyan text-sm">Edit</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-2">
                Edit Customer Information
              </h1>
              <p className="text-muted-foreground">Update {customer.userName}'s health intake information</p>
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
                <h2 className="font-semibold text-foreground mb-4">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Name *
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
                      Email *
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
                      Phone
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
                      Signature Name
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

              {/* Health Information */}
              <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 space-y-4">
                <h2 className="font-semibold text-foreground mb-4">Health Information</h2>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Health Notes
                  </label>
                  <textarea
                    name="healthNotes"
                    value={formData.healthNotes}
                    onChange={handleChange}
                    placeholder="General health, injuries, surgeries, safety notes..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Waiver Accepted
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="waiverAccepted"
                      checked={formData.waiverAccepted}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-glow-cyan/20 text-glow-cyan cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">Health waiver has been accepted</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 space-y-4">
                <h2 className="font-semibold text-foreground mb-4">Emergency Contact</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Emergency Contact Name
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
                      Emergency Contact Phone
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
                <h2 className="font-semibold text-foreground mb-4">Additional Information</h2>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Comments
                  </label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    placeholder="Any additional notes or comments..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-foreground resize-none"
                  />
                </div>
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
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>

                <Link
                  href={`/admin/customers/${customerId}`}
                  className="flex-1 px-6 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 text-foreground hover:bg-card transition-colors font-medium text-center flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
