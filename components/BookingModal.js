'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { X, Calendar, Clock, MapPin, DollarSign, Loader2, LogIn, Check, ChevronLeft, ChevronRight, Tag, Gift } from 'lucide-react';

// Generate available dates based on day of week
function getAvailableDatesByDay(dayOfWeek, weeksAhead = 12) {
  const dates = [];
  const today = new Date();
  const currentDay = today.getDay();
  
  // dayOfWeek: 'wednesday' (3) or 'thursday' (4)
  const targetDay = dayOfWeek === 'wednesday' ? 3 : 4;
  const cutoffHour = dayOfWeek === 'wednesday' ? 18 : 12; // 6pm for Wed, 12pm for Thu
  
  let daysUntilTarget = (targetDay - currentDay + 7) % 7;
  
  // If it's the target day, check if we're before the class time
  if (currentDay === targetDay && today.getHours() >= cutoffHour) {
    daysUntilTarget = 7; // Skip to next week
  }
  
  let startDate = new Date(today);
  startDate.setDate(today.getDate() + daysUntilTarget);
  
  for (let i = 0; i < weeksAhead; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + (i * 7));
    dates.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-NZ', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }),
      fullDate: date.toLocaleDateString('en-NZ', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    });
  }
  
  return dates;
}

// Generate available Wednesdays starting from the next upcoming Wednesday
function getAvailableWednesdays(weeksAhead = 12) {
  return getAvailableDatesByDay('wednesday', weeksAhead);
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  classDetails,
  dayOfWeek = null, // null means allow user to select, 'wednesday' or 'thursday'
  language = 'en' 
}) {
  // ALL hooks must be called unconditionally - no early returns before hooks!
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    notes: ''
  });
  const [bringAFriend, setBringAFriend] = useState(false);
  // Payment method: 'card' (Stripe) or 'cash'
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  // Multi-date selection state
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const DATES_PER_PAGE = 4;
  
  // Day selection state (for homepage)
  const [selectedDay, setSelectedDay] = useState(dayOfWeek || 'wednesday');
  
  // Get available dates based on day of week
  const effectiveDayOfWeek = dayOfWeek || selectedDay;
  const availableDates = getAvailableDatesByDay(effectiveDayOfWeek, 12);
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
      setBringAFriend(false);
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
  const payableAmount = bringAFriend ? 0 : finalPrice;

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
      // Build query params for checkout page
      const className = effectiveDayOfWeek === 'wednesday' 
        ? 'Beginner Yoga - Wednesday'
        : 'Beginner Yoga - Thursday';
      const classTime = effectiveDayOfWeek === 'wednesday' 
        ? '6:00 PM' 
        : '12:00 PM';
      
        if (!bringAFriend && paymentMethod === 'card') {
          // Build query params for checkout page
          const params = new URLSearchParams();
          params.set('class_name', className);
          params.set('amount', payableAmount.toString());
          params.set('class_time', classTime);
          params.set('location', classDetails.location);

          // Add selected dates (for multi-date booking)
          if (selectedDates.length > 0) {
            params.set('selected_dates', selectedDates.map(d => d.date).join(','));
          }

          // Add coupon if applied
          if (appliedCoupon) {
            params.set('coupon_code', appliedCoupon.code);
          }

          // Add notes
          if (formData.notes) {
            params.set('notes', formData.notes);
          }

          // Redirect to embedded checkout page with Stripe Elements
          // The checkout page will create the booking and payment intent
          window.location.href = `/checkout?${params.toString()}`;
        } else {
          // Pay by cash or Bring a Friend: create bookings directly
          try {
            // Distribute payable total across selected dates (per-booking amount)
            const perBooking = bringAFriend
              ? 0
              : parseFloat((payableAmount / selectedDates.length).toFixed(2));

            const created = [];
            for (const d of selectedDates) {
              const payload = {
                className: className,
                classDate: d.date,
                classTime: classTime,
                location: classDetails.location,
                amount: perBooking,
                notes: formData.notes || '',
                paymentMethod: bringAFriend ? 'bring_a_friend' : 'cash',
                bringAFriend: bringAFriend
              };

              const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || 'Failed to create booking');
              }
              created.push(data.booking);
            }

            // Successfully created all bookings - redirect to dashboard with success message
            // Keep loading state until redirect completes
            const paidType = bringAFriend ? 'bring-friend' : 'cash';
            window.location.href = '/dashboard?paid=' + paidType + '&created=' + encodeURIComponent(created.map(b => b._id).join(','));
            return; // Exit early to prevent setIsLoading(false) below
          } catch (err) {
            console.error('Cash booking error:', err);
            setError(err.message || (bringAFriend ? 'Failed to create Bring a Friend booking' : 'Failed to create cash booking'));
            setIsLoading(false); // Reset loading on error
          }
        }
    } finally {
      // For card payment flow, ensure loading is reset
      if (!bringAFriend && paymentMethod === 'card') {
        setIsLoading(false);
      }
    }
  };

  const handleSignInFromBooking = async () => {
    // If user already selected dates, send them directly back to checkout flow after login
    if (selectedDates.length > 0) {
      const className = effectiveDayOfWeek === 'wednesday'
        ? 'Beginner Yoga - Wednesday'
        : 'Beginner Yoga - Thursday';
      const classTime = effectiveDayOfWeek === 'wednesday'
        ? '6:00 PM'
        : '12:00 PM';

      const params = new URLSearchParams();
      params.set('class_name', className);
      params.set('amount', finalPrice.toString());
      params.set('class_time', classTime);
      params.set('location', classDetails.location);
      params.set('selected_dates', selectedDates.map(d => d.date).join(','));

      if (appliedCoupon) {
        params.set('coupon_code', appliedCoupon.code);
      }

      const callbackUrl = `/checkout?${params.toString()}`;
      await signIn(undefined, { callbackUrl });
      return;
    }

    // Fallback: return to current page
    const fallbackCallback = typeof window !== 'undefined'
      ? window.location.href
      : '/dashboard';
    await signIn(undefined, { callbackUrl: fallbackCallback });
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
              {effectiveDayOfWeek === 'wednesday' ? '6:00 PM' : '12:00 PM'}
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

        {/* Day Selection Tabs (only if dayOfWeek not pre-specified) */}
        {!dayOfWeek && (
          <div className="px-6 py-4 border-b border-glow-cyan/10">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDay('wednesday');
                  setSelectedDates([]);
                  setCurrentPage(0);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  selectedDay === 'wednesday'
                    ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan'
                    : 'bg-background/50 border border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
                }`}
              >
                {language === 'zh' ? '周三 6PM' : 'Wednesday 6PM'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDay('thursday');
                  setSelectedDates([]);
                  setCurrentPage(0);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  selectedDay === 'thursday'
                    ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan'
                    : 'bg-background/50 border border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
                }`}
              >
                {language === 'zh' ? '周四 12PM' : 'Thursday 12PM'}
              </button>
            </div>
          </div>
        )}

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

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{language === 'zh' ? '支付方式' : 'Payment Method'}</label>
              <label className={`w-full p-3 rounded-lg border flex items-start gap-3 transition-colors ${bringAFriend ? 'border-green-500/40 bg-green-500/10' : 'border-border/30 bg-card/60'}`}>
                <input
                  type="checkbox"
                  checked={bringAFriend}
                  onChange={(e) => setBringAFriend(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-foreground">
                    {language === 'zh' ? '带朋友来（免费课程）' : 'Bring a Friend (Free Class)'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'zh'
                      ? '选择后本次预约免费，管理员将在线下确认你已带朋友。'
                      : 'This booking is free. Admin will confirm after class that you brought a friend.'}
                  </p>
                </div>
              </label>

              <div className="flex gap-3">
                <label className={`px-3 py-2 rounded-lg border ${paymentMethod === 'card' ? 'border-glow-cyan/40 bg-glow-cyan/10' : 'border-border/30 bg-card/60'} cursor-pointer flex-1 text-center ${bringAFriend ? 'opacity-50 pointer-events-none' : ''}`}> 
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="hidden"
                  />
                  {language === 'zh' ? '卡 (Stripe)' : 'Card (Stripe)'}
                </label>
                <label className={`px-3 py-2 rounded-lg border ${paymentMethod === 'cash' ? 'border-glow-cyan/40 bg-glow-cyan/10' : 'border-border/30 bg-card/60'} cursor-pointer flex-1 text-center ${bringAFriend ? 'opacity-50 pointer-events-none' : ''}`}> 
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="hidden"
                  />
                  {language === 'zh' ? '现金支付' : 'Pay Cash'}
                </label>
              </div>
            </div>

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
                  {bringAFriend
                    ? (language === 'zh' ? '免费预约（带朋友）' : 'Book Free (Bring a Friend)')
                    : (language === 'zh' ? `支付 $${payableAmount.toFixed(2)}` : `Pay $${payableAmount.toFixed(2)}`)}
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
                onClick={handleSignInFromBooking}
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
            
            {/* Forgot Password Link */}
            <div className="pt-2">
              <button
                onClick={() => { onClose(); window.location.href = '/auth/forgot-password'; }}
                className="text-sm text-muted-foreground hover:text-glow-cyan transition-colors"
              >
                {language === 'zh' ? '忘记密码？' : 'Forgot Password?'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

