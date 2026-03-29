/**
 * 12-Week Yoga Course Schedule — Starting April 2026
 * Each week focuses on a specific area of the body.
 * Content (mainContent, practiceHighlights, instructorNote) is stored
 * in the database via the NewsletterCampaign model and edited through
 * the admin panel at /admin/newsletter.
 */

export const COURSE_START_DATE = '2026-04-06'; // First Monday of April 2026

export const weeklySchedule = [
  {
    week: 1,
    title: 'Foundation & Grounding',
    titleZh: '大地根基',
    bodyFocus: 'Feet & Legs',
    bodyFocusZh: '双脚与腿部',
    emoji: '🌿',
    description: 'We begin from the ground up — rooting through the feet, waking up the legs, and building a strong foundation for the journey ahead.',
  },
  {
    week: 2,
    title: 'Core Power',
    titleZh: '核心力量',
    bodyFocus: 'Core & Abdomen',
    bodyFocusZh: '核心与腹部',
    emoji: '🔥',
    description: 'Ignite your inner fire. This week we explore the core — the centre of strength, stability, and energy.',
  },
  {
    week: 3,
    title: 'Hip Liberation',
    titleZh: '骨盆开放',
    bodyFocus: 'Hips & Pelvis',
    bodyFocusZh: '骨盆与髋部',
    emoji: '🌀',
    description: 'The hips store emotion and tension. This week we gently open and release, creating space in the body and the mind.',
  },
  {
    week: 4,
    title: 'Spinal Flow',
    titleZh: '脊柱伸展',
    bodyFocus: 'Spine & Back',
    bodyFocusZh: '脊椎与背部',
    emoji: '🌊',
    description: 'The spine is the axis of life. We explore flexion, extension, rotation, and lateral movement to nourish the entire back body.',
  },
  {
    week: 5,
    title: 'Shoulder Release',
    titleZh: '肩膀放松',
    bodyFocus: 'Shoulders & Upper Back',
    bodyFocusZh: '肩膀与上背',
    emoji: '🕊️',
    description: 'We carry so much in our shoulders. This week is about letting go — releasing tension held in the shoulders and upper back.',
  },
  {
    week: 6,
    title: 'Heart Opening',
    titleZh: '心轮开启',
    bodyFocus: 'Chest & Heart Center',
    bodyFocusZh: '胸部与心脏',
    emoji: '💛',
    description: 'Open your heart — literally and figuratively. Chest openers and backbends invite vulnerability, courage, and compassion.',
  },
  {
    week: 7,
    title: 'Neck & Jaw Release',
    titleZh: '颈部释放',
    bodyFocus: 'Neck, Jaw & Head',
    bodyFocusZh: '颈部与头部',
    emoji: '🌸',
    description: 'Tension in the neck and jaw is deeply connected to stress and unexpressed emotion. We soften, breathe, and release.',
  },
  {
    week: 8,
    title: 'Arms & Wrist Flow',
    titleZh: '上肢流动',
    bodyFocus: 'Arms, Wrists & Hands',
    bodyFocusZh: '手臂与手腕',
    emoji: '✨',
    description: 'From the fingertips to the shoulder socket — we mobilise, strengthen, and bring awareness to the full arm line.',
  },
  {
    week: 9,
    title: 'Lower Body Integration',
    titleZh: '下肢整合',
    bodyFocus: 'Legs, Knees & Ankles',
    bodyFocusZh: '下肢整合',
    emoji: '🌱',
    description: 'Revisiting the lower body with fresh eyes. We integrate strength and flexibility from the hips down through the feet.',
  },
  {
    week: 10,
    title: 'Upper Body Integration',
    titleZh: '上肢整合',
    bodyFocus: 'Shoulders, Neck & Arms',
    bodyFocusZh: '肩颈臂整合',
    emoji: '🌤️',
    description: 'Weaving together the work of the upper body — shoulders, neck, chest, and arms — into one fluid, connected practice.',
  },
  {
    week: 11,
    title: 'Full Body Flow',
    titleZh: '全身流动',
    bodyFocus: 'Full Body',
    bodyFocusZh: '全身',
    emoji: '🌈',
    description: "Everything comes together. A full-body flow that honours the journey we've taken over the past 10 weeks.",
  },
  {
    week: 12,
    title: 'Mind, Body & Spirit',
    titleZh: '心灵归整',
    bodyFocus: 'Mind, Body & Spirit',
    bodyFocusZh: '身心灵整合',
    emoji: '🪷',
    description: 'The final week. We celebrate, integrate, and rest — honouring all that has shifted within us through this 12-week journey.',
  },
];

/**
 * Get schedule info for a specific week number (1-12)
 */
export function getWeekSchedule(weekNumber) {
  return weeklySchedule.find((w) => w.week === weekNumber) || null;
}
