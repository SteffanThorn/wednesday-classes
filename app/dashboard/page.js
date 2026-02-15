'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { Calendar, Clock, MapPin, CreditCard, User, Mail, LogOut, ChevronRight, CheckCircle, XCircle, Wallet, X } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to avoid session issues during build
export const dynamic = 'force-dynamic';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellationOptions, setCancellationOptions] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = async (bookingId) => {
    try {
      const response = await fetch("/api/bookings/cancel-update?id=" + bookingId, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCancellationOptions(data);
        setCancellingId(bookingId);
        setShowCancelModal(true);
      } else {
        alert('Failed to get cancellation options');
      }
    } catch (error) {
      console.error('Error getting cancellation options:', error);
    }
  };

  const handleConfirmCancellation = async (cancellationType) => {
    if (!cancellingId || !cancellationType) return;
    
    try {
      const response = await fetch('/api/bookings/cancel-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: cancellingId,
          cancellationType,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setShowCancelModal(false);
        setCancellingId(null);
        setCancellationOptions(null);
        fetchBookings();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-3 text-glow-cyan">
              <span className="w-8 h-8 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const upcomingBookings = bookings.filter(b => { 
    const classDate = new Date(b.classDate); 
    const now = new Date(); 
    const isUpcoming = classDate >= now; 
    const isNotCancelled = b.status !== 'cancelled'; 
    const isPaymentFailed = b.paymentStatus === 'failed'; 
    return isUpcoming && (isNotCancelled || isPaymentFailed);
  });

  const pastBookings = bookings.filter(b => 
    new Date(b.classDate) < new Date() || b.status === 'cancelled'
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        <section className="px-6 pt-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                            flex items-center justify-center border border-glow-cyan/30 box-glow">
                <User className="w-8 h-8 text-glow-cyan" />
              </div>
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-light text-glow-subtle">
                  Welcome, {session.user.name}
                </h1>
                <p className="text-muted-foreground">
                  Manage your yoga journey
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4 animate-fade-in-up animation-delay-200">
              <Link 
                href="/wednesday-classes"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">Book a Class</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>
              
              <Link 
                href="/first-class"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">First Class Offer</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">Sign Out</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </button>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/60 border border-glow-cyan/20 rounded-3xl p-6 animate-fade-in-up animation-delay-200">
              <h2 className="font-display text-xl text-foreground mb-4">Profile Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-glow-cyan" />
                  <span className="text-muted-foreground">{session.user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {upcomingBookings.length > 0 ? (
          <section className="px-6 pb-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 animate-fade-in-up">
                <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                  Upcoming Classes
                </h2>
              </div>
              
              <div className="space-y-4">
                {upcomingBookings.map((booking, index) => (
                  <div 
                    key={booking._id}
                    className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                             hover:border-glow-cyan/40 transition-all duration-500
                             animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-glow-cyan/20 text-glow-cyan' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === 'paid' || booking.paymentStatus === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : booking.paymentStatus === 'failed'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {booking.paymentStatus === 'paid' || booking.paymentStatus === 'completed' ? 'Paid' : 
                             booking.paymentStatus === 'failed' ? 'Payment Failed' : 'Payment Pending'}
                          </span>
                        </div>
                        <h3 className="font-display text-xl text-foreground mb-2">
                          {booking.className}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.classDate).toLocaleDateString('en-NZ', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.classTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl text-glow-cyan">
                          ${booking.amount}
                        </div>
                        <button 
                          onClick={() => handleCancelClick(booking._id)}
                          className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="px-6 pb-12">
            <div className="max-w-4xl mx-auto text-center">
              <div className="p-8 rounded-3xl bg-card/60 border border-glow-cyan/20">
                <Calendar className="w-12 h-12 text-glow-cyan mx-auto mb-4" />
                <h3 className="font-display text-xl text-foreground mb-2">
                  No Upcoming Bookings
                </h3>
                <p className="text-muted-foreground mb-6">
                  You haven&apos;t booked any classes yet. Start your yoga journey today!
                </p>
                <Link 
                  href="/wednesday-classes"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-glow-cyan/20 
                           border border-glow-cyan/40 text-glow-cyan font-medium 
                           hover:bg-glow-cyan/30 hover:box-glow transition-all duration-300"
                >
                  Book Your First Class
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {pastBookings.length > 0 && (
          <section className="px-6 pb-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl md:text-3xl font-light text-glow-subtle mb-4">
                  Past Classes
                </h2>
              </div>
              
              <div className="space-y-3 opacity-60">
                {pastBookings.slice(0, 5).map((booking) => (
                  <div 
                    key={booking._id}
                    className="p-4 rounded-2xl border border-glow-cyan/10 bg-card/40"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{booking.className}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.classDate).toLocaleDateString('en-NZ')}
                        </p>
                      </div>
                      {booking.status === 'cancelled' ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <footer className="relative z-10 py-12 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 INNER LIGHT · Auckland, New Zealand
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              Breathe deeply. Move gently. Live fully.
            </p>
          </div>
        </footer>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && cancellationOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative w-full max-w-md mx-4 bg-card border border-glow-cyan/30 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-glow-cyan/20 flex items-center justify-between">
              <h2 className="text-xl font-display text-glow-cyan">Cancel Booking</h2>
              <button onClick={() => setShowCancelModal(false)} className="p-2 rounded-full hover:bg-glow-cyan/10">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-glow-cyan/5 border border-glow-cyan/20">
                <p className="font-medium text-foreground">{cancellationOptions.className}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(cancellationOptions.classDate).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-sm text-glow-cyan mt-1">Original: ${cancellationOptions.originalAmount}</p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Time until class: {cancellationOptions.hoursUntilClass < 24 
                  ? `${Math.round(cancellationOptions.hoursUntilClass)} hours` 
                  : 'More than 24 hours'}
              </p>
              
              <div className="space-y-3">
                <p className="font-medium text-foreground">Choose your cancellation option:</p>
                {cancellationOptions.options.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleConfirmCancellation(option.type)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      option.type === 'credit' 
                        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                        : 'bg-glow-cyan/10 border-glow-cyan/30 hover:bg-glow-cyan/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${option.type === 'credit' ? 'text-green-400' : 'text-glow-cyan'}`}>
                          {option.label}
                        </p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {option.type === 'credit' && <Wallet className="w-5 h-5 text-green-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
