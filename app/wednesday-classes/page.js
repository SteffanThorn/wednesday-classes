'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import BookingModal from '@/components/BookingModal';
import { useLanguage } from '@/hooks/useLanguage';
import { Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Wednesday class details
const WEDNESDAY_CLASS = {
  name: 'New Alignment Yoga',
  date: '2025-02-18', // Next Wednesday - starting from 18th Feb 2025
  time: '6:00 PM',
  location: 'Village Valley Centre, Ashhurst',
  price: 15
};

// Generate available Wednesdays starting from 18th Feb 2025 for 3 months
export function getAvailableWednesdays(startDate = '2025-02-18', weeksAhead = 12) {
  const wednesdays = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < weeksAhead; i++) {
    const wed = new Date(start);
    wed.setDate(start.getDate() + (i * 7));
    wednesdays.push({
      date: wed.toISOString().split('T')[0],
      displayDate: wed.toLocaleDateString('en-NZ', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }),
      fullDate: wed.toLocaleDateString('en-NZ', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    });
  }
  
  return wednesdays;
}

const WednesdayClassesPage = () => {
  const { t, mounted, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
      answerEn: "You don't need to be really flexible, but you should be able to walk around comfortably for this kind of class. ALL levels are welcome.",
      answerZh: '完全不需要！这是一堂温和的初学者课程。您不需要任何柔韧性或瑜伽经验即可参加。无论您是瑜伽新手还是休息后重返，Yuki都会指导您每一步。',
    },
    {
      questionEn: 'Can pregnant or postpartum mothers attend?',
      questionZh: '孕妇、产后妈妈可以参加吗？',
      answerEn: "Not if you have gotten pregnant in the last 12 weeks. Otherwise, I've trained in pregnancy yoga and can adapt poses to make the class safe and comfortable for you. Please inform me about your specific situation before class. ",
      answerZh: '如果您在过去12周内怀孕，则不适合参加。否则，我接受过孕妇瑜伽培训，可以调整体式让您安全舒适地参与课程。请在上课前告知我您的具体情况。',
    },
    {
      questionEn: 'Can I attend if I have had surgery?',
      questionZh: '身体做过手术可以参加吗？',
      answerEn: 'Please consult your doctor first and inform me about your condition. I will help adapt the practice to your needs.',
      answerZh: '请先咨询您的医生，并告知我您的身体状况。我会根据您的需要帮助调整练习。',
    },
    {
      questionEn: 'Can I attend if I have pain such as knee injuries, neck/back discomfort, or wrist syndrome?',
      questionZh: '身体有疼痛比如：膝关节损伤、颈椎腰椎不适、腕关节综合症等可以参加课程吗？',
      answerEn: 'Yes, but please inform me before class. I will guide you through gentle modifications suitable for your condition.',
      answerZh: '可以，但请在上课前告知我。我会根据您的情况引导您进行适当的温和调整。',
    },
    {
      questionEn: 'Medical Conditions',
      questionZh: '健康状况',
      answerEn: 'Please inform me before class if you are pregnant, have cardiovascular conditions, or high blood pressure. I will adapt the practice to ensure your safety and comfort.',
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
              {mounted ? (language === 'zh' ? 'Ashhurst新对齐瑜伽课程' : 'New Alignment Yoga Classes in Ashhurst') : 'New Alignment Yoga Classes in Ashhurst'}
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
                <span className="text-sm">Small classes · Max 8 people</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-glow-cyan/20">
                <DollarSign className="w-4 h-4 text-glow-cyan" />
                <span className="text-sm">$15 per class</span>
              </div>
            </div>
            
            {/* Primary CTA */}
            <div className="animate-fade-in-up animation-delay-400">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-glow-cyan/20 border border-glow-cyan/40 
                         text-glow-cyan font-medium text-lg hover:bg-glow-cyan/30 hover:box-glow
                         transition-all duration-300 shadow-glow cursor-pointer"
              >
                {mounted ? (language === 'zh' ? '立即预约' : 'Book Class') : 'Book Class'}
              </button>
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
                  <div className="text-muted-foreground space-y-4 text-sm leading-relaxed whitespace-pre-line">
                    <p>
                      {mounted 
                        ? (language === 'zh' 
                          ? '自从我接触瑜伽垫的那一刻起，我就找到了人生的热爱。\n\n瑜伽疗愈了我。瑜伽也能疗愈你。\n\n缓解酸痛。\n改善体态和核心力量。增强心态。\n\n让我与你分享来自全球导师的8年以上的瑜伽知识和经验。'
                          : "Ever since I've touched a yoga mat I found my passion in life. \n\nYoga healed me. And yoga can heal you. \n\nAlleviate aches and pains. \nImprove posture and core strength. Empower your mentality. \n\nLet me share with you 8+ years of yoga knowledge and experience from teachers all across the globe.")
                        : "Ever since I've touched a yoga mat I found my passion in life. \n\nYoga healed me. And yoga can heal you. \n\nAlleviate aches and pains. \nImprove posture and core strength. Empower your mentality. \n\nLet me share with you 8+ years of yoga knowledge and experience from teachers all across the globe."}
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
                    ? (language === 'zh' ? '请自带瑜伽垫' : 'BYO Yoga Mat')
                    : 'BYO Yoga Mat'}
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
                      <span className="text-muted-foreground">{mounted ? (language === 'zh' ? '每节课' : 'per class') : 'per class'}</span>
                    </div>
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
              
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-glow-cyan/20 border border-glow-cyan/40 
                         text-glow-cyan font-medium text-lg hover:bg-glow-cyan/30 hover:box-glow
                         transition-all duration-300 shadow-glow cursor-pointer"
              >
                {mounted ? (language === 'zh' ? '立即预约' : 'Book Class') : 'Book Class'}
              </button>
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

        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          classDetails={WEDNESDAY_CLASS}
          language={mounted ? language : 'en'}
        />
      </div>
    </div>
  );
};

export default WednesdayClassesPage;

