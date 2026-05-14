'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Mail, Loader2 } from 'lucide-react';
import FloatingParticles from '@/components/FloatingParticle';
import { classifyBodyType, getRiskAreas, BODY_TYPES } from '@/lib/body-assessment';

// ── Option lists ───────────────────────────────────────────────────

const PAIN_OPTIONS = [
  'Knee pain (stairs / squatting)',
  'Lower back discomfort',
  'Neck / shoulder tension',
  'Ankle instability or frequent sprains',
  'Wrist or elbow discomfort (weight-bearing)',
  'Hip tightness or instability',
  'No pain',
];

const INJURY_OPTIONS = [
  'Fracture',
  'Surgery',
  'Disc / spine issues',
  'Ligament injury',
  'Postnatal recovery',
  'None',
];

const AGE_OPTIONS = ['Under 25', '25–35', '35–45', '45–60', '60+'];

const GENDER_OPTIONS = [
  { val: 'Male',               icon: '♂', desc: '' },
  { val: 'Female',             icon: '♀', desc: '' },
  { val: 'Prefer not to say',  icon: '—', desc: '' },
];

const LAST_BIRTH_OPTIONS = [
  'Less than 6 months ago',
  '6 months – 1 year ago',
  '1 – 3 years ago',
  'More than 3 years ago',
];

const PELVIC_FLOOR_OPTIONS = [
  'Yes — still noticeable (e.g. leaking, pressure, heaviness)',
  'Occasionally — mild and improving',
  'No — fully recovered',
  'Unsure',
];

const FREQUENCY_OPTIONS = [
  'Occasionally (after activity)',
  'Regularly (weekly)',
  'Constant / long-term (3+ months)',
];

const LIFESTYLE_OPTIONS = [
  'Mostly sitting (6+ hours/day)',
  'Mostly standing',
  'Active (regular exercise)',
  'Low activity',
];

const BODY_FEEL_OPTIONS = [
  'Stiff',
  'Weak',
  'Easily fatigued',
  'Poor balance',
  'Feels good overall',
];

const GOAL_OPTIONS = [
  'Reduce pain',
  'Improve strength',
  'Increase flexibility',
  'Postnatal recovery',
  'Relaxation / stress relief',
  'Reconnect with body',
];

const DIET_OPTIONS = [
  { val: 'Balanced — vegetables, fruit & protein daily', icon: '🥗' },
  { val: 'Mostly home-cooked but limited variety',       icon: '🍳' },
  { val: 'Frequent processed or fast food',              icon: '🍔' },
  { val: 'Vegetarian / plant-based',                    icon: '🌱' },
];

const SLEEP_OPTIONS = [
  { val: 'Light sleep — wake easily or frequently',     icon: '😴' },
  { val: 'Moderate — occasionally disrupted',           icon: '🌙' },
  { val: 'Good — generally well-rested',                icon: '✨' },
  { val: 'Poor — difficulty falling or staying asleep', icon: '😞' },
];

// ── Initial state ──────────────────────────────────────────────────

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  ageRange: '',
  gender: '',
  hasBirthExperience: '',
  lastBirthTime: '',
  pelvicFloorIssues: '',
  painAreas: [],
  painLevel: '',
  painType: '',
  painFrequency: '',
  painDetail: '',
  injuries: [],
  injuryDetail: '',
  lifestyle: '',
  bodyFeel: [],
  goals: [],
  waiverAccepted: null,
};

// ── Step order (linear baseline) ──────────────────────────────────

const STEP_ORDER = [
  'welcome',
  'q1', 'q2', 'q3', 'q4',
  'q4b', 'q4c', 'q4d', 'q4e',
  'q5', 'q5b', 'q5c', 'q6', 'q7',
  'q8', 'q9',
  'q10', 'q11',
  'q12',
  'q13',
  'done',
];

const QUESTION_NUM = {
  q1: 1, q2: 2, q3: 3, q4: 4,
  q4b: 5, q4c: 6, q4d: 7, q4e: 8,
  q5: 9, q5b: 10, q5c: 11, q6: 12, q7: 13,
  q8: 14, q9: 15,
  q10: 16, q11: 17,
  q12: 18,
  q13: 19,
};

const TOTAL = 19;

