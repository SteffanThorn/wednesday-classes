'use client';

// dynamic rendering because we embed BookingModal (client) and session info
export const dynamic = 'force-dynamic';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession, signIn } from 'next-auth/react';
import { Calendar, MapPin, DollarSign, Clock, LogIn, Loader2, Zap, Sun, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

// Generate available dates for both Wednesday and Thursday
function getAvailableDates(weeksAhead = 12) {
  const dates = [];
  const today = new Date();
  const currentDay = today.getDay();
  
  // Add Wednesdays
  let daysUntilWednesday = (3 - currentDay + 7) % 7;
  if (currentDay === 3 && today.getHours() >= 18) {
    daysUntilWednesday = 7; // If it's Wednesday after 6pm, start next Wednesday
  }
  
  let wedDate = new Date(today);
  wedDate.setDate(today.getDate() + daysUntilWednesday);
  
  for (let i = 0; i < weeksAhead; i++) {
    dates.push({
      date: new Date(wedDate),
      day: 'wednesday',
      dayName: 'Wednesday',
      time: '6:00 PM',
      displayTime: '6 PM'
    });
    wedDate.setDate(wedDate.getDate() + 7);
  }
  
  // Add Thursdays
  let daysUntilThursday = (4 - currentDay + 7) % 7;
  if (currentDay === 4 && today.getHours() >= 12) {
    daysUntilThursday = 7; // If it's Thursday after 12pm, start next Thursday
  }
  
  let thuDate = new Date(today);
  thuDate.setDate(today.getDate() + daysUntilThursday);
  
  for (let i = 0; i < weeksAhead; i++) {
    dates.push({
      date: new Date(thuDate),
      day: 'thursday',
      dayName: 'Thursday',
      time: '12:00 PM',
      displayTime: '12 PM'
    });
    thuDate.setDate(thuDate.getDate() + 7);
  }
  
  // Sort by date
  return dates.sort((a, b) => a.date - b.date);
}

export default function BookClassesPage() {
  const { language } = useLanguage();
  const { data: session, status } = useSession();
  const [selectedDates, setSelectedDates] = useState([]);
  const [classFilter, setClassFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  
  const availableDates = getAvailableDates();
  const filteredDates = classFilter === 'all' 
    ? availableDates 
    : availableDates.filter(d => d.day === classFilter);
  
  const totalPrice = selectedDates.length * 15;

  const handleDateToggle = (dateObj) => {
    const key = `${dateObj.date.toISOString().split('T')[0]}-${dateObj.day}`;
    setSelectedDates(prev => {
      const exists = prev.find(d => `${d.date.toISOString().split('T')[0]}-${d.day}` === key);
      if (exists) {
        return prev.filter(d => `${d.date.toISOString().split('T')[0]}-${d.day}` !== key);
      }
      return [...prev, dateObj];
    });
  };

  const handleCheckout = async () => {
    if (!session) {
      signIn();
      return;
    }

    if (selectedDates.length === 0) {
      setError(language === 'zh' ? '请选择至少一个课程日期' : 'Please select at least one class date');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (paymentMethod === 'card') {
        // Build query params for checkout page
        const params = new URLSearchParams();
        params.set('class_name', 'Beginner Yoga');
        params.set('amount', totalPrice.toString());
        params.set('selected_dates', selectedDates.map(d => d.date.toISOString().split('T')[0]).join(','));
        params.set('date_days', selectedDates.map(d => d.day).join(','));
        if (couponCode) params.set('coupon_code', couponCode);

        window.location.href = `/checkout?${params.toString()}`;
      } else {
        // Pay by cash: create bookings directly
        const perBooking = parseFloat((totalPrice / selectedDates.length).toFixed(2));
        const created = [];

        for (const dateObj of selectedDates) {
          const dateStr = dateObj.date.toISOString().split('T')[0];
          const className = dateObj.day === 'wednesday' 
            ? 'Beginner Yoga - Wednesday' 
            : 'Beginner Yoga - Thursday';
          
          const payload = {
            className,
            classDate: dateStr,
            classTime: dateObj.time,
            location: 'Village Valley Centre, Ashhurst',
            amount: perBooking,
            paymentMethod: 'cash'
          };

          const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to create booking');
          }

          const data = await res.json();
          created.push(data.booking);
        }

        window.location.href = '/dashboard?paid=cash&created=' + encodeURIComponent(created.map(b => b._id).join(','));
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || (language === 'zh' ? '预约失败' : 'Booking failed'));
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FloatingParticles />
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Book a Class' : '预约课程'}
            </h1>
            <p className="text-gray-600 mb-4">
              {language === 'en' 
                ? 'Choose Wednesday or Thursday sessions, or both!' 
                : '选择周三或周四的课程，或两者都选！'}
            </p>
          </div>

          {/* Class Filter Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setClassFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                classFilter === 'all'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {language === 'en' ? 'All Classes' : '所有课程'}
            </button>
            <button
              onClick={() => setClassFilter('wednesday')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                classFilter === 'wednesday'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <Zap size={18} />
              {language === 'en' ? 'Wednesday 6pm' : '周三晚上6点'}
            </button>
            <button
              onClick={() => setClassFilter('thursday')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                classFilter === 'thursday'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <Sun size={18} />
              {language === 'en' ? 'Thursday 12pm' : '周四中午12点'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Dates */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'en' ? 'Select Your Classes' : '选择您的课程'}
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredDates.map((dateObj, idx) => {
                    const key = `${dateObj.date.toISOString().split('T')[0]}-${dateObj.day}`;
                    const isSelected = selectedDates.some(d => 
                      `${d.date.toISOString().split('T')[0]}-${d.day}` === key
                    );
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateToggle(dateObj)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 bg-white hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-900">
                              {dateObj.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-600">{dateObj.dayName}</div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-rose-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-rose-600 font-medium">{dateObj.displayTime}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {language === 'en' ? 'Order Summary' : '订单摘要'}
                </h3>

                {/* Selected Count */}
                <div className="mb-4 p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <p className="text-sm text-gray-600">
                    {language === 'en' ? 'Classes Selected' : '已选课程'}
                  </p>
                  <p className="text-2xl font-bold text-rose-600">{selectedDates.length}</p>
                </div>

                {/* Price Summary */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">${totalPrice > 0 ? '15/class' : '—'}</span>
                    <span className="font-medium text-gray-900">× {selectedDates.length}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>{language === 'en' ? 'Total' : '总计'}</span>
                    <span className="text-rose-600">${totalPrice}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Payment Method' : '支付方式'}
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-2 rounded-lg border transition-colors text-sm ${
                        paymentMethod === 'card'
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      💳 {language === 'en' ? 'Card' : '信用卡'}
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`w-full p-2 rounded-lg border transition-colors text-sm ${
                        paymentMethod === 'cash'
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      💵 {language === 'en' ? 'Cash' : '现金'}
                    </button>
                  </div>
                </div>

                {/* Coupon */}
                {paymentMethod === 'card' && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Coupon code' : '优惠券'}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Login Warning */}
                {!session && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      {language === 'en' 
                        ? 'Please log in to continue' 
                        : '请登录以继续'}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleCheckout}
                  disabled={selectedDates.length === 0 || isSubmitting}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    selectedDates.length === 0 || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {!session ? (
                    <>
                      <LogIn size={18} />
                      {language === 'en' ? 'Sign In & Book' : '登录并预约'}
                    </>
                  ) : (
                    language === 'en' ? 'Proceed to Checkout' : '继续结账'
                  )}
                </button>

                {/* Info */}
                <p className="text-xs text-gray-500 mt-3 text-center">
                  {language === 'en' 
                    ? '$15 per class • All future lessons included' 
                    : '每节课$15 • 包含所有未来的课程'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
