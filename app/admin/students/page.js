'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    if (!newStudentName.trim() || !newStudentEmail.trim()) {
      setError('Name and email are required.');
      return;
    }

    setCreatingStudent(true);
    setError('');
    setMessage('');

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

      if (newStudentWaiverAccepted === 'yes') payload.waiverAccepted = true;
      if (newStudentWaiverAccepted === 'no') payload.waiverAccepted = false;

      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save student');

      setMessage(data.message || 'Student saved successfully.');
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
    } catch (err) {
      setError(err.message || 'Failed to save student');
    } finally {
      setCreatingStudent(false);
    }
  };

  if (status === 'loading') {
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />

        <section className="px-6 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle">
                Add a Student
              </h1>
              <p className="text-muted-foreground mt-1">
                Add or update student records (same database as Attendance & Credits).
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/60 border border-glow-cyan/20">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-glow-cyan" />
                Add Student
              </h2>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  {message}
                </div>
              )}

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
                  placeholder="Comments (optional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={creatingStudent}
                  className="w-full px-3 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50"
                >
                  {creatingStudent ? 'Saving...' : 'Save Student'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
