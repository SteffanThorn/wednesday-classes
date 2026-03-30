'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Calendar, Clock, MapPin, Search, Loader2, Download } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminBookingsPage() {
  const { language, mounted } = useLanguage();
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
  const [showAttendanceView, setShowAttendanceView] = useState(false);
  const [showIntakeView, setShowIntakeView] = useState(false);
  const [intakeForms, setIntakeForms] = useState([]);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState(null);
  const [attendanceSessions, setAttendanceSessions] = useState([]);
  const [selectedAttendanceSession, setSelectedAttendanceSession] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [selectedBookedStudent, setSelectedBookedStudent] = useState('');
  const [selectedWalkInStudent, setSelectedWalkInStudent] = useState('');
  const [customerLookupTerm, setCustomerLookupTerm] = useState('');
  const [customerLookupPool, setCustomerLookupPool] = useState([]);
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [bookingCustomerId, setBookingCustomerId] = useState('');
  const [assistedBookingLoading, setAssistedBookingLoading] = useState(false);
  const isZh = language !== 'en';
  const txt = (zh, en) => (isZh ? zh : en);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchBookings();
        fetchAttendanceData();
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (showAttendanceView && customerLookupPool.length === 0) {
      fetchCustomerLookupPool();
    }
  }, [showAttendanceView]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin' && customerLookupPool.length === 0) {
      fetchCustomerLookupPool();
    }
  }, [status, session]);

  const fetchCustomerLookupPool = async () => {
    try {
      setCustomerLookupLoading(true);
      const response = await fetch('/api/admin/customers');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load customers');
      setCustomerLookupPool(data.customers || []);
    } catch (error) {
      console.error('Error loading customers for quick lookup:', error);
      setAttendanceError(error.message || 'Failed to load customer lookup data');
    } finally {
      setCustomerLookupLoading(false);
    }
  };

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

  const fetchIntakeForms = async () => {
    try {
      setIntakeLoading(true);
      const res = await fetch('/api/admin/intake');
      const data = await res.json();
      if (res.ok) setIntakeForms(data.intakes || []);
    } catch (err) {
      console.error('Error fetching intake forms:', err);
    } finally {
      setIntakeLoading(false);
    }
  };

  const fetchAttendanceData = async (sessionKey = '') => {    try {
      setAttendanceLoading(true);
      setAttendanceError('');

      let url = '/api/admin/attendance';
      if (sessionKey && sessionKey.includes('|')) {
        const [classDate, classTime] = sessionKey.split('|');
        url += `?classDate=${encodeURIComponent(classDate)}&classTime=${encodeURIComponent(classTime)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch attendance data');
      }

      setAttendanceSessions(data.classSessions || []);
      setAttendanceRecords(data.attendance || []);
      setAttendanceStudents(data.students || []);

      if (data.selectedSession?.key) {
        setSelectedAttendanceSession(data.selectedSession.key);
      } else if (data.classSessions?.length > 0 && !selectedAttendanceSession) {
        setSelectedAttendanceSession(data.classSessions[0].key);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceError(error.message || 'Failed to fetch attendance data');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleMarkAttendance = async ({ studentEmail, bookingId = '' }) => {
    if (!selectedAttendanceSession || !studentEmail) return;

    const [classDate, classTime] = selectedAttendanceSession.split('|');
    const selectedSession = attendanceSessions.find((s) => s.key === selectedAttendanceSession);

    if (!selectedSession) return;

    setAttendanceMessage('');
    setAttendanceError('');

    try {
      const response = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classDate,
          classTime,
          className: selectedSession.className,
          location: selectedSession.location,
          studentEmail,
          bookingId: bookingId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to mark attendance';
        const isDuplicateAttendance =
          response.status === 400 &&
          typeof errorMessage === 'string' &&
          errorMessage.toLowerCase().includes('attendance already marked');

        if (isDuplicateAttendance) {
          setAttendanceError('');
          setAttendanceMessage(
            txt(
              '该学员本场次已经签到，无需重复操作。',
              'Attendance already marked for this student in this class session.'
            )
          );
          setSelectedWalkInStudent('');
          return;
        }

        throw new Error(errorMessage);
      }

      setAttendanceMessage(data.message || 'Attendance marked.');
      setSelectedBookedStudent('');
      setSelectedWalkInStudent('');
      await fetchAttendanceData(selectedAttendanceSession);
      await fetchBookings();
    } catch (error) {
      if (!(error?.message || '').toLowerCase().includes('attendance already marked')) {
        console.error('Error marking attendance:', error);
      }
      setAttendanceError(error.message || 'Failed to mark attendance');
    }
  };

  const handleMarkNoShow = async ({ studentEmail, bookingId = '' }) => {
    if (!selectedAttendanceSession || !studentEmail) return;

    const [classDate, classTime] = selectedAttendanceSession.split('|');
    const selectedSession = attendanceSessions.find((s) => s.key === selectedAttendanceSession);

    if (!selectedSession) return;

    setAttendanceMessage('');
    setAttendanceError('');

    try {
      const response = await fetch('/api/admin/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classDate,
          classTime,
          className: selectedSession.className,
          location: selectedSession.location,
          studentEmail,
          bookingId: bookingId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark no-show');
      }

      setAttendanceMessage(data.message || 'No-show marked.');
      setSelectedBookedStudent('');
      await fetchAttendanceData(selectedAttendanceSession);
      await fetchBookings();
    } catch (error) {
      console.error('Error marking no-show:', error);
      setAttendanceError(error.message || 'Failed to mark no-show');
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
    const headers = ['Date', 'Name', 'Email', 'Class', 'Time', 'Location', 'Amount', 'Status', 'Payment', 'Bring a Friend', 'Friend Confirmed'];
    const rows = filteredBookings.map(b => [
      new Date(b.classDate).toLocaleDateString(),
      b.userName,
      b.userEmail,
      b.className,
      b.classTime,
      b.location,
      b.amount,
      b.status,
      b.paymentStatus,
      b.bringAFriend ? 'yes' : 'no',
      b.bringAFriendConfirmed ? 'yes' : 'no'
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

  const selectedSessionData = attendanceSessions.find(s => s.key === selectedAttendanceSession) || null;
  const attendedEmails = new Set((attendanceRecords || []).map(a => a.userEmail));
  const availableBookedStudents = (selectedSessionData?.bookings || []).filter(
    b => !attendedEmails.has(b.userEmail)
  );
  const filteredCustomerLookup = customerLookupTerm.trim()
    ? customerLookupPool
        .filter((customer) => {
          const term = customerLookupTerm.toLowerCase().trim();
          return (
            customer.userName?.toLowerCase().includes(term) ||
            customer.userEmail?.toLowerCase().includes(term) ||
            customer.phone?.toLowerCase().includes(term)
          );
        })
        .slice(0, 8)
    : [];

  const globalMatchedCustomers = searchTerm.trim()
    ? customerLookupPool
        .filter((customer) => {
          const term = searchTerm.toLowerCase().trim();
          return (
            customer.userName?.toLowerCase().includes(term) ||
            customer.userEmail?.toLowerCase().includes(term) ||
            customer.phone?.toLowerCase().includes(term)
          );
        })
        .slice(0, 5)
    : [];

  const customerByEmail = new Map(
    (customerLookupPool || []).map((customer) => [
      (customer.userEmail || '').toLowerCase().trim(),
      customer,
    ])
  );

  const handleOpenCustomerProfile = (customer) => {
    if (!customer?.id) return;

    if (!selectedSessionData || !selectedAttendanceSession) {
      router.push(`/admin/customers/${customer.id}`);
      return;
    }

    const [classDate, classTime] = selectedAttendanceSession.split('|');
    const params = new URLSearchParams({
      classDate,
      classTime,
      className: selectedSessionData.className || '',
      location: selectedSessionData.location || '',
      source: 'bookings',
    });

    router.push(`/admin/customers/${customer.id}?${params.toString()}`);
  };

  const handleOpenBookingHomepage = () => {
    const params = new URLSearchParams({ fromAdmin: '1' });

    if (selectedAttendanceSession) {
      const [classDate, classTime] = selectedAttendanceSession.split('|');
      params.set('classDate', classDate || '');
      params.set('classTime', classTime || '');
    }

    window.open(`/wednesday-classes?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const handleGoToAssistedBookingPanel = (customer) => {
    setShowWeeklyView(false);
    setShowAttendanceView(true);
    setShowIntakeView(false);
    setCustomerLookupTerm(customer?.userEmail || customer?.userName || '');

    setTimeout(() => {
      const el = document.getElementById('quick-customer-lookup-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  const handleCreateAssistedBooking = async (customer, options = {}) => {
    const { sendEmail = true } = options;

    if (!selectedSessionData || !selectedAttendanceSession) {
      setAttendanceError(txt('请先选择课程场次。', 'Please select a class session first.'));
      return;
    }

    const existingBooking = (selectedSessionData.bookings || []).find(
      (b) => (b.userEmail || '').toLowerCase().trim() === (customer.userEmail || '').toLowerCase().trim()
    );

    if (existingBooking) {
      setAttendanceError('');
      setAttendanceMessage(
        txt('该会员已预约本场次，无需重复预约。请在下方“已预约学员”中点击“确认到课”签到。', 'This member is already booked for this session. No need to rebook; use Confirm Attended below under Booked Students.')
      );
      return;
    }

    const [classDate, classTime] = selectedAttendanceSession.split('|');
    const confirmed = window.confirm(
      txt(
        `确认给该会员预约此课程${sendEmail ? '并发送预约邮件' : '，且不发送预约邮件'}？\n\n${customer.userName} (${customer.userEmail})\n${selectedSessionData.className}\n${classDate} ${classTime}`,
        `Book this class for this member${sendEmail ? ' and send the booking email' : ' without sending the booking email'}?\n\n${customer.userName} (${customer.userEmail})\n${selectedSessionData.className}\n${classDate} ${classTime}`
      )
    );

    if (!confirmed) return;

    setAssistedBookingLoading(true);
    setBookingCustomerId(customer.id);
    setAttendanceError('');
    setAttendanceMessage('');

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: customer.id,
          userEmail: customer.userEmail,
          className: selectedSessionData.className,
          classDate,
          classTime,
          location: selectedSessionData.location || '',
          sendEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setAttendanceError('');
          setAttendanceMessage(
            txt('该会员已预约本场次，无需重复预约。请在下方“已预约学员”中点击“确认到课”签到。', 'This member is already booked for this session. No need to rebook; use Confirm Attended below under Booked Students.')
          );
          return;
        }
        throw new Error(data.error || 'Failed to create assisted booking');
      }

      setAttendanceMessage(
        txt(
          sendEmail
            ? `预约成功，邮件已发送。当前剩余课次：${data.remainingClassCredits}（到课时自动扣减）。`
            : `预约成功，未发送预约邮件。当前剩余课次：${data.remainingClassCredits}（到课时自动扣减）。`,
          sendEmail
            ? `Booking successful and confirmation email sent. Remaining credits: ${data.remainingClassCredits} (deducted when attendance is marked).`
            : `Booking successful without sending the booking email. Remaining credits: ${data.remainingClassCredits} (deducted when attendance is marked).`
        )
      );

      await fetchBookings();
      await fetchAttendanceData(selectedAttendanceSession);
    } catch (error) {
      console.error('Error creating assisted booking:', error);
      setAttendanceError(error.message || 'Failed to create assisted booking');
    } finally {
      setAssistedBookingLoading(false);
      setBookingCustomerId('');
    }
  };

  const getAttendanceSessionLabel = (sessionItem) => {
    if (!sessionItem) return '—';
    return isZh
      ? (sessionItem.labelZh || sessionItem.label || '—')
      : (sessionItem.labelEn || sessionItem.label || '—');
  };

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
                  {txt('预约管理', 'Booking Management')}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {txt('查看并管理所有课程预约', 'View and manage all class bookings')}
                </p>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 
                         text-glow-cyan hover:bg-glow-cyan/20 transition-all"
              >
                <Download className="w-4 h-4" />
                {txt('导出 CSV', 'Export CSV')}
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-card/60 border border-glow-cyan/20">
                <div className="text-2xl font-bold text-glow-cyan">{confirmedBookings}</div>
                <div className="text-sm text-muted-foreground">{txt('已预约', 'bookings')}</div>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">{pendingBookings}</div>
                <div className="text-sm text-muted-foreground">{txt('待处理', 'pending')}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={txt('按姓名、邮箱或课程搜索...', 'Search by name, email or class...')}
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
                  <option value="all">{txt('全部状态', 'All Status')}</option>
                  <option value="booked">{txt('已预约', 'Booked')}</option>
                  <option value="pending">{txt('待处理', 'Pending')}</option>
                  <option value="confirmed">{txt('已确认', 'Confirmed')}</option>
                  <option value="cancelled">{txt('已取消', 'Cancelled')}</option>
                  <option value="completed">{txt('已完成', 'Completed')}</option>
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                >
                  <option value="all">{txt('全部支付状态', 'All Payments')}</option>
                  <option value="pending">{txt('待支付', 'Pending')}</option>
                  <option value="processing">{txt('处理中', 'Processing')}</option>
                  <option value="completed">{txt('已支付', 'Completed')}</option>
                  <option value="failed">{txt('支付失败', 'Payment Failed')}</option>
                </select>
              </div>
            </div>

            {searchTerm.trim() && globalMatchedCustomers.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-card/60 border border-glow-cyan/20">
                <p className="text-sm text-muted-foreground mb-3">
                  {txt('找到匹配客户：可直接进入代预约流程。', 'Matched customers found: jump directly into assisted booking flow.')}
                </p>
                <div className="space-y-2">
                  {globalMatchedCustomers.map((customer) => (
                    <div key={`global-${customer.id}`} className="p-3 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <p className="text-sm text-foreground font-medium">{customer.userName}</p>
                      <p className="text-xs text-muted-foreground">{customer.userEmail}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone || '—'}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleGoToAssistedBookingPanel(customer)}
                          className="px-3 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-xs"
                        >
                          {txt('进入代预约面板', 'Open Assisted Booking Panel')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCustomerProfile(customer)}
                          className="px-3 py-1 rounded bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-colors text-xs"
                        >
                          {txt('查看客户信息', 'Open Customer Profile')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowWeeklyView(true);
                    setShowAttendanceView(false);
                    setShowIntakeView(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    showWeeklyView 
                      ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan' 
                      : 'bg-card/60 border border-glow-cyan/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {txt('每周容量', 'Weekly Capacity')}
                </button>
                <button
                  onClick={() => {
                    setShowWeeklyView(false);
                    setShowAttendanceView(false);
                    setShowIntakeView(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    !showWeeklyView && !showAttendanceView && !showIntakeView
                      ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan' 
                      : 'bg-card/60 border border-glow-cyan/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {txt('全部预约', 'All Bookings')}
                </button>
                <button
                  onClick={() => {
                    setShowWeeklyView(false);
                    setShowAttendanceView(true);
                    setShowIntakeView(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    showAttendanceView
                      ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan'
                      : 'bg-card/60 border border-glow-cyan/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {txt('出勤与课次', 'Attendance & Credits')}
                </button>
                <button
                  onClick={() => {
                    setShowWeeklyView(false);
                    setShowAttendanceView(false);
                    setShowIntakeView(true);
                    if (intakeForms.length === 0) fetchIntakeForms();
                  }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    showIntakeView
                      ? 'bg-glow-cyan/20 border border-glow-cyan/50 text-glow-cyan'
                      : 'bg-card/60 border border-glow-cyan/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {txt('学员表单', 'Student Forms')}
                </button>
              </div>
            </div>

            {/* Weekly Capacity View */}
            {showWeeklyView && (
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-foreground">{txt('每周课程容量', 'Weekly Class Capacity')}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {txt(`每周三 6pm 课程 • 每节最多 ${maxStudentsPerClass} 人`, `Wednesday Classes at 6pm • Max ${maxStudentsPerClass} students per class`)}
                </p>
                
                {weeklyCapacity.length === 0 ? (
                  <div className="p-8 rounded-xl bg-card/60 border border-glow-cyan/20 text-center">
                    <p className="text-muted-foreground">{txt('暂无预约', 'No bookings yet')}</p>
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
                                <p className="text-xs text-muted-foreground mb-2">{txt('已预约学员：', 'Students booked:')}</p>
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
                                <p className="text-xs text-muted-foreground mb-2">{txt('待确认学员：', 'Students pending:')}</p>
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
                            {txt('⚠️ 本节课程已满员', '⚠️ Class is full')}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Attendance & Credits View */}
            {showAttendanceView && (
              <div className="space-y-6 mb-8">
                <div className="p-6 rounded-xl bg-card/60 border border-glow-cyan/20">
                  <h2 className="text-xl font-semibold text-foreground mb-4">{txt('课程签到', 'Mark Class Attendance')}</h2>

                  {attendanceError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {attendanceError}
                    </div>
                  )}

                  {attendanceMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                      {attendanceMessage}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{txt('课程场次', 'Class Session')}</label>
                      <select
                        value={selectedAttendanceSession}
                        onChange={(e) => {
                          setSelectedAttendanceSession(e.target.value);
                          setSelectedBookedStudent('');
                          setSelectedWalkInStudent('');
                          fetchAttendanceData(e.target.value);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        disabled={attendanceLoading}
                      >
                        {attendanceSessions.length === 0 && <option value="">{txt('暂无可用场次', 'No sessions found')}</option>}
                        {attendanceSessions.map((s) => (
                          <option key={s.key} value={s.key}>{getAttendanceSessionLabel(s)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <p className="text-sm text-muted-foreground">{txt('当前选择课程', 'Selected class')}</p>
                      <p className="text-foreground font-medium">{selectedSessionData?.className || '—'}</p>
                      <p className="text-xs text-muted-foreground">{getAttendanceSessionLabel(selectedSessionData)}</p>
                      <p className="text-xs text-muted-foreground">{selectedSessionData?.location || ''}</p>
                    </div>
                  </div>

                  <div id="quick-customer-lookup-panel" className="mb-4 p-4 rounded-lg bg-card/40 border border-glow-cyan/10">
                    <h3 className="text-sm font-medium text-foreground mb-2">{txt('快速定位客户', 'Quick Customer Lookup')}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {txt('输入姓名、电话或邮箱，可直接跳转客户详情，或代客预约本次课程并自动发送确认邮件。', 'Search by name, phone, or email. Jump to customer profile or create an assisted booking with auto confirmation email.')}
                    </p>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleOpenBookingHomepage}
                        className="px-3 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-colors text-xs"
                      >
                        {txt('打开预约首页（现场协助）', 'Open Booking Homepage (Assist On-site)')}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customerLookupTerm}
                      onChange={(e) => setCustomerLookupTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredCustomerLookup.length > 0) {
                          e.preventDefault();
                          handleOpenCustomerProfile(filteredCustomerLookup[0]);
                        }
                      }}
                      placeholder={txt('按姓名 / 电话 / 邮箱搜索', 'Search by name / phone / email')}
                      className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                    />

                    {customerLookupLoading && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {txt('加载客户中...', 'Loading customers...')}
                      </div>
                    )}

                    {customerLookupTerm.trim() && !customerLookupLoading && (
                      <div className="mt-3 space-y-2">
                        {filteredCustomerLookup.length === 0 ? (
                          <p className="text-xs text-muted-foreground">{txt('未找到匹配客户。', 'No matched customer.')}</p>
                        ) : (
                          filteredCustomerLookup.map((customer) => {
                            const isAlreadyBooked = (selectedSessionData?.bookings || []).some(
                              (b) => (b.userEmail || '').toLowerCase().trim() === (customer.userEmail || '').toLowerCase().trim()
                            );

                            return (
                              <div
                                key={customer.id}
                                onClick={() => handleOpenCustomerProfile(customer)}
                                className="w-full text-left p-3 rounded-lg border border-glow-cyan/20 bg-card/50 hover:bg-glow-cyan/5 cursor-pointer"
                              >
                                <p className="text-sm text-foreground font-medium">{customer.userName}</p>
                                <p className="text-xs text-muted-foreground">{customer.userEmail}</p>
                                <p className="text-xs text-muted-foreground">{customer.phone || '—'}</p>
                                {isAlreadyBooked && (
                                  <p className="mt-1 text-xs text-green-400">
                                    {txt('该会员本场次已预约，请在下方“已预约学员”中点击“确认到课”。', 'Already booked for this session. Use Confirm Attended below under Booked Students.')}
                                  </p>
                                )}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCustomerProfile(customer);
                                    }}
                                    className="px-3 py-1 rounded bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-colors text-xs"
                                  >
                                    {txt('查看客户信息', 'Open Customer Profile')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateAssistedBooking(customer, { sendEmail: true });
                                    }}
                                    disabled={isAlreadyBooked || (assistedBookingLoading && bookingCustomerId === customer.id)}
                                    className="px-3 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-xs disabled:opacity-50"
                                  >
                                    {(assistedBookingLoading && bookingCustomerId === customer.id)
                                      ? txt('预约中...', 'Booking...')
                                      : txt('预约课程（发送邮件）', 'Book Class (Send Email)')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateAssistedBooking(customer, { sendEmail: false });
                                    }}
                                    disabled={isAlreadyBooked || (assistedBookingLoading && bookingCustomerId === customer.id)}
                                    className="px-3 py-1 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 transition-colors text-xs disabled:opacity-50"
                                  >
                                    {(assistedBookingLoading && bookingCustomerId === customer.id)
                                      ? txt('预约中...', 'Booking...')
                                      : txt('预约课程（不发送预约邮件）', 'Book Class (No Email)')}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <h3 className="text-sm font-medium text-foreground mb-2">{txt('已预约学员', 'Booked Students')}</h3>
                      <div className="space-y-2">
                        <select
                          value={selectedBookedStudent}
                          onChange={(e) => setSelectedBookedStudent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        >
                          <option value="">{txt('请选择已预约学员', 'Select a booked student')}</option>
                          {availableBookedStudents.map((b) => (
                            <option key={b.bookingId} value={`${b.userEmail}|${b.bookingId}`}>
                              {b.userName} ({b.userEmail})
                            </option>
                          ))}
                        </select>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              if (!selectedBookedStudent) return;
                              const [email, bookingId] = selectedBookedStudent.split('|');
                              handleMarkAttendance({ studentEmail: email, bookingId });
                            }}
                            disabled={!selectedBookedStudent || !selectedAttendanceSession}
                            className="w-full px-3 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {txt('确认到课', 'Confirm Attended')}
                          </button>
                          <button
                            onClick={() => {
                              if (!selectedBookedStudent) return;
                              const [email, bookingId] = selectedBookedStudent.split('|');
                              handleMarkNoShow({ studentEmail: email, bookingId });
                            }}
                            disabled={!selectedBookedStudent || !selectedAttendanceSession}
                            className="w-full px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {txt('标记未到场', 'Mark No-Show')}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <h3 className="text-sm font-medium text-foreground mb-2">{txt('临时到场 / 未预约', 'Walk-in / Not Booked')}</h3>
                      <div className="space-y-2">
                        <select
                          value={selectedWalkInStudent}
                          onChange={(e) => setSelectedWalkInStudent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        >
                          <option value="">{txt('请选择学员', 'Select student')}</option>
                          {attendanceStudents.map((s) => (
                            <option key={s.id} value={s.email}>
                              {s.name} ({s.email}) · {txt('课次', 'Credits')}: {s.classCredits || 0}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (!selectedWalkInStudent) return;
                            handleMarkAttendance({ studentEmail: selectedWalkInStudent });
                          }}
                          disabled={!selectedWalkInStudent || !selectedAttendanceSession}
                          className="w-full px-3 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {txt('确认到课（临时到场）', 'Confirm Attended (Walk-in)')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Student Forms View */}
            {showIntakeView && (
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-foreground">{txt('学员健康与免责表单', 'Student Health & Waiver Forms')}</h2>

                {intakeLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {txt('表单加载中...', 'Loading forms...')}
                  </div>
                ) : intakeForms.length === 0 ? (
                  <div className="p-8 rounded-xl bg-card/60 border border-glow-cyan/20 text-center text-muted-foreground">
                    {txt('暂无已提交表单。', 'No forms submitted yet.')}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {intakeForms.map((form) => (
                      <div
                        key={form.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedIntake?.id === form.id
                            ? 'bg-glow-cyan/10 border-glow-cyan/50'
                            : 'bg-card/60 border-glow-cyan/20 hover:border-glow-cyan/40'
                        }`}
                        onClick={() => setSelectedIntake(selectedIntake?.id === form.id ? null : form)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">{form.userName}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(form.signedAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{form.userEmail}</p>
                        {form.phone && <p className="text-xs text-muted-foreground">{form.phone}</p>}
                        <div className="mt-2 flex gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${form.waiverAccepted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {form.waiverAccepted ? txt('免责已签 ✓', 'Waiver ✓') : txt('免责未签 ✗', 'Waiver ✗')}
                          </span>
                        </div>

                        {/* Expanded detail */}
                        {selectedIntake?.id === form.id && (
                          <div className="mt-4 space-y-3 text-sm border-t border-glow-cyan/10 pt-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">{txt('健康 / 伤病', 'Health / Injuries')}</p>
                              <p className="text-foreground whitespace-pre-wrap">{form.healthNotes}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">{txt('紧急联系人', 'Emergency Contact')}</p>
                              <p className="text-foreground">{form.emergencyContactName} · {form.emergencyContactPhone}</p>
                            </div>
                            {form.comments && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">{txt('备注', 'Comments')}</p>
                                <p className="text-foreground whitespace-pre-wrap">{form.comments}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">{txt('签名', 'Signature')}</p>
                              {form.signatureDataUrl ? (
                                <img
                                  src={form.signatureDataUrl}
                                  alt={txt('学员签名', 'Student signature')}
                                  className="max-h-20 rounded border border-glow-cyan/20 bg-card/40"
                                />
                              ) : (
                                <p className="text-foreground text-sm">
                                  {form.signatureName || txt('无签名图片（过渡记录）', 'No signature image (transition record)')}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground/50 mt-1">
                                {txt('签署于', 'Signed')} {new Date(form.signedAt).toLocaleString('en-NZ')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Table - Hidden when in weekly or attendance view */}
            {!showWeeklyView && !showAttendanceView && !showIntakeView && (
            <div className="overflow-x-auto rounded-xl bg-card/60 border border-glow-cyan/20">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-glow-cyan/20">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('学员', 'Student')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('课程', 'Class')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('日期与时间', 'Date & Time')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('地点', 'Location')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('金额', 'Amount')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('状态', 'Status')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('支付', 'Payment')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('带朋友', 'Bring a Friend')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        {txt('未找到预约记录', 'No bookings found')}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-glow-cyan/10 hover:bg-glow-cyan/5">
                        <td className="p-4">
                          {(() => {
                            const linkedCustomer = customerByEmail.get((booking.userEmail || '').toLowerCase().trim());
                            return (
                              <>
                                <div className="font-medium text-foreground">{booking.userName}</div>
                                <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                                {linkedCustomer && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCustomerProfile(linkedCustomer)}
                                    className="mt-2 px-2 py-1 rounded text-xs bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-colors"
                                  >
                                    {txt('跳转客户信息', 'Open Customer')}
                                  </button>
                                )}
                              </>
                            );
                          })()}
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
                            {booking.status === 'confirmed' && (booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid')
                              ? txt('已预约', 'booked')
                              : booking.status === 'cancelled'
                                ? txt('已取消', 'cancelled')
                                : booking.status === 'confirmed'
                                  ? txt('已确认', 'confirmed')
                                  : booking.status === 'pending'
                                    ? txt('待处理', 'pending')
                                    : booking.status === 'completed'
                                      ? txt('已完成', 'completed')
                                      : booking.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                            booking.paymentStatus === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                            booking.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            booking.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {booking.paymentStatus === 'failed'
                              ? txt('支付失败', 'Payment Failed')
                              : booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid'
                                ? txt('已支付', booking.paymentStatus)
                                : booking.paymentStatus === 'processing'
                                  ? txt('处理中', 'processing')
                                  : booking.paymentStatus === 'pending'
                                    ? txt('待支付', 'pending')
                                    : booking.paymentStatus}
                            </span>

                            {/* Confirm cash payment button (admin) */}
                            {booking.paymentMethod === 'cash' && booking.paymentStatus === 'pending' && (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/admin/bookings/confirm-cash', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ bookingId: booking._id })
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || 'Failed to confirm');
                                    // Refresh bookings
                                    await fetch('/api/admin/bookings').then(r => r.json()).then(j => setBookings(j.bookings));
                                  } catch (err) {
                                    console.error('Confirm cash error:', err);
                                  }
                                }}
                                className="px-2 py-1 rounded-md text-xs bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
                              >
                                {txt('确认现金收款', 'Confirm Cash')}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {booking.bringAFriend ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.bringAFriendConfirmed
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {booking.bringAFriendConfirmed ? txt('已确认', 'Confirmed') : txt('待确认', 'Pending')}
                              </span>

                              {!booking.bringAFriendConfirmed && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch('/api/admin/bookings/confirm-bring-friend', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ bookingId: booking._id })
                                      });
                                      const data = await res.json();
                                      if (!res.ok) throw new Error(data.error || 'Failed to confirm');
                                      await fetch('/api/admin/bookings').then(r => r.json()).then(j => setBookings(j.bookings));
                                    } catch (err) {
                                      console.error('Confirm bring-a-friend error:', err);
                                    }
                                  }}
                                  className="px-2 py-1 rounded-md text-xs bg-glow-cyan/10 border border-glow-cyan/20 text-glow-cyan hover:bg-glow-cyan/20"
                                >
                                  {txt('确认带朋友', 'Confirm Friend')}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground text-center">
              {txt('显示', 'Showing')} {filteredBookings.length} / {bookings.length} {txt('条预约记录', 'bookings')}
            </div>
          </div>
        </section>

        <footer className="relative z-10 py-8 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              {txt('© 2026 INNER LIGHT · 新西兰奥克兰', '© 2026 INNER LIGHT · Auckland, New Zealand')}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

