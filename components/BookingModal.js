'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { X, Calendar, Clock, MapPin, DollarSign, Loader2, LogIn, Check, ChevronLeft, ChevronRight, Tag, Gift } from 'lucide-react';

// Generate available Wednesdays starting from 18th Feb 2025 for 3 months
function getAvailableWednesdays(startDate = '2025-02-18', weeksAhead = 12) {
  const wednesdays = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < weeksAhead; i++) {
    const wed = new Date(start);
    wed.setDate(start.getDate() + (i * 7));
    wednesdays.push({
      date: wed.toISOString().split('T')[0],
      displayDate: wed.toLocaleDateString('en-NZ', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }),
      fullDate: wed.toLocaleDateString('en-NZ', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    });
  }
  
  return wednesdays;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  classDetails,
  language = 'en' 
}) {
  // ALL hooks must be called unconditionally - no early returns before hooks!
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    notes: ''
  });
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  // Multi-date selection state
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const DATES_PER_PAGE = 4;
  
  // Get available dates
  const availableDates = getAvailableWednesdays('2025-02-18', 12);
  const totalPages = Math.ceil(availableDates.length / DATES_PER_PAGE);
  const displayedDates = availableDates.slice(currentPage * DATES_PER_PAGE, (currentPage + 1) * DATES_PER_PAGE);
  
  // Calculate total price
  const totalPrice = selectedDates.length * (classDetails?.price || 15);

  // Reset state when modal opens - useEffect must always be called
  useEffect(() => {
    if (isOpen) {
      setSelectedDates([]);
      setCurrentPage(0);
      setError('');
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
    }
  }, [isOpen]);

  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return totalPrice * (appliedCoupon.discountValue / 100);
    }
    return appliedCoupon.discountValue;
  };

  const discount = calculateDiscount();
  const finalPrice = Math.max(0, totalPrice - discount);

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(language === 'zh' ? '请输入优惠券码' : 'Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          numClasses: selectedDates.length
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid coupon');
      }

      setAppliedCoupon(data);
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle removing coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleDateToggle = (date) => {
    setSelectedDates(prev => {
      const exists = prev.find(d => d.date === date.date);
      if (exists) {
        return prev.filter(d => d.date !== date.date);
      }
      return [...prev, date];
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedDates.length === 0) {
      setError(language === 'zh' ? '请至少选择一个日期' : 'Please select at least one date');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/book-and-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          className: classDetails.name,
          selectedDates: selectedDates.map(d => d.date),
          classTime: classDetails.time,
          location: classDetails.location,
          amount: finalPrice,
          notes: formData.notes,
          bookingType: 'multi-date',
          couponCode: appliedCoupon ? appliedCoupon.code : null,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response');
      }

      if (response.status === 401 && data.requireAuth) {
        signIn();
        return;
      }

      if (!response.ok) {
        console.error('Booking error response:', data);
        throw new Error(data.error || `Failed to create booking (${response.status})`);
      }

      if (data.interested) {
        alert(language === 'zh' ? '感谢您的兴趣！我们会稍后通知您。' : 'Thanks for your interest! We\'ll be in touch.');
        onClose();
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Use conditional rendering instead of early return to maintain hook order
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-glow-cyan/30 
                    rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-glow-cyan/20 flex items-center justify-between sticky top-0 bg-card z-10">
          <h2 className="text-xl font-display text-glow-cyan">
            {language === 'zh' ? '预约课程' : 'Book Class'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-glow-cyan/10 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Class Details Summary */}
        <div className="px-6 py-4 bg-glow-cyan/5 border-b border-glow-cyan/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-glow-cyan" />
            <span className="font-medium text-foreground">
              {classDetails.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {classDetails.time}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {classDetails.location}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-glow-cyan" />
            <span className="text-2xl font-display text-glow-cyan">
              ${classDetails.price}
            </span>
            <span className="text-muted-foreground">
              {language === 'zh' ? '每节课' : 'per class'}
            </span>
          </div>
        </div>

        {/* Date Selection */}
        <div className="px-6 py-4 border-b border-glow-cyan/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">
              {language === 'zh' ? '选择日期:' : 'Select Dates:'}
            </h3>
            <span className="text-sm text-muted-foreground">
              {selectedDates.length} {language === 'zh' ? '已选' : 'selected'}
            </span>
          </div>
          
          {/* Date Grid */}
          <div className="space-y-2">
            {displayedDates.map((date) => {
              const isSelected = selectedDates.some(d => d.date === date.date);
              return (
                <button
                  key={date.date}
                  type="button"
                  onClick={() => handleDateToggle(date)}
                  className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-glow-cyan/20 border-glow-cyan/50 text-foreground' 
                      : 'bg-background/50 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-glow-cyan bg-glow-cyan' : 'border-muted-foreground'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-card" />}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{date.displayDate}</div>
                      <div className="text-xs text-muted-foreground">{classDetails.time}</div>
                    </div>
                  </div>
                  <div className="text-glow-cyan font-medium">
                    ${classDetails.price}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg bg-card/50 border border-glow-cyan/20 hover:border-glow-cyan/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg bg-card/50 border border-glow-cyan/20 hover:border-glow-cyan/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Selected Dates Summary */}
        {selectedDates.length > 0 && (
          <div className="px-6 py-4 bg-glow-cyan/5 border-b border-glow-cyan/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground">
                {selectedDates.length} {language === 'zh' ? '节课' : 'class(es)'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-display text-glow-cyan">
                  ${totalPrice}
                </span>
              </div>
            </div>

            {/* Coupon Input Section */}
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={language === 'zh' ? '输入优惠券码' : 'Enter coupon code'}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-background/50 border border-glow-cyan/20 
                             text-sm focus:border-glow-cyan/50 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 
                           text-glow-cyan text-sm font-medium hover:bg-glow-cyan/30 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {couponLoading ? '...' : language === 'zh' ? '应用' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {appliedCoupon.discountType === 'percentage' 
                      ? `-${appliedCoupon.discountValue}%`
                      : `-$${appliedCoupon.discountValue}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                >
                  {language === 'zh' ? '移除' : 'Remove'}
                </button>
              </div>
            )}

            {/* Coupon Error */}
            {couponError && (
              <p className="text-xs text-red-400">{couponError}</p>
            )}

            {/* Discount Display */}
            {appliedCoupon && discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'zh' ? '折扣' : 'Discount'}
                </span>
                <span className="text-green-400 font-medium">
                  -${discount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Final Price */}
            {appliedCoupon && finalPrice !== totalPrice && (
              <div className="flex items-center justify-between pt-2 border-t border-glow-cyan/10">
                <span className="font-medium text-foreground">
                  {language === 'zh' ? '应付金额' : 'Total'}
                </span>
                <span className="text-2xl font-display text-glow-cyan">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Policy */}
        <div className="px-6 py-4 border-b border-glow-cyan/10">
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <h4 className="text-sm font-medium text-yellow-400 mb-2">
              {language === 'zh' ? '取消政策' : 'Cancellation Policy'}
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong className="text-yellow-300">{language === 'zh' ? '24小时内' : 'Within 24 hours'}</strong>: {language === 'zh' ? '退款50%或获得50%积分' : '50% refund OR 50% credit'}</li>
              <li>• <strong className="text-green-400">{language === 'zh' ? '24小时外' : 'Outside 24 hours'}</strong>: {language === 'zh' ? '退款90%或获得100%积分' : '90% refund OR 100% credit'}</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2 italic">
              {language === 'zh' ? '注：50%积分 = 半节课。100%积分 = 1节课。' : 'Note: 50% Credit = 1/2 Class. 100% Credit = 1 Class.'}
            </p>
          </div>
        </div>

        {/* Form - Show based on auth status */}
        {status === 'loading' ? (
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-glow-cyan animate-spin" />
          </div>
        ) : session ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* User Info (from session - read only) */}
            <div className="p-3 rounded-xl bg-glow-cyan/5 border border-glow-cyan/20">
              <div className="text-sm text-muted-foreground">
                {language === 'zh' ? '预订人' : 'Booking as'}
              </div>
              <div className="font-medium text-foreground">{session.user.name}</div>
              <div className="text-sm text-muted-foreground">{session.user.email}</div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {language === 'zh' ? '备注' : 'Notes'}
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl bg-background border border-glow-cyan/20 
                         focus:border-glow-cyan/50 focus:outline-none transition-colors resize-none"
                placeholder={language === 'zh' ? '有任何特殊情况请告知' : 'Any special requirements or health conditions?'}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || selectedDates.length === 0}
              className="w-full py-3 rounded-xl font-medium text-lg transition-all duration-300 shadow-glow
                       disabled:opacity-50 disabled:cursor-not-allowed
                       bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30
                       flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {language === 'zh' ? '处理中...' : 'Processing...'}
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  {language === 'zh' ? `支付 $${finalPrice.toFixed(2)}` : `Pay $${finalPrice.toFixed(2)}`}
                </>
              )}
            </button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground/60">
              🔒 {language === 'zh' 
                ? '安全支付由Stripe提供支持' 
                : 'Secure payment powered by Stripe'}
            </p>
          </form>
        ) : (
          <div className="p-6 space-y-4 text-center">
            <div className="p-4 rounded-xl bg-glow-cyan/5 border border-glow-cyan/20">
              <LogIn className="w-8 h-8 text-glow-cyan mx-auto mb-2" />
              <h3 className="font-medium text-foreground mb-1">
                {language === 'zh' ? '请先登录' : 'Please sign in'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' 
                  ? '登录后即可预约课程' 
                  : 'Sign in to book your class'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => signIn()}
                className="flex-1 py-3 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 
                         text-glow-cyan font-medium hover:bg-glow-cyan/30 
                         hover:box-glow transition-all duration-300"
              >
                {language === 'zh' ? '登录' : 'Sign In'}
              </button>
              <button
                onClick={() => { onClose(); window.location.href = '/auth/signup'; }}
                className="flex-1 py-3 rounded-xl bg-muted/20 border border-border/40 
                         text-muted-foreground font-medium hover:bg-muted/40 
                         transition-all duration-300"
              >
                {language === 'zh' ? '注册' : 'Sign Up'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

