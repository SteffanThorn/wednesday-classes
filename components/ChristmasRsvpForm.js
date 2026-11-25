'use client';

import { useState } from 'react';
import { Check, Heart, Leaf, Loader2, TreePine } from 'lucide-react';

// Colours and type from the Christmas Gathering invitation
const C = {
  bg: '#1f3a30',
  card: '#f5f0e6',
  gold: '#c9a54a',
  goldSoft: 'rgba(201,165,74,0.14)',
  cream: '#f5f0e6',
  red: '#a8322d',
  ink: '#2b2b2b',
  muted: 'rgba(245,240,230,0.75)',
};
const serif = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const sans = { fontFamily: 'Jost, Arial, sans-serif' };

const OPTIONS = [
  { value: 'dec16', title: 'December 16', sub: 'Wednesday', Icon: TreePine },
  { value: 'dec23', title: 'December 23', sub: 'Wednesday', Icon: TreePine },
  { value: 'either', title: 'Either date works for me', Icon: Heart },
  { value: 'no', title: 'Sorry, I won’t be able to join this time', Icon: Leaf },
];

// Asked only of people who are coming
const ATTENDANCE = [
  { value: 'gathering', title: 'Christmas gathering only', sub: '10:30 – 11:00 am' },
  { value: 'yoga-and-gathering', title: 'Yoga class + Christmas gathering', sub: 'Join the class, then stay for the celebration' },
];
const ATTENDANCE_THANKS = {
  gathering: 'We’ll see you for the Christmas gathering at 10:30 am.',
  'yoga-and-gathering': 'We’ll see you for yoga, followed by the Christmas gathering.',
};

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

const THANKS = {
  dec16: 'See you on Wednesday 16 December!',
  dec23: 'See you on Wednesday 23 December!',
  either: 'Thank you for being flexible. We’ll let you know the final date soon.',
  no: 'Thank you for letting us know. We’ll miss you, and see you on the mat soon!',
};

