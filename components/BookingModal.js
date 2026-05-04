'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { X, Calendar, Clock, MapPin, Loader2, LogIn, Check, ChevronLeft, ChevronRight, Tag, Gift } from 'lucide-react';
import { getAvailableDatesByDay, getClassNameForDay, getClassTimeForDay } from '@/lib/class-schedule';
import { calculateClassBookingTotal, SINGLE_CLASS_PRICE } from '@/lib/pricing';
import HealthIntakeForm from '@/components/HealthIntakeForm';

// Weekly focus template for specific date + slot (easy to extend later)
const WEEKLY_FOCUS_SERIES = {
  'wednesday-morning': {
    '2026-04-01': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 1 — Lower Back Relief',
      focus: 'Release tension in the lower back and improve mobility',
      bestFor: 'Sitting long hours, lower back stiffness, morning tightness',
    },
    '2026-04-08': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 2 — Neck & Shoulder Release',
      focus: 'Relieve tension in the neck and shoulders',
      bestFor: 'Desk workers, screen time fatigue, headaches',
    },
    '2026-04-15': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 3 — Hip Release & Mobility',
      focus: 'Open tight hips and reduce pressure in the pelvic area',
      bestFor: 'Sitting long periods, hip stiffness, limited mobility',
    },
    '2026-04-22': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 4 — Knee Care & Support',
      focus: 'Reduce knee strain and improve joint support',
      bestFor: 'Knee discomfort, difficulty walking or climbing stairs',
    },
    '2026-04-29': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 5 — Core Activation for Back Support',
      focus: 'Activate deep core muscles to support the spine',
      bestFor: 'Weak core, recurring back discomfort',
    },
    '2026-05-06': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 6 — Breathing & Rib Cage Mobility',
      focus: 'Improve breathing patterns and release chest tightness',
      bestFor: 'Shallow breathing, stress, tight chest',
    },
    '2026-05-13': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 7 — Shoulder Mobility & Stability',
      focus: 'Restore shoulder movement and reduce tension',
      bestFor: 'Shoulder stiffness, limited range of motion',
    },
    '2026-05-20': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 8 — Foot Strength & Balance',
      focus: 'Strengthen feet and improve balance',
      bestFor: 'Foot pain, instability, fall prevention',
    },
    '2026-05-27': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 9 — Full Body Fascia Release',
      focus: 'Release tension through the entire body',
      bestFor: 'General stiffness, lack of flexibility',
    },
    '2026-06-03': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 10 — Spine Mobility & Decompression',
      focus: 'Create space and mobility in the spine',
      bestFor: 'Back tightness, posture issues',
    },
    '2026-06-10': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 11 — Functional Movement Training',
      focus: 'Improve everyday movement patterns',
      bestFor: 'Walking discomfort, poor posture habits',
    },
    '2026-06-17': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      weekTitle: 'Week 12 — Full Body Integration',
      focus: 'Connect the whole body for better movement',
      bestFor: 'Overall strength, coordination, long-term wellbeing',
    },
  },
  'thursday-evening': {
    '2026-04-02': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 1 — Posterior Chain Opening',
      focus: 'Release and lengthen the back body (hamstrings, back, calves)',
      bestFor: 'Tight body, poor flexibility, back tension',
    },
    '2026-04-09': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 2 — Chest Opening & Posture Reset',
      focus: 'Open the chest and correct rounded shoulders',
      bestFor: 'Desk posture, hunched back',
    },
    '2026-04-16': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 3 — Hip Stability & Control',
      focus: 'Build strength and control in the hip joints',
      bestFor: 'Hip instability, weak lower body',
    },
    '2026-04-23': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 4 — Knee Alignment & Support',
      focus: 'Improve knee tracking and joint stability',
      bestFor: 'Knee discomfort, misalignment',
    },
    '2026-04-30': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 5 — Deep Core Stability',
      focus: 'Strengthen deep core for spinal support',
      bestFor: 'Back pain prevention, weak core',
    },
    '2026-05-07': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 6 — Rib Cage Mobility & Structure',
      focus: 'Improve rib positioning and breathing mechanics',
      bestFor: 'Tight chest, restricted breathing',
    },
    '2026-05-14': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 7 — Shoulder Stability & Strength',
      focus: 'Build strong and stable shoulders',
      bestFor: 'Shoulder weakness, instability',
    },
    '2026-05-21': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 8 — Foot Mechanics & Balance',
      focus: 'Strengthen feet and improve alignment from the ground up',
      bestFor: 'Foot pain, balance issues',
    },
    '2026-05-28': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 9 — Fascia Lines Integration',
      focus: 'Connect the body through fascial chains',
      bestFor: 'Movement coordination, stiffness',
    },
    '2026-06-04': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 10 — Spinal Stability & Control',
      focus: 'Strengthen and stabilise the spine',
      bestFor: 'Poor posture, recurring discomfort',
    },
    '2026-06-11': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 11 — Functional Strength & Movement',
      focus: 'Apply strength to everyday movement',
      bestFor: 'Daily activity improvement',
    },
    '2026-06-18': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      weekTitle: 'Week 12 — Full Body Integration & Flow',
      focus: 'Combine strength, mobility, and control',
      bestFor: 'Overall body performance and confidence',
    },
  },
};

