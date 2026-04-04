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
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Wed 9:15 Pain Relief · Wed 18:00 Breathwork · Thu 17:30 Alignment',
    bodyFocusZh: '周三早疼痛缓解 · 周三晚呼吸修复 · 周四晚结构体态',
    emoji: '🗓️',
    description: '本周邮件包含三种课程内容：下背舒缓、呼吸安全感建立、后链打开。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Lower Back Relief', summary: '释放下背紧张并提升活动度。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Breath Awareness & Safety', summary: '通过慢呼吸建立神经系统安全感。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Posterior Chain Opening', summary: '打开后链（腿后侧、背部、小腿）并改善柔韧性。' },
    ],
  },
  {
    week: 2,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Neck/Shoulder Relief · Diaphragm Release · Posture Reset',
    bodyFocusZh: '肩颈释放 · 横膈膜呼吸 · 胸椎体态重置',
    emoji: '💆',
    description: '本周核心是肩颈与呼吸链路：晨课肩颈放松，晚课肩颈+横膈膜释放，周四胸腔打开矫正体态。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Neck & Shoulder Release', summary: '缓解肩颈僵硬与压力型头痛。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Neck, Shoulder & Diaphragm Release', summary: '释放肩颈与呼吸肌，改善浅呼吸。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Chest Opening & Posture Reset', summary: '打开胸腔、改善圆肩驼背。' },
    ],
  },
  {
    week: 3,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Hip Mobility · Nervous Down-Regulation · Hip Control',
    bodyFocusZh: '髋部灵活 · 神经系统降档 · 髋稳定控制',
    emoji: '🌀',
    description: '围绕髋部与压力调节：晨课髋部松解，晚课神经系统降档，周四建立髋关节控制力。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Hip Release & Mobility', summary: '减少久坐带来的髋部卡紧与代偿。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Down-Regulation & Grounding', summary: '从应激模式回到放松与稳定。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Hip Stability & Control', summary: '提升髋关节稳定，降低下肢受伤风险。' },
    ],
  },
  {
    week: 4,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Knee Support · Body Scan Relaxation · Knee Alignment',
    bodyFocusZh: '膝关节支持 · 身体扫描放松 · 膝对线优化',
    emoji: '🦵',
    description: '以膝关节和深层放松为主：晨课膝关节养护，晚课身体扫描，周四膝对线与稳定。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Knee Care & Support', summary: '改善膝部压力，提升行走与上下楼舒适度。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Body Scan & Somatic Relaxation', summary: '释放无意识紧张，改善睡眠恢复。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Knee Alignment & Support', summary: '纠正膝关节轨迹，增强下肢支撑。' },
    ],
  },
  {
    week: 5,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Core Support · Emotional Regulation · Deep Core Stability',
    bodyFocusZh: '核心护腰 · 情绪调节 · 深层核心稳定',
    emoji: '🔥',
    description: '核心与情绪周：晨课激活核心护腰，晚课呼吸调节情绪，周四建立深层核心稳定。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Core Activation for Back Support', summary: '激活深层核心，减轻腰背反复不适。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Breath & Emotional Regulation', summary: '通过呼吸节律提升情绪稳定度。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Deep Core Stability', summary: '构建脊柱保护性的稳定核心。' },
    ],
  },
  {
    week: 6,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Breath Mobility · Rib Expansion · Rib Structure',
    bodyFocusZh: '呼吸活动度 · 胸廓扩张 · 肋骨结构优化',
    emoji: '🌬️',
    description: '呼吸容量提升周：晨课胸廓灵活，晚课扩展呼吸，周四优化肋骨与呼吸力学。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Breathing & Rib Cage Mobility', summary: '改善呼吸模式，释放胸廓紧张。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Rib Cage Mobility & Breath Expansion', summary: '提升吸呼容量与胸廓弹性。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Rib Cage Mobility & Structure', summary: '优化肋骨位置，改善呼吸效率。' },
    ],
  },
  {
    week: 7,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Shoulder Mobility · Slow Flow Balance · Shoulder Stability',
    bodyFocusZh: '肩部灵活 · 慢流平衡 · 肩部稳定强化',
    emoji: '🧘',
    description: '肩部整合周：晨课恢复肩活动度，晚课慢流调节神经系统，周四强化肩稳定。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Shoulder Mobility & Stability', summary: '恢复肩部活动范围并减轻紧张。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Slow Flow for Nervous System Balance', summary: '动作与呼吸同步，稳定身心节律。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Shoulder Stability & Strength', summary: '增强肩关节稳定与承重能力。' },
    ],
  },
  {
    week: 8,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Foot Balance · Restorative Recovery · Foot Mechanics',
    bodyFocusZh: '足部平衡 · 修复恢复 · 足部力学优化',
    emoji: '🦶',
    description: '足部与恢复周：晨课足部力量平衡，晚课修复恢复，周四足部对线与平衡机制。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Foot Strength & Balance', summary: '提升足弓稳定与平衡能力。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Restorative Reset & Recovery', summary: '深度恢复，缓解疲劳与神经耗竭。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Foot Mechanics & Balance', summary: '从足部重建全身对线基础。' },
    ],
  },
  {
    week: 9,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Fascia Release · Breath-Mind Focus · Fascia Integration',
    bodyFocusZh: '筋膜释放 · 呼吸专注 · 筋膜链整合',
    emoji: '✨',
    description: '筋膜与专注周：晨课全身筋膜释放，晚课呼吸-注意力训练，周四整合筋膜动力链。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Full Body Fascia Release', summary: '改善全身僵硬与活动受限。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Breath, Mind & Focus Training', summary: '减少脑内噪音，提升专注与清晰度。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Fascia Lines Integration', summary: '提升身体链路协同与动作效率。' },
    ],
  },
  {
    week: 10,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Spine Decompression · Meditation Stillness · Spinal Control',
    bodyFocusZh: '脊柱减压 · 冥想静心 · 脊柱控制稳定',
    emoji: '🧠',
    description: '脊柱与静心周：晨课脊柱减压，晚课引导冥想，周四强化脊柱控制与稳定。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Spine Mobility & Decompression', summary: '释放脊柱压力，改善体态与灵活性。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Guided Meditation & Stillness', summary: '建立内在安定，提升睡眠与情绪质量。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Spinal Stability & Control', summary: '提升脊柱稳定，减少反复不适。' },
    ],
  },
  {
    week: 11,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Functional Movement · Deep Reset · Functional Strength',
    bodyFocusZh: '功能动作 · 深度重置 · 功能力量',
    emoji: '🏃',
    description: '功能整合周：晨课优化日常动作模式，晚课深度神经修复，周四转化为功能力量。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Functional Movement Training', summary: '优化走路、站立、弯腰等日常动作。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Deep Nervous System Reset', summary: '深层恢复身心系统，缓解长期压力。' },
      { slot: 'Thu 17:30', series: 'Structural Alignment', topic: 'Functional Strength & Movement', summary: '把稳定与力量应用到实际生活动作中。' },
    ],
  },
  {
    week: 12,
    title: 'Three-Class Weekly Integration',
    titleZh: '三课程周整合',
    bodyFocus: 'Full Body Integration · Sustainable Calm · Full Body Flow',
    bodyFocusZh: '全身整合 · 长效平衡 · 全身流动',
    emoji: '🌈',
    description: '收官整合周：将三类课程工具整合为可持续的每周自我照护方案。',
    classSummaries: [
      { slot: 'Wed 9:15', series: 'Functional Pain Relief', topic: 'Full Body Integration', summary: '整合全身链路，提升动作协调与舒适感。' },
      { slot: 'Wed 18:00', series: 'Nervous System Reset', topic: 'Integration & Sustainable Calm', summary: '形成可持续的呼吸与神经系统自我调节习惯。' },
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