export default function ChristmasRsvpForm({ initialChoice = '' }) {
  const [choice, setChoice] = useState(initialChoice);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [attendance, setAttendance] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);

  // Email and how they'll join are only asked of people who are coming
  const attending = Boolean(choice) && choice !== 'no';

  const submit = async (e) => {
    e.preventDefault();
    if (!choice) return setError('Please choose one of the date options above.');
    if (attending && !attendance) return setError('Please choose how you’d like to join.');
    if (!name.trim()) return setError('Please enter your name.');
    if (attending && !isEmail(email)) return setError('Please enter a valid email address so we can send you the details.');
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/christmas-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          choice,
          note,
          email: attending ? email.trim() : '',
          attendance: attending ? attendance : '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setUpdated(Boolean(data.updated));
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  };

  return (
    <main style={{ background: C.bg, minHeight: '100vh', color: C.cream, ...sans }} className="px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[640px]">
        {/* Heading */}
        <header className="text-center">
          <p className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium" style={{ color: C.gold, letterSpacing: '0.35em' }}>
            <TreePine className="w-4 h-4" aria-hidden="true" /> INNER LIGHT
          </p>
          {/* One line at every screen width: the size scales with the screen */}
          <h1
            className="mt-3 leading-none whitespace-nowrap"
            style={{ ...serif, fontWeight: 600, color: C.cream, fontSize: 'clamp(2rem, 10vw, 4.5rem)' }}
          >
            Christmas Gathering
          </h1>
          <p className="mt-3 text-2xl sm:text-3xl italic" style={{ ...serif, color: C.gold }}>Move, Relax &amp; Connect</p>
        </header>

        {/* Invitation */}
        <section className="mt-10 rounded-3xl px-6 py-8 sm:px-10 text-center" style={{ background: C.card, color: C.ink }}>
          <h2 className="text-3xl sm:text-4xl" style={{ ...serif, fontWeight: 600, color: C.red }}>Let&rsquo;s celebrate the year together!</h2>
          <p className="mt-4 leading-relaxed">Our practice will begin with different forms of meditation, helping you truly connect with your body and, through your five senses, learn to be fully present in the moment.</p>
          <p className="mt-3 leading-relaxed">After our yoga practice, let&rsquo;s enjoy a little Christmas gathering with tea, coffee and homemade treats.</p>
          <p className="mt-3 leading-relaxed">I&rsquo;ll prepare Chinese tea, green tea, tea bags and coffee.</p>
          <p className="mt-3 leading-relaxed">Feel free to bring along your favourite homemade cookies, cakes or little treats to share.</p>
          <p className="mt-4 text-xl italic" style={{ ...serif, color: C.bg }}>No pressure, just friendship, connection and a little Christmas happiness!</p>
        </section>

        {state === 'done' ? (
          <section className="mt-10 rounded-3xl border px-6 py-10 text-center" style={{ borderColor: C.gold, background: C.goldSoft }}>
            <Check className="mx-auto w-10 h-10" style={{ color: C.gold }} aria-hidden="true" />
            <h2 className="mt-3 text-3xl" style={{ ...serif, fontWeight: 600 }}>
              {updated ? 'Your answer has been updated' : `Thank you, ${name.trim().split(' ')[0]}!`}
            </h2>
            <p className="mt-3" style={{ color: C.muted }}>{THANKS[choice]}</p>
            {attending && ATTENDANCE_THANKS[attendance] && (
              <p className="mt-1" style={{ color: C.muted }}>{ATTENDANCE_THANKS[attendance]}</p>
            )}
            <button
              type="button"
              onClick={() => setState('idle')}
              className="mt-6 text-sm underline underline-offset-4"
              style={{ color: C.gold }}
            >
              Change my answer
            </button>
          </section>
        ) : (
          <form onSubmit={submit} className="mt-10" noValidate>
            <div className="text-center">
              <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: C.gold, letterSpacing: '0.18em' }}>
                HELP US PLAN OUR CHRISTMAS GATHERING{' '}
                <Heart className="inline-block w-4 h-4 align-[-2px]" aria-hidden="true" />
              </p>
              <p className="mt-3">Would you like to join our community yoga gathering this December?</p>
              <p className="mt-2 font-medium">Which date works best for you?</p>
            </div>

            <fieldset className="mt-6">
              <legend className="sr-only">Choose a date</legend>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                {OPTIONS.map(({ value, title, sub, Icon }) => {
                  const selected = choice === value;
                  return (
                    <label
                      key={value}
                      className="relative flex items-center gap-3 rounded-2xl border px-4 py-4 cursor-pointer transition-colors"
                      style={{ borderColor: selected ? C.gold : 'rgba(201,165,74,0.45)', background: selected ? C.goldSoft : 'transparent' }}
                    >
                      <input
                        type="radio"
                        name="choice"
                        value={value}
                        checked={selected}
                        onChange={() => { setChoice(value); setError(''); }}
                        className="sr-only"
                      />
                      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: C.gold }} aria-hidden="true" />
                      <span className="flex-1">
                        <span className="block text-lg leading-snug font-medium">{title}</span>
                        {sub && <span className="block text-sm" style={{ color: C.muted }}>{sub}</span>}
                      </span>
                      <span
                        className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: C.gold, background: selected ? C.gold : 'transparent' }}
                        aria-hidden="true"
                      >
                        {selected && <Check className="w-3.5 h-3.5" style={{ color: C.bg }} />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {attending && (
              <fieldset className="mt-8">
                <legend className="w-full text-center font-medium">How would you like to join?</legend>
                <div className="mt-4 grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                  {ATTENDANCE.map(({ value, title, sub }) => {
                    const selected = attendance === value;
                    return (
                      <label
                        key={value}
                        className="flex items-center gap-3 rounded-2xl border px-4 py-4 cursor-pointer transition-colors"
                        style={{ borderColor: selected ? C.gold : 'rgba(201,165,74,0.45)', background: selected ? C.goldSoft : 'transparent' }}
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value={value}
                          checked={selected}
                          onChange={() => { setAttendance(value); setError(''); }}
                          className="sr-only"
                        />
                        <span className="flex-1">
                          <span className="block text-lg leading-snug font-medium">{title}</span>
                          <span className="block text-sm" style={{ color: C.muted }}>{sub}</span>
                        </span>
                        <span
                          className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: C.gold, background: selected ? C.gold : 'transparent' }}
                          aria-hidden="true"
                        >
                          {selected && <Check className="w-3.5 h-3.5" style={{ color: C.bg }} />}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="block text-sm mb-1.5" style={{ color: C.muted }}>Your name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="e.g. Sarah Jones"
                  className="w-full rounded-xl px-4 py-3 text-base outline-none focus:ring-2"
                  style={{ background: C.cream, color: C.ink, '--tw-ring-color': C.gold }}
                />
              </label>
              {attending && (
                <label className="block">
                  <span className="block text-sm mb-1.5" style={{ color: C.muted }}>Your email (so we can send you the final details)</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    maxLength={200}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="e.g. sarah@example.com"
                    className="w-full rounded-xl px-4 py-3 text-base outline-none focus:ring-2"
                    style={{ background: C.cream, color: C.ink, '--tw-ring-color': C.gold }}
                  />
                </label>
              )}
              <label className="block">
                <span className="block text-sm mb-1.5" style={{ color: C.muted }}>A note for Yuki (optional)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="e.g. I'll bring some ginger cookies!"
                  className="w-full rounded-xl px-4 py-3 text-base outline-none focus:ring-2 resize-none"
                  style={{ background: C.cream, color: C.ink, '--tw-ring-color': C.gold }}
                />
              </label>
            </div>

            {error && <p className="mt-4 text-center text-sm" style={{ color: '#f2b8a8' }} role="alert">{error}</p>}

            <button
              type="submit"
              disabled={state === 'sending'}
              className="mt-6 w-full rounded-xl text-base font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
              style={{ background: C.gold, color: C.bg, minHeight: 52, padding: '14px 16px' }}
            >
              {state === 'sending' && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {state === 'sending' ? 'Sending…' : 'Send my answer'}
            </button>
            <p className="mt-4 text-center text-sm" style={{ color: C.muted }}>Your feedback will help us choose the best date!</p>
          </form>
        )}

        <footer className="mt-12 text-center">
          <p className="text-xl italic" style={{ ...serif, color: C.muted }}>With love,</p>
          <p className="mt-1 text-lg font-medium" style={{ letterSpacing: '0.12em' }}>
            Yuki <span style={{ color: C.gold }}>|</span> Inner Light <span style={{ color: C.gold }}>&infin;</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
