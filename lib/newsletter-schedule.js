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
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Wed 9:15 Pain Relief · Thu 17:30 Alignment',
    bodyFocusZh: '周三早疼痛缓解 · 周四晚结构体态',
    emoji: '🗓️',
    description: '本周邮件包含两种课程内容：下背舒缓、后链打开。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Lower Back Relief', summary: '释放下背紧张并提升活动度。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Posterior Chain Opening', summary: '打开后链（腿后侧、背部、小腿）并改善柔韧性。' },
    ],
  },
  {
    week: 2,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Neck/Shoulder Relief · Posture Reset',
    bodyFocusZh: '肩颈释放 · 胸椎体态重置',
    emoji: '💆',
    description: '本周核心是肩颈：晨课肩颈放松，周四胸腔打开矫正体态。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Neck & Shoulder Release', summary: '缓解肩颈僵硬与压力型头痛。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Chest Opening & Posture Reset', summary: '打开胸腔、改善圆肩驼背。' },
    ],
  },
  {
    week: 3,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Hip Mobility · Hip Control',
    bodyFocusZh: '髋部灵活 · 髋稳定控制',
    emoji: '🌀',
    description: '围绕髋部：晨课髋部松解，周四建立髋关节控制力。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Hip Release & Mobility', summary: '减少久坐带来的髋部卡紧与代偿。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Hip Stability & Control', summary: '提升髋关节稳定，降低下肢受伤风险。' },
    ],
  },
  {
    week: 4,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Knee Support · Knee Alignment',
    bodyFocusZh: '膝关节支持 · 膝对线优化',
    emoji: '🦵',
    description: '以膝关节为主：晨课膝关节养护，周四膝对线与稳定。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Knee Care & Support', summary: '改善膝部压力，提升行走与上下楼舒适度。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Knee Alignment & Support', summary: '纠正膝关节轨迹，增强下肢支撑。' },
    ],
  },
  {
    week: 5,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Core Support · Deep Core Stability',
    bodyFocusZh: '核心护腰 · 深层核心稳定',
    emoji: '🔥',
    description: '核心周：晨课激活核心护腰，周四建立深层核心稳定。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Core Activation for Back Support', summary: '激活深层核心，减轻腰背反复不适。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Deep Core Stability', summary: '构建脊柱保护性的稳定核心。' },
    ],
  },
  {
    week: 6,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Breath Mobility · Rib Structure',
    bodyFocusZh: '呼吸活动度 · 肋骨结构优化',
    emoji: '🌬️',
    description: '呼吸容量提升周：晨课胸廓灵活，周四优化肋骨与呼吸力学。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Breathing & Rib Cage Mobility', summary: '改善呼吸模式，释放胸廓紧张。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Rib Cage Mobility & Structure', summary: '优化肋骨位置，改善呼吸效率。' },
    ],
  },
  {
    week: 7,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Shoulder Mobility · Shoulder Stability',
    bodyFocusZh: '肩部灵活 · 肩部稳定强化',
    emoji: '🧘',
    description: '肩部整合周：晨课恢复肩活动度，周四强化肩稳定。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Shoulder Mobility & Stability', summary: '恢复肩部活动范围并减轻紧张。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Shoulder Stability & Strength', summary: '增强肩关节稳定与承重能力。' },
    ],
  },
  {
    week: 8,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Foot Balance · Foot Mechanics',
    bodyFocusZh: '足部平衡 · 足部力学优化',
    emoji: '🦶',
    description: '足部周：晨课足部力量平衡，周四足部对线与平衡机制。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Foot Strength & Balance', summary: '提升足弓稳定与平衡能力。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Foot Mechanics & Balance', summary: '从足部重建全身对线基础。' },
    ],
  },
  {
    week: 9,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Fascia Release · Fascia Integration',
    bodyFocusZh: '筋膜释放 · 筋膜链整合',
    emoji: '✨',
    description: '筋膜周：晨课全身筋膜释放，周四整合筋膜动力链。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Full Body Fascia Release', summary: '改善全身僵硬与活动受限。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Fascia Lines Integration', summary: '提升身体链路协同与动作效率。' },
    ],
  },
  {
    week: 10,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Spine Decompression · Spinal Control',
    bodyFocusZh: '脊柱减压 · 脊柱控制稳定',
    emoji: '🧠',
    description: '脊柱周：晨课脊柱减压，周四强化脊柱控制与稳定。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Spine Mobility & Decompression', summary: '释放脊柱压力，改善体态与灵活性。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Spinal Stability & Control', summary: '提升脊柱稳定，减少反复不适。' },
    ],
  },
  {
    week: 11,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Functional Movement · Functional Strength',
    bodyFocusZh: '功能动作 · 功能力量',
    emoji: '🏃',
    description: '功能整合周：晨课优化日常动作模式，周四转化为功能力量。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Functional Movement Training', summary: '优化走路、站立、弯腰等日常动作。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Functional Strength & Movement', summary: '把稳定与力量应用到实际生活动作中。' },
    ],
  },
  {
    week: 12,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Full Body Integration · Full Body Flow',
    bodyFocusZh: '全身整合 · 全身流动',
    emoji: '🌈',
    description: '收官整合周：将两类课程工具整合为可持续的每周自我照护方案。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Full Body Integration', summary: '整合全身链路，提升动作协调与舒适感。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Full Body Integration & Flow', summary: '融合力量、灵活与控制，建立流畅体态。' },
    ],
  },
];

/**
 * Get schedule info for a specific week number (1-12)
 */
export function getWeekSchedule(weekNumber) {
  return weeklySchedule.find((w) => w.week === weekNumber) || null;
}
