'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Calendar, Clock, MapPin, Search, Loader2, Download, Copy } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminBookingsPage() {
  const { language, mounted } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [forceZhMode, setForceZhMode] = useState(false);
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
  const [attendanceListView, setAttendanceListView] = useState('checked-in');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [bulkCheckInLoading, setBulkCheckInLoading] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [selectedBookedStudent, setSelectedBookedStudent] = useState('');
  const [selectedWalkInStudent, setSelectedWalkInStudent] = useState('');
  const [customerLookupTerm, setCustomerLookupTerm] = useState('');
  const [customerLookupPool, setCustomerLookupPool] = useState([]);
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [bookingCustomerId, setBookingCustomerId] = useState('');
  const [assistedBookingLoading, setAssistedBookingLoading] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState('');
  const [showActiveBookingsList, setShowActiveBookingsList] = useState(false);
  const [sendingAdminBookingTest, setSendingAdminBookingTest] = useState(false);
  const [assistedConfirmOpen, setAssistedConfirmOpen] = useState(false);
  const [pendingAssistedBooking, setPendingAssistedBooking] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLanguage = String(window.localStorage.getItem('language') || '').toLowerCase();
    const browserLanguage = String(window.navigator?.language || '').toLowerCase();
    const shouldUseZh =
      savedLanguage === 'zh' ||
      savedLanguage === 'cn' ||
      savedLanguage.startsWith('zh-') ||
      savedLanguage.startsWith('zh_') ||
      browserLanguage.startsWith('zh');

    setForceZhMode(shouldUseZh);
  }, [language, mounted]);

  const isZh = language !== 'en' || forceZhMode;
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

  useEffect(() => {
    const entryView = String(searchParams.get('view') || '').toLowerCase();
    if (entryView === 'assisted' || entryView === 'attendance') {
      setShowWeeklyView(false);
      setShowAttendanceView(true);
      setShowIntakeView(false);
    }
  }, [searchParams]);

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
      setAttendanceListView('checked-in');
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

  const handleBulkMarkAttendance = async () => {
    if (!selectedAttendanceSession || !selectedSessionData) {
      setAttendanceError(txt('请先选择课程场次。', 'Please select a class session first.'));
      return;
    }

    const pendingStudents = (availableBookedStudents || []).filter((student) => student?.userEmail);
    if (pendingStudents.length === 0) {
      setAttendanceError('');
      setAttendanceMessage(txt('当前场次暂无可批量签到的学员。', 'No pending booked students to check in for this session.'));
      return;
    }

    const [classDate, classTime] = selectedAttendanceSession.split('|');

    setBulkCheckInLoading(true);
    setAttendanceMessage('');
    setAttendanceError('');

    let successCount = 0;
    let duplicateCount = 0;
    const failedStudents = [];

    for (const student of pendingStudents) {
      try {
        const response = await fetch('/api/admin/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classDate,
            classTime,
            className: selectedSessionData.className,
            location: selectedSessionData.location,
            studentEmail: student.userEmail,
            bookingId: student.bookingId || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = String(data?.error || 'Failed to mark attendance');
          const isDuplicateAttendance =
            response.status === 400 && errorMessage.toLowerCase().includes('attendance already marked');

          if (isDuplicateAttendance) {
            duplicateCount += 1;
            continue;
          }

          failedStudents.push(student.userName || student.userEmail || txt('未知学员', 'Unknown student'));
          continue;
        }

        successCount += 1;
      } catch (error) {
        console.error('Bulk attendance mark failed for student:', student?.userEmail, error);
        failedStudents.push(student.userName || student.userEmail || txt('未知学员', 'Unknown student'));
      }
    }

    await fetchAttendanceData(selectedAttendanceSession);
    await fetchBookings();

    if (failedStudents.length > 0) {
      setAttendanceError(
        txt(
          `批量签到完成：成功 ${successCount} 人，失败 ${failedStudents.length} 人（${failedStudents.join('、')}）。`,
          `Bulk check-in finished: ${successCount} succeeded, ${failedStudents.length} failed (${failedStudents.join(', ')}).`
        )
      );
    }

    if (successCount > 0 || duplicateCount > 0) {
      setAttendanceMessage(
        txt(
          `批量签到完成：新增签到 ${successCount} 人${duplicateCount > 0 ? `，原已签到 ${duplicateCount} 人` : ''}。`,
          `Bulk check-in complete: ${successCount} newly checked in${duplicateCount > 0 ? `, ${duplicateCount} already checked in` : ''}.`
        )
      );
    }

    if (successCount === 0 && duplicateCount === 0 && failedStudents.length > 0) {
      setAttendanceMessage('');
    }

    setBulkCheckInLoading(false);
  };

  const handleDeleteBooked = async ({ bookingId }) => {
    if (!bookingId) return;

    setAttendanceMessage('');
    setAttendanceError('');
    setDeletingBookingId(bookingId);

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove booking');
      }

      setAttendanceMessage(txt('已删除该预约。', 'Booking removed.'));
      setSelectedBookedStudent('');
      await fetchAttendanceData(selectedAttendanceSession);
      await fetchBookings();
    } catch (error) {
      console.error('Error removing booking:', error);
      setAttendanceError(error.message || 'Failed to remove booking');
    } finally {
      setDeletingBookingId('');
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
  const parseClassDateTime = (classDate, classTime) => {
    const date = new Date(classDate);
    if (Number.isNaN(date.getTime())) return null;

    const normalizedTime = String(classTime || '').trim().toUpperCase();
    const match = normalizedTime.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
    if (!match) return null;

    let hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const meridiem = match[3] || null;

    if (meridiem === 'AM' && hours === 12) hours = 0;
    if (meridiem === 'PM' && hours < 12) hours += 12;

    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  const now = new Date();
  const activeBookingMap = new Map();
  bookings.forEach((booking) => {
    const status = String(booking?.status || '').toLowerCase();
    const paymentStatus = String(booking?.paymentStatus || '').toLowerCase();
    const noShow = Boolean(booking?.noShow);

    if (status === 'cancelled') return;

    const isBookedLike =
      status === 'booked' ||
      status === 'confirmed' ||
      status === 'pending' ||
      paymentStatus === 'completed' ||
      paymentStatus === 'paid' ||
      paymentStatus === 'processing';

    const isSignedIn = status === 'completed';
    if (!isBookedLike || isSignedIn || noShow) return;

    const classDateTime = parseClassDateTime(booking.classDate, booking.classTime);
    if (!classDateTime) return;

    // Exclude sessions that have already passed.
    if (classDateTime < now) return;

    const dedupKey = `${String(booking.userEmail || '').toLowerCase().trim()}|${new Date(booking.classDate).toISOString().split('T')[0]}|${String(booking.classTime || '').trim()}`;
    if (!activeBookingMap.has(dedupKey)) {
      activeBookingMap.set(dedupKey, booking);
    }
  });

  const confirmedBookings = activeBookingMap.size;
  const activeBookingsList = Array.from(activeBookingMap.values()).sort((a, b) => {
    const dateA = parseClassDateTime(a.classDate, a.classTime)?.getTime() || 0;
    const dateB = parseClassDateTime(b.classDate, b.classTime)?.getTime() || 0;
    if (dateA !== dateB) return dateA - dateB;
    return String(a.userName || '').localeCompare(String(b.userName || ''));
  });
  const pendingBookings = bookings.filter(b => 
    b.status === 'pending' || b.paymentStatus === 'processing'
  ).length;

  const selectedSessionData = attendanceSessions.find(s => s.key === selectedAttendanceSession) || null;
  const attendedEmails = new Set((attendanceRecords || []).map(a => a.userEmail));
  const attendanceRecordByEmail = new Map(
    (attendanceRecords || []).map((record) => [
      (record.userEmail || '').toLowerCase().trim(),
      record,
    ])
  );
  const isActiveBookedStatus = (booking) => {
    const status = String(booking?.status || '').toLowerCase();
    const paymentStatus = String(booking?.paymentStatus || '').toLowerCase();
    return (
      status === 'booked' ||
      status === 'confirmed' ||
      status === 'completed' ||
      paymentStatus === 'completed' ||
      paymentStatus === 'paid' ||
      paymentStatus === 'processing'
    );
  };
  const bookedRoster = (selectedSessionData?.bookings || []).filter(isActiveBookedStatus);
  const checkedInRoster = (attendanceRecords || []).filter(
    (record) => String(record?.status || 'attended').toLowerCase() === 'attended'
  );
  const selectedSessionCheckedInCount = Number(selectedSessionData?.checkedInCount || 0);
  const selectedSessionNoShowCount = Number(selectedSessionData?.noShowCount || 0);
  const preBookedEmailSet = new Set(
    (selectedSessionData?.bookings || [])
      .filter((b) => Boolean(b?.bookingId))
      .map((b) => String(b.userEmail || '').toLowerCase().trim())
  );
  const checkedInSummaryNames = checkedInRoster
    .map((record) => String(record?.userName || record?.userEmail || '').trim())
    .filter(Boolean);
  const checkedInSummaryText = checkedInSummaryNames.join('、');
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
    const { sendEmail = true, skipConfirm = false } = options;

    if (!selectedSessionData || !selectedAttendanceSession) {
      setAttendanceError(txt('请先选择课程场次。', 'Please select a class session first.'));
      return;
    }

    const isActiveBooked = (booking) => {
      const status = String(booking?.status || '').toLowerCase();
      const paymentStatus = String(booking?.paymentStatus || '').toLowerCase();
      return (
        status === 'booked' ||
        status === 'confirmed' ||
        status === 'completed' ||
        paymentStatus === 'completed' ||
        paymentStatus === 'paid' ||
        paymentStatus === 'processing'
      );
    };

    const existingBooking = (selectedSessionData.bookings || []).find(
      (b) =>
        (b.userEmail || '').toLowerCase().trim() === (customer.userEmail || '').toLowerCase().trim() &&
        isActiveBooked(b)
    );

    if (existingBooking) {
      setAttendanceError('');
      setAttendanceMessage(
        txt('该会员已预约本场次，无需重复预约。请在下方“已预约学员”中点击“确认到课”签到。', 'This member is already booked for this session. No need to rebook; use Confirm Attended below under Booked Students.')
      );
      return;
    }

    const [classDate, classTime] = selectedAttendanceSession.split('|');
    if (!skipConfirm) {
      setPendingAssistedBooking({
        customer,
        sendEmail,
        classDate,
        classTime,
        className: selectedSessionData.className,
      });
      setAssistedConfirmOpen(true);
      return;
    }

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
            ? data.emailSent === false
              ? `预约成功，但预约邮件发送失败。当前剩余课次：${data.remainingClassCredits}（到课时自动扣减）。${data.emailError?.includes('not verified') ? '⚠️ 邮件域名尚未验证，请前往 resend.com/domains 完成域名验证后方可向客户发送邮件。' : data.emailError ? `原因：${data.emailError}` : ''}`
              : `预约成功，邮件已发送至 ${data.emailTo || customer.userEmail}。当前剩余课次：${data.remainingClassCredits}（到课时自动扣减）。${data.emailMessageId ? ` 邮件ID：${data.emailMessageId}` : ''}`
            : `预约成功，未发送预约邮件。当前剩余课次：${data.remainingClassCredits}（到课时自动扣减）。`,
          sendEmail
            ? data.emailSent === false
              ? `Booking successful, but confirmation email failed. Remaining credits: ${data.remainingClassCredits} (deducted when attendance is marked). ${data.emailError?.includes('not verified') ? '⚠️ Email domain not verified. Please go to resend.com/domains to verify your domain before sending emails to customers.' : data.emailError ? `Reason: ${data.emailError}` : ''}`
              : `Booking successful and confirmation email sent to ${data.emailTo || customer.userEmail}. Remaining credits: ${data.remainingClassCredits} (deducted when attendance is marked).${data.emailMessageId ? ` Email ID: ${data.emailMessageId}` : ''}`
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
      setAssistedConfirmOpen(false);
      setPendingAssistedBooking(null);
    }
  };

  const handleCancelAssistedBookingConfirm = () => {
    setAssistedConfirmOpen(false);
    setPendingAssistedBooking(null);
    setAttendanceError('');
    setAttendanceMessage(txt('已取消预约操作。', 'Booking action cancelled.'));
  };

  const handleSendAdminBookingTestEmail = async () => {
    if (!selectedAttendanceSession || !selectedSessionData) {
      setAttendanceError(txt('请先选择课程场次。', 'Please select a class session first.'));
      return;
    }

    const adminEmail = session?.user?.email;
    if (!adminEmail) {
      setAttendanceError(txt('当前账号缺少邮箱，无法发送测试邮件。', 'Current account has no email, cannot send test email.'));
      return;
    }

    const [classDate, classTime] = selectedAttendanceSession.split('|');

    setSendingAdminBookingTest(true);
    setAttendanceError('');
    setAttendanceMessage('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          emailType: 'booking-confirmation',
          data: {
            userName: session?.user?.name || 'Admin Test',
            className: selectedSessionData.className || 'Booking Confirmation Test',
            classDate,
            classTime,
            location: selectedSessionData.location || 'Village Valley Centre, Ashhurst',
            amount: 0,
            bookingId: `test-${Date.now()}`,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Failed to send test email');
      }

      setAttendanceMessage(
        txt(
          `测试预约邮件已发送至 ${adminEmail}${data?.id ? `（邮件ID：${data.id}）` : ''}`,
          `Test booking email sent to ${adminEmail}${data?.id ? ` (Email ID: ${data.id})` : ''}`
        )
      );
    } catch (error) {
      setAttendanceError(error.message || 'Failed to send test email');
    } finally {
      setSendingAdminBookingTest(false);
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
                <div className="text-sm text-muted-foreground">{txt('已预约人数', 'bookings')}</div>
                <button
                  type="button"
                  onClick={() => setShowActiveBookingsList((prev) => !prev)}
                  className="mt-2 text-xs text-glow-cyan hover:underline"
                >
                  {showActiveBookingsList
                    ? txt('收起名单', 'Hide list')
                    : txt('查看名单', 'View list')}
                </button>
              </div>
              <div className="p-4 rounded-xl bg-card/60 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">{pendingBookings}</div>
                <div className="text-sm text-muted-foreground">{txt('待处理人数', 'pending')}</div>
              </div>
            </div>

            {showActiveBookingsList && (
              <div className="mb-6 p-4 rounded-xl bg-card/60 border border-glow-cyan/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">
                    {txt('已预约有效人数明细', 'Active Booked Details')}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {txt(`共 ${activeBookingsList.length} 人`, `${activeBookingsList.length} students`)}
                  </span>
                </div>
                {activeBookingsList.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {txt('当前没有符合条件的有效预约。', 'No active bookings match the current criteria.')}
                  </p>
                ) : (
                  <div className="max-h-64 overflow-auto space-y-2 pr-1">
                    {activeBookingsList.map((booking, idx) => {
                      const dateTime = parseClassDateTime(booking.classDate, booking.classTime);
                      const displayDate = dateTime
                        ? dateTime.toLocaleString(isZh ? 'zh-CN' : 'en-NZ', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : `${booking.classDate} ${booking.classTime}`;
                      const itemKey =
                        booking.id ||
                        booking._id ||
                        `${String(booking.userEmail || '').toLowerCase().trim()}-${String(booking.classDate || '')}-${String(booking.classTime || '')}-${idx}`;

                      return (
                        <div key={`active-booking-${itemKey}`} className="p-2 rounded border border-glow-cyan/10 bg-card/40">
                          <p className="text-sm text-foreground font-medium">{booking.userName || booking.userEmail}</p>
                          <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                          <p className="text-xs text-muted-foreground">{displayDate}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                  {txt(`每周课程场次 • 每节最多 ${maxStudentsPerClass} 人`, `Weekly class sessions • Max ${maxStudentsPerClass} students per class`)}
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
                    const singleDate = new Date(week.weekStart).toLocaleDateString(isZh ? 'zh-CN' : 'en-NZ', { 
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
                              {txt(
                                `${week.bookedCount} 已预约，${week.pendingCount} 待处理`,
                                `${week.bookedCount} booked, ${week.pendingCount} pending`
                              )}
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
                    <div className={`mb-4 p-3 rounded-lg text-sm ${attendanceMessage.includes('resend.com/domains') ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                      {attendanceMessage.includes('resend.com/domains') ? (
                        <>
                          {attendanceMessage.split('resend.com/domains')[0]}
                          <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-yellow-100">
                            resend.com/domains
                          </a>
                          {attendanceMessage.split('resend.com/domains')[1]}
                        </>
                      ) : attendanceMessage}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <label className="block text-sm text-muted-foreground mb-2">{txt('课程场次', 'Class Session')}</label>
                      <select
                        value={selectedAttendanceSession}
                        onChange={(e) => {
                          setSelectedAttendanceSession(e.target.value);
                          setAttendanceListView('checked-in');
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

                      <div className="p-3 rounded-lg bg-card/40 border border-glow-cyan/10">
                        <p className="text-sm text-muted-foreground">{txt('当前选择课程', 'Selected class')}</p>
                        <p className="text-foreground font-medium">{selectedSessionData?.className || '—'}</p>
                        <p className="text-xs text-muted-foreground">{getAttendanceSessionLabel(selectedSessionData)}</p>
                        <p className="text-xs text-muted-foreground">{selectedSessionData?.location || ''}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">{txt('右侧签到统计', 'Attendance Stats')}</p>
                        <span className="text-xs text-muted-foreground">{txt('每节课', 'Per class')}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="p-2 rounded bg-glow-cyan/10 border border-glow-cyan/20 text-center">
                          <p className="text-[11px] text-muted-foreground">{txt('已预约', 'Booked')}</p>
                          <p className="text-base font-semibold text-glow-cyan">{bookedRoster.length}</p>
                        </div>
                        <div className="p-2 rounded bg-green-500/10 border border-green-500/20 text-center">
                          <p className="text-[11px] text-muted-foreground">{txt('已签到', 'Checked-in')}</p>
                          <p className="text-base font-semibold text-green-300">{selectedSessionCheckedInCount}</p>
                        </div>
                        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-center">
                          <p className="text-[11px] text-muted-foreground">{txt('未到场', 'No-show')}</p>
                          <p className="text-base font-semibold text-red-300">{selectedSessionNoShowCount}</p>
                        </div>
                      </div>

                      <div className="max-h-40 overflow-auto space-y-1 pr-1">
                        {attendanceSessions.length === 0 ? (
                          <p className="text-xs text-muted-foreground">{txt('暂无场次统计。', 'No session stats yet.')}</p>
                        ) : (
                          attendanceSessions.map((sessionItem) => {
                            const isSelected = sessionItem.key === selectedAttendanceSession;
                            return (
                              <button
                                key={`stat-${sessionItem.key}`}
                                type="button"
                                onClick={() => {
                                  setSelectedAttendanceSession(sessionItem.key);
                                  setAttendanceListView('checked-in');
                                  setSelectedBookedStudent('');
                                  setSelectedWalkInStudent('');
                                  fetchAttendanceData(sessionItem.key);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded border text-xs transition-colors ${
                                  isSelected
                                    ? 'bg-glow-cyan/15 border-glow-cyan/40 text-foreground'
                                    : 'bg-card/50 border-glow-cyan/10 text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate">{getAttendanceSessionLabel(sessionItem)}</span>
                                  <span className="whitespace-nowrap text-green-300">
                                    {txt('签到', 'In')}: {Number(sessionItem.checkedInCount || 0)}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 p-4 rounded-lg bg-card/40 border border-glow-cyan/10">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-medium text-foreground">{txt('课程名单', 'Class Roster')}</h3>
                      <p className="text-xs text-muted-foreground">
                        {txt(`已预约 ${bookedRoster.length} 人 · 已签到 ${selectedSessionCheckedInCount} 人 · 未到场 ${selectedSessionNoShowCount} 人`, `${bookedRoster.length} booked · ${selectedSessionCheckedInCount} checked in · ${selectedSessionNoShowCount} no-show`)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setAttendanceListView('booked')}
                        className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                          attendanceListView === 'booked'
                            ? 'bg-glow-cyan/20 border-glow-cyan/50 text-glow-cyan'
                            : 'bg-card/60 border-glow-cyan/20 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {txt('已预约客户名单', 'Booked Students List')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceListView('checked-in')}
                        className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                          attendanceListView === 'checked-in'
                            ? 'bg-green-500/20 border-green-500/50 text-green-300'
                            : 'bg-card/60 border-glow-cyan/20 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {txt('签到客户名单', 'Checked-in Students List')}
                      </button>
                    </div>

                    <div className="max-h-56 overflow-auto space-y-2 pr-1">
                      {attendanceListView === 'booked' ? (
                        bookedRoster.length === 0 ? (
                          <p className="text-xs text-muted-foreground">{txt('当前场次暂无已预约客户。', 'No booked students for this class session yet.')}</p>
                        ) : (
                          bookedRoster.map((student, idx) => {
                            const record = attendanceRecordByEmail.get((student.userEmail || '').toLowerCase().trim());
                            const attendanceStatus = String(record?.status || '').toLowerCase();
                            const isCheckedIn = attendanceStatus === 'attended';
                            const isNoShow = attendanceStatus === 'no-show';
                            const rosterKey =
                              student.bookingId ||
                              `${String(student.userEmail || '').toLowerCase().trim()}-${String(student.classTime || '')}-${idx}`;

                            return (
                              <div key={`booked-roster-${rosterKey}`} className="p-2 rounded border border-glow-cyan/15 bg-card/50">
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm text-foreground font-medium">{student.userName}</p>
                                    <p className="text-xs text-muted-foreground">{student.userEmail}</p>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] ${
                                      isCheckedIn
                                        ? 'bg-green-500/20 text-green-300'
                                        : isNoShow
                                          ? 'bg-red-500/20 text-red-300'
                                          : 'bg-slate-500/20 text-slate-300'
                                    }`}
                                  >
                                    {isCheckedIn
                                      ? txt('已签到', 'Checked in')
                                      : isNoShow
                                        ? txt('未到场', 'No-show')
                                        : txt('未签到', 'Not checked in')}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )
                      ) : checkedInRoster.length === 0 ? (
                        <p className="text-xs text-muted-foreground">{txt('当前场次暂无签到记录。', 'No checked-in students for this class session yet.')}</p>
                      ) : (
                        checkedInRoster.map((record) => (
                          <div key={`checked-in-${record.id}`} className="p-2 rounded border border-green-500/20 bg-green-500/5">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm text-foreground font-medium">{record.userName || record.userEmail}</p>
                                <p className="text-xs text-muted-foreground">{record.userEmail}</p>
                                {!record.bookingId && !preBookedEmailSet.has(String(record.userEmail || '').toLowerCase().trim()) && (
                                  <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                                    {txt('临时到场', 'Walk-in')}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-green-300 whitespace-nowrap">
                                {record.createdAt
                                  ? new Date(record.createdAt).toLocaleTimeString(isZh ? 'zh-CN' : 'en-NZ', { hour: '2-digit', minute: '2-digit' })
                                  : txt('已签到', 'Checked in')}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {attendanceListView === 'checked-in' && checkedInRoster.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-card/60 border border-glow-cyan/20">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-sm text-foreground font-medium">
                            {txt('课后到场汇总', 'Post-class Attendance Summary')}
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                                  const summary = txt(
                                    `到场共 ${checkedInSummaryNames.length} 人：${checkedInSummaryText}`,
                                    `Total attended: ${checkedInSummaryNames.length}. Names: ${checkedInSummaryNames.join(', ')}`
                                  );
                                  await navigator.clipboard.writeText(summary);
                                  setAttendanceError('');
                                  setAttendanceMessage(txt('已复制到场汇总。', 'Attendance summary copied.'));
                                }
                              } catch (copyError) {
                                console.error('Failed to copy attendance summary:', copyError);
                                setAttendanceError(txt('复制失败，请手动复制。', 'Copy failed, please copy manually.'));
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/10 text-xs"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {txt('复制汇总', 'Copy Summary')}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {txt(`已到场 ${checkedInSummaryNames.length} 人`, `${checkedInSummaryNames.length} students attended`)}
                        </p>
                        <p className="text-sm text-foreground leading-relaxed break-words">
                          {checkedInSummaryText}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <h3 className="text-sm font-medium text-foreground mb-2">{txt('已预约学员', 'Booked Students')}</h3>
                      <div className="space-y-2">
                        <button
                          onClick={handleBulkMarkAttendance}
                          disabled={!selectedAttendanceSession || availableBookedStudents.length === 0 || bulkCheckInLoading}
                          className="w-full px-3 py-2 rounded-lg bg-green-500/15 border border-green-500/40 text-green-300 hover:bg-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bulkCheckInLoading
                            ? txt('批量签到中...', 'Bulk Check-in...')
                            : txt(`一键全部签到（${availableBookedStudents.length}人）`, `Check In All (${availableBookedStudents.length})`)}
                        </button>
                        <select
                          value={selectedBookedStudent}
                          onChange={(e) => setSelectedBookedStudent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        >
                          <option value="">{txt('请选择已预约学员', 'Select a booked student')}</option>
                          {availableBookedStudents.map((b, idx) => {
                            const optionKey =
                              b.bookingId || `${String(b.userEmail || '').toLowerCase().trim()}-${idx}`;
                            return (
                            <option key={optionKey} value={`${b.userEmail}|${b.bookingId || ''}`}>
                              {b.userName} ({b.userEmail})
                            </option>
                            );
                          })}
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
                        <button
                          onClick={() => {
                            if (!selectedBookedStudent) return;
                            const [, bookingId] = selectedBookedStudent.split('|');
                            handleDeleteBooked({ bookingId });
                          }}
                          disabled={!selectedBookedStudent || !selectedAttendanceSession || !!deletingBookingId}
                          className="w-full px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingBookingId
                            ? txt('删除中...', 'Removing...')
                            : txt('删除已预约', 'Delete Booked')}
                        </button>
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

                    {assistedConfirmOpen && pendingAssistedBooking && (
                      <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-300 mb-3">
                          {txt(
                            `确认给该会员预约此课程${pendingAssistedBooking.sendEmail ? '并发送预约邮件' : '，且不发送预约邮件'}？`,
                            `Confirm assisted booking${pendingAssistedBooking.sendEmail ? ' and send confirmation email' : ' without sending confirmation email'}?`
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {pendingAssistedBooking.customer.userName} ({pendingAssistedBooking.customer.userEmail})
                          {' · '}
                          {pendingAssistedBooking.className}
                          {' · '}
                          {pendingAssistedBooking.classDate} {pendingAssistedBooking.classTime}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleCreateAssistedBooking(pendingAssistedBooking.customer, {
                              sendEmail: pendingAssistedBooking.sendEmail,
                              skipConfirm: true,
                            })}
                            disabled={assistedBookingLoading}
                            className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 text-xs"
                          >
                            {assistedBookingLoading
                              ? txt('预约中...', 'Booking...')
                              : txt('确认预约', 'Confirm Booking')}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelAssistedBookingConfirm}
                            disabled={assistedBookingLoading}
                            className="px-3 py-2 rounded border border-white/20 text-muted-foreground hover:text-foreground text-xs"
                          >
                            {txt('取消', 'Cancel')}
                          </button>
                        </div>
                      </div>
                    )}
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{txt('操作', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
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
                            {new Date(booking.classDate).toLocaleDateString(isZh ? 'zh-CN' : 'en-NZ')}
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
                        <td className="p-4">
                          {booking.status !== 'cancelled' ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteBooked({ bookingId: booking._id })}
                              disabled={!!deletingBookingId}
                              className="px-2 py-1 rounded-md text-xs bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                            >
                              {deletingBookingId === booking._id
                                ? txt('删除中...', 'Removing...')
                                : txt('删除预约', 'Delete Booking')}
                            </button>
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

