'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { Loader2, CalendarCheck2, TicketPercent, UserPlus, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

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

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />

        <section className="px-6 pt-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage bookings, students, and coupons.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/admin/bookings"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck2 className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">Bookings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>

              <Link
                href="/admin/students"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">Add a Student</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>

              <Link
                href="/admin/coupons"
                className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                         hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                         flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <TicketPercent className="w-5 h-5 text-glow-cyan" />
                  <span className="font-medium">Coupons</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
