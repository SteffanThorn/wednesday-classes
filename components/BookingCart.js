'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import styles from './BookingCart.module.css';

export default function BookingCart({ 
  selectedClasses = [], 
  onRemoveClass,
  onClearCart,
  onCheckout 
}) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate totals
  const subtotal = selectedClasses.reduce((sum, cls) => sum + cls.amount, 0);
  const classCount = selectedClasses.length;
  const freeClassThreshold = 5; // Buy 5, get 1 free
  const bonusClasses = Math.floor(classCount / freeClassThreshold);
  
  const effectiveCount = classCount + bonusClasses;
  const averagePrice = classCount > 0 ? subtotal / effectiveCount : 0;

  const handleCheckout = async () => {
    if (status === 'loading') return;
    
    if (!session) {
      // Prompt user to sign in
      signIn();
      return;
    }

    if (selectedClasses.length === 0) {
      setError('Please select at least one class');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCheckout();
    } catch (err) {
      setError(err.message || 'Failed to process checkout');
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedClasses.length === 0) {
    return null;
  }

  return (
    <div className={styles.cart}>
      <div className={styles.header}>
        <h2>Your Cart</h2>
        <span className={styles.count}>{classCount} class{classCount !== 1 ? 'es' : ''}</span>
      </div>

      {/* Cart Items */}
      <div className={styles.items}>
        {selectedClasses.map((cls, index) => (
          <div key={cls.id || index} className={styles.item}>
            <div className={styles.itemInfo}>
              <h3>{cls.className}</h3>
              <p>{cls.date} at {cls.time}</p>
              <p className={styles.location}>{cls.location}</p>
            </div>
            <div className={styles.itemPrice}>
              ${cls.amount.toFixed(2)}
            </div>
            {onRemoveClass && (
              <button
                className={styles.removeButton}
                onClick={() => onRemoveClass(index)}
                aria-label="Remove class"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bulk Discount Info */}
      {classCount >= freeClassThreshold && (
        <div className={styles.discountBadge}>
          🎉 You&apos;ll get {bonusClasses} bonus class{bonusClasses !== 1 ? 'es' : ''} free!
        </div>
      )}

      {/* Totals */}
      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Subtotal ({classCount} class{classCount !== 1 ? 'es' : ''})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {bonusClasses > 0 && (
          <div className={styles.totalRow}>
            <span>Bonus class{bonusClasses !== 1 ? 'es' : ''} (Buy {freeClassThreshold}, Get 1 Free)</span>
            <span className={styles.free}>FREE</span>
          </div>
        )}
        
        <div className={styles.totalRow}>
          <span className={styles.grandTotal}>Total</span>
          <span className={styles.grandTotal}>${subtotal.toFixed(2)}</span>
        </div>
        
        {classCount > 1 && (
          <div className={styles.averagePrice}>
            (${averagePrice.toFixed(2)} per class on average)
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {onClearCart && (
          <button
            className={styles.clearButton}
            onClick={onClearCart}
            disabled={isLoading}
          >
            Clear Cart
          </button>
        )}
        
        <button
          className={styles.checkoutButton}
          onClick={handleCheckout}
          disabled={isLoading || status === 'loading'}
        >
          {isLoading ? (
            <span className={styles.spinner}>Processing...</span>
          ) : (
            <>
              {session ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* Trust Badges */}
      <div className={styles.trustBadges}>
        <span>🔒 Secure Payment</span>
        <span>✓ Instant Confirmation</span>
      </div>
    </div>
  );
}

// Hook for managing booking cart state
export function useBookingCart() {
  const [selectedClasses, setSelectedClasses] = useState([]);

  const addClass = (classInfo) => {
    // Check if already in cart
    const isAlreadyAdded = selectedClasses.some(
      cls => cls.id === classInfo.id || 
        (cls.date === classInfo.date && cls.time === classInfo.time)
    );

    if (!isAlreadyAdded) {
      setSelectedClasses([...selectedClasses, classInfo]);
    }
  };

  const removeClass = (index) => {
    setSelectedClasses(selectedClasses.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setSelectedClasses([]);
  };

  const isInCart = (classId) => {
    return selectedClasses.some(cls => cls.id === classId);
  };

  const getTotal = () => {
    return selectedClasses.reduce((sum, cls) => sum + cls.amount, 0);
  };

  return {
    selectedClasses,
    addClass,
    removeClass,
    clearCart,
    isInCart,
    getTotal,
    classCount: selectedClasses.length,
  };
}

