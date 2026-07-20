/**
 * 12-Week Yoga Course Schedule — Starting April 2026
 * Each week focuses on a specific area of the body.
 * Content (mainContent, practiceHighlights, instructorNote) is stored
 * in the database via the NewsletterCampaign model and edited through
 * the admin panel at /admin/newsletter.
 *
 * Bare fields (title, bodyFocus, classSummaries[].topic/summary) are English —
 * these are the values embedded directly in the customer-facing email, which
 * goes out to English-speaking clients in Palmerston North, NZ.
 * `*Zh` fields are Chinese, shown only in the admin dashboard for reference.
 */

export const COURSE_START_DATE = '2026-04-06'; // First Monday of April 2026

export const weeklySchedule = [
  {
    week: 1,
    title: 'Two-Class Weekly Integration',
    titleZh: '两课程周整合',
    bodyFocus: 'Wed 9:15 Resistance Band & Neck Alignment · Thu 17:30 Breath & Nervous System Reset',
    bodyFocusZh: '周三弹力带与肩颈正位 · 周四呼吸与神经重塑',
    emoji: '💆',
    description: '本周聚焦肩颈：周三用弹力带训练肩颈正位，改善长期低头工作、看手机导致的颈椎前移，以及肩部酸痛甚至偏头痛；周四通过呼吸练习释放肩颈紧张，促进神经系统重塑。',
    classSummaries: [
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Resistance Band & Neck Alignment Training',
        topicZh: '弹力带与肩颈正位的训练',
        summary: 'Helps improve forward head posture from long hours at a desk or on the phone, along with shoulder tension and tension headaches.',
        summaryZh: '帮助改善经常低头工作、看手机导致的颈椎前移，以及肩部经常酸疼甚至偏头痛的问题。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Breath & Neck Tension Release, Nervous System Reset',
        topicZh: '呼吸与肩颈紧张的释放以及神经重塑',
        summary: 'Uses breathwork to release neck and shoulder tension while calming and resetting the nervous system.',
        summaryZh: '通过呼吸练习释放肩颈紧张，促进神经系统的放松与重塑。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Neck & Shoulder Release',
        topicZh: '肩颈放松',
        summary: 'Relieves neck and shoulder stiffness and tension headaches.',
        summaryZh: '缓解肩颈僵硬与压力型头痛。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Chest Opening & Posture Reset',
        topicZh: '胸腔打开与体态重置',
        summary: 'Opens the chest and corrects rounded shoulders and forward posture.',
        summaryZh: '打开胸腔、改善圆肩驼背。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Hip Release & Mobility',
        topicZh: '髋部松解与灵活度',
        summary: 'Reduces hip tightness and compensation patterns from prolonged sitting.',
        summaryZh: '减少久坐带来的髋部卡紧与代偿。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Hip Stability & Control',
        topicZh: '髋部稳定与控制',
        summary: 'Builds hip joint stability to reduce the risk of lower-body injury.',
        summaryZh: '提升髋关节稳定，降低下肢受伤风险。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Knee Care & Support',
        topicZh: '膝关节养护与支持',
        summary: 'Eases pressure on the knees and improves comfort walking and on stairs.',
        summaryZh: '改善膝部压力，提升行走与上下楼舒适度。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Knee Alignment & Support',
        topicZh: '膝关节对线与支撑',
        summary: 'Corrects knee tracking and strengthens lower-body support.',
        summaryZh: '纠正膝关节轨迹，增强下肢支撑。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Core Activation for Back Support',
        topicZh: '核心激活护腰',
        summary: 'Activates the deep core to reduce recurring lower back discomfort.',
        summaryZh: '激活深层核心，减轻腰背反复不适。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Deep Core Stability',
        topicZh: '深层核心稳定',
        summary: 'Builds a stable core that protects and supports the spine.',
        summaryZh: '构建脊柱保护性的稳定核心。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Breathing & Rib Cage Mobility',
        topicZh: '呼吸与肋骨活动度',
        summary: 'Improves breathing patterns and releases tension in the rib cage.',
        summaryZh: '改善呼吸模式，释放胸廓紧张。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Rib Cage Mobility & Structure',
        topicZh: '肋骨结构优化',
        summary: 'Optimizes rib cage position to improve breathing efficiency.',
        summaryZh: '优化肋骨位置，改善呼吸效率。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Shoulder Mobility & Stability',
        topicZh: '肩部灵活与稳定',
        summary: 'Restores shoulder range of motion and eases tension.',
        summaryZh: '恢复肩部活动范围并减轻紧张。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Shoulder Stability & Strength',
        topicZh: '肩部稳定与力量强化',
        summary: 'Strengthens shoulder joint stability and load-bearing capacity.',
        summaryZh: '增强肩关节稳定与承重能力。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Foot Strength & Balance',
        topicZh: '足部力量与平衡',
        summary: 'Improves arch stability and overall balance.',
        summaryZh: '提升足弓稳定与平衡能力。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Foot Mechanics & Balance',
        topicZh: '足部力学与平衡',
        summary: 'Rebuilds whole-body alignment starting from the feet.',
        summaryZh: '从足部重建全身对线基础。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Full Body Fascia Release',
        topicZh: '全身筋膜释放',
        summary: 'Reduces overall stiffness and improves range of motion.',
        summaryZh: '改善全身僵硬与活动受限。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Fascia Lines Integration',
        topicZh: '筋膜链整合',
        summary: 'Improves coordination across fascial lines for more efficient movement.',
        summaryZh: '提升身体链路协同与动作效率。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Spine Mobility & Decompression',
        topicZh: '脊柱灵活与减压',
        summary: 'Releases spinal pressure and improves posture and flexibility.',
        summaryZh: '释放脊柱压力，改善体态与灵活性。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Spinal Stability & Control',
        topicZh: '脊柱稳定与控制',
        summary: 'Improves spinal stability to reduce recurring discomfort.',
        summaryZh: '提升脊柱稳定，减少反复不适。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Functional Movement Training',
        topicZh: '功能性动作训练',
        summary: 'Optimizes everyday movements like walking, standing, and bending.',
        summaryZh: '优化走路、站立、弯腰等日常动作。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Functional Strength & Movement',
        topicZh: '功能力量与动作',
        summary: 'Applies stability and strength to real everyday movement.',
        summaryZh: '把稳定与力量应用到实际生活动作中。',
      },
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
      {
        slot: 'Wed 9:15',
        series: 'Functional Pain Relief',
        topic: 'Full Body Integration',
        topicZh: '全身整合',
        summary: 'Integrates the whole body for better coordination and comfort.',
        summaryZh: '整合全身链路，提升动作协调与舒适感。',
      },
      {
        slot: 'Thu 17:30',
        series: 'Structural Alignment',
        topic: 'Full Body Integration & Flow',
        topicZh: '全身整合与流动',
        summary: 'Combines strength, flexibility, and control into a fluid posture.',
        summaryZh: '融合力量、灵活与控制，建立流畅体态。',
      },
    ],
  },
];

/**
 * Get schedule info for a specific week number (1-12)
 */
export function getWeekSchedule(weekNumber) {
  return weeklySchedule.find((w) => w.week === weekNumber) || null;
}
