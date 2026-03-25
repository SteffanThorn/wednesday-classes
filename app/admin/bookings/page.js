'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Calendar, Clock, MapPin, Search, Loader2, Download, UserPlus } from 'lucide-react';

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
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentClassCredits, setNewStudentClassCredits] = useState('');
  const [newStudentHealthNotes, setNewStudentHealthNotes] = useState('');
  const [newStudentEmergencyName, setNewStudentEmergencyName] = useState('');
  const [newStudentEmergencyPhone, setNewStudentEmergencyPhone] = useState('');
  const [newStudentWaiverAccepted, setNewStudentWaiverAccepted] = useState('');
  const [newStudentComments, setNewStudentComments] = useState('');
  const [newStudentSignatureName, setNewStudentSignatureName] = useState('');
  const [newStudentSignedAt, setNewStudentSignedAt] = useState(() => new Date().toISOString().split('T')[0]);
  const [creatingStudent, setCreatingStudent] = useState(false);

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
        throw new Error(data.error || 'Failed to mark attendance');
      }

      setAttendanceMessage(data.message || 'Attendance marked.');
      setSelectedBookedStudent('');
      setSelectedWalkInStudent('');
      await fetchAttendanceData(selectedAttendanceSession);
      await fetchBookings();
    } catch (error) {
      console.error('Error marking attendance:', error);
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

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    if (
      !newStudentName.trim() ||
      !newStudentEmail.trim()
    ) {
      setAttendanceError('Name and email are required.');
      return;
    }

    setCreatingStudent(true);
    setAttendanceError('');
    setAttendanceMessage('');

    try {
      const payload = {
        name: newStudentName.trim(),
        email: newStudentEmail.trim(),
        phone: newStudentPhone.trim(),
        classCredits: newStudentClassCredits === '' ? undefined : Number(newStudentClassCredits),
        healthNotes: newStudentHealthNotes.trim(),
        emergencyContactName: newStudentEmergencyName.trim(),
        emergencyContactPhone: newStudentEmergencyPhone.trim(),
        comments: newStudentComments.trim(),
        signatureName: newStudentSignatureName.trim(),
        signedAt: newStudentSignedAt,
      };

      if (newStudentWaiverAccepted === 'yes') {
        payload.waiverAccepted = true;
      } else if (newStudentWaiverAccepted === 'no') {
        payload.waiverAccepted = false;
      }

      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student');
      }

      setAttendanceMessage(data.message || 'Student added successfully.');
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentPhone('');
      setNewStudentClassCredits('');
      setNewStudentHealthNotes('');
      setNewStudentEmergencyName('');
      setNewStudentEmergencyPhone('');
      setNewStudentWaiverAccepted('');
      setNewStudentComments('');
      setNewStudentSignatureName('');
      setNewStudentSignedAt(new Date().toISOString().split('T')[0]);
      await fetchAttendanceData(selectedAttendanceSession);
      await fetchIntakeForms();
    } catch (error) {
      console.error('Error creating student:', error);
      setAttendanceError(error.message || 'Failed to create student');
    } finally {
      setCreatingStudent(false);
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
                  Weekly Capacity
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
                  All Bookings
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
                  Attendance &amp; Credits
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
                  Student Forms
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

            {/* Attendance & Credits View */}
            {showAttendanceView && (
              <div className="space-y-6 mb-8">
                <div className="p-6 rounded-xl bg-card/60 border border-glow-cyan/20">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Mark Class Attendance</h2>

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
                      <label className="block text-sm text-muted-foreground mb-2">Class Session</label>
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
                        {attendanceSessions.length === 0 && <option value="">No sessions found</option>}
                        {attendanceSessions.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <p className="text-sm text-muted-foreground">Selected class</p>
                      <p className="text-foreground font-medium">{selectedSessionData?.className || '—'}</p>
                      <p className="text-xs text-muted-foreground">{selectedSessionData?.location || ''}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <h3 className="text-sm font-medium text-foreground mb-2">Booked Students</h3>
                      <div className="space-y-2">
                        <select
                          value={selectedBookedStudent}
                          onChange={(e) => setSelectedBookedStudent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        >
                          <option value="">Select a booked student</option>
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
                            Confirm Attended
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
                            Mark No-Show
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card/40 border border-glow-cyan/10">
                      <h3 className="text-sm font-medium text-foreground mb-2">Walk-in / Not Booked</h3>
                      <div className="space-y-2">
                        <select
                          value={selectedWalkInStudent}
                          onChange={(e) => setSelectedWalkInStudent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        >
                          <option value="">Select student</option>
                          {attendanceStudents.map((s) => (
                            <option key={s.id} value={s.email}>
                              {s.name} ({s.email}) · Credits: {s.classCredits || 0}
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
                          Confirm Attended (Walk-in)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl bg-card/60 border border-glow-cyan/20">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Attendance for Session</h2>
                    {attendanceLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading attendance...
                      </div>
                    ) : attendanceRecords.length === 0 ? (
                      <p className="text-muted-foreground">No attendance marked yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {attendanceRecords.map((a) => {
                          const isNoShow = a.status === 'no-show';

                          return (
                            <div key={a.id} className="p-3 rounded-lg bg-card/40 border border-glow-cyan/10 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-foreground font-medium">{a.userName}</p>
                                <p className="text-xs text-muted-foreground">{a.userEmail}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${isNoShow ? 'bg-red-500/20 text-red-400' : 'bg-glow-cyan/20 text-glow-cyan'}`}>
                                  {isNoShow ? 'no-show' : 'attended'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${a.usedCredit ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                  {a.usedCredit ? '1 credit used' : 'no credit'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-6 rounded-xl bg-card/60 border border-glow-cyan/20">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-glow-cyan" />
                      Add Student
                    </h2>
                    <p className="text-xs text-muted-foreground mb-3">
                      Transition mode: add or update existing student records with health + waiver details.
                    </p>
                    <form onSubmit={handleCreateStudent} className="space-y-3">
                      <input
                        type="text"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="Student name *"
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        required
                      />
                      <input
                        type="email"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="Student email *"
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        value={newStudentPhone}
                        onChange={(e) => setNewStudentPhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={newStudentClassCredits}
                        onChange={(e) => setNewStudentClassCredits(e.target.value)}
                        placeholder="Transferred class credits (optional)"
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                      />
                      <textarea
                        value={newStudentHealthNotes}
                        onChange={(e) => setNewStudentHealthNotes(e.target.value)}
                        placeholder="General Health / Injuries / Surgeries / safety notes (optional)"
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none resize-none"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newStudentEmergencyName}
                          onChange={(e) => setNewStudentEmergencyName(e.target.value)}
                          placeholder="Emergency contact name (optional)"
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={newStudentEmergencyPhone}
                          onChange={(e) => setNewStudentEmergencyPhone(e.target.value)}
                          placeholder="Emergency contact phone (optional)"
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={newStudentWaiverAccepted}
                          onChange={(e) => setNewStudentWaiverAccepted(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        >
                          <option value="">Waiver status (optional)</option>
                          <option value="yes">Waiver accepted: Yes</option>
                          <option value="no">Waiver accepted: No</option>
                        </select>
                        <input
                          type="date"
                          value={newStudentSignedAt}
                          onChange={(e) => setNewStudentSignedAt(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        value={newStudentSignatureName}
                        onChange={(e) => setNewStudentSignatureName(e.target.value)}
                        placeholder="Signature name (as recorded, optional)"
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                      />
                      <textarea
                        value={newStudentComments}
                        onChange={(e) => setNewStudentComments(e.target.value)}
                        placeholder="Comments"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none resize-none"
                      />
                      <button
                        type="submit"
                        disabled={creatingStudent}
                        className="w-full px-3 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50"
                      >
                        {creatingStudent ? 'Adding...' : 'Add Student'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Student Forms View */}
            {showIntakeView && (
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-foreground">Student Health & Waiver Forms</h2>

                {intakeLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading forms...
                  </div>
                ) : intakeForms.length === 0 ? (
                  <div className="p-8 rounded-xl bg-card/60 border border-glow-cyan/20 text-center text-muted-foreground">
                    No forms submitted yet.
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
                            {form.waiverAccepted ? 'Waiver ✓' : 'Waiver ✗'}
                          </span>
                        </div>

                        {/* Expanded detail */}
                        {selectedIntake?.id === form.id && (
                          <div className="mt-4 space-y-3 text-sm border-t border-glow-cyan/10 pt-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">Health / Injuries</p>
                              <p className="text-foreground whitespace-pre-wrap">{form.healthNotes}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">Emergency Contact</p>
                              <p className="text-foreground">{form.emergencyContactName} · {form.emergencyContactPhone}</p>
                            </div>
                            {form.comments && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Comments</p>
                                <p className="text-foreground whitespace-pre-wrap">{form.comments}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Signature</p>
                              {form.signatureDataUrl ? (
                                <img
                                  src={form.signatureDataUrl}
                                  alt="Student signature"
                                  className="max-h-20 rounded border border-glow-cyan/20 bg-card/40"
                                />
                              ) : (
                                <p className="text-foreground text-sm">
                                  {form.signatureName || 'No signature image (transition record)'}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground/50 mt-1">
                                Signed {new Date(form.signedAt).toLocaleString('en-NZ')}
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Class</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Location</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Bring a Friend</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
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
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                            booking.paymentStatus === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                            booking.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            booking.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {booking.paymentStatus === 'failed' ? 'Payment Failed' : booking.paymentStatus}
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
                                Confirm Cash
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
                                {booking.bringAFriendConfirmed ? 'Confirmed' : 'Pending'}
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
                                  Confirm Friend
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

