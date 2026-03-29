import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="card rounded-3xl p-8 md:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-cyan-300">Starter template</p>
        <h1 className="text-4xl font-semibold md:text-6xl">Reusable full-stack setup for future apps</h1>
        <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
          This template keeps the essentials from your current project: Next.js App Router,
          Auth.js credentials auth, MongoDB with Mongoose, Stripe checkout + webhooks, and Resend emails.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/auth/signup" className="rounded-lg bg-violet-500 px-5 py-3 font-medium text-white hover:bg-violet-400">
            Create account
          </Link>
          <Link href="/auth/signin" className="rounded-lg border border-white/15 px-5 py-3 font-medium hover:bg-white/5">
            Sign in
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-cyan-400/30 px-5 py-3 font-medium text-cyan-200 hover:bg-cyan-400/10">
            Open dashboard
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-5">
            <h2 className="font-semibold">Auth</h2>
            <p className="mt-2 text-sm text-slate-300">Email/password signup and sign-in with session support.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <h2 className="font-semibold">Payments</h2>
            <p className="mt-2 text-sm text-slate-300">Create an order, start Stripe Checkout, and handle webhook updates.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <h2 className="font-semibold">Email</h2>
            <p className="mt-2 text-sm text-slate-300">Welcome and order confirmation email plumbing using Resend.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