function getWeeklyFocusForDate(day, date) {
  return WEEKLY_FOCUS_SERIES?.[day]?.[date] || null;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  classDetails,
  dayOfWeek = null, // null means allow user to select: 'wednesday-morning' or 'thursday-evening'
  preselectedDate = '',
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
  // Payment method: 'card' (Stripe) or 'cash' or 'member_card'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [memberCredits, setMemberCredits] = useState(0);
  
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
  const [selectedDay, setSelectedDay] = useState(dayOfWeek || 'wednesday-morning');

  // Health intake gate
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [pendingSubmitAction, setPendingSubmitAction] = useState(null);
  
  // Get available dates based on day of week
  const effectiveDayOfWeek = dayOfWeek || selectedDay;
  const availableDates = getAvailableDatesByDay(effectiveDayOfWeek, 12);
  const totalPages = Math.ceil(availableDates.length / DATES_PER_PAGE);
  const displayedDates = availableDates.slice(currentPage * DATES_PER_PAGE, (currentPage + 1) * DATES_PER_PAGE);
  
  // Calculate total price (supports 5-class package pricing)
  const totalPrice = calculateClassBookingTotal(selectedDates.length);
  const regularPrice = selectedDates.length * SINGLE_CLASS_PRICE;
  const packageSavings = Math.max(0, regularPrice - totalPrice);

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

  useEffect(() => {
    if (!isOpen || !session?.user?.email) return;

    let cancelled = false;

    const loadCredits = async () => {
      try {
        const res = await fetch('/api/health-intake');
        const data = await res.json();
        if (!res.ok) return;
        if (!cancelled) {
          setMemberCredits(Number(data.currentClassCredits ?? data.intake?.remainingClassCredits ?? 0));
        }
      } catch {
        // ignore
      }
    };

    loadCredits();

    return () => {
      cancelled = true;
    };
  }, [isOpen, session?.user?.email]);

  useEffect(() => {
    if (!isOpen || !preselectedDate) return;
    const target = availableDates.find((d) => d.date === preselectedDate);
    if (!target) return;

    setSelectedDates((prev) => {
      if (prev.some((d) => d.date === target.date)) return prev;
      return [target];
    });
  }, [isOpen, preselectedDate, effectiveDayOfWeek]);

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
  const shouldHidePriceForMember = true;
  const slotSeriesInfo = {
    'wednesday-morning': {
      title: 'Functional Pain Relief Series',
      subtitle: 'Release tension. Reduce pain. Restore natural movement.',
      focus: 'Lower back relief, spinal decompression, and daily movement quality',
    },
    'thursday-evening': {
      title: 'Structural Alignment & Deep Mobility Series',
      subtitle: 'Improve posture. Unlock joints. Build resilient movement.',
      focus: 'Postural alignment, hip and shoulder mobility, and joint stability',
    },
  };
  const selectedSeriesTitle = slotSeriesInfo[effectiveDayOfWeek]?.title;
  const displayClassName = selectedSeriesTitle || classDetails?.name || (language === 'zh' ? '功能性整合瑜伽' : 'Functional Integrative Yoga');

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

  const proceedWithBooking = async (paymentMethodOverride = null) => {
    if (selectedDates.length === 0) {
      setError(language === 'zh' ? '请至少选择一个日期' : 'Please select at least one date');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const effectivePaymentMethod = paymentMethodOverride || paymentMethod;
      // Build query params for checkout page
      const className = getClassNameForDay(effectiveDayOfWeek);
      const classTime = getClassTimeForDay(effectiveDayOfWeek);

        if (!bringAFriend && effectivePaymentMethod === 'card') {
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
          // Pay by cash / member card / Bring a Friend: create bookings directly
          try {
            if (!bringAFriend && effectivePaymentMethod === 'member_card' && memberCredits < selectedDates.length) {
              throw new Error(language === 'zh'
                ? `会员卡剩余次数不足（当前 ${memberCredits}，需要 ${selectedDates.length}）`
                : `Not enough member credits (have ${memberCredits}, need ${selectedDates.length})`);
            }

            // Distribute payable total across selected dates (per-booking amount)
            const perBooking = bringAFriend
              ? 0
              : effectivePaymentMethod === 'member_card'
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
                paymentMethod: bringAFriend ? 'bring_a_friend' : (effectivePaymentMethod === 'member_card' ? 'member_card' : 'cash'),
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
            const paidType = bringAFriend ? 'bring-friend' : (effectivePaymentMethod === 'member_card' ? 'member-card' : 'cash');
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
      if (!bringAFriend && (paymentMethodOverride || paymentMethod) === 'card') {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedDates.length === 0) {
      setError(language === 'zh' ? '请至少选择一个日期' : 'Please select at least one date');
      return;
    }

    if (paymentMethod === 'member_card') {
      const bookedTime = getClassTimeForDay(effectiveDayOfWeek);
      const bookedContent = selectedDates
        .map((d) => getWeeklyFocusForDate(effectiveDayOfWeek, d.date)?.weekTitle || d.displayDate)
        .join('、');
      const remainingAfterBooking = memberCredits - selectedDates.length;

      if (memberCredits < selectedDates.length) {
        const goRecharge = window.confirm(
          language === 'zh'
            ? `会员卡剩余次数不足（当前 ${memberCredits}，需要 ${selectedDates.length}）。\n点击“确定”去充值；点击“取消”改为现金支付。`
            : `Not enough member credits (have ${memberCredits}, need ${selectedDates.length}).\nClick OK to recharge, or Cancel to switch to cash payment.`
        );

        if (goRecharge) {
          window.location.href = '/checkout/package';
          return;
        }

        const confirmCashBooking = window.confirm(
          language === 'zh'
            ? '将改为现金支付继续预约，是否确认？'
            : 'Continue booking with cash payment instead, confirm?'
        );

        if (!confirmCashBooking) {
          return;
        }

        await proceedWithBooking('cash');
        return;
      }

      const memberBookingConfirmed = window.confirm(
        language === 'zh'
          ? `您已选择预约：\n时间：${bookedTime}\n课程内容：${bookedContent}\n预约后剩余课程次数：${remainingAfterBooking}\n\n确认预约吗？`
          : `You are booking:\nTime: ${bookedTime}\nClass content: ${bookedContent}\nRemaining credits after booking: ${remainingAfterBooking}\n\nConfirm booking?`
      );

      if (!memberBookingConfirmed) {
        return;
      }
    }
    
    setIsLoading(true);
    setError('');

    // Check if user has completed health intake form
    try {
      const intakeRes = await fetch('/api/health-intake');
      const intakeData = await intakeRes.json();
      if (!intakeData.hasIntake) {
        setIsLoading(false);
        setShowIntakeForm(true);
        return;
      }
    } catch {
      // If check fails, still allow booking
    }
    setIsLoading(false);

    await proceedWithBooking();
  };

  const handleSignInFromBooking = async () => {
    // If user already selected dates, send them directly back to checkout flow after login
    if (selectedDates.length > 0) {
      const className = getClassNameForDay(effectiveDayOfWeek);
      const classTime = getClassTimeForDay(effectiveDayOfWeek);

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

  // If intake form is needed, show it as a fullscreen overlay
  if (showIntakeForm) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur border-b border-glow-cyan/20">
          <button
            onClick={() => setShowIntakeForm(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-glow-cyan transition-colors"
          >
            ← Back to booking
          </button>
          <p className="text-xs text-muted-foreground">Step 1 of 2 — Health Form</p>
        </div>
        <HealthIntakeForm
          userName={session?.user?.name || ''}
          userEmail={session?.user?.email || ''}
          onComplete={() => {
            setShowIntakeForm(false);
            proceedWithBooking();
          }}
        />
      </div>
    );
  }

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

        {session && (
          <div className="px-6 py-3 border-b border-glow-cyan/10 bg-background/40">
            <p className={`text-sm ${memberCredits < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
              {language === 'zh'
                ? `当前剩余课程次数：${memberCredits}`
                : `Current member credits: ${memberCredits}`}
            </p>
          </div>
        )}

        {/* Class Details Summary */}
        <div className="px-6 py-4 bg-glow-cyan/5 border-b border-glow-cyan/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-glow-cyan" />
            <span className="font-medium text-foreground">
              {displayClassName}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getClassTimeForDay(effectiveDayOfWeek)}
            </div>
            {!shouldHidePriceForMember && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {classDetails.location}
              </div>
            )}
          </div>
          {shouldHidePriceForMember ? (
            <div className="mt-3 p-3 rounded-xl bg-glow-purple/10 border border-glow-purple/30">
              <p className="text-xs font-semibold text-glow-purple">
                {slotSeriesInfo[effectiveDayOfWeek]?.title}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                {slotSeriesInfo[effectiveDayOfWeek]?.subtitle}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">
                  {language === 'zh' ? '专注点：' : 'Focus: '}
                </span>
                {slotSeriesInfo[effectiveDayOfWeek]?.focus}
              </p>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-display text-glow-cyan">
                  ${classDetails.price}
                </span>
                <span className="text-muted-foreground">
                  {language === 'zh' ? '每节课' : 'per class'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/checkout/package';
                }}
                className="py-2 px-3 rounded-lg font-medium transition-colors bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan hover:bg-glow-cyan/30"
              >
                {language === 'zh' ? '购买5节课套餐（$65）' : 'Buy 5-Class Package ($65)'}
              </button>
            </div>
          )}
        </div>

        {/* Day Selection Tabs (only if dayOfWeek not pre-specified) */}
        {!dayOfWeek && (
          <div className="px-6 py-4 border-b border-glow-cyan/10">
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  key: 'wednesday-morning',
                  dayZh: '周三',
                  timeZh: '9:15AM',
                  dayEn: 'Wednesday',
                  timeEn: '9:15 AM',
                },
                {
                  key: 'thursday-evening',
                  dayZh: '周四',
                  timeZh: '5:30PM',
                  dayEn: 'Thursday',
                  timeEn: '5:30 PM',
                },
              ].map((slot) => (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => {
                    setSelectedDay(slot.key);
                    setSelectedDates([]);
                    setCurrentPage(0);
                  }}
                  className={`group relative py-2 px-3 rounded-lg font-medium transition-colors ${
                    selectedDay === slot.key
                      ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan'
                      : 'bg-background/50 border border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-semibold">{language === 'zh' ? slot.dayZh : slot.dayEn}</div>
                    <div className="text-xs">{language === 'zh' ? slot.timeZh : slot.timeEn}</div>
                  </div>

                  {/* Desktop hover popover */}
                  <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-72 -translate-x-1/2 rounded-xl border border-glow-purple/40 bg-background/95 p-3 text-left opacity-0 shadow-xl transition-all duration-200 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 md:block">
                    <p className="text-xs font-semibold text-glow-purple">
                      {slotSeriesInfo[slot.key]?.title}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      {slotSeriesInfo[slot.key]?.subtitle}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">
                        {language === 'zh' ? '专注点：' : 'Focus: '}
                      </span>
                      {slotSeriesInfo[slot.key]?.focus}
                    </p>
                  </div>

                  {/* Mobile tap-expand details */}
                  {selectedDay === slot.key && (
                    <div className="mt-3 rounded-xl border border-glow-purple/30 bg-glow-purple/10 p-3 text-left md:hidden">
                      <p className="text-xs font-semibold text-glow-purple">
                        {slotSeriesInfo[slot.key]?.title}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                        {slotSeriesInfo[slot.key]?.subtitle}
                      </p>
                      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                        <span className="text-foreground font-medium">
                          {language === 'zh' ? '专注点：' : 'Focus: '}
                        </span>
                        {slotSeriesInfo[slot.key]?.focus}
                      </p>
                    </div>
                  )}
                </button>
              ))}
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
            {displayedDates.length === 0 && (
              <div className="p-3 rounded-xl bg-card/40 border border-glow-cyan/10 text-sm text-muted-foreground">
                {language === 'zh' ? '当前没有可预约日期，请稍后再查看。' : 'No available dates right now. Please check back soon.'}
              </div>
            )}
            {displayedDates.map((date) => {
              const isSelected = selectedDates.some(d => d.date === date.date);
              const weeklyFocus = getWeeklyFocusForDate(effectiveDayOfWeek, date.date);
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
                      {weeklyFocus && (
                        <div className="mt-2 p-2 rounded-lg bg-glow-purple/10 border border-glow-purple/30">
                          <p className="text-xs text-foreground font-medium">{weeklyFocus.weekTitle}</p>
                          <p className="text-[11px] text-muted-foreground mt-2">
                            <span className="text-foreground font-medium">{language === 'zh' ? '专注点：' : 'Focus: '}</span>
                            {weeklyFocus.focus}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            <span className="text-foreground font-medium">{language === 'zh' ? '适合人群：' : 'Best for: '}</span>
                            {weeklyFocus.bestFor}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {!shouldHidePriceForMember && (
                    <div className="text-glow-cyan font-medium">
                      ${classDetails.price}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

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
              {!shouldHidePriceForMember && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-display text-glow-cyan">
                    ${totalPrice}
                  </span>
                </div>
              )}
            </div>

            {!shouldHidePriceForMember && packageSavings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'zh' ? '套餐优惠' : 'Package savings'}
                </span>
                <span className="text-green-400 font-medium">-${packageSavings.toFixed(2)}</span>
              </div>
            )}

            {/* Coupon Input Section */}
            {!shouldHidePriceForMember && !appliedCoupon ? (
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
            ) : !shouldHidePriceForMember ? (
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
            ) : null}

            {/* Coupon Error */}
            {!shouldHidePriceForMember && couponError && (
              <p className="text-xs text-red-400">{couponError}</p>
            )}

            {/* Discount Display */}
            {!shouldHidePriceForMember && appliedCoupon && discount > 0 && (
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
            {!shouldHidePriceForMember && appliedCoupon && finalPrice !== totalPrice && (
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
              <div className="flex gap-3">
                <label className={`px-3 py-2 rounded-lg border ${paymentMethod === 'card' ? 'border-glow-cyan/40 bg-glow-cyan/10' : 'border-border/30 bg-card/60'} cursor-pointer flex-1 text-center`}> 
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="hidden"
                  />
                  {language === 'zh' ? '卡' : 'Card'}
                </label>
                <label className={`px-3 py-2 rounded-lg border ${paymentMethod === 'cash' ? 'border-glow-cyan/40 bg-glow-cyan/10' : 'border-border/30 bg-card/60'} cursor-pointer flex-1 text-center`}> 
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
                <label className={`px-3 py-2 rounded-lg border ${paymentMethod === 'member_card' ? 'border-glow-cyan/40 bg-glow-cyan/10' : 'border-border/30 bg-card/60'} cursor-pointer flex-1 text-center`}> 
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="member_card"
                    checked={paymentMethod === 'member_card'}
                    onChange={() => setPaymentMethod('member_card')}
                    className="hidden"
                  />
                  {language === 'zh' ? '会员卡次数' : 'Member Credits'}
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
                  {language === 'zh' ? '确认预约' : 'Confirm Booking'}
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

        <div className="px-6 py-4 border-t border-glow-cyan/10 bg-background/40">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{language === 'zh' ? '上课地点：' : 'Class Location: '}{classDetails.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

