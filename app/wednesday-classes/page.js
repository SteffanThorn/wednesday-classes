'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const WednesdayClassesPage = () => {
  const { t, mounted, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const whoIsThisFor = [
    { textEn: 'Adults new to yoga', textZh: '瑜伽新手' },
    { textEn: 'Adults who sit for long periods with stiff joints', textZh: '长期久坐人群、身体关节僵硬' },
    { textEn: 'Adults who ache from being on their feet all day', textZh: '长时间站立、腿部酸痛人群' },
    { textEn: 'Adults with neck or lower back discomfort', textZh: '颈椎、腰椎容易产生不适人群（已经有病理性病变人群需要提前告知）' },
    { textEn: 'Postpartum mothers (Pregnant mothers Please inform me before class)', textZh: '产后妈妈（孕中妈妈需要提前告知）' },
    { textEn: 'Adults who want to purify inner energy and mind', textZh: '净化内在能量与大脑的人' },
    { textEn: 'Adults who want to reconnect with themselves', textZh: '想要与自己重新连接的人' },
  ];

  const faqs = [
    {
      questionEn: 'Do I need to be flexible or have yoga experience?',
      questionZh: '我需要柔韧性或瑜伽经验吗？',
      answerEn: "Not at all! This is a gentle, beginner-friendly class. You do not need any existing flexibility or yoga experience to attend. Whether you're completely new to yoga or returning after a break, Yuki will guide you through every step.",
      answerZh: '完全不需要！这是一堂温和的初学者课程。您不需要任何柔韧性或瑜伽经验即可参加。无论您是瑜伽新手还是休息后重返，Yuki都会指导您每一步。',
    },
    {
      questionEn: 'Can pregnant or postpartum mothers attend?',
      questionZh: '孕妇、产后妈妈可以参加吗？',
      answerEn: 'Yes, Yuki has training in pregnancy yoga and can adapt poses to make the class safe and comfortable for you. Please inform Yuki about your specific situation before class. Note: Mothers in their second trimester should also inform Yuki beforehand.',
      answerZh: '可以，Yuki接受过孕妇瑜伽培训，可以调整体式让您安全舒适地参与课程。请在上课前告知Yuki您的具体情况。注意；孕中期妈妈请提前告知',
    },
    {
      questionEn: 'Can I attend if I have had surgery?',
      questionZh: '身体做过手术可以参加吗？',
      answerEn: 'Please consult your doctor first and inform Yuki about your condition. She will help adapt the practice to your needs.',
      answerZh: '请先咨询您的医生，并告知Yuki您的身体状况。她会根据您的需要帮助调整练习。',
    },
    {
      questionEn: 'Can I attend if I have pain such as knee injuries, neck/back discomfort, or wrist syndrome?',
      questionZh: '身体有疼痛比如：膝关节损伤、颈椎腰椎不适、腕关节综合症等可以参加课程吗？',
      answerEn: 'Yes, but please inform Yuki before class. She will guide you through gentle modifications suitable for your condition.',
      answerZh: '可以，但请在上课前告知Yuki。她会根据您的情况引导您进行适当的温和调整。',
    },
    {
      questionEn: 'Medical Conditions',
      questionZh: '健康状况',
      answerEn: 'Please inform Yuki before class if you are pregnant, have cardiovascular conditions, or high blood pressure. She will adapt the practice to ensure your safety and comfort.',
      answerZh: '孕妈妈、心脑血管疾病患者、高血压患者请在课前告知Yuki。她会根据您的情况调整练习，确保您的安全和舒适。',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <section className="px-6 pt-8 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light 
                         text-glow animate-fade-in-up mb-6">
              {mounted ? (language === 'zh' ? 'Ashhurst新瑜伽课程' : 'New Yoga Classes in Ashhurst') : 'New Yoga Classes in Ashhurst'}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto 
                        leading-relaxed animate-fade-in-up animation-delay-200 mb-8">
              {mounted ? (language === 'zh' ? '通过瑜伽缓解疼痛、减少焦虑和恐惧，并提高柔韧性' : 'Alleviate pains, reduce anxiety and fears, and improve flexibility with Yoga') : 'Alleviate pains, reduce anxiety and fears, and improve flexibility with Yoga'}
            </p>
            
            {/* Supporting Details */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10 animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-glow-cyan/20">
                <Calendar className="w-4 h-4 text-glow-cyan" />
                <span className="text-sm">Wednesdays · 6:00 PM</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-glow-cyan/20">
                <MapPin className="w-4 h-4 text-glow-cyan" />
                <span className="text-sm">Village Valley Centre, Ashhurst</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-glow-cyan/20">
                <Users className="w-4 h-4 text-glow-cyan" />
                <span className="text-sm">Small classes · Max 10 people</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-glow-cyan/20">
                <DollarSign className="w-4 h-4 text-glow-cyan" />
                <span className="text-sm">$15 intro · $20 standard</span>
              </div>
            </div>
            
            {/* Primary CTA */}
            <div className="animate-fade-in-up animation-delay-400">
              <a 
                href="#booking"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-glow-cyan/20 border border-glow-cyan/40 
                         text-glow-cyan font-medium text-lg hover:bg-glow-cyan/30 hover:box-glow
                         transition-all duration-300 shadow-glow"
              >
                {mounted ? (language === 'zh' ? '预订$15体验课' : 'Book Your $15 Intro Class') : 'Book Your $15 Intro Class'}
              </a>
            </div>
          </div>
        </section>

        {/* About the Teacher */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '认识您的老师' : 'Meet Your Teacher') : 'Meet Your Teacher'}
              </h2>
            </div>
            
            <div className="bg-card/60 border border-glow-cyan/20 rounded-3xl p-8 animate-fade-in-up animation-delay-200">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Teacher Photo */}
                <div className="w-full md:w-72 h-72 rounded-2xl bg-gradient-to-br from-glow-cyan/20 to-glow-purple/20 
                              flex items-center justify-center border border-glow-cyan/30 shrink-0 overflow-hidden p-2">
                  <img 
                    src="/yukiyoga.jpg" 
                    alt="Yuki yoga teacher" 
                    className="w-full h-full object-contain object-top rounded-xl"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-display text-2xl text-foreground mb-2">Yuki</h3>
                  <p className="text-glow-cyan text-sm font-medium mb-4">
                    {mounted ? (language === 'zh' ? '正念瑜伽与冥想老师及疗愈师' : 'Mindfulness Yoga & Meditation Teacher & Healer') : 'Mindfulness Yoga & Meditation Teacher & Healer'}
                  </p>
                  <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
                    <p>
                      {mounted 
                        ? (language === 'zh' 
                          ? '这一切始于2018年的一张安静的瑜伽垫上。在那里，我第一次体验了心灵完全属于自我的宁静。这种对内在空间的渴望引导我从练习者成为瑜伽老师。在教授产前和产后修复时，我见证了一个更深的真理：女性需要的不仅仅是身体的恢复，更是心理的治愈和能量的复苏。'
                          : 'It began in 2018 on a quiet yoga mat. There, for the first time, I experienced the stillness of having my mind completely belong to myself. This longing for inner space guided me from practitioner to yoga teacher, and while teaching prenatal and postnatal restoration, I witnessed a deeper truth: what women need is not just physical recovery, but psychological healing and energetic revival.')
                        : 'It began in 2018 on a quiet yoga mat. There, for the first time, I experienced the stillness of having my mind completely belong to myself. This longing for inner space guided me from practitioner to yoga teacher, and while teaching prenatal and postnatal restoration, I witnessed a deeper truth: what women need is not just physical recovery, but psychological healing and energetic revival.'}
                    </p>
                    <p>
                      {mounted 
                        ? (language === 'zh' 
                          ? '2021年，我和伴侣开始了三年的海外生活。在巴厘岛的六个月里，这片灵性土壤滋养了我。我带领了三次内在成长静修，与朋友们在振动和寂静中探索自我。也是在一次深入的"萨满"学习中，我经历了深刻的觉醒：我观察到家族中的女性长辈似乎被某种无形的印记纠缠，经历着相似的情感挣扎。'
                          : 'In 2021, my partner and I embarked on a three-year journey of living abroad. During our six months in Bali, the spiritual soil nourished me. I led three inner growth retreats, exploring the self with friends in vibration and silence. It was also during an in-depth Shamanic study that a profound awakening struck me: I observed that the women elders in my family seemed to be entangled by some invisible imprint, experiencing similar emotional struggles.')
                        : 'In 2021, my partner and I embarked on a three-year journey of living abroad. During our six months in Bali, the spiritual soil nourished me. I led three inner growth retreats, exploring the self with friends in vibration and silence. It was also during an in-depth Shamanic study that a profound awakening struck me: I observed that the women elders in my family seemed to be entangled by some invisible imprint, experiencing similar emotional struggles.'}
                    </p>
                    <p>
                      {mounted 
                        ? (language === 'zh' 
                          ? '那一刻，我明白了有些模式刻在能量中，写在DNA里。我存在的意义正是与像我这样的女性携手同行，走出旧的循环，亲手重塑我们的"内在DNA"，重新夺回那条本就属于我们的发光内在之路。'
                          : 'At that moment, I understood that some patterns are etched in energy, written in DNA. And the meaning of my existence is precisely to walk hand-in-hand with women like me, stepping out of old cycles, personally reshaping our inner DNA, and reclaiming that glowing inner path that was always ours.')
                        : 'At that moment, I understood that some patterns are etched in energy, written in DNA. And the meaning of my existence is precisely to walk hand-in-hand with women like me, stepping out of old cycles, personally reshaping our inner DNA, and reclaiming that glowing inner path that was always ours.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who This Class Is For */}
        <section className="px-6 py-12 bg-card/30">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '这堂课适合谁' : 'Who This Class Is For?') : 'Who This Class Is For?'}
              </h2>
            </div>
            
            <div className="bg-card/60 border border-glow-cyan/20 rounded-3xl p-8 animate-fade-in-up animation-delay-200">
              <ul className="space-y-4 mb-6">
                {whoIsThisFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-glow-cyan shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      {mounted ? (language === 'zh' ? item.textZh : item.textEn) : item.textEn}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="p-4 rounded-2xl bg-glow-cyan/10 border border-glow-cyan/20">
                <p className="text-center text-glow-cyan font-medium">
                  {mounted 
                    ? (language === 'zh' ? '无需柔韧性或体能要求——只需要好奇心。' : 'No flexibility or fitness level required — just curiosity.')
                    : 'No flexibility or fitness level required — just curiosity.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Class Details & Pricing */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '课程详情与价格' : 'Class Details & Pricing') : 'Class Details & Pricing'}
              </h2>
            </div>
            
            <div className="bg-card/60 border border-glow-cyan/20 rounded-3xl p-8 animate-fade-in-up animation-delay-200">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-glow-cyan shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      {mounted ? (language === 'zh' ? '时间：' : 'When:') : 'When:'}
                    </h4>
                    <p className="text-muted-foreground">Wednesdays · 6:00 PM · 60 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-glow-cyan shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      {mounted ? (language === 'zh' ? '地点：' : 'Where:') : 'Where:'}
                    </h4>
                    <p className="text-muted-foreground">Village Valley Centre, Ashhurst</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-glow-cyan shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      {mounted ? (language === 'zh' ? '时长：' : 'Duration:') : 'Duration:'}
                    </h4>
                    <p className="text-muted-foreground">60 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-glow-cyan shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      {mounted ? (language === 'zh' ? '请携带：' : 'What to bring:') : 'What to bring:'}
                    </h4>
                    <p className="text-muted-foreground">BYO Yoga Mat · Comfortable clothing</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-glow-cyan/20 pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-display text-glow-cyan">$15</span>
                      <span className="text-muted-foreground">{mounted ? (language === 'zh' ? '体验课' : 'intro class') : 'intro class'}</span>
                      <span className="text-3xl font-display text-foreground">$20</span>
                      <span className="text-muted-foreground">{mounted ? (language === 'zh' ? '标准课' : 'standard') : 'standard'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {mounted ? (language === 'zh' ? '$15体验价仅限您的第一堂课。' : '(Or $15 for 5 classes)') : '(Or $15 for 5 classes)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-12 bg-card/30">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '常见问题' : 'FAQ') : 'FAQ'}
              </h2>
            </div>
            
            <div className="space-y-4 animate-fade-in-up animation-delay-200">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-card/60 border border-glow-cyan/20 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-card/80 transition-colors"
                  >
                    <span className="font-medium text-foreground">
                      {mounted ? (language === 'zh' ? faq.questionZh : faq.questionEn) : faq.questionEn}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 text-glow-cyan transition-transform ${openFaq === index ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-muted-foreground">
                      {mounted ? (language === 'zh' ? faq.answerZh : faq.answerEn) : faq.answerEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-6 py-16 pb-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-glow-cyan/10 to-glow-purple/10 
                          border border-glow-cyan/20 box-glow animate-fade-in-up">
              <p className="font-display text-2xl text-glow-subtle mb-6 italic">
                {mounted ? (language === 'zh' ? '如你所是。轻柔移动。深呼吸。' : '"Come as you are. Move gently. Breathe."') : '"Come as you are. Move gently. Breathe."'}
              </p>
              
              <a 
                href="#booking"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-glow-cyan/20 border border-glow-cyan/40 
                         text-glow-cyan font-medium text-lg hover:bg-glow-cyan/30 hover:box-glow
                         transition-all duration-300 shadow-glow"
              >
                {mounted ? (language === 'zh' ? '预订$15体验课' : 'Book Your $15 Intro Class') : 'Book Your $15 Intro Class'}
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              {mounted ? t('copyright') : '© 2026 INNER LIGHT · Auckland, New Zealand'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              {mounted ? t('footerMotto') : 'Breathe deeply. Move gently. Live fully.'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WednesdayClassesPage;

