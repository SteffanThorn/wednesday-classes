'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PaymentForm from '@/components/PaymentForm';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Global flag to prevent duplicate API calls across Strict Mode renders
let globalAPICalled = false;
let globalInitComplete = false;
// Track the last URL to detect navigation changes
let lastPathname = '';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const { data: session, status } = useSession();
  
  // Reset globals on new navigation
  if (pathname !== lastPathname) {
    console.log('New navigation detected, resetting globals');
    globalAPICalled = false;
    globalInitComplete = false;
    lastPathname = pathname;
  }
  const { t, mounted, language } = useLanguage();
  
  const [bookingData, setBookingData] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  
  // Use refs that persist across renders
  const clientSecretRef = useRef(clientSecret);
  const bookingDataRef = useRef(bookingData);
  const isLocalInitialized = useRef(false);
  
  // Update refs when clientSecret and bookingData change
  useEffect(() => {
    clientSecretRef.current = clientSecret;
  }, [clientSecret]);

  useEffect(() => {
    bookingDataRef.current = bookingData;
  }, [bookingData]);

  // Use state for params instead of ref to ensure proper reactivity
  const [params, setParams] = useState(null);

  // Initialize params from searchParams - use effect to ensure proper client-side initialization
  useEffect(() => {
    const paramsData = {
      bookingId: searchParams.get('booking_id'),
      amount: searchParams.get('amount'),
      className: searchParams.get('class_name'),
      classDate: searchParams.get('class_date'),
      classTime: searchParams.get('class_time'),
      location: searchParams.get('location'),
      selectedDates: searchParams.get('selected_dates'),
      couponCode: searchParams.get('coupon_code'),
      notes: searchParams.get('notes')
    };
    
    console.log('Initialized params from searchParams:', paramsData);
    setParams(paramsData);
  }, [searchParams]);

  // Extract params with fallbacks
  const bookingId = params?.bookingId || null;
  const amount = params?.amount || null;
  const className = params?.className || null;
  const classDate = params?.classDate || null;
  const classTime = params?.classTime || null;
  const location = params?.location || null;
  const selectedDates = params?.selectedDates || null;
  const couponCode = params?.couponCode || null;
  const notes = params?.notes || null;
  
  useEffect(() => {
    // Debug: Log publishable key prefix (client-side env)
    console.log('Stripe publishable key prefix (client):',
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 8)
        : 'none'
    );

    // Debug: Log the search params we're receiving
    console.log('Checkout page useEffect - params:', {
      bookingId,
      amount,
      className,
      classDate,
      classTime,
      location,
      selectedDates,
      couponCode,
      notes,
      hasClientSecret: !!clientSecretRef.current,
      globalAPICalled,
      globalInitComplete,
      isLocalInitialized: isLocalInitialized.current,
      sessionStatus: status,
      rawSearchParams: searchParams.toString()
    });
    
    // Wait for session to load before making API calls
    if (status === 'loading') {
      console.log('Session loading, waiting...');
      return;
    }
    
    // Redirect to sign in if not authenticated
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to sign in...');
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
      return;
    }
    
    // Guard: Don't run if global initialization is complete
    if (globalInitComplete) {
      console.log('Global init complete, skipping...');
      setIsLoading(false);
      return;
    }
    
    // Guard: Don't re-fetch if we already have a clientSecret
    if (clientSecretRef.current) {
      console.log('Client secret already exists, skipping API call');
      setIsLoading(false);
      globalInitComplete = true;
      return;
    }
    
    // Guard: Don't re-call API if we've already fetched
    if (globalAPICalled) {
      console.log('Global API already called, skipping...');
      setIsLoading(false);
      globalInitComplete = true;
      return;
    }
    
    // Check if we have valid params - redirect to home if not
    // But first, make sure params have been initialized from searchParams
    if (params === null) {
      console.log('Params not yet initialized, waiting...');
      return;
    }
    
    if (!bookingId && (!className || !amount)) {
      console.error('Missing required params - redirecting to home');
      setError(language === 'zh' 
        ? '缺少预订信息，正在返回...' 
        : 'Missing booking information, redirecting...');
      
      globalInitComplete = true;
      
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }
    
    // Mark that we're about to call the API
    globalAPICalled = true;
    globalInitComplete = true;
    
    // If we have a booking_id, fetch the client secret from the API
    if (bookingId && amount) {
      fetchClientSecret();
    } else if (className && amount) {
      // Check if we have booking data in URL parameters
      // Handle both single date and multi-date bookings
      const dates = selectedDates ? selectedDates.split(',') : (classDate ? [classDate] : []);
      
      setBookingData({
        className,
        classDate,
        classTime,
        location,
        amount: parseFloat(amount),
        selectedDates: dates,
        couponCode,
        notes
      });
      
      // Create a payment intent for this ad-hoc booking (with or without coupon)
      createAdHocPaymentIntent(dates, couponCode, { amount, className, classTime, location });
    } else {
      // More helpful error message for debugging
      const missingParams = [];
      if (!bookingId) missingParams.push('bookingId');
      if (!amount) missingParams.push('amount');
      if (!className) missingParams.push('className');
      
      console.error('Missing required params:', missingParams);
      setError(language === 'zh' ? `缺少预订信息: ${missingParams.join(', ')}` : `Missing booking information: ${missingParams.join(', ')}`);
      setIsLoading(false);
    }
    
    // Warn user before leaving the page during payment
    const handleBeforeUnload = (e) => {
      if (!isLoading && clientSecretRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [status, language, bookingId, className, amount, params, router]);

  const fetchClientSecret = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching client secret for bookingId:', bookingId);
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();
      
      console.log('API response:', { status: response.status, data });

      if (!response.ok) {
        // Handle specific error cases with more detail
        console.error('API error response:', data);
        
        if (data.code === 'NO_SESSION' || data.error?.includes('Unauthorized')) {
          throw new Error(language === 'zh' 
            ? '请先登录后再进行支付' 
            : 'Please sign in to complete payment. Redirecting to login...');
        }
        
        if (data.error === 'Booking ID or booking details are required' || data.code === 'MISSING_FIELDS') {
          const debugMsg = `${
            language === 'zh' 
              ? '预订信息无效，请重新选择课程' 
              : 'Invalid booking information. Please select your class again.'
          } -- ${JSON.stringify(data)}`;
          throw new Error(debugMsg);
        }
        
        if (data.error === 'Booking not found') {
          throw new Error(language === 'zh' 
            ? '预订不存在，请重新选择课程' 
            : 'Booking not found. Please select your class again.');
        }
        
        if (data.error === 'Booking is already paid') {
          throw new Error(language === 'zh' 
            ? '此预订已完成支付' 
            : 'This booking has already been paid.');
        }
        
        // Show more detailed error for debugging
        throw new Error(data.error || `Payment initialization failed (${response.status}). Please try again.`);
      }

      if (!data.clientSecret) {
        throw new Error(language === 'zh' 
          ? '支付初始化失败，请重试' 
          : 'Failed to initialize payment. Please try again.');
      }

      setClientSecret(data.clientSecret);
      setBookingData({
        bookingId,
        amount: data.amount,
        className: data.className || className,
        classDate: data.classDate || classDate,
        classTime: data.classTime || classTime,
        location: data.location || location,
      });
    } catch (err) {
      console.error('Error fetching client secret:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createAdHocPaymentIntent = async (dates = [], couponCode = null, classDetails = {}) => {
    try {
      setIsLoading(true);
      
      // Debug: Log the params we're working with
      const { amount: classAmount, className: classClassName, classTime: classClassTime, location: classLocation } = classDetails;
      
      console.log('Creating ad-hoc payment intent with:', {
        amount: classAmount,
        className: classClassName,
        classDate,
        classTime: classClassTime,
        location: classLocation,
        dates,
        couponCode,
        notes
      });
      if (!classAmount || !classClassName || isNaN(parseFloat(classAmount))) {
        console.error('Ad-hoc booking parameters appear invalid:', {
          classAmount,
          classClassName,
          parsedAmount: parseFloat(classAmount)
        });
      }
      
      // For ad-hoc bookings (not yet created in database), create a payment intent directly
      const requestBody = {
        amount: parseFloat(classAmount),
        className: classClassName,
        classTime: classClassTime,
        location: classLocation,
      };
      
      // Add single date or multiple dates
      if (dates && dates.length > 0) {
        if (dates.length === 1) {
          requestBody.classDate = dates[0];
        } else {
          requestBody.selectedDates = dates;
        }
      }
      
      // Add coupon if applied
      if (couponCode) {
        requestBody.couponCode = couponCode;
      }
      
      // Add notes if provided
      if (notes) {
        requestBody.notes = notes;
      }
      
      console.log('Sending request body to API:', requestBody);
      if (!requestBody.amount || !requestBody.className || isNaN(requestBody.amount)) {
        console.error('Request body is missing required fields before API call', requestBody);
        throw new Error(`Local error: invalid booking parameters ${JSON.stringify(requestBody)}`);
      }
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log('API response for ad-hoc:', { status: response.status, data });

      if (!response.ok) {
        // Handle specific error cases with more detail
        console.error('API error response for ad-hoc:', data);
        
        if (data.code === 'NO_SESSION' || data.error?.includes('Unauthorized')) {
          throw new Error(language === 'zh' 
            ? '请先登录后再进行支付' 
            : 'Please sign in to complete payment. Redirecting to login...');
        }
        
        if (data.error === 'Booking ID or booking details are required' || data.code === 'MISSING_FIELDS') {
          const debugMsg = `${
            language === 'zh' 
              ? '预订信息无效，请重新选择课程' 
              : 'Invalid booking information. Please select your class again.'
          } -- ${JSON.stringify(data)}`;
          throw new Error(debugMsg);
        }
        
        // Show more detailed error for debugging
        throw new Error(data.error || `Payment initialization failed (${response.status}). Please try again.`);
      }

      if (!data.clientSecret) {
        throw new Error(language === 'zh' 
          ? '支付初始化失败，请重试' 
          : 'Failed to initialize payment. Please try again.');
      }

      setClientSecret(data.clientSecret);
      
      // Update booking data with returned info (handle both single and multi-date)
      setBookingData(prev => ({ 
        ...prev, 
        bookingId: data.bookingId || data.primaryBookingId,
        bookingIds: data.bookingIds,
        classDate: data.classDate || classDate,
        selectedDates: data.selectedDates || dates
      }));
    } catch (err) {
      console.error('Error creating ad-hoc payment intent:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    // Show success message briefly before redirecting (give user time to see the success message)
    // The PaymentForm component already shows "Payment Successful!" - we add delay here
    // so user can see it before redirecting
    
    // Use ref to get the latest bookingData (state may not be updated yet)
    const currentBookingData = bookingDataRef.current;
    
    const params = new URLSearchParams();
    
    // Handle both single and multi-date bookings
    if (currentBookingData?.bookingIds && currentBookingData.bookingIds.length > 0) {
      params.set('booking_ids', currentBookingData.bookingIds.join(','));
    } else if (currentBookingData?.bookingId) {
      params.set('booking_id', currentBookingData.bookingId);
    }
    
    params.set('payment_intent', paymentIntent.id);
    params.set('payment_status', 'succeeded');
    
    // Delay redirect to let user see the success message
    setTimeout(() => {
      router.push(`/checkout/success?${params.toString()}`);
    }, 3000); // 3 seconds delay
  };

  const handlePaymentError = (errorMessage) => {
    // Check if it's a session expired error - try to refresh the client secret
    if (errorMessage === 'session_expired') {
      setError(language === 'zh' 
        ? '支付会话已过期，正在重新加载...' 
        : 'Payment session expired, reloading...');
      
      // Attempt to refresh the client secret
      if (bookingData?.bookingId) {
        fetchClientSecret();
      } else if (bookingData?.className && bookingData?.amount) {
        // For ad-hoc bookings, recreate the payment intent
        createAdHocPaymentIntent(
          bookingData.selectedDates || [], 
          bookingData.couponCode
        );
      } else {
        // Can't refresh - redirect to try again
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } else {
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-glow-cyan animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium text-foreground mb-2">
            {language === 'zh' ? '加载中...' : 'Loading...'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'zh' ? '正在初始化支付' : 'Initializing payment'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-4 p-6 rounded-3xl bg-card border border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-foreground text-center mb-2">
            {language === 'zh' ? '支付错误' : 'Payment Error'}
          </h2>
          <p className="text-muted-foreground text-center mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 
                     text-glow-cyan font-medium hover:bg-glow-cyan/30 transition-colors"
          >
            {language === 'zh' ? '返回' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-glow-cyan 
                   transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'zh' ? '返回' : 'Go Back'}
        </button>

        {/* Booking Summary */}
        <div className="p-6 rounded-3xl bg-card border border-glow-cyan/30 mb-6">
          <h1 className="text-2xl font-display text-glow-cyan mb-4">
            {language === 'zh' ? '确认支付' : 'Complete Payment'}
          </h1>
          
          {bookingData && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-glow-cyan" />
                <span className="font-medium text-foreground">
                  {bookingData.className}
                </span>
              </div>
              
              {bookingData.classDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(bookingData.classDate).toLocaleDateString('en-NZ', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  {bookingData.classTime && ` at ${bookingData.classTime}`}
                </div>
              )}
              
              {bookingData.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {bookingData.location}
                </div>
              )}
              
              <div className="pt-3 mt-3 border-t border-glow-cyan/20 flex items-center justify-between">
                <span className="text-muted-foreground">
                  {language === 'zh' ? '应付金额' : 'Total'}
                </span>
                <span className="text-3xl font-display text-glow-cyan">
                  ${bookingData.amount?.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <div className="p-6 rounded-3xl bg-card border border-glow-cyan/30">
          <h2 className="text-lg font-medium text-foreground mb-4">
            {language === 'zh' ? '支付详情' : 'Payment Details'}
          </h2>
          
          <PaymentForm
            clientSecret={clientSecret}
            amount={bookingData?.amount || 0}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            language={language}
          />
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          {language === 'zh' 
            ? '如需帮助，请联系我们'
            : 'Need help? Contact us if you have any questions'}
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-glow-cyan animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
