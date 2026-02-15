'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Clock, 
  DollarSign, 
  Percent,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minClasses: 1,
    maxUses: '',
    unlimitedUses: true,
    validUntil: '',
    active: true,
    applicableTo: 'all'
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchCoupons();
      }
    }
  }, [status, session, router]);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minClasses: 1,
      maxUses: '',
      unlimitedUses: true,
      validUntil: '',
      active: true,
      applicableTo: 'all'
    });
    setEditingCoupon(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        maxUses: formData.unlimitedUses ? null : (formData.maxUses ? parseInt(formData.maxUses) : null),
        discountValue: parseFloat(formData.discountValue),
        minClasses: parseInt(formData.minClasses) || 1
      };

      // Remove unlimitedUses from payload
      delete payload.unlimitedUses;

      let response;
      let method;

      if (editingCoupon) {
        method = 'PUT';
        response = await fetch('/api/coupons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCoupon._id, ...payload })
        });
      } else {
        method = 'POST';
        response = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save coupon');
      }

      setSuccess(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!');
      fetchCoupons();
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minClasses: coupon.minClasses || 1,
      maxUses: coupon.maxUses?.toString() || '',
      unlimitedUses: !coupon.maxUses,
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      active: coupon.active,
      applicableTo: coupon.applicableTo || 'all'
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/coupons?id=${couponId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete coupon');
      }

      setSuccess('Coupon deleted successfully!');
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: coupon._id, 
          active: !coupon.active 
        })
      });

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  // Filter coupons
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = searchTerm === '' || 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Check if coupon is expired
  const isExpired = (coupon) => {
    return new Date(coupon.validUntil) < new Date();
  };

  // Check if coupon is valid
  const isValid = (coupon) => {
    return coupon.active && !isExpired(coupon) && 
           (!coupon.maxUses || coupon.currentUses < coupon.maxUses);
  };

  if (status === 'loading' || loading) {
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

  if (!session?.user || session?.user?.role !== 'admin') {
    return null;
  }

  const activeCoupons = coupons.filter(c => c.active).length;
  const expiredCoupons = coupons.filter(c => isExpired(c)).length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        <section className="px-6 pt-8 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle">
                  Coupon Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Create and manage discount coupons
                </p>
              </div>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 
                         text-glow-cyan hover:bg-glow-cyan/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Coupon
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-card/60 border border-glow-cyan/20">
                <div className="text-2xl font-bold text-glow-cyan">{coupons.length}</div>
                <div className="text-sm text-muted-foreground">Total Coupons</div>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">{activeCoupons}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">{expiredCoupons}</div>
                <div className="text-sm text-muted-foreground">Expired</div>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-red-500/20">
                <div className="text-2xl font-bold text-red-400">
                  {coupons.filter(c => !c.active).length}
                </div>
                <div className="text-sm text-muted-foreground">Inactive</div>
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by coupon code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                           focus:border-glow-cyan/50 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Coupon Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-lg bg-card/95 backdrop-blur-sm rounded-xl border border-glow-cyan/30 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-glow-cyan/20">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="p-2 rounded-lg hover:bg-glow-cyan/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    {success}
                  </div>
                )}

                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SUMMER20"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                             focus:border-glow-cyan/50 focus:outline-none uppercase"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Summer special discount"
                    className="w-full px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                             focus:border-glow-cyan/50 focus:outline-none"
                  />
                </div>

                {/* Discount Type and Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                               focus:border-glow-cyan/50 focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Discount Value *
                    </label>
                    <div className="relative">
                      {formData.discountType === 'percentage' ? (
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      )}
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        placeholder={formData.discountType === 'percentage' ? '20' : '10'}
                        min="0"
                        max={formData.discountType === 'percentage' ? 100 : undefined}
                        required
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                                 focus:border-glow-cyan/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Valid Until *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                               focus:border-glow-cyan/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Usage Limit
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.unlimitedUses}
                        onChange={(e) => setFormData({ ...formData, unlimitedUses: e.target.checked })}
                        className="w-4 h-4 rounded border-glow-cyan/30 bg-card/60 text-glow-cyan 
                                 focus:ring-glow-cyan/50"
                      />
                      <span className="text-sm text-muted-foreground">Unlimited</span>
                    </label>
                    {!formData.unlimitedUses && (
                      <input
                        type="number"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                        placeholder="100"
                        min="1"
                        className="flex-1 px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                                 focus:border-glow-cyan/50 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Minimum Classes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Minimum Classes Required
                  </label>
                  <input
                    type="number"
                    value={formData.minClasses}
                    onChange={(e) => setFormData({ ...formData, minClasses: e.target.value })}
                    min="1"
                    className="w-full px-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                             focus:border-glow-cyan/50 focus:outline-none"
                  />
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded border-glow-cyan/30 bg-card/60 text-glow-cyan 
                               focus:ring-glow-cyan/50"
                    />
                    <span className="text-sm text-foreground">Active (can be used)</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="flex-1 px-4 py-2 rounded-lg border border-glow-cyan/20 text-muted-foreground 
                             hover:bg-glow-cyan/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                             bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan hover:bg-glow-cyan/30 
                             transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingCoupon ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Coupons List */}
            <div className="space-y-4">
              {filteredCoupons.length === 0 ? (
                <div className="p-8 rounded-xl bg-card/60 border border-glow-cyan/20 text-center">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No coupons found matching your search' : 'No coupons yet. Create your first coupon!'}
                  </p>
                </div>
              ) : (
                filteredCoupons.map((coupon) => (
                  <div 
                    key={coupon._id}
                    className="p-4 rounded-xl bg-card/60 border border-glow-cyan/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{coupon.code}</h3>
                          {coupon.active ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">
                              Inactive
                            </span>
                          )}
                          {isExpired(coupon) && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                              Expired
                            </span>
                          )}
                          {isValid(coupon) && !isExpired(coupon) && coupon.active && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                              Valid
                            </span>
                          )}
                        </div>
                        
                        {coupon.description && (
                          <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1 text-glow-cyan">
                            {coupon.discountType === 'percentage' ? (
                              <>
                                <Percent className="w-4 h-4" />
                                <span>{coupon.discountValue}% off</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4" />
                                <span>${coupon.discountValue} off</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {coupon.maxUses 
                                ? `${coupon.currentUses || 0} / ${coupon.maxUses} uses` 
                                : 'Unlimited uses'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Until {new Date(coupon.validUntil).toLocaleDateString('en-NZ')}
                            </span>
                          </div>
                          
                          {coupon.minClasses > 1 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Tag className="w-4 h-4" />
                              <span>Min {coupon.minClasses} classes</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(coupon)}
                          className={`p-2 rounded-lg transition-all ${
                            coupon.active 
                              ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400' 
                              : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                          }`}
                          title={coupon.active ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.active ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 rounded-lg bg-glow-cyan/10 hover:bg-glow-cyan/20 text-glow-cyan transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {filteredCoupons.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Showing {filteredCoupons.length} of {coupons.length} coupons
              </div>
            )}
          </div>
        </section>

        <footer className="relative z-10 py-8 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 INNER LIGHT · Auckland, New Zealand
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

