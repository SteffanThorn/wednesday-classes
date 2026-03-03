'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

// Initialize Stripe with publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Debug: log publishable key prefix to detect environment mismatches
if (stripePublishableKey) {
  console.log('Stripe publishable key prefix (module load):', stripePublishableKey.substring(0, 8));
} else {
  console.log('Stripe publishable key missing');
}

// Only log warning if keys are missing (not during initial load when env vars might not be ready)
// This is expected behavior during SSR - keys will be available on client
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

/**
 * PaymentFormInner - The actual payment form component
 * This component uses Stripe Elements to collect card details
 */
function PaymentFormInner({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError, 
  className = '',
  language = 'en'
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  // Card element styling options
  const cardStyle = {
    base: {
      color: '#e2e8f0',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#64748b',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe or Elements not available');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    // Debug: Log the clientSecret being used
    console.log('Confirming payment with clientSecret:', clientSecret?.substring(0, 30) + '...');

    // Confirm the payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    console.log('Payment confirmation result:', { stripeError, paymentIntent });

    if (stripeError) {
      // Handle specific error cases
      console.error('Stripe error:', stripeError.code, stripeError.message);
      
      // Handle payment intent not found / invalid
      if (stripeError.code === 'resource_missing' || 
          stripeError.code === 'payment_intent_invalid' ||
          stripeError.message?.includes('No such payment_intent') ||
          stripeError.message?.includes('Payment Intent')) {
        // This usually means:
        // 1. Payment intent expired (30 min timeout)
        // 2. Keys mismatch between create and confirm
        // 3. Payment intent was never created properly
        
        setError(language === 'zh' 
          ? '支付会话无效或已过期，请刷新页面重试。如果问题持续，请重新选择课程。' 
          : 'Payment session is invalid or expired. Please refresh the page and try again. If the problem persists, please select your class again.');
        
        if (onError) onError('session_expired');
      } else if (stripeError.code === 'card_declined') {
        setError(language === 'zh' 
          ? '您的卡被拒绝，请尝试其他支付方式' 
          : 'Your card was declined. Please try a different payment method.');
        if (onError) onError('card_declined');
      } else if (stripeError.code === 'expired_card') {
        setError(language === 'zh' 
          ? '您的卡已过期，请尝试其他卡' 
          : 'Your card has expired. Please try a different card.');
        if (onError) onError('expired_card');
      } else {
        setError(stripeError.message);
        if (onError) onError(stripeError.message);
      }
      setIsProcessing(false);
    } else if (paymentIntent) {
      setSucceeded(true);
      setIsProcessing(false);
      if (onSuccess) onSuccess(paymentIntent);
    }
  };

  if (succeeded) {
    return (
      <div className={`p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center ${className}`}>
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-green-400 mb-2">
          {language === 'zh' ? '支付成功！' : 'Payment Successful!'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'zh' 
            ? '正在跳转到成功页面...' 
            : 'Redirecting to success page...'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Card Element */}
      <div className="p-4 rounded-xl bg-card/50 border border-glow-cyan/20">
        <CardElement 
          options={{
            style: cardStyle,
            hidePostalCode: true,
          }}
          className="p-2"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 px-6 rounded-xl font-medium text-lg transition-all duration-300
                 bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {language === 'zh' ? '处理中...' : 'Processing...'}
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {language === 'zh' 
              ? `支付 $${amount.toFixed(2)}` 
              : `Pay $${amount.toFixed(2)}`}
          </>
        )}
      </button>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
        <Lock className="w-3 h-3" />
        {language === 'zh' 
          ? '安全支付由Stripe提供支持' 
          : 'Secure payment powered by Stripe'}
      </div>
    </form>
  );
}

/**
 * PaymentForm - Wrapper component that provides Stripe context
 */
export default function PaymentForm({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError,
  className,
  language = 'en'
}) {
  // Validate clientSecret format (should be pi_xxx_secret_xxx)
  const isValidClientSecret = clientSecret && 
    typeof clientSecret === 'string' && 
    clientSecret.startsWith('pi_') && 
    clientSecret.includes('_secret_');

  // Check if Stripe is available
  if (!stripePromise) {
    return (
      <div className={`p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-400 mb-2">
          {language === 'zh' ? '支付配置错误' : 'Payment Configuration Error'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'zh' 
            ? 'Stripe未正确配置，请联系管理员' 
            : 'Stripe is not properly configured. Please contact the administrator.'}
        </p>
      </div>
    );
  }

  if (!clientSecret || !isValidClientSecret) {
    return (
      <div className={`p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-yellow-400 mb-2">
          {language === 'zh' ? '加载中...' : 'Loading payment form...'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'zh' 
            ? '请稍候' 
            : 'Please wait'}
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner 
        clientSecret={clientSecret}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        className={className}
        language={language}
      />
    </Elements>
  );
}