function getNextStep(step, answers) {
  if (step === 'q4b') {
    return answers.gender === 'Female' ? 'q4c' : 'q5';
  }
  if (step === 'q4c') {
    return answers.hasBirthExperience === 'Yes' ? 'q4d' : 'q5';
  }
  if (step === 'q5') {
    return answers.painAreas.includes('No pain') ? 'q8' : 'q5b';
  }
  if (step === 'q8') {
    return answers.injuries.includes('None') ? 'q10' : 'q9';
  }
  const i = STEP_ORDER.indexOf(step);
  return STEP_ORDER[i + 1] ?? 'done';
}

// ── Main page ──────────────────────────────────────────────────────

export default function SurveyPage() {
  const router = useRouter();
  const [history, setHistory] = useState(['welcome']);
  const [answers, setAnswers] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const step = history[history.length - 1];
  const qNum = QUESTION_NUM[step] ?? 0;
  const progress = step === 'welcome' || step === 'done' ? 0 : qNum / TOTAL;

  const setField = (field, value) =>
    setAnswers((prev) => ({ ...prev, [field]: value }));

  const toggleMulti = (field, option) => {
    const exclusive = option === 'No pain' || option === 'None';
    setAnswers((prev) => {
      const cur = prev[field];
      if (exclusive) {
        return { ...prev, [field]: cur.includes(option) ? [] : [option] };
      }
      const without = cur.filter((o) => o !== 'No pain' && o !== 'None');
      return {
        ...prev,
        [field]: without.includes(option)
          ? without.filter((o) => o !== option)
          : [...without, option],
      };
    });
  };

  const canNext = () => {
    switch (step) {
      case 'welcome': return true;
      case 'q1':  return answers.name.trim().length > 0;
      case 'q2':  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email);
      case 'q3':  return true;
      case 'q4':  return !!answers.ageRange;
      case 'q4b': return !!answers.gender;
      case 'q4c': return !!answers.hasBirthExperience;
      case 'q4d': return !!answers.lastBirthTime;
      case 'q4e': return !!answers.pelvicFloorIssues;
      case 'q5':  return answers.painAreas.length > 0;
      case 'q5b': return !!answers.painLevel;
      case 'q5c': return !!answers.painType;
      case 'q6':  return !!answers.painFrequency;
      case 'q7':  return true;
      case 'q8':  return answers.injuries.length > 0;
      case 'q9':  return true;
      case 'q10': return !!answers.lifestyle;
      case 'q11': return answers.bodyFeel.length > 0;
      case 'q12': return answers.goals.length > 0;
      case 'q13': return answers.waiverAccepted !== null;
      default:    return true;
    }
  };

  const goBack = () => setHistory((h) => h.slice(0, -1));

  const goNext = async () => {
    const next = getNextStep(step, answers);
    if (next === 'done') {
      setSubmitting(true);
      try {
        await fetch('/api/survey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });
      } catch { /* show done screen regardless */ }
      setSubmitting(false);
    }
    setHistory((h) => [...h, next]);
  };

  const waiverNo = answers.waiverAccepted === false;

  // ── Shared sub-components ──────────────────────────────────────

  const SingleChoice = ({ field, options }) => (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setField(field, opt)}
          className={`w-full px-5 py-3 rounded-xl border text-sm text-left transition-all ${
            answers[field] === opt
              ? 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan'
              : 'bg-card/40 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40 hover:bg-card/60'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const MultiSelect = ({ field, options }) => (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {options.map((opt) => {
        const selected = answers[field].includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggleMulti(field, opt)}
            className={`w-full px-5 py-3 rounded-xl border text-sm text-left flex items-center gap-3 transition-all ${
              selected
                ? 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan'
                : 'bg-card/40 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40 hover:bg-card/60'
            }`}
          >
            <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
              selected ? 'bg-glow-cyan border-glow-cyan' : 'border-glow-cyan/40'
            }`}>
              {selected && <Check className="w-3 h-3 text-background" />}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );

  // Navigation bar shared by all question steps
  const Nav = ({ disabled }) => (
    <div className="flex items-center gap-3 pt-4">
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-glow-cyan/20
                   text-sm text-muted-foreground hover:border-glow-cyan/40 hover:text-foreground transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={!canNext() || submitting || disabled}
        className="flex items-center gap-1.5 px-7 py-2.5 rounded-full bg-glow-cyan/10 border border-glow-cyan/30
                   text-glow-cyan text-sm font-medium hover:bg-glow-cyan/20 transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : 'Continue'}
        {!submitting && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Progress bar */}
        {step !== 'welcome' && step !== 'done' && (
          <div className="w-full h-0.5 bg-glow-cyan/10">
            <div
              className="h-full bg-gradient-to-r from-glow-cyan to-glow-purple transition-all duration-500 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Back-to-home pill */}
        {step === 'welcome' && (
          <div className="px-6 pt-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
            </button>
          </div>
        )}

        {/* Central content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md" key={step}>

            {/* ── Welcome ── */}
            {step === 'welcome' && (
              <div className="text-center space-y-6 animate-fade-in-up">
                <p className="text-xs tracking-[0.3em] text-glow-cyan/70 uppercase">Inner Light Yoga</p>
                <h1 className="font-display text-3xl md:text-4xl text-glow-subtle leading-snug">
                  Start with Your Body,<br />Not the Pose
                </h1>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Before your first class, we'd love to understand your body.
                  This short assessment helps us support you safely — especially if you've
                  experienced pain, injury, or instability.
                </p>
                <p className="text-sm text-glow-cyan/60">Takes 2–3 minutes.</p>
                <button
                  onClick={goNext}
                  className="mt-2 px-10 py-3.5 rounded-full bg-gradient-to-r from-glow-cyan/20 to-glow-purple/20
                             border border-glow-cyan/30 text-foreground hover:from-glow-cyan/30 hover:to-glow-purple/30
                             hover:border-glow-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-glow-cyan/20
                             text-base font-medium"
                >
                  Start →
                </button>
              </div>
            )}

            {/* ── Q1 Name ── */}
            {step === 'q1' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader section="① Basic Information" num={1} total={TOTAL} question="What's your name?" />
                <input
                  type="text" autoFocus
                  value={answers.name}
                  onChange={(e) => setField('name', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canNext() && goNext()}
                  placeholder="Your name"
                  className="w-full max-w-sm px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20
                             focus:border-glow-cyan/50 focus:outline-none text-foreground text-base"
                />
                <Nav />
              </div>
            )}

            {/* ── Q2 Email ── */}
            {step === 'q2' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader section="① Basic Information" num={2} total={TOTAL} question="Your email address" />
                <input
                  type="email" autoFocus
                  value={answers.email}
                  onChange={(e) => setField('email', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canNext() && goNext()}
                  placeholder="you@example.com"
                  className="w-full max-w-sm px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20
                             focus:border-glow-cyan/50 focus:outline-none text-foreground text-base"
                />
                <Nav />
              </div>
            )}

            {/* ── Q3 Phone ── */}
            {step === 'q3' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="① Basic Information" num={3} total={TOTAL}
                  question={<>Phone number <span className="text-sm font-normal text-muted-foreground/50">(optional)</span></>}
                />
                <input
                  type="tel" autoFocus
                  value={answers.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && goNext()}
                  placeholder="+64 XX XXX XXXX"
                  className="w-full max-w-sm px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20
                             focus:border-glow-cyan/50 focus:outline-none text-foreground text-base"
                />
                <Nav />
              </div>
            )}

            {/* ── Q4 Age Range ── */}
            {step === 'q4' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader section="① Basic Information" num={4} total={TOTAL} question="Age Range" />
                <SingleChoice field="ageRange" options={AGE_OPTIONS} />
                <Nav />
              </div>
            )}

            {/* ── Q4b Gender ── */}
            {step === 'q4b' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader section="① Basic Information" num={5} total={TOTAL} question="What is your gender?" />
                <div className="flex flex-col gap-3 w-full max-w-sm">
                  {GENDER_OPTIONS.map(({ val, icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setField('gender', val)}
                      className={`w-full px-5 py-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                        answers.gender === val
                          ? 'bg-glow-cyan/20 border-glow-cyan'
                          : 'bg-card/40 border-glow-cyan/20 hover:border-glow-cyan/40 hover:bg-card/60'
                      }`}
                    >
                      <span className={`text-xl w-8 text-center ${answers.gender === val ? 'text-glow-cyan' : 'text-muted-foreground'}`}>{icon}</span>
                      <span className={`text-sm font-medium ${answers.gender === val ? 'text-glow-cyan' : 'text-foreground'}`}>{val}</span>
                    </button>
                  ))}
                </div>
                <Nav />
              </div>
            )}

            {/* ── Q4c Birth Experience (female only) ── */}
            {step === 'q4c' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="① Basic Information" num={6} total={TOTAL}
                  question="Have you had any childbirth experience?"
                />
                <div className="flex gap-3 w-full max-w-sm">
                  {[
                    { val: 'Yes', label: 'Yes', active: 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan' },
                    { val: 'No',  label: 'No',  active: 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan' },
                  ].map(({ val, label, active }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setField('hasBirthExperience', val)}
                      className={`flex-1 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                        answers.hasBirthExperience === val
                          ? active
                          : 'bg-card/40 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Nav />
              </div>
            )}

            {/* ── Q4d Last Birth Time ── */}
            {step === 'q4d' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="① Basic Information" num={7} total={TOTAL}
                  question="How long ago was your most recent birth?"
                />
                <SingleChoice field="lastBirthTime" options={LAST_BIRTH_OPTIONS} />
                <Nav />
              </div>
            )}

            {/* ── Q4e Pelvic Floor ── */}
            {step === 'q4e' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="① Basic Information" num={8} total={TOTAL}
                  question="Do you still experience pelvic floor issues?"
                  hint="e.g. leaking when sneezing / jumping, pressure, or heaviness"
                />
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {PELVIC_FLOOR_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setField('pelvicFloorIssues', opt)}
                      className={`w-full px-5 py-3 rounded-xl border text-sm text-left transition-all ${
                        answers.pelvicFloorIssues === opt
                          ? 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan'
                          : 'bg-card/40 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40 hover:bg-card/60'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <Nav />
              </div>
            )}

            {/* ── Q5 Joint Pain ── */}
            {step === 'q5' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="② Pain & Joint Screening" num={5} total={TOTAL}
                  question="Have you experienced any of the following?"
                  hint="Select all that apply"
                />
                <MultiSelect field="painAreas" options={PAIN_OPTIONS} />
                <Nav />
              </div>
            )}

            {/* ── Q5b Pain Level ── */}
            {step === 'q5b' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="② Pain & Joint Screening" num={6} total={TOTAL}
                  question="On a scale of 1–10, how intense is your pain?"
                  hint="1 = mild discomfort · 10 = severe / debilitating"
                />
                <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
                  {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => {
                    const level = Number(n);
                    const color =
                      level <= 3 ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20' :
                      level <= 6 ? 'text-amber-400 border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20' :
                                   'text-red-400 border-red-400/40 bg-red-400/10 hover:bg-red-400/20';
                    const selectedColor =
                      level <= 3 ? 'bg-emerald-400/30 border-emerald-400 text-emerald-300' :
                      level <= 6 ? 'bg-amber-400/30 border-amber-400 text-amber-300' :
                                   'bg-red-400/30 border-red-400 text-red-300';
                    const isSelected = answers.painLevel === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setField('painLevel', n)}
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                          isSelected ? selectedColor : `bg-card/40 border-glow-cyan/20 text-muted-foreground ${color}`
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                {answers.painLevel && (
                  <p className="text-sm text-muted-foreground/70 text-center">
                    {Number(answers.painLevel) <= 3 ? '🟢 Mild — manageable in daily life' :
                     Number(answers.painLevel) <= 6 ? '🟡 Moderate — affects some activities' :
                                                      '🔴 Severe — significantly limits activity'}
                  </p>
                )}
                <Nav />
              </div>
            )}

            {/* ── Q5c Pain Type ── */}
            {step === 'q5c' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="② Pain & Joint Screening" num={7} total={TOTAL}
                  question="How would you describe the nature of your pain?"
                />
                <div className="flex flex-col gap-3 w-full max-w-sm">
                  {[
                    {
                      val: 'Localized (one fixed spot)',
                      icon: '📍',
                      desc: 'Pain stays in one specific area and does not spread',
                    },
                    {
                      val: 'Radiating (spreads to other areas)',
                      icon: '⚡',
                      desc: 'Pain travels down the arm, leg, or another region',
                    },
                    {
                      val: 'Both — localized and sometimes radiating',
                      icon: '🔀',
                      desc: 'Mostly in one spot but occasionally spreads',
                    },
                  ].map(({ val, icon, desc }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setField('painType', val)}
                      className={`w-full px-4 py-3.5 rounded-xl border text-left transition-all ${
                        answers.painType === val
                          ? 'bg-glow-cyan/20 border-glow-cyan'
                          : 'bg-card/40 border-glow-cyan/20 hover:border-glow-cyan/40 hover:bg-card/60'
                      }`}
                    >
                      <p className={`text-sm font-medium mb-0.5 ${answers.painType === val ? 'text-glow-cyan' : 'text-foreground'}`}>
                        {icon} {val}
                      </p>
                      <p className="text-xs text-muted-foreground/70">{desc}</p>
                    </button>
                  ))}
                </div>
                <Nav />
              </div>
            )}

            {/* ── Q6 Pain Frequency ── */}
            {step === 'q6' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader section="② Pain & Joint Screening" num={6} total={TOTAL} question="How often do you experience discomfort?" />
                <SingleChoice field="painFrequency" options={FREQUENCY_OPTIONS} />
                <Nav />
              </div>
            )}

            {/* ── Q7 Pain Detail ── */}
            {step === 'q7' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="② Pain & Joint Screening" num={7} total={TOTAL}
                  question={<>Describe your pain or discomfort <span className="text-sm font-normal text-muted-foreground/50">(optional)</span></>}
                />
                <textarea
                  value={answers.painDetail}
                  onChange={(e) => setField('painDetail', e.target.value)}
                  placeholder="If you'd like, describe your pain or discomfort in more detail…"
                  rows={4}
                  className="w-full max-w-sm px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20
                             focus:border-glow-cyan/50 focus:outline-none text-foreground text-sm resize-none"
                />
                <Nav />
              </div>
            )}

            {/* ── Q8 Injury History ── */}
            {step === 'q8' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="③ Injury / Surgery History" num={8} total={TOTAL}
                  question="Do you have any history of injury or surgery?"
                  hint="Select all that apply"
                />
                <MultiSelect field="injuries" options={INJURY_OPTIONS} />
                <Nav />
              </div>
            )}

            {/* ── Q9 Injury Detail ── */}
            {step === 'q9' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="③ Injury / Surgery History" num={9} total={TOTAL}
                  question={<>Please briefly describe <span className="text-sm font-normal text-muted-foreground/50">(optional)</span></>}
                />
                <textarea
                  value={answers.injuryDetail}
                  onChange={(e) => setField('injuryDetail', e.target.value)}
                  placeholder="Describe your injury or surgery history…"
                  rows={4}
                  className="w-full max-w-sm px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20
                             focus:border-glow-cyan/50 focus:outline-none text-foreground text-sm resize-none"
                />
                <Nav />
              </div>
            )}

            {/* ── Q10 Lifestyle ── */}
            {step === 'q10' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader section="④ Body & Lifestyle" num={10} total={TOTAL} question="Which best describes your daily routine?" />
                <SingleChoice field="lifestyle" options={LIFESTYLE_OPTIONS} />
                <Nav />
              </div>
            )}

            {/* ── Q11 Body Feel ── */}
            {step === 'q11' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="④ Body & Lifestyle" num={11} total={TOTAL}
                  question="How does your body generally feel?"
                  hint="Select all that apply"
                />
                <MultiSelect field="bodyFeel" options={BODY_FEEL_OPTIONS} />
                <Nav />
              </div>
            )}

            {/* ── Q12 Goals ── */}
            {step === 'q12' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="⑤ Goals" num={12} total={TOTAL}
                  question="What would you like to improve?"
                  hint="Select all that apply"
                />
                <MultiSelect field="goals" options={GOAL_OPTIONS} />
                <Nav />
              </div>
            )}

            {/* ── Q13 Waiver ── */}
            {step === 'q13' && (
              <div className="space-y-6 animate-fade-in-up">
                <QuestionHeader
                  section="⑥ Risk Acknowledgement" num={13} total={TOTAL}
                  question="I understand that physical activity carries some risk and I take responsibility for my participation."
                />
                <div className="flex gap-3 w-full max-w-sm">
                  {[
                    { val: true,  label: 'Yes, I agree', active: 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan' },
                    { val: false, label: 'No',           active: 'bg-red-500/20 border-red-500 text-red-400' },
                  ].map(({ val, label, active }) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setField('waiverAccepted', val)}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                        answers.waiverAccepted === val
                          ? active
                          : 'bg-card/40 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Nav />
              </div>
            )}

            {/* ── Done ── */}
            {step === 'done' && (
              <EndScreen
                waiverNo={waiverNo}
                answers={answers}
                onHome={() => router.push('/')}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ── QuestionHeader ─────────────────────────────────────────────────

function QuestionHeader({ section, num, total, question, hint }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-widest text-glow-cyan/60 uppercase">{section}</p>
        <p className="text-xs text-muted-foreground/50">{num} / {total}</p>
      </div>
      <h2 className="font-display text-2xl md:text-3xl text-glow-subtle leading-snug pt-1">{question}</h2>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── EndScreen ──────────────────────────────────────────────────────

function EndScreen({ waiverNo, answers, onHome }) {
  const [consent, setConsent]     = useState(false);
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [sendError, setSendError] = useState('');

  // Waiver declined — no report, just contact prompt
  if (waiverNo) {
    return (
      <div className="text-center space-y-5 animate-fade-in-up">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl">⚠️</div>
        <h2 className="font-display text-2xl md:text-3xl text-glow-subtle">Before you join</h2>
        <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
          For your safety, we recommend speaking with us before participating.
          Please contact us directly.
        </p>
        <button onClick={onHome} className="px-7 py-2.5 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-all text-sm">
          Return to Homepage
        </button>
      </div>
    );
  }

  // ── Compute report ──
  const bodyTypeName = classifyBodyType(answers);
  const bodyType     = BODY_TYPES[bodyTypeName];
  const riskAreas    = getRiskAreas(answers);

  const handleSend = async () => {
    if (!consent || sending || sent) return;
    setSending(true);
    setSendError('');
    try {
      const res = await fetch('/api/survey/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, emailConsent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setSent(true);
    } catch (err) {
      setSendError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Dynamic colours from body type
  const c = bodyType.color;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="text-3xl">🧠</div>
        <p className="text-xs tracking-[0.3em] text-glow-cyan/60 uppercase">Assessment Complete</p>
        <h2 className="font-display text-2xl md:text-3xl text-glow-subtle">Your Level 1 Body Report</h2>
      </div>

      {/* Body Type card */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: bodyType.bg, borderColor: bodyType.border }}
      >
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: c }}>Body Type</p>
        <p className="text-2xl font-semibold mb-1" style={{ color: c }}>{bodyTypeName}</p>
        <p className="text-sm text-muted-foreground italic">{bodyType.tagline}</p>
      </div>

      {/* Risk Areas */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-2">Risk Areas</p>
        <ul className="space-y-1.5">
          {riskAreas.map((r) => (
            <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Hidden recommendation notice */}
      <div className="rounded-xl border border-dashed border-glow-cyan/25 bg-glow-cyan/5 px-4 py-3 flex items-start gap-3">
        <Mail className="w-4 h-4 text-glow-cyan flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your full <strong className="text-foreground">Training Recommendation</strong> is included in the report sent to your email.
        </p>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <button
          type="button"
          onClick={() => setConsent((v) => !v)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            consent
              ? 'bg-glow-cyan border-glow-cyan'
              : 'border-glow-cyan/30 group-hover:border-glow-cyan/60'
          }`}
        >
          {consent && <Check className="w-3 h-3 text-background" />}
        </button>
        <span className="text-sm text-muted-foreground leading-relaxed">
          I agree to receive my <strong className="text-foreground">Level 1 Body Assessment Report</strong> via email to <span className="text-glow-cyan">{answers.email}</span>
        </span>
      </label>

      {sendError && (
        <p className="text-sm text-red-400 px-1">{sendError}</p>
      )}

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!consent || sending || sent}
        className={`w-full py-3.5 rounded-2xl border font-medium text-sm flex items-center justify-center gap-2 transition-all ${
          sent
            ? 'bg-green-500/15 border-green-500/40 text-green-400 cursor-default'
            : consent
              ? 'bg-glow-cyan/10 border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20'
              : 'bg-card/30 border-glow-cyan/10 text-muted-foreground/40 cursor-not-allowed'
        }`}
      >
        {sent ? (
          <><Check className="w-4 h-4" /> Email Sent</>
        ) : sending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
        ) : (
          <><Mail className="w-4 h-4" /> Send Report to Email</>
        )}
      </button>

      <button
        onClick={onHome}
        className="w-full py-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        Return to Homepage
      </button>
    </div>
  );
}
