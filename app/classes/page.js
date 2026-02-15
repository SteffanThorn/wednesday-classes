'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ClassCard from '@/components/ClassCard';
import ScheduleTable from '@/components/ScheduleTable';
import { Zap, Heart, Sun, Star, Calendar, Clock, Wind, Moon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const ClassesPage = () => {
  const { t, mounted } = useLanguage();

  const classTypes = [
    {
      icon: Zap,
      titleEn: 'Mindfulness',
      titleZh: '正念冥想',
      descEn: 'Our foundation classes blend traditional Hatha with mindful movement. Suitable for all levels, these sessions focus on building strength, flexibility, and inner awareness.',
      descZh: '我们的基础课程融合了传统哈他正念和正念运动。适合所有级别，这些课程专注于建立力量、灵活性和内在意识。',
      duration: '60 min',
      level: 'All Levels',
      price: '$25/class',
      href: '/classes/mindfulness',
    },
    {
      icon: Heart,
      titleEn: 'Mom-to-be Mindfulness Practice Online + Offline',
      titleZh: '孕妈妈正念练习 线上+线下',
      descEn: 'A nurturing practice designed for expectant mothers. Gentle stretches, breathing techniques, and poses that support the changing body and prepare for birth.',
      descZh: '为准妈妈设计的滋养练习。轻柔的伸展、呼吸技术和姿势支持变化的身体并为分娩做准备。',
      duration: '75 min',
      level: 'Prenatal',
      price: '$30/class',
      href: '/classes/mom-to-be-mindfulness',
    },
    {
      icon: Sun,
      titleEn: 'Outdoor Yoga',
      titleZh: '户外瑜伽',
      descEn: 'Connect with nature in our outdoor sessions. Held in beautiful garden settings, these classes blend yoga with the grounding energy of the earth.',
      descZh: '在我们的户外课程中与自然连接。在美丽的花园环境中进行，这些课程将瑜伽与大地的接地能量相结合。',
      duration: '90 min',
      level: 'All Levels',
      price: '$35/class',
      href: '/classes/outdoor-yoga',
    },
    {
      icon: Wind,
      titleEn: 'Insight Flow',
      titleZh: '内观流',
      descEn: 'A dynamic meditative flow that connects music with movement. Build strength, flexibility, and inner awareness through fluid fascia sequences—a meditation movement of music and yoga.',
      descZh: '将音乐与运动相连的动态冥想流程。通过流畅的筋膜序列建立力量、灵活性和内在意识——一种音乐与瑜伽的冥想运动。',
      duration: '60 min',
      level: 'All Levels',
      price: '$28/class',
      href: '/classes/insight-flow',
    },
    {
      icon: Moon,
      titleEn: 'Full Moon Ceremony',
      titleZh: '满月仪式',
      descEn: 'Join us for a transformative evening under the full moon. This special ceremony combines meditation, intention setting, and energy healing to harness lunar energy.',
      descZh: '加入我们在满月之夜的变革性晚会。这个特别的仪式结合了冥想、意图设定和能量疗愈，以利用月球能量。',
      duration: '90 min',
      level: 'All Levels',
      price: '$45/class',
      href: '/classes/full-moon-ceremony',
    },
    {
      icon: Star,
      titleEn: 'VIP (1 on 1)',
      titleZh: '私教课程',
      descEn: 'Personalized sessions tailored to your unique needs and goals. Deepen your practice with individualized attention and custom sequences.',
      descZh: '根据您独特的需求和目标量身定制的个人课程。通过个性化关注和定制序列深化您的练习。',
      duration: '60 min',
      level: 'Personalized',
      price: '$80/session',
      href: '/classes/vip-1on1',
    },
  ];

  const schedule = [
    { dayKey: 'monday', time: '7:00 AM', classKey: 'yoga', teacher: 'Mei Lin', spots: 5 },
    { dayKey: 'monday', time: '6:00 PM', classKey: 'pregnantYoga', teacher: 'Mei Lin', spots: 3 },
    { dayKey: 'tuesday', time: '7:00 AM', classKey: 'yoga', teacher: 'Sarah', spots: 8 },
    { dayKey: 'tuesday', time: '5:30 PM', classKey: 'gardenYoga', teacher: 'Mei Lin', spots: 6 },
    { dayKey: 'wednesday', time: '7:00 AM', classKey: 'yoga', teacher: 'Mei Lin', spots: 4 },
    { dayKey: 'wednesday', time: '10:00 AM', classKey: 'pregnantYoga', teacher: 'Mei Lin', spots: 2 },
    { dayKey: 'thursday', time: '6:00 PM', classKey: 'yoga', teacher: 'Sarah', spots: 7 },
    { dayKey: 'friday', time: '7:00 AM', classKey: 'yoga', teacher: 'Mei Lin', spots: 6 },
    { dayKey: 'saturday', time: '9:00 AM', classKey: 'gardenYoga', teacher: 'Mei Lin', spots: 8 },
    { dayKey: 'saturday', time: '11:00 AM', classKey: 'yoga', teacher: 'Sarah', spots: 5 },
    { dayKey: 'sunday', time: '10:00 AM', classKey: 'yoga', teacher: 'Mei Lin', spots: 4 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Our Classes"
          titleZh="我们的课程"
          subtitleEn="Discover the perfect practice for your journey. From gentle flows to deep exploration, we have a class for everyone."
          subtitleZh="发现适合您旅程的完美练习。从轻柔的流动到深度探索，我们为每个人提供课程。"
        />

        {/* Class Types Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('classTypes') : 'Class Types'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {mounted ? t('classTypesSubtitle') : 'Choose from our diverse range of offerings, each designed to support your unique path.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {classTypes.map((cls) => (
                <div key={cls.titleEn} id={cls.titleEn.toLowerCase().replace(/[^a-z0-9]/g, '')}>
                  <ClassCard
                    icon={cls.icon}
                    titleEn={cls.titleEn}
                    titleZh={cls.titleZh}
                    descriptionEn={cls.descEn}
                    descriptionZh={cls.descZh}
                    duration={cls.duration}
                    level={cls.level}
                    price={cls.price}
                    href={cls.href}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-glow-cyan" />
                <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle">
                  {mounted ? t('weeklySchedule') : 'Weekly Schedule'}
                </h2>
              </div>
              <p className="text-muted-foreground">
                {mounted ? t('scheduleSubtitle') : 'Find the perfect time for your practice.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                        animate-fade-in-up animation-delay-200">
              <ScheduleTable schedule={schedule} />
            </div>

            <div className="mt-6 text-center">
              <button className="px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                               text-glow-cyan text-sm hover:bg-glow-cyan/20 hover:box-glow
                               transition-all duration-300">
                {mounted ? t('downloadSchedule') : 'Download Full Schedule'}
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('pricing') : 'Pricing'}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  titleEn: 'Drop In',
                  titleZh: '单次',
                  price: '$25',
                  features: ['Any single class', 'No commitment', 'Flexible schedule'],
                },
                {
                  titleEn: '10 Class Pack',
                  titleZh: '10次课程包',
                  price: '$200',
                  features: ['10 classes of any type', '6 month expiry', 'Shareable with family'],
                  popular: true,
                },
                {
                  titleEn: 'Monthly Unlimited',
                  titleZh: '月卡无限',
                  price: '$250',
                  features: ['Unlimited classes', 'Priority booking', 'Free mat rental'],
                },
              ].map((tier, index) => (
                <div 
                  key={tier.titleEn}
                  className={`p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500
                             ${tier.popular 
                               ? 'border-glow-cyan/50 bg-card/70 box-glow' 
                               : 'border-glow-cyan/20 bg-card/50 hover:border-glow-cyan/40'}`}
                >
                  {tier.popular && (
                    <div className="mb-4 text-xs font-medium text-center text-glow-cyan uppercase tracking-wider">
                      {mounted ? t('mostPopular') : 'Most Popular'}
                    </div>
                  )}
                  <h3 className="font-display text-2xl text-foreground mb-2">
                    {mounted ? (t('language') === 'zh' ? tier.titleZh : tier.titleEn) : tier.titleEn}
                  </h3>
                  <div className="font-display text-4xl text-glow-cyan mb-6">
                    {tier.price}
                    <span className="text-lg text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                        <svg className="w-4 h-4 text-glow-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-xl font-medium transition-all duration-300
                                   ${tier.popular 
                                     ? 'bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30' 
                                     : 'bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20'}`}>
                    {mounted ? t('choosePlan') : 'Choose Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-purple/10 to-glow-cyan/10 
                          border border-glow-purple/20 box-glow-purple animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-4">
                {mounted ? t('newToYoga') : 'New to Yoga?'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('newToYogaDesc') : 'Book your first class and receive a complimentary consultation with Mei Lin.'}
              </p>
              <button className="px-8 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                               text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                               transition-all duration-300">
                {mounted ? t('bookFirstClass') : 'Book Your First Class'}
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
      </div>
    </div>
  );
};

export default ClassesPage;

