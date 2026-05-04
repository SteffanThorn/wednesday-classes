// Body type classification + report content for the New Student Survey

export const BODY_TYPES = {
  Balanced: {
    label: 'Balanced',
    tagline: 'Your body is in a good baseline state.',
    color: '#10b981',     // emerald
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.35)',
    riskSummary: 'No significant risk areas identified at this time.',
    recommendation: `You're well-suited for most class formats. Your practice can include progressive strength,
      flexibility, and mindfulness work. We recommend starting with a Functional Integrative Yoga class to
      establish your baseline — this gives your teacher a chance to understand how your body moves before
      adding challenge. Continue listening to your body and communicating any changes to your teacher.`,
  },
  Recovery: {
    label: 'Recovery',
    tagline: 'Your body is in a rebuilding phase.',
    color: '#f59e0b',     // amber
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    riskSummary: 'Structural or postnatal history requiring careful sequencing.',
    recommendation: `Prioritise gentle, breath-led movement over intensity. Avoid deep spinal compression,
      high-impact loading, and prolonged inversion. Your practice should focus on pelvic floor awareness,
      core reconnection, and progressive joint loading — beginning at the centre and working outward.
      Please let your teacher know your history before class so modifications can be offered in real time.
      Recovery is not the absence of movement — it is the beginning of intentional movement.`,
  },
  Tension: {
    label: 'Tension',
    tagline: 'Your body is holding accumulated postural stress.',
    color: '#8b5cf6',     // purple
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.35)',
    riskSummary: 'Postural load patterns creating held tension in key areas.',
    recommendation: `Your practice should prioritise release before strength. Begin each session with
      breath-work and nervous-system settling before moving into active shapes. Emphasise thoracic
      mobility, hip opening, and spinal decompression. Avoid over-stretching — tension often reflects
      the nervous system's protective response, not just muscular tightness.
      A regular practice of 2–3 sessions per week will help reset accumulated postural patterns
      from extended sitting or standing.`,
  },
  Sensitivity: {
    label: 'Sensitivity',
    tagline: 'Your joints and nervous system need a mindful approach.',
    color: '#06b6d4',     // cyan
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.35)',
    riskSummary: 'Chronic or recurring pain patterns requiring joint-protective sequencing.',
    recommendation: `Build stability before flexibility. Your practice should avoid end-range joint
      loading and prioritise proprioception — the body's ability to sense its own position.
      Weight-bearing modifications will be offered for wrist, knee, and ankle positions.
      Chronic pain often involves a sensitised nervous system, so pacing and rest between effort
      are as important as the movement itself. Communicating how you feel on any given day
      is the most valuable information you can give your teacher.`,
  },
};

/**
 * Classify body type from survey answers.
 * Returns one of: 'Balanced' | 'Recovery' | 'Tension' | 'Sensitivity'
 */
export function classifyBodyType(answers) {
  const { painAreas = [], injuries = [], painFrequency, lifestyle, bodyFeel = [] } = answers;

  const noPain   = painAreas.includes('No pain');
  const noInjury = injuries.includes('None');

  if (noPain && noInjury) return 'Balanced';

  let recovery    = 0;
  let tension     = 0;
  let sensitivity = 0;

  // ── Recovery indicators ────────────────────────────────────────
  if (injuries.includes('Postnatal recovery'))       recovery += 4;
  if (injuries.includes('Surgery'))                  recovery += 3;
  if (injuries.includes('Fracture'))                 recovery += 2;
  if (injuries.includes('Ligament injury'))           recovery += 2;
  if (injuries.includes('Disc / spine issues'))       recovery += 1;
  if (lifestyle === 'Low activity')                   recovery += 1;
  if (bodyFeel.includes('Weak'))                      recovery += 1;

  // ── Tension indicators ─────────────────────────────────────────
  if (painAreas.includes('Lower back discomfort'))           tension += 3;
  if (painAreas.includes('Neck / shoulder tension'))         tension += 3;
  if (painAreas.includes('Hip tightness or instability'))    tension += 2;
  if (lifestyle === 'Mostly sitting (6+ hours/day)')         tension += 3;
  if (bodyFeel.includes('Stiff'))                            tension += 2;
  if (painFrequency === 'Occasionally (after activity)')     tension += 1;

  // ── Sensitivity indicators ─────────────────────────────────────
  if (painFrequency === 'Constant / long-term (3+ months)')           sensitivity += 4;
  if (painFrequency === 'Regularly (weekly)')                          sensitivity += 2;
  if (painAreas.includes('Ankle instability or frequent sprains'))     sensitivity += 3;
  if (painAreas.includes('Knee pain (stairs / squatting)'))            sensitivity += 2;
  if (painAreas.includes('Wrist or elbow discomfort (weight-bearing)')) sensitivity += 2;
  if (bodyFeel.includes('Poor balance'))                               sensitivity += 2;
  if (bodyFeel.includes('Easily fatigued'))                            sensitivity += 1;
  const realInjuries = injuries.filter((i) => i !== 'None');
  if (realInjuries.length >= 2)                                        sensitivity += 1;

  const max = Math.max(recovery, tension, sensitivity);
  if (max === 0) return 'Balanced';
  if (recovery === max)    return 'Recovery';
  if (tension === max)     return 'Tension';
  return 'Sensitivity';
}

/**
 * Derive the list of risk areas from survey answers (for display).
 */
export function getRiskAreas(answers) {
  const { painAreas = [], injuries = [] } = answers;
  const items = [];

  const painMap = {
    'Knee pain (stairs / squatting)':              'Knee — load & flexion',
    'Lower back discomfort':                       'Lower back — postural loading',
    'Neck / shoulder tension':                     'Neck & shoulders — compression',
    'Ankle instability or frequent sprains':       'Ankle — proprioception & stability',
    'Wrist or elbow discomfort (weight-bearing)':  'Wrist & elbow — weight-bearing',
    'Hip tightness or instability':                'Hip — mobility & stability',
  };
  const injuryMap = {
    'Fracture':            'Previous fracture site',
    'Surgery':             'Post-surgical tissue',
    'Disc / spine issues': 'Spinal disc / nerve sensitivity',
    'Ligament injury':     'Ligament integrity',
    'Postnatal recovery':  'Postnatal — pelvic floor & core',
  };

  for (const [key, label] of Object.entries(painMap)) {
    if (painAreas.includes(key)) items.push(label);
  }
  for (const [key, label] of Object.entries(injuryMap)) {
    if (injuries.includes(key)) items.push(label);
  }

  return items.length ? items : ['None identified'];
}
