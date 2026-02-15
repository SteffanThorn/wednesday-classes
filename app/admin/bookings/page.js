'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Calendar, Clock, MapPin, CreditCard, User, Mail, Search, Filter, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [weeklyCapacity, setWeeklyCapacity] = useState([]);
  const [maxStudentsPerClass, setMaxStudentsPerClass] = useState(10);
  const [showWeeklyView, setShowWeeklyView] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchBookings();
      }
    }
  }, [status, session, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        setWeeklyCapacity(data.weeklyCapacity || []);
        setMaxStudentsPerClass(data.maxStudentsPerClass || 10);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.className?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Class', 'Time', 'Location', 'Amount', 'Status', 'Payment'];
    const rows = filteredBookings.map(b => [
      new Date(b.classDate).toLocaleDateString(),
      b.userName,
      b.userEmail,
      b.className,
      b.classTime,
      b.location,
      b.amount,
      b.status,
      b.paymentStatus
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

  // Stats - show only confirmed (booked) and pending
  const confirmedBookings = bookings.filter(b => 
    (b.status === 'confirmed') || 
    (b.paymentStatus === 'completed' || b.paymentStatus === 'paid')
  ).length;
  const pendingBookings = bookings.filter(b => 
    b.status === 'pending' || b.paymentStatus === 'processing'
  ).length;

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
                  Booking Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  View and manage all class bookings
                </p>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 
                         text-glow-cyan hover:bg-glow-cyan/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-card/60 border border-glow-cyan/20">
                <div className="text-2xl font-bold text-glow-cyan">{confirmedBookings}</div>
                <div className="text-sm text-muted-foreground">bookings</div>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">{pendingBookings}</div>
                <div className="text-sm text-muted-foreground">pending</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 
                           focus:border-glow-cyan/50 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="booked">Booked</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Payment Failed</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWeeklyView(true)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    showWeeklyView 
                      ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan' 
                      : 'bg-card/60 border border-glow-cyan/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Weekly Capacity
                </button>
                <button
                  onClick={() => setShowWeeklyView(false)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    !showWeeklyView 
                      ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan' 
                      : 'bg-card/60 border border-glow-cyan/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Bookings
                </button>
              </div>
            </div>

            {/* Weekly Capacity View */}
            {showWeeklyView && (
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-foreground">Weekly Class Capacity</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Wednesday Classes at 6pm • Max {maxStudentsPerClass} students per class
                </p>
                
                {weeklyCapacity.length === 0 ? (
                  <div className="p-8 rounded-xl bg-card/60 border border-glow-cyan/20 text-center">
                    <p className="text-muted-foreground">No bookings yet</p>
                  </div>
                ) : (
                  weeklyCapacity.map((week, index) => {
                    // Only show booked count in the main number (not pending)
                    const bookedOnly = week.bookedCount;
                    const percentage = (bookedOnly / week.maxStudents) * 100;
                    const isFull = bookedOnly >= week.maxStudents;
                    const isAlmostFull = percentage >= 70;
                    
                    // Format single date instead of week range
                    const singleDate = new Date(week.weekStart).toLocaleDateString('en-NZ', { 
                      day: 'numeric', 
                      month: 'short' 
                    });
                    
                    return (
                      <div 
                        key={index} 
                        className="p-4 rounded-xl bg-card/60 border border-glow-cyan/20"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{singleDate}</h3>
                          </div>
                          <div className="text-right">
                            <span className={`text-2xl font-bold ${
                              isFull ? 'text-red-400' : isAlmostFull ? 'text-yellow-400' : 'text-glow-cyan'
                            }`}>
                              {bookedOnly}
                            </span>
                            <span className="text-muted-foreground"> / {week.maxStudents}</span>
                            <p className="text-xs text-muted-foreground">
                              {week.bookedCount} booked, {week.pendingCount} pending
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-3 bg-card rounded-full overflow-hidden mb-3">
                          <div 
                            className={`h-full transition-all ${
                              isFull ? 'bg-red-500' : isAlmostFull ? 'bg-yellow-500' : 'bg-glow-cyan'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        {/* Student List - Separate sections for booked and pending */}
                        {week.students.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-glow-cyan/10">
                            {/* Booked Students */}
                            {week.bookedCount > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-muted-foreground mb-2">Students booked:</p>
                                <div className="flex flex-wrap gap-2">
                                  {week.students
                                    .filter(s => s.status === 'booked' || s.paymentStatus === 'completed' || s.paymentStatus === 'paid')
                                    .map((student, idx) => (
                                      <span 
                                        key={`booked-${idx}`}
                                        className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400"
                                      >
                                        {student.name}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Pending Students */}
                            {week.pendingCount > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Students pending:</p>
                                <div className="flex flex-wrap gap-2">
                                  {week.students
                                    .filter(s => s.status === 'pending' || s.paymentStatus === 'processing')
                                    .map((student, idx) => (
                                      <span 
                                        key={`pending-${idx}`}
                                        className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400"
                                      >
                                        {student.name}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {isFull && (
                          <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            ⚠️ Class is full
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Bookings Table - Hidden when in weekly view */}
            {!showWeeklyView && (
            <div className="overflow-x-auto rounded-xl bg-card/60 border border-glow-cyan/20">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-glow-cyan/20">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Class</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Location</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-glow-cyan/10 hover:bg-glow-cyan/5">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{booking.userName}</div>
                          <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-foreground">{booking.className}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-foreground">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(booking.classDate).toLocaleDateString('en-NZ')}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {booking.classTime}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-foreground">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {booking.location}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-glow-cyan">${booking.amount}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {booking.status === 'confirmed' && (booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid') ? 'booked' : booking.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                            booking.paymentStatus === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                            booking.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            booking.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {booking.paymentStatus === 'failed' ? 'Payment Failed' : booking.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
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

