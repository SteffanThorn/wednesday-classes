// Ayurveda Dosha Test Questions
// Based on traditional Ayurvedic constitution assessment

export const ayurvedaQuestions = [
  // Vata Questions (Questions 1-8)
  {
    id: 1,
    dosha: 'vata',
    category: 'bodyFrame',
    text: {
      en: 'My body frame tends to be slender and light',
      zh: '我的体型倾向于纤细轻盈'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 2,
    dosha: 'vata',
    category: 'weight',
    text: {
      en: 'I find it difficult to gain weight even when I try',
      zh: '即使努力尝试，我也很难增加体重'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 3,
    dosha: 'vata',
    category: 'skin',
    text: {
      en: 'My skin tends to be dry, especially in winter',
      zh: '我的皮肤尤其是冬季容易干燥'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 4,
    dosha: 'vata',
    category: 'energy',
    text: {
      en: 'I tend to have bursts of energy followed by fatigue',
      zh: '我往往在精力充沛之后会感到疲惫'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 5,
    dosha: 'vata',
    category: 'digestion',
    text: {
      en: 'My digestion is irregular and I often experience bloating or gas',
      zh: '我的消化不规律，经常腹胀或胀气'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 6,
    dosha: 'vata',
    category: 'mind',
    text: {
      en: 'My mind is often racing with thoughts and I find it hard to calm down',
      zh: '我的思绪经常纷飞，很难平静下来'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 7,
    dosha: 'vata',
    category: 'sleep',
    text: {
      en: 'I tend to have light sleep and wake up easily',
      zh: '我往往睡眠很浅，容易醒来'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 8,
    dosha: 'vata',
    category: 'activity',
    text: {
      en: 'I prefer to move quickly and do many things at once',
      zh: '我喜欢快速移动，同时做很多事情'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  
  // Pitta Questions (Questions 9-16)
  {
    id: 9,
    dosha: 'pitta',
    category: 'bodyFrame',
    text: {
      en: 'My body frame tends to be medium and athletic',
      zh: '我的体型倾向于中等且健壮'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 10,
    dosha: 'pitta',
    category: 'weight',
    text: {
      en: 'I can gain and lose weight relatively easily',
      zh: '我能相对容易地增减体重'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 11,
    dosha: 'pitta',
    category: 'skin',
    text: {
      en: 'My skin tends to be oily and I may have acne or rashes',
      zh: '我的皮肤容易出油，可能有痘痘或皮疹'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 12,
    dosha: 'pitta',
    category: 'appetite',
    text: {
      en: 'I have a strong appetite and get irritable when hungry',
      zh: '我食欲旺盛，饿的时候容易烦躁'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 13,
    dosha: 'pitta',
    category: 'temperature',
    text: {
      en: 'I tend to feel hot easily and sweat a lot',
      zh: '我容易感到热，经常大量出汗'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 14,
    dosha: 'pitta',
    category: 'personality',
    text: {
      en: 'I am decisive and like to be in leadership positions',
      zh: '我果断自信，喜欢处于领导位置'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 15,
    dosha: 'pitta',
    category: 'emotion',
    text: {
      en: 'I can be impatient and easily frustrated',
      zh: '我可能没有耐心，容易感到沮丧'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 16,
    dosha: 'pitta',
    category: 'digestion',
    text: {
      en: 'I have strong digestion but may experience heartburn',
      zh: '我消化能力强，但可能烧心'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  
  // Kapha Questions (Questions 17-24)
  {
    id: 17,
    dosha: 'kapha',
    category: 'bodyFrame',
    text: {
      en: 'My body frame tends to be solid and well-built',
      zh: '我的体型倾向于结实且体格健壮'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 18,
    dosha: 'kapha',
    category: 'weight',
    text: {
      en: 'I tend to gain weight easily and find it hard to lose',
      zh: '我容易发胖，而且很难减下来'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 19,
    dosha: 'kapha',
    category: 'skin',
    text: {
      en: 'My skin tends to be smooth and soft with a natural glow',
      zh: '我的皮肤往往光滑柔软，带有自然光泽'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 20,
    dosha: 'kapha',
    category: 'energy',
    text: {
      en: 'I have steady energy throughout the day',
      zh: '我一整天都有稳定的精力'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 21,
    dosha: 'kapha',
    category: 'sleep',
    text: {
      en: 'I tend to sleep soundly and may oversleep',
      zh: '我往往睡得很沉，可能睡过头'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 22,
    dosha: 'kapha',
    category: 'personality',
    text: {
      en: 'I am calm, patient, and easy-going',
      zh: '我冷静、耐心、随和'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 23,
    dosha: 'kapha',
    category: 'emotion',
    text: {
      en: 'I can be attached to possessions and resistant to change',
      zh: '我可能执着于财物，抗拒改变'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 24,
    dosha: 'kapha',
    category: 'digestion',
    text: {
      en: 'My digestion is slow and I can go without food easily',
      zh: '我消化缓慢，可以轻易地不吃东西'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  
  // Additional Questions 25-37 - Body Constitution, Emotions, Spirit, Modern Lifestyle
  
  // Body Constitution (Questions 25-28)
  {
    id: 25,
    dosha: 'vata',
    category: 'bodyConstitution',
    text: {
      en: 'I often feel cold even when others are comfortable',
      zh: '即使别人觉得舒适，我也经常感到冷'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 26,
    dosha: 'pitta',
    category: 'bodyConstitution',
    text: {
      en: 'I tend to have strong stamina and good endurance',
      zh: '我往往有很强的体力和耐力'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 27,
    dosha: 'kapha',
    category: 'bodyConstitution',
    text: {
      en: 'My joints tend to be stiff, especially in the morning',
      zh: '我的关节往往僵硬，尤其是早晨'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 28,
    dosha: 'pitta',
    category: 'bodyConstitution',
    text: {
      en: 'I have a good appetite and enjoy flavorful meals',
      zh: '我食欲很好，喜欢美味的饭菜'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  
  // Emotions (Questions 29-32)
  {
    id: 29,
    dosha: 'vata',
    category: 'emotions',
    text: {
      en: 'I often feel anxious or nervous without obvious reason',
      zh: '我经常感到焦虑或紧张，没有明显原因'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 30,
    dosha: 'pitta',
    category: 'emotions',
    text: {
      en: 'I can be critical of myself and others',
      zh: '我可能对自己和他人挑剔'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 31,
    dosha: 'kapha',
    category: 'emotions',
    text: {
      en: 'I tend to hold onto sadness or grief for a long time',
      zh: '我往往长时间沉浸在悲伤中'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 32,
    dosha: 'vata',
    category: 'emotions',
    text: {
      en: 'I experience mood swings and emotional ups and downs',
      zh: '我经历情绪波动和情绪起伏'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  
  // Spirit/Mind (Questions 33-35)
  {
    id: 33,
    dosha: 'vata',
    category: 'spirit',
    text: {
      en: 'I find it difficult to focus on one task for extended periods',
      zh: '我发现很难长时间专注于一项任务'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 34,
    dosha: 'pitta',
    category: 'spirit',
    text: {
      en: 'I am driven by goals and achievements',
      zh: '我被目标和成就所驱动'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 35,
    dosha: 'kapha',
    category: 'spirit',
    text: {
      en: 'I am content with my life and rarely feel the need for change',
      zh: '我对自己的生活感到满足，很少感到需要改变'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  
  // Modern Lifestyle (Questions 36-37)
  {
    id: 36,
    dosha: 'vata',
    category: 'modernLifestyle',
    text: {
      en: 'I often stay up late and have irregular sleep patterns',
      zh: '我经常熬夜，睡眠不规律'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  },
  {
    id: 37,
    dosha: 'pitta',
    category: 'modernLifestyle',
    text: {
      en: 'I easily get addicted to screens (phone, computer, TV) and find it hard to stop',
      zh: '我容易沉迷于屏幕（手机、电脑、电视），很难停下来'
    },
    options: [
      { value: 1, en: 'Rarely', zh: '很少' },
      { value: 2, en: 'Sometimes', zh: '偶尔' },
      { value: 3, en: 'Moderately', zh: '一般' },
      { value: 4, en: 'Often', zh: '经常' },
      { value: 5, en: 'Very Often', zh: '非常频繁' }
    ]
  }
];

// Dosha names and descriptions
export const doshaInfo = {
  vata: {
    sanskrit: 'Vata',
    en: 'Vata',
    zh: '瓦塔',
    meaning: 'Air & Ether',
    description: {
      en: 'Vata types are creative, energetic, and quick-thinking. They often have a slim build and dry skin.',
      zh: '瓦塔体质的人富有创造力、精力充沛、思维敏捷。他们通常体型纤瘦，皮肤干燥。'
    },
    color: 'cyan',
    qualities: ['Dry', 'Light', 'Cold', 'Rough', 'Subtle'],
    element: 'Air & Ether'
  },
  pitta: {
    sanskrit: 'Pitta',
    en: 'Pitta',
    zh: '皮塔',
    meaning: 'Fire & Water',
    description: {
      en: 'Pitta types are intelligent, ambitious, and assertive. They often have a medium build and oily skin.',
      zh: '皮塔体质的人聪明、有野心、果断自信。他们通常体型中等，皮肤偏油。'
    },
    color: 'purple',
    qualities: ['Hot', 'Sharp', 'Light', 'Liquid', 'Spreading'],
    element: 'Fire & Water'
  },
  kapha: {
    sanskrit: 'Kapha',
    en: 'Kapha',
    zh: '卡法',
    meaning: 'Earth & Water',
    description: {
      en: 'Kapha types are calm, patient, and nurturing. They often have a solid build and smooth skin.',
      zh: '卡法体质的人冷静、耐心、有包容心。他们通常体型结实，皮肤光滑。'
    },
    color: 'teal',
    qualities: ['Heavy', 'Slow', 'Cool', 'Oily', 'Smooth'],
    element: 'Earth & Water'
  }
};

// Interpretation functions
export const calculateDoshaScores = (answers) => {
  const scores = {
    vata: { total: 0, answered: 0 },
    pitta: { total: 0, answered: 0 },
    kapha: { total: 0, answered: 0 }
  };
  
  ayurvedaQuestions.forEach((question, index) => {
    if (answers[index] !== undefined) {
      scores[question.dosha].total += answers[index];
      scores[question.dosha].answered += 1;
    }
  });
  
  return scores;
};

export const interpretDoshaScores = (scores) => {
  const maxScore = 65; // Vata: 13 questions, Pitta: 13 questions, Kapha: 11 questions (37 total)
  
  const results = [];
  
  Object.entries(scores).forEach(([dosha, data]) => {
    const percentage = (data.total / maxScore) * 100;
    let status;
    
    if (percentage >= 60) {
      status = 'dominant';
    } else if (percentage >= 40) {
      status = 'balanced';
    } else {
      status = 'low';
    }
    
    results.push({
      dosha,
      score: data.total,
      percentage: Math.round(percentage),
      status
    });
  });
  
  // Sort by score to determine primary and secondary dosha
  results.sort((a, b) => b.score - a.score);
  
  return results;
};

export const getDoshaRecommendations = (primaryDosha, secondaryDosha = null) => {
  const recommendations = {
    vata: {
      diet: {
        en: `WARM & COOKED FOODS: Prioritize warm, moist, and oily foods. 
        
FOODS TO EMBRACE:
• Sweet: Rice, oats, bananas, mangoes, dates, honey
• Sour: Lemon, yogurt, pickles, fermented foods
• Salty: Sea salt, miso, tamari

BEST CHOICES: 
- Warm soups and stews
- Cooked vegetables (asparagus, carrots, squash)
- Whole grains (rice, quinoa, oats)
- Warm milk with spices
- Ghee and olive oil
- Nuts (almonds, walnuts, pecans)

FOODS TO AVOID:
- Cold drinks and ice cream
- Raw salads and vegetables
- Caffeine and carbonated drinks
- Chips, crackers, popcorn
- Frozen or refrigerated foods

TIMING: Eat main meal at noon when digestion is strongest. Avoid eating after 7 PM.`,
        
        zh: `温暖且煮熟的食物：优先选择温热、湿润、油腻的食物。

推荐食物：
• 甜味：米饭、燕麦、香蕉、芒果、枣、蜂蜜
• 酸味：柠檬、酸奶、泡菜、发酵食品
• 咸味：海盐、味噌、酱油

最佳选择：
- 温热的汤和炖菜
- 煮熟的蔬菜（芦笋、胡萝卜、南瓜）
- 全面谷物（米饭、藜麦、燕麦）
- 加香料的温牛奶
- 酥油和橄榄油
- 坚果（杏仁、核桃、山核桃）

应避免的食物：
- 冷饮和冰淇淋
- 生蔬菜沙拉
- 咖啡因和碳酸饮料
- 薯片、爆米花
- 冷冻或冷藏食品

用餐时间：午餐时消化能力最强，应吃主餐。晚上7点后避免进食。`
      },
      lifestyle: {
        en: `ESTABLISH ROUTINES: Vata thrives on consistency.

DAILY PRACTICES:
• Wake up before 6 AM
• Oil massage (abhyanga) with warm sesame oil
• Meditation for 20 minutes morning and evening
• Warm bath before bed
• Foot and scalp massage

ENVIRONMENT:
• Keep your space warm and humid
• Use essential oils: lavender, cedar, ginger
• Listen to calming music
• Reduce screen time after sunset

STRESS MANAGEMENT:
• Practice deep breathing (3-4 times daily)
• Avoid multitasking
• Take short rests throughout the day`,
        
        zh: `建立规律：瓦塔体质需要一致性。

日常实践：
• 早上6点前起床
• 用温热芝麻油进行油脂按摩（abhyanga）
• 早晚冥想20分钟
• 睡前温水澡
• 足部和头皮按摩

环境：
• 保持空间温暖湿润
• 使用精油：薰衣草、雪松、生姜
• 听舒缓音乐
• 日落后减少屏幕使用

压力管理：
• 练习深呼吸（每天3-4次）
• 避免多任务处理
• 一天中短暂休息`
      },
      exercise: {
        en: `GENTLE MOVEMENT: Vata needs grounding exercise.

RECOMMENDED:
• Walking (20-30 minutes daily)
• Gentle yoga (Hatha, Yin)
• Swimming in warm water
• Tai chi or qigong
• Light strength training

BEST TIME: Morning (6-10 AM) or early evening

INTENSITY: Light to moderate. Avoid competitive sports and excessive cardio.

REST: Take breaks every 20-30 minutes during exercise.`,
        
        zh: `温和运动：瓦塔需要接地气的运动。

推荐运动：
• 散步（每天20-30分钟）
• 温和瑜伽（哈他、阴瑜伽）
• 在温水中游泳
• 太极或气功
• 轻度力量训练

最佳时间：早晨（6-10点）或傍晚

强度：轻到中度。避免竞技运动和过度有氧运动。

休息：运动时每20-30分钟休息一次。`
      },
      // Seasonal recommendations
      seasonal: {
        en: `SEASONAL ADJUSTMENTS FOR VATA

SPRING (Vata Aggravation Season):
• Focus on warm, cooked foods
• Reduce raw salads and cold foods
• Add warming spices: ginger, cinnamon, cumin
• Increase oil and ghee in cooking
• Practice grounding yoga

SUMMER:
• Still prioritize warmth but lighter options
• Room temperature foods are acceptable
• Avoid icy drinks completely
• Stay hydrated with warm water
• Evening walks in nature

AUTUMN:
• Increase warming foods as temperature drops
• Start oil massage routine
• Add more cooked grains
• Reduce raw vegetables
• Meditation for anxiety prevention

WINTER:
• Most challenging season for Vata
• Heavy, warm, oily foods
• Hot soups and stews daily
• Ginger tea in morning
• Extra rest and self-care`,
        
        zh: `瓦塔体质的季节调整

春季（瓦塔加重季节）：
• 专注于温热的煮熟食物
• 减少生沙拉和冷食
• 添加温热香料：生姜、肉桂、孜然
• 增加烹饪中的油和酥油
• 练习接地瑜伽

夏季：
• 仍以温热为主但选择更轻盈
• 常温食物可以接受
• 完全避免冰镇饮料
• 喝温水保持水分
• 傍晚在自然中散步

秋季：
• 随气温下降增加温热食物
• 开始油脂按摩例程
• 增加更多煮熟的谷物
• 减少生蔬菜
• 冥想预防焦虑

冬季：
• 对瓦塔最具挑战的季节
• 重口味、温热、油腻的食物
• 每天热汤和炖菜
• 早上喝姜茶
• 额外休息和自我照顾`
      },
      // Daily tea timing
      teaTiming: {
        en: `DAYTIME DRINKS FOR VATA BALANCE

MORNING (6-00 AM - 10:00 AM):
• Warm water with lemon
• Ginger tea with honey
• Masala chai (spiced milk tea)
• Tulsi (holy basil) tea

MIDDAY (10:00 AM - 2:00 PM):
• Warm water throughout
• Chamomile tea after meals
• Avoid caffeine entirely

AFTERNOON (2:00 PM - 6:00 PM):
• Licorice root tea
• Warm milk with turmeric and cardamom
• Avoid black tea and coffee

EVENING (6:00 PM - 9:00 PM):
• Warm milk with nutmeg
• Chamomile or lavender tea
• No caffeine after 2 PM

BEDTIME (9:00 PM +):
• Warm almond milk
• Golden milk (turmeric + ghee + milk)
• Relaxing herbal blends

HERBAL ADDITIONS:
• Fresh ginger
• Cinnamon sticks
• Cardamom pods
• Turmeric root
• Fennel seeds
• Black pepper (enhances absorption)`,
        
        zh: `瓦塔平衡的日间饮品

早晨（早上6点-10点）：
• 柠檬温水
• 加蜂蜜的姜茶
• 马萨拉茶（香料奶茶）
• 图尔西（圣罗勒）茶

中午（上午10点-下午2点）：
• 全天喝温水
• 餐后喝洋甘菊茶
• 完全避免咖啡因

下午（下午2点-6点）：
• 甘草根茶
• 加姜黄和小豆蔻的温牛奶
• 避免红茶和咖啡

傍晚（下午6点-9点）：
• 加肉豆蔻的温牛奶
• 洋甘菊或薰衣草茶
• 下午2点后不摄入咖啡因

睡前（晚上9点后）：
• 温杏仁奶
• 黄金奶（姜黄+酥油+牛奶）
• 放松草药茶

草药添加：
• 新鲜生姜
• 肉桂棒
• 小豆蔻荚
• 姜黄根
• 茴香籽
• 黑胡椒（增强吸收）`
      }
    },
    pitta: {
      diet: {
        en: `COOLING FOODS: Pitta needs heat-reducing nutrition.

FOODS TO EMBRACE:
• Sweet: Melons, mangoes, coconut, sweet potatoes, rice
• Bitter: Leafy greens, dandelion, aloe vera
• Astringent: Beans, lentils, green apples, pomegranates

BEST CHOICES:
- Cool salads with cucumber and lettuce
- Coconut water and coconut milk
- Fresh fruit juices (not acidic)
- Mung beans and kitchari
- Ghee in small amounts
- Milk-based desserts
- Cucumber raita

FOODS TO AVOID:
- Hot, spicy foods
- Fried and oily foods
- Caffeine and alcohol
- Acidic foods (tomatoes, citrus)
- Red meat and eggs
- Garlic and raw onion
- Hot sauces and chilies

TIMING: Eat main meal at noon. Light dinner before 7 PM.`,
        
        zh: `清凉食物：皮塔需要减少热量的营养。

推荐食物：
• 甜味：瓜类、芒果、椰子、红薯、米饭
• 苦味：绿叶蔬菜、蒲公英、芦荟
• 涩味：豆类、扁豆、青苹果、石榴

最佳选择：
- 黄瓜和生菜凉拌沙拉
- 椰子水和椰奶
- 果汁（非酸性）
- 绿豆和杂粮粥
- 少量酥油
- 牛奶甜点
- 黄瓜酸奶酱

应避免的食物：
- 辛辣食物
- 油炸食品
- 咖啡因和酒精
- 酸性食物（番茄、柑橘）
- 红肉和鸡蛋
- 大蒜和生洋葱
- 辣椒酱

用餐时间：午餐吃主餐。晚餐在晚上7点前。`
      },
      lifestyle: {
        en: `COOLING LIFESTYLE: Pitta needs calm and patience.

DAILY PRACTICES:
• Wake up at 6 AM
• Cool oil massage with coconut oil
• Moonlight bathing
• Swimming in cool water
• Walking in nature at sunset

ENVIRONMENT:
• Keep your space cool
• Use cooling scents: rose, sandalwood, jasmine
• Avoid intense heat and sun
• Soft, gentle lighting
• Calming music

STRESS MANAGEMENT:
• Practice cooling pranayama
• Take cool showers
• Spend time near water
• Avoid conflict and heated arguments
• Practice gratitude journaling`,
        
        zh: `清凉生活方式：皮塔需要平静和耐心。

日常实践：
• 早上6点起床
• 用椰子油进行清凉按摩
• 月光浴
• 在凉水中游泳
• 日落时在自然中散步

环境：
• 保持空间凉爽
• 使用清凉香气：玫瑰、檀香、茉莉
• 避免强烈阳光和高温
• 柔和的灯光
• 舒缓音乐

压力管理：
• 练习清凉呼吸法
• 洗冷水澡
• 在水边消磨时间
• 避免冲突和激烈争论
• 感恩日记`
      },
      exercise: {
        en: `MODERATE EXERCISE: Pitta needs to release heat.

RECOMMENDED:
• Swimming (best choice)
• Walking in cool morning/evening
• Gentle yoga (not heated)
• Cycling in shaded areas
• Light tennis or badminton

BEST TIME: Early morning (before 8 AM) or evening (after 6 PM)

INTENSITY: Moderate. Avoid competitive and heated environments.

AVOID: Hot yoga, intense cardio, HIIT in warm conditions.`,
        
        zh: `适度运动：皮塔需要释放热量。

推荐运动：
• 游泳（最佳选择）
• 凉爽早晨/傍晚散步
• 温和瑜伽（非热瑜伽）
• 在阴凉处骑自行车
• 轻量网球或羽毛球

最佳时间：清晨（早上8点前）或傍晚（下午6点后）

强度：适度。避免竞争和高温环境。

避免：热瑜伽、剧烈有氧运动、在温暖条件下进行高强度间歇训练。`
      },
      // Seasonal recommendations
      seasonal: {
        en: `SEASONAL ADJUSTMENTS FOR PITTA

SPRING:
• Begin introducing cooling foods
• Reduce heavy oils and fats
• Increase fresh salads
• Start oil massage routine
• Morning swimming if possible

SUMMER (Pitta Aggravation Season):
• Maximum cooling focus
• Avoid all spicy and hot foods
• Ice-cold drinks in moderation
• Spend midday indoors
• Extra coconut oil massage
• Avoid intense exercise

AUTUMN:
• Continue cooling foods
• Add some warming spices in small amounts
• Oil massage continues
• Reduce raw foods as weather cools
• Gradual transition to warmer meals

WINTER:
• Less challenging than summer
• Still avoid very hot and spicy foods
• Warm (not hot) cooked foods
• Ghee in moderation
• Indoor swimming preferred`,
        
        zh: `皮塔体质的季节调整

春季：
• 开始引入清凉食物
• 减少重油脂
• 增加新鲜沙拉
• 开始油脂按摩例程
• 可能的话早晨游泳

夏季（皮塔加重季节）：
• 最大程度清凉
• 避免所有辛辣和热性食物
• 适量冰镇饮料
• 中午待在室内
• 额外椰子油按摩
• 避免剧烈运动

秋季：
• 继续清凉食物
• 少量添加温热香料
• 继续油脂按摩
• 天气转凉时减少生食
• 逐渐过渡到温热食物

冬季：
• 不像夏季那么有挑战
• 仍避免非常辛辣和热性食物
• 温热（不要太烫）的煮熟食物
• 适量酥油
• 室内游泳更好`
      },
      // Daily tea timing
      teaTiming: {
        en: `DAYTIME DRINKS FOR PITTA BALANCE

MORNING (6:00 AM - 10:00 AM):
• Cool mint tea
• Chrysanthemum tea
• Rose petal tea
• Room temperature water

MIDDAY (10:00 AM - 2:00 PM):
• Coconut water
• Cool cucumber water
• Fennel seed tea (after meals)
• Avoid hot coffee/tea

AFTERNOON (2:00 PM - 6:00 PM):
• Hibiscus tea (cooling)
• Rose water sherbet
• Mint lemonade (no ice)
• Licorice root tea

EVENING (6:00 PM - 9:00 PM):
• Cool milk with sandalwood
• Chamomile tea
• Brahmi tea for mind
• Warm (not hot) water

BEDTIME (9:00 PM +):
• Warm milk with rose water
• Cooling herbal blend
• No caffeine after noon

HERBAL ADDITIONS:
• Fresh mint leaves
• Rose petals
• Fennel seeds
• Chrysanthemum flowers
• Hibiscus flowers
• Cooling cucumber slices`,
        
        zh: `皮塔平衡的日间饮品

早晨（早上6点-10点）：
• 凉爽薄荷茶
• 菊花茶
• 玫瑰花茶
• 常温水

中午（上午10点-下午2点）：
• 椰子水
• 黄瓜凉水
• 茴香茶（餐后）
• 避免热咖啡/茶

下午（下午2点-6点）：
• 木槿茶（清凉）
• 玫瑰水冰沙
• 薄荷柠檬水（不加冰）
• 甘草根茶

傍晚（下午6点-9点）：
• 加檀香木的凉爽牛奶
• 洋甘菊茶
• 积雪草茶（健脑）
• 温水（不要太烫）

睡前（晚上9点后）：
• 加玫瑰水的温牛奶
• 清凉草药茶
• 中午之后不摄入咖啡因

草药添加：
• 新鲜薄荷叶
• 玫瑰花瓣
• 茴香籽
• 菊花
• 木槿花
• 清凉黄瓜片`
      }
    },
    kapha: {
      diet: {
        en: `LIGHT & DRY FOODS: Kapha needs stimulation and lightness.

FOODS TO EMBRACE:
• Pungent: Ginger, garlic, black pepper, chilies
• Bitter: Dark leafy greens, dandelion, turmeric
• Astringent: Beans, lentils, green apples, pomegranates

BEST CHOICES:
- Light soups and broths
- Steamed vegetables
- Quinoa and barley
- Light proteins (fish, chicken, tofu)
- Raw vegetables in moderation
- Honey (never heated)
- Light dairy or dairy alternatives
- Spices in cooking

FOODS TO AVOID:
- Heavy, oily foods
- Sweet and creamy desserts
- Cheese and cream
- Red meat
- Wheat and bread
- Cold drinks and ice water
- Banana and mango
- Alcohol (especially beer)

TIMING: Eat main meal at noon. Light breakfast. Early dinner.`,
        
        zh: `轻盈干燥的食物：卡法需要刺激和轻盈。

推荐食物：
• 辛辣：生姜、大蒜、黑胡椒、辣椒
• 苦味：深绿叶蔬菜、蒲公英、姜黄
• 涩味：豆类、扁豆、青苹果、石榴

最佳选择：
- 清淡的汤和肉汤
- 蒸蔬菜
- 藜麦和大麦
- 轻蛋白（鱼、鸡、豆腐）
- 适量生蔬菜
• 蜂蜜（不要加热）
- 轻乳制品或替代品
- 烹饪中多放香料

应避免的食物：
- 油腻食物
- 甜腻甜点
- 奶酪和奶油
- 红肉
- 小麦和面包
- 冷饮和冰水
- 香蕉和芒果
- 酒精（尤其是啤酒）

用餐时间：午餐吃主餐。早餐要轻。晚餐要早。`
      },
      lifestyle: {
        en: `STIMULATING LIFESTYLE: Kapha needs movement and variety.

DAILY PRACTICES:
• Wake up early (5-6 AM)
• Dry brush massage before shower
• Energizing exercise every morning
• Contrast shower (warm then cool)
• Spicy food for breakfast

ENVIRONMENT:
• Keep your space warm but well-ventilated
• Use stimulating scents: eucalyptus, cinnamon, cloves
• Bright lighting
• Upbeat music
• Declutter regularly

STRESS MANAGEMENT:
• Try new activities
• Social engagement
• Morning exercise is essential
• Avoid oversleeping
• Stay mentally stimulated`,
        
        zh: `刺激性生活方式：卡法需要运动和多样性。

日常实践：
• 早起（早上5-6点）
• 淋浴前干刷按摩
• 每天早晨精力充沛地运动
• 冷热交替淋浴
• 早餐吃辛辣食物

环境：
• 保持空间温暖但通风良好
• 使用刺激性香气：尤加利、肉桂、丁香
• 明亮照明
• 欢快的音乐
• 定期整理

压力管理：
• 尝试新活动
• 社交互动
• 早晨运动必不可少
• 避免过度睡眠
• 保持精神刺激`
      },
      exercise: {
        en: `VIGOROUS EXERCISE: Kapha needs movement and heat generation.

RECOMMENDED:
• Running and jogging
• High-intensity interval training
• Aerobics and dance
• Power yoga
• Cycling uphill
• Rock climbing
• Competitive sports

BEST TIME: Morning (most important for Kapha)

INTENSITY: Vigorous. Kapha needs to sweat and be challenged.

DAILY MINIMUM: 45-60 minutes of movement.`,
        
        zh: `剧烈运动：卡法需要运动和产生热量。

推荐运动：
• 跑步和慢跑
• 高强度间歇训练
• 有氧运动和舞蹈
• 力量瑜伽
• 骑自行车上坡
• 攀岩
• 竞技运动

最佳时间：早晨（对卡法最重要）

强度：剧烈。卡法需要出汗和挑战。

每天最低：45-60分钟的运动。`
      },
      // Seasonal recommendations
      seasonal: {
        en: `SEASONAL ADJUSTMENTS FOR KAPHA

SPRING (Kapha Aggravation Season):
• Maximum lightening focus
• Reduce all heavy foods
• Increase pungent spices
• Extra dry brush massage
• More vigorous exercise
• Reduce dairy significantly

SUMMER:
• Continue light foods
• Reduce spices as heat increases
• More raw vegetables acceptable
• Lighter exercise routines
• Stay hydrated
• Evening swimming

AUTUMN:
• Begin slightly warming foods
• Add back some heavier grains
• Reduce raw foods gradually
• Maintain exercise intensity
• Start oil massage again
• Transition to warmer meals

WINTER:
• Easiest season for Kapha
• Can tolerate slightly heavier foods
• Still avoid dairy and sweets
• Maintain exercise routine
• Warm (not heavy) meals
• Spices for stimulation`,
        
        zh: `卡法体质的季节调整

春季（卡塔加重季节）：
• 最大程度轻盈
• 减少所有重食
• 增加辛辣香料
• 额外干刷按摩
• 更剧烈的运动
• 显著减少乳制品

夏季：
• 继续轻盈食物
• 随着热量增加减少香料
• 可以接受更多生蔬菜
• 较轻盈的运动例程
• 保持水分
• 傍晚游泳

秋季：
• 开始略微增加温热食物
• 增加一些较重的谷物
• 逐渐减少生食
• 保持运动强度
• 再次开始油脂按摩
• 过渡到温热食物

冬季：
• 对卡法最容易的季节
• 可以容忍稍重的食物
• 仍避免乳制品和甜食
• 保持运动例程
• 温热（不要太重）的饭菜
• 香料促进刺激`
      },
      // Daily tea timing
      teaTiming: {
        en: `DAYTIME DRINKS FOR KAPHA BALANCE

MORNING (5:00 AM - 10:00 AM - Kapha needs EARLY start):
• Spicy ginger tea with black pepper
• Masala chai (strong)
• Cinnamon stick tea
• Tulsi tea for stimulation
• Hot water with lemon and honey

MIDDAY (10:00 AM - 2:00 PM):
• Light herbal teas
• Green tea (not too strong)
• Peppermint tea
• Avoid heavy milk drinks

AFTERNOON (2:00 PM - 6:00 PM):
• Ginger tea revival
• Light green tea
• Spicy cinnamon tea
• Stay active and avoid napping

EVENING (6:00 PM - 9:00 PM):
• Lighter options
• Chamomile tea
• Fennel tea for digestion
• Avoid heavy milk teas

BEDTIME (9:00 PM +):
• Very light if at all
• Warm water
• Avoid any heavy or sweet drinks
• No caffeine after noon

HERBAL ADDITIONS:
• Fresh ginger (lots!)
• Black pepper
• Cinnamon
• Turmeric
• Cardamom
• Cloves
• Long pepper (pippali)`,
        
        zh: `卡法平衡的日间饮品

早晨（早上5点-10点-卡法需要早开始）：
• 加黑胡椒的辛辣姜茶
• 浓马萨拉茶
• 肉桂棒茶
• 图尔西茶提神
• 柠檬蜂蜜热水

中午（上午10点-下午2点）：
• 清淡花草茶
• 绿茶（不要太浓）
• 薄荷茶
• 避免重奶茶

下午（下午2点-6点）：
• 姜茶提神
• 淡绿茶
• 辛辣肉桂茶
• 保持活跃，避免午睡

傍晚（下午6点-9点）：
• 较轻的选择
• 洋甘菊茶
• 茴香茶帮助消化
• 避免重奶茶

睡前（晚上9点后）：
• 如果有的话非常清淡
• 温水
• 避免任何重或甜的饮料
• 中午之后不摄入咖啡因

草药添加：
• 新鲜生姜（多放！）
• 黑胡椒
• 肉桂
• 姜黄
• 小豆蔻
• 丁香
• 长胡椒（毗梨勒）`
      }
    }
  };
  
  return {
    primary: recommendations[primaryDosha],
    secondary: secondaryDosha ? recommendations[secondaryDosha] : null
  };
};

