'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Translations object
const translations = {
  en: {
// Header
    luminousYoga: 'Inner Light Mindfulness',
    practice: 'Energy Medicine Academy',
    about: 'About',
    classes: 'Classes',
    contact: 'Contact',
    beginJourney: 'Begin Journey',
    language: 'en',
    motherscope: 'Motherscope',
    
    // Hero
    findYourInnerLight: 'Find Your Inner Light',
    heroSubtitle: 'Where ancient wisdom meets modern healing, discover the transformative power of mindful movement in the heart of New Zealand.',
    
    // Yoga Benefits Column
    healingThroughMovement: 'Healing Through Mindfulness & Movement',
    healingSubtitle: 'Your body holds infinite wisdom. Yoga is the gentle key that unlocks its natural ability to heal, restore, and flourish.',
    
    // Benefits
    backPainRelief: 'Relief for Body Pains',
    backPainDesc: 'Through mindful movement and gentle stretches, yoga addresses pain throughout the body—unlocking tight muscles, soothing joint discomfort, and promoting holistic healing.',
    
    pregnancySupport: 'Pregnancy Support',
    pregnancyDesc: 'Full-cycle maternity yoga creates a sacred space for expectant mothers, easing discomfort, preparing the body for birth, and nurturing the deep connection between mother and child.',
    
    kneePainRecovery: 'Mindfulness Through Meditation',
    kneePainDesc: 'Guided meditation practices calm the mind, reduce stress, and cultivate inner peace—helping you find stillness and clarity in our fast-paced world.',

    
    quote: 'The body achieves what the mind believes.',
    
    // Teacher Story Column
    fromShanghaiToAuckland: 'From Shanghai to Auckland',
    journeyOfPurpose: 'Awakening Path',
    
    // Teacher profile
    meiLin: 'Yuki',
    yogaTeacherHealer: 'Mindfulness Yoga & Meditation Teacher & Healer',
    meiLinStory1: 'It began in 2018 on a quiet yoga mat. There, for the first time, I experienced the stillness of having my mind completely belong to myself. This longing for inner space guided me from practitioner to yoga teacher, and while teaching prenatal and postnatal restoration, I witnessed a deeper truth: what women need is not just physical recovery, but psychological healing and energetic revival.',
    meiLinStory2: 'In 2021, my partner and I embarked on a three-year journey of living abroad. During our six months in Bali, the spiritual soil nourished me. I led three inner growth retreats, exploring the self with friends in vibration and silence. It was also during an in-depth "Shamanic" study that a profound awakening struck me: I observed that the women elders in my family seemed to be entangled by some invisible imprint, experiencing similar emotional struggles.',
    meiLinStory3: 'At that moment, I understood that some patterns are etched in energy, written in DNA. And the meaning of my existence is precisely to walk hand-in-hand with women like me, stepping out of old cycles, personally reshaping our "inner DNA," and reclaiming that glowing inner path that was always ours.',
    
    // Teaching Philosophy
    teachingPhilosophy: 'Teaching Philosophy',
    philosophyQuote: '"Mind, body, and action united as a way of life—mindfulness happens beyond the yoga mat."',
    
    // Stats
    yearsPractice: 'Years Practice',
    studentsGuided: 'Students Guided',
    momentsOfWonder: 'Moments of Wonder',
    
    // Footer
    copyright: '© 2026 Inner Light Yoga · Auckland, New Zealand',
    footerMotto: 'Breathe deeply. Move gently. Live fully.',

    // Practice Page
    benefitsOfYoga: 'Benefits of Mindfulness',
    benefitsSubtitle: 'Explore how mindfulness can transform your body, mind, and spirit.',
    readyToBegin: 'Ready to Begin Your Journey?',
    ctaSubtitle: 'Join us for a class and discover the transformative power of mindfulness.',
    bookFirstClass: 'Book Your First Class',

    // About Page
    aJourneyOf: 'Your Body-Mind',
    purpose: 'Integration Healing Partner',
    ourValues: 'Our Values',
    meetYourTeacher: 'Meet Your Teacher',
    meetTeacherDesc: 'Book a consultation or drop in for a class to experience the Inner Light Yoga difference.',
    bookFreeConsultation: 'Book Free Consultation',

    // Classes Page
    classTypes: 'Class Types',
    classTypesSubtitle: 'Choose from our diverse range of offerings, each designed to support your unique path.',
    weeklySchedule: 'Weekly Schedule',
    scheduleSubtitle: 'Find the perfect time for your practice.',
    downloadSchedule: 'Download Full Schedule',
    pricing: 'Pricing',
    mostPopular: 'Most Popular',
    choosePlan: 'Choose Plan',
    newToYoga: 'New to Mindfulness?',
    newToYogaDesc: 'Book your first class and receive a complimentary consultation with Yuki.',
    day: 'Day',
    time: 'Time',
    class: 'Class',
    teacher: 'Teacher',
    spots: 'Spots',
    available: 'available',

    // Contact Page
    sendUsMessage: 'Send Us a Message',
    contactSubtitle: 'Fill out the form and we\'ll get back to you within 24 hours.',
    followUs: 'Follow Us',
    faq: 'Frequently Asked Questions',
    faqSubtitle: 'Find answers to common questions about our classes and studio.',
    mapPlaceholder: 'Interactive map coming soon',

    // Contact Form
    bookNow: 'Book Now',
    yourName: 'Your Name',
    namePlaceholder: 'Enter your name',
    emailAddress: 'Email Address',
    emailPlaceholder: 'your@email.com',
    subject: 'Subject',
    subjectPlaceholder: 'How can we help you?',
    message: 'Message',
    messagePlaceholder: 'Tell us more...',
    sendMessage: 'Send Message',
    formNote: 'We typically respond within 24 hours.',
    messageSent: 'Message Sent!',
    messageSentDesc: 'Thank you for reaching out. We will get back to you soon.',
    sendAnother: 'Send another message',

    // Ayurveda Page
    ayurvedaArticles: 'Ayurveda Articles',
    articlesCount: 'articles',
    writeArticle: 'Write Article',
    writeNewArticle: 'Write New Article',
    articleTitle: 'Article Title',
    titlePlaceholder: 'Enter article title...',
    articleCategory: 'Category',
    articleContent: 'Content',
    contentPlaceholder: 'Write your article content here...',
    publishArticle: 'Publish Article',
    publishing: 'Publishing...',
    cancel: 'Cancel',
    noArticlesYet: 'No Articles Yet',
    startWriting: 'Start writing your first Ayurveda article!',
    deleteArticle: 'Delete Article',

    // Testimonials Section
    testimonialsTitle: 'Student Stories',
    testimonialsSubtitle: 'Real experiences from our community of mindful practitioners.',
    testimonialsCTA: 'Ready to write your own story?',
    
    // Ayurveda Page
    ayurvedaWhatIsAyurveda: 'What is Ayurveda?',
    
    // Ayurveda Test Page
    ayurvedaTestTitle: 'Ayurveda Constitution Test',
    ayurvedaTestSubtitle: 'Discover your unique dosha constitution and personalized wellness recommendations',
    ayurveda24Questions: '37 Questions',
    ayurveda24Desc: 'Comprehensive assessment covering body constitution, emotions, spirit, and modern lifestyle habits. Answer based on your natural tendencies.',
    ayurvedaLikert: 'Frequency Scale',
    ayurvedaLikertDesc: 'Rate how often each statement applies to you from 1 (rarely) to 5 (very often).',
    ayurvedaPersonalResults: 'Personalized Results',
    ayurvedaPersonalResultsDesc: 'Get your dosha profile with diet, lifestyle, and exercise recommendations.',
    ayurvedaStartTest: 'Begin the Test',
    ayurvedaTestComplete: 'Your Constitution Results',
    ayurvedaYourDosha: 'Based on your responses, here is your unique dosha profile',
    ayurvedaScore: 'Score',
    ayurvedaRecommendations: 'Personalized Recommendations',
    ayurvedaDiet: 'Diet Recommendations',
    ayurvedaLifestyle: 'Lifestyle Recommendations',
    ayurvedaExercise: 'Exercise Recommendations',
    ayurvedaBookConsultation: 'Ready to explore your constitution deeper?',
    ayurvedaRarely: 'Rarely',
    ayurvedaSometimes: 'Sometimes',
    ayurvedaModerately: 'Moderately',
    ayurvedaOften: 'Often',
    ayurvedaVeryOften: 'Very Often',
    ayurvedaWhatIsAyurveda: 'What is Ayurveda?',
    ayurvedaThreeDoshas: 'The Three Doshas',
    ayurvedaDisclaimerTitle: 'Important Disclaimer',
    ayurvedaHowItWorks: 'How It Works',
    ayurvedaProfessionalConsultation: 'For Professional Diagnosis',
    
    // Chakra Test Page
    chakraTestTitle: 'Chakra Balance Test',
    chakraTestSubtitle: 'Discover your energy balance through this comprehensive assessment',
    test49Questions: '49 Questions',
    test49Desc: 'Seven chakras, seven questions each. Answer honestly based on your recent experiences.',
    likertScale: 'Likert Scale',
    likertDesc: 'Rate each statement from 1 (completely disagree) to 5 (completely agree).',
    personalInsights: 'Personal Insights',
    personalInsightsDesc: 'Get detailed analysis of each chakra\'s energy state and personalized suggestions.',
    startTest: 'Begin the Test',
    completelyDisagree: '1. Completely Disagree',
    completelyAgree: '5. Completely Agree',
    disagree: 'Disagree',
    neutral: 'Neutral',
    agree: 'Agree',
    previous: 'Previous',
    next: 'Next',
    saveProgress: 'Save Progress',
    questionProgress: 'Question',
    testComplete: 'Test Complete',
    yourResults: 'Here are your chakra energy results',
    totalScore: 'Total Score',
    status: 'Status',
    retakeTest: 'Retake Test',
    showMore: 'View Details',
    showLess: 'Show Less',
    lifestylePatterns: 'Lifestyle Patterns',
    modernManifestations: 'Modern Life Manifestations',
suggestions: 'Suggestions',
    work: 'Work',
    relationships: 'Relationships',
    health: 'Health',
    mental: 'Mental',

    // Motherscope Page
    motherscopeJourney: 'Your Journey of Discovery',
    motherscopeDesc1: 'Motherscope is a comprehensive platform designed to support women through every stage of their motherhood journey. From pregnancy to postpartum, we provide resources, community, and guidance for navigating the beautiful challenges of becoming a mother.',
    motherscopeDesc2: 'Our approach combines ancient wisdom with modern understanding, offering a holistic perspective on maternal health and well-being. Connect with other mothers, access expert advice, and discover tools for your personal growth.',
    motherscopeDesc3: 'Whether you are planning pregnancy, currently expecting, or navigating the postpartum period, Motherscope is here to support you with compassion and knowledge.',
    pregnancySupport: 'Pregnancy Support',
    pregnancySupportDesc: 'Comprehensive resources for your pregnancy journey, from conception to birth.',
    mindfulnessPractices: 'Mindfulness Practices',
    mindfulnessPracticesDesc: 'Gentle exercises and meditations designed for mothers at any stage.',
    communityConnection: 'Community Connection',
    communityConnectionDesc: 'Connect with other mothers who understand your journey.',
    beginMotherscopeJourney: 'Begin Your Motherscope Journey',
    motherscopeCtaDesc: 'Join our supportive community and discover the resources available for your motherhood journey.',

    // First Class Landing Page
    firstClassHero: 'Your First Class',
    firstClassSubtitle: 'Begin your mindfulness journey with us. A warm welcome awaits.',
    firstClassOffer: 'First Class Special',
    firstClassOfferDesc: 'Try your first class for just $15 and receive a free consultation with Yuki.',
    whyChooseUs: 'Why Start Here?',
    whyChooseUsDesc: 'A supportive space for your journey into mindfulness.',
    supportiveEnvironment: 'Supportive Environment',
    supportiveEnvironmentDesc: 'Beginners welcome. No experience needed. All bodies celebrated.',
    experiencedGuide: 'Experienced Guide',
    experiencedGuideDesc: 'Yuki has guided hundreds of beginners to find their inner light.',
    gentleApproach: 'Gentle Approach',
    gentleApproachDesc: 'Classes that honor your unique pace and journey.',
    chooseYourClass: 'Choose Your First Class',
    chooseYourClassDesc: 'Start with a class that suits your needs and experience level.',
    whatToExpect: 'What to Expect',
    whatToExpectDesc: 'Your first visit made simple.',
    bringMat: 'What to Bring',
    bringMatDesc: 'Just yourself and comfortable clothing. We provide mats and props.',
    arriveEarly: 'Arrival',
    arriveEarlyDesc: 'Arrive 10 minutes early to settle in and meet your instructor.',
    firstTimer: 'First Time',
    firstTimerDesc: 'Tell us it\'s your first class so we can give you extra attention.',
    readyToBegin: 'Ready to Begin?',
    readyToBeginDesc: 'Book your first class and take the first step towards inner peace.',
    firstClassSuccess: 'Booking Received!',
    firstClassSuccessDesc: 'Thank you for booking your first class with us. We will confirm your appointment within 24 hours.',
    bookNow: 'Book Now',
    bookingFormTitle: 'Book Your First Class',
    yourName: 'Your Name',
    namePlaceholder: 'Enter your name',
    emailAddress: 'Email Address',
    emailPlaceholder: 'your@email.com',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '+64 XX XXX XXXX',
    selectClass: 'Select Class',
    selectClassPlaceholder: 'Choose a class...',
    preferredDate: 'Preferred Date',
    preferredTime: 'Preferred Time',
    additionalNotes: 'Additional Notes',
    notesPlaceholder: 'Tell us about any injuries, concerns, or goals...',
    submitBooking: 'Confirm Booking',
    bookingNote: 'We will confirm your appointment within 24 hours.',
    testimonialsFirstClass: 'First Class Stories',
    testimonialsFirstClassSubtitle: 'Hear from others who took their first step with us.',
    classMindfulness: 'Mindfulness',
    classMindfulnessDesc: 'Perfect for beginners. Gentle Hatha yoga with mindful awareness.',
    classOutdoor: 'Outdoor Yoga',
    classOutdoorDesc: 'Connect with nature in our garden sessions.',
    classMomToBe: 'Mom-to-be',
    classMomToBeDesc: 'Nurturing practice designed for expectant mothers.',
    classInsightFlow: 'Insight Flow',
    classInsightFlowDesc: 'Dynamic flow with music for those ready to move.',
  },
  
  zh: {
// Header
    luminousYoga: '内在光芒',
    practice: '能量医学院',
    about: '关于',
    classes: '课程',
    contact: '联系',
    beginJourney: '开始旅程',
    language: 'zh',
    motherscope: '孕妈探索',
    
    // Hero
    findYourInnerLight: '寻找你内心的光',
    heroSubtitle: '古老智慧与现代疗愈的交汇之地，在新西兰的中心发现正念运动的变革力量。',
    
    // Yoga Benefits Column
    healingThroughMovement: '正念 & 运动疗愈',
    healingSubtitle: '你的身体蕴藏着无限的智慧。瑜伽是打开其自然疗愈、恢复和繁荣能力的温和钥匙。',
    
    // Benefits
    backPainRelief: '缓解身体疼痛',
    backPainDesc: '通过正念运动和轻柔伸展，瑜伽缓解全身疼痛——放松紧绷的肌肉，缓解关节不适，促进整体疗愈。',
    
    pregnancySupport: '孕期支持',
    pregnancyDesc: '孕产全周期瑜伽为准妈妈创造了一个神圣的空间，缓解不适，为分娩做准备，并培养母子之间的深度联系。',
    
    kneePainRecovery: '正念冥想',
    kneePainDesc: '引导式冥想练习可以平静心灵、减轻压力、培养内在平和——帮助你在快节奏的世界中找到宁静与清明。',
    
    quote: '身体达成心灵所相信的。',
    
    // Teacher Story Column
    fromShanghaiToAuckland: '从上海到奥克兰',
    journeyOfPurpose: '觉醒之路',
    
    // Teacher profile
    meiLin: 'Yuki',
    yogaTeacherHealer: '正念瑜伽、冥想导师&疗愈师',
    meiLinStory1: '始于2018年一张安静的瑜伽垫。在那里，我第一次体验到大脑完全属于自己的平静。这份对内在空间的渴望，引领我从一名练习者成为瑜伽老师，更在教授孕产修复时，看见了一个更深层的真相：女性需要的不仅是身体的复原，更是心理的疗愈与能量的复苏。',
    meiLinStory2: '2021年，我与伴侣踏上三年旅居。在巴厘岛的半年，灵性土壤滋养了我。我开设了三次内在成长旅修，与朋友们在震动与静默中探索自我。也是在一次深入的"萨满"学习中，一个深刻的觉醒击中了我：我观察到，家族中的女性长辈们，似乎被某种无形的印记缠绕，经历着相似的情感磨难。',
    meiLinStory3: '那一刻我明白了，有些模式印在能量里，写在DNA中。而我存在的意义，正是与像我一样的女性携手，走出旧有的循环，亲手重塑我们的"内在DNA"，寻回那条本就属于我们的、发光的内在道路。',
    
    // Teaching Philosophy
    teachingPhilosophy: '教学理念',
    philosophyQuote: '"思想、身体、行动，知行合一，正念不仅仅发生在瑜伽垫上"',
    
    // Stats
    yearsPractice: '练习年数',
    studentsGuided: '指导学生',
    momentsOfWonder: '奇妙时刻',
    
    // Footer
    copyright: '© 2026 内在光芒 · 新西兰奥克兰',
    footerMotto: '深沉呼吸。轻柔移动。充分生活。',

    // Practice Page
    benefitsOfYoga: '正念益处',
    benefitsSubtitle: '探索正念如何改变您的身体、心灵和精神。',
    readyToBegin: '准备好开始您的旅程了吗？',
    ctaSubtitle: '加入我们的课程，发现正念的变革力量。',
    bookFirstClass: '预约您的第一堂课',

    // About Page
    aJourneyOf: '你的身心',
    purpose: '整合疗愈伙伴',
    ourValues: '非二元的哲学思想',
    meetYourTeacher: '认识您的老师',
    meetTeacherDesc: '预约咨询或来上一节课，体验内在光芒的不同之处。',
    bookFreeConsultation: '预约免费咨询',

    // Classes Page
    classTypes: '课程类型',
    classTypesSubtitle: '从我们多样化的课程中选择，每一种都旨在支持您独特的道路。',
    weeklySchedule: '每周时间表',
    scheduleSubtitle: '找到练习的最佳时间。',
    downloadSchedule: '下载完整时间表',
    pricing: '价格',
    mostPopular: '最受欢迎',
    choosePlan: '选择计划',
    newToYoga: '正念初学者？',
    newToYogaDesc: '预约您的第一堂课，即可获得与Yuki老师的免费咨询。',
    day: '日期',
    time: '时间',
    class: '课程',
    teacher: '老师',
    spots: '名额',
    available: '可用',

    // Contact Page
    sendUsMessage: '给我们留言',
    contactSubtitle: '填写表格，我们将在24小时内回复您。',
    followUs: '关注我们',
    faq: '常见问题',
    faqSubtitle: '找到关于我们的课程和工作室的常见问题答案。',
    mapPlaceholder: '交互式地图即将推出',

    // Contact Form
    bookNow: '立即预约',
    yourName: '您的姓名',
    namePlaceholder: '输入您的姓名',
    emailAddress: '电子邮件地址',
    emailPlaceholder: 'your@email.com',
    subject: '主题',
    subjectPlaceholder: '我们如何帮助您？',
    message: '留言',
    messagePlaceholder: '告诉我们更多...',
    sendMessage: '发送留言',
    formNote: '我们通常在24小时内回复。',
    messageSent: '留言已发送！',
    messageSentDesc: '感谢您的联系，我们将尽快回复您。',
    sendAnother: '发送另一条留言',

    // Ayurveda Page
    ayurvedaArticles: '阿育吠陀文章',
    articlesCount: '篇文章',
    writeArticle: '撰写文章',
    writeNewArticle: '撰写新文章',
    articleTitle: '文章标题',
    titlePlaceholder: '输入文章标题...',
    articleCategory: '分类',
    articleContent: '内容',
    contentPlaceholder: '在这里写下您的文章内容...',
    publishArticle: '发布文章',
    publishing: '发布中...',
    cancel: '取消',
    noArticlesYet: '暂无文章',
    startWriting: '开始撰写您的第一篇阿育吠陀文章！',
    deleteArticle: '删除文章',

    // Testimonials Section
    testimonialsTitle: '学员故事',
    testimonialsSubtitle: '来自正念练习者社群的真实体验与分享。',
    testimonialsCTA: '准备好书写您的故事了吗？',

    // Ayurveda Test Page
    ayurvedaTestTitle: '阿育吠陀体质测试',
    ayurvedaTestSubtitle: '发现您独特的体质类型并获得个性化健康建议',
    ayurveda24Questions: '37道题目',
    ayurveda24Desc: '涵盖体质、情绪、精神和现代生活习惯的全面评估。根据您的自然倾向回答。',
    ayurvedaLikert: '频率量表',
    ayurvedaLikertDesc: '从1（很少）到5（非常频繁）评估每个陈述对您的适用程度。',
    ayurvedaPersonalResults: '个性化结果',
    ayurvedaPersonalResultsDesc: '获得您的体质档案以及饮食、生活方式和运动建议。',
    ayurvedaStartTest: '开始测试',
    ayurvedaTestComplete: '您的体质结果',
    ayurvedaYourDosha: '根据您的回答，这是您独特的体质档案',
    ayurvedaScore: '得分',
    ayurvedaRecommendations: '个性化建议',
    ayurvedaDiet: '饮食建议',
    ayurvedaLifestyle: '生活方式建议',
    ayurvedaExercise: '运动建议',
    ayurvedaBookConsultation: '准备好更深入地探索您的体质了吗？',
    ayurvedaRarely: '很少',
    ayurvedaSometimes: '偶尔',
    ayurvedaModerately: '一般',
    ayurvedaOften: '经常',
    ayurvedaVeryOften: '非常频繁',
    ayurvedaWhatIsAyurveda: '什么是阿育吠陀？',
    ayurvedaThreeDoshas: '三种体质',
    ayurvedaDisclaimerTitle: '重要免责声明',
    ayurvedaHowItWorks: '测试流程',
    ayurvedaProfessionalConsultation: '专业诊断建议',

    // Chakra Test Page
    chakraTestTitle: '脉轮平衡测试',
    chakraTestSubtitle: '通过全面的评估发现您的能量平衡状态',
    test49Questions: '49道题目',
    test49Desc: '七个脉轮，每个脉轮七道题。根据您近期的经历诚实地回答。',
    likertScale: '李克特量表',
    likertDesc: '对每个陈述从1（完全不符合）到5（完全符合）进行评分。',
    personalInsights: '个人洞察',
    personalInsightsDesc: '获得每个脉轮能量状态的详细分析和个性化建议。',
    startTest: '开始测试',
    completelyDisagree: '1. 完全不符合',
    completelyAgree: '5. 完全符合',
    disagree: '不符合',
    neutral: '不确定',
    agree: '符合',
    previous: '上一题',
    next: '下一题',
    saveProgress: '保存进度',
    questionProgress: '题目',
    testComplete: '测试完成',
    yourResults: '以下是您的脉轮能量结果',
    totalScore: '总分',
    status: '状态',
    retakeTest: '重新测试',
    showMore: '查看详情',
    showLess: '收起详情',
    lifestylePatterns: '生活模式',
    modernManifestations: '现代生活表现',
    suggestions: '改善建议',
    work: '工作',
    relationships: '关系',
    health: '健康',
mental: '心理',

    // Motherscope Page
    motherscopeJourney: '您的探索之旅',
    motherscopeDesc1: 'Motherscope 是一个综合平台，旨在支持女性度过母亲旅程的每个阶段。从怀孕到产后，我们提供资源、社区和指导，帮助您应对成为母亲的美好挑战。',
    motherscopeDesc2: '我们的方法将古老智慧与现代理解相结合，提供关于孕产妇健康和幸福的整体视角。与其他妈妈建立联系，获取专家建议，发现个人成长的工具。',
    motherscopeDesc3: '无论您正在计划怀孕、正在孕期还是正在度过产后时期，Motherscope 都会以同情和知识在这里支持您。',
    pregnancySupport: '孕期支持',
    pregnancySupportDesc: '从受孕到分娩，为您的孕期旅程提供全面的资源。',
    mindfulnessPractices: '正念练习',
    mindfulnessPracticesDesc: '为任何阶段的妈妈设计的温和练习和冥想。',
    communityConnection: '社区连接',
    communityConnectionDesc: '与理解您旅程的其他妈妈建立联系。',
    beginMotherscopeJourney: '开始您的孕妈探索之旅',
    motherscopeCtaDesc: '加入我们的支持社区，发现适用于您母亲旅程的各种资源。',

    // First Class Landing Page
    firstClassHero: '您的第一堂课',
    firstClassSubtitle: '与我们一起开始您的正念之旅。我们热情欢迎您的到来。',
    firstClassOffer: '首次体验优惠',
    firstClassOfferDesc: '首次体验仅需$15，并可获得与Yuki老师的免费咨询。',
    whyChooseUs: '为什么选择这里？',
    whyChooseUsDesc: '一个支持您正念之旅的温暖空间。',
    supportiveEnvironment: '支持性环境',
    supportiveEnvironmentDesc: '初学者欢迎。无需经验。尊重所有身体。',
    experiencedGuide: '经验丰富的导师',
    experiencedGuideDesc: 'Yuki已帮助数百名初学者找到内心的光芒。',
    gentleApproach: '温和的方式',
    gentleApproachDesc: '尊重您独特节奏和旅程的课程。',
    chooseYourClass: '选择您的第一堂课',
    chooseYourClassDesc: '从适合您需求和体验水平的课程开始。',
    whatToExpect: '您可以期待什么',
    whatToExpectDesc: '让您的第一次访问变得简单。',
    bringMat: '需要带什么',
    bringMatDesc: '只需带上您自己舒适的服装。我们提供瑜伽垫和道具。',
    arriveEarly: '到达时间',
    arriveEarlyDesc: '提前10分钟到达，适应环境并认识您的老师。',
    firstTimer: '第一次上课',
    firstTimerDesc: '告诉我们这是您的第一次课程，我们会给您额外的关注。',
    readyToBegin: '准备好开始了吗？',
    readyToBeginDesc: '预约您的第一堂课，迈出内心的平静第一步。',
    firstClassSuccess: '预约已收到！',
    firstClassSuccessDesc: '感谢您预约我们的第一堂课。我们将在24小时内确认您的预约。',
    bookNow: '立即预约',
    bookingFormTitle: '预约您的第一堂课',
    yourName: '您的姓名',
    namePlaceholder: '输入您的姓名',
    emailAddress: '电子邮件地址',
    emailPlaceholder: 'your@email.com',
    phoneNumber: '电话号码',
    phonePlaceholder: '+64 XX XXX XXXX',
    selectClass: '选择课程',
    selectClassPlaceholder: '选择课程...',
    preferredDate: '首选日期',
    preferredTime: '首选时间',
    additionalNotes: '附加备注',
    notesPlaceholder: '告诉我们任何伤病、顾虑或目标...',
    submitBooking: '确认预约',
    bookingNote: '我们将在24小时内确认您的预约。',
    testimonialsFirstClass: '第一次上课的故事',
    testimonialsFirstClassSubtitle: '听听其他从这里开始第一步的人怎么说。',
    classMindfulness: '正念冥想',
    classMindfulnessDesc: '非常适合初学者。温和的哈他瑜伽配合正念觉察。',
    classOutdoor: '户外瑜伽',
    classOutdoorDesc: '在我们的花园课程中与自然连接。',
    classMomToBe: '孕妈妈',
    classMomToBeDesc: '为准妈妈设计的滋养练习。',
    classInsightFlow: '内观流',
    classInsightFlowDesc: '配合音乐的动态流动，适合准备好运动的人。',
  },
};

// Language Context
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check for saved preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguage(savedLanguage);
    } else {
      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'zh') {
        setLanguage('zh');
      }
    }
    setMounted(true);
  }, []);

  const t = (key) => {
    if (!mounted) return translations.en[key] || key;
    return translations[language][key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'zh' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const setLanguageTo = (lang) => {
    if (lang === 'en' || lang === 'zh') {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLanguageTo, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default translations;
