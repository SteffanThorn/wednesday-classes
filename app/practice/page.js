'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';
import { Heart, Baby, Sparkles, Sun, Wind, Moon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const PracticePage = () => {
  const { t, mounted } = useLanguage();

  const benefits = [
    {
      icon: Heart,
      titleEn: 'Ayurveda',
      titleZh: '阿育吠陀',
      descEn: 'Ayurveda and Yoga both originate from Samkhya philosophy (the science of human evolution). They believe all matter is composed of five elements: ether, air, fire, water, earth, which evolve into three doshas: Kapha, Pitta, Vata.',
      descZh: '阿育吠陀和瑜伽来自于数论派哲学（研究人类演化的科学），他们都认为万物由五大元素组成：空，风，火，水，土，而这五大元素在生命体内演化出了三种能量：Kapha（土） Pitta（火） Vata（风）',
      href: '/ayurveda',
      delay: 0,
    },
    {
      icon: Moon,
      titleEn: 'Mindfulness, Chakras & Meditation',
      titleZh: '正念、脉轮、冥想',
      descEn: 'Reduce stress and anxiety through breathing techniques that calm the mind and restore inner peace.',
      descZh: '探索古老而强大的身心连接，通过专业的呼吸技巧唤醒内在能量，脊柱运动释放深层紧张，脉轮清理平衡能量中心，配合深度冥想和催眠疗法。在这里您将学会如何与真实的自己相遇。',
      href: '/practice/mindfulness-chakras-meditation',
      delay: 200,
    },
    {
      icon: Sparkles,
      titleEn: 'Chakra Balance',
      titleZh: '脉轮平衡',
      descEn: 'Restore natural energy flow and harmony within your body\'s interconnected systems.',
      descZh: '恢复身体相互关联系统内的自然能量流动与和谐。',
      href: '/practice/chakra-balance',
      delay: 400,
    },
    {
      icon: Baby,
      titleEn: 'Emotion & Pain Connection',
      titleZh: '情绪与疼痛的关系',
      descEn: 'Develop mindfulness practices that cultivate lasting calm and emotional resilience.',
      descZh: '深入探索情绪与身体疼痛之间的深层联系。通过专业的正念练习，学会识别和释放压抑的情绪，理解身体疼痛背后的心理根源。您将掌握实用的情绪释放技巧和身体疗愈方法，建立持久的内心平静与情绪韧性，学会与自己的情绪和身体和谐共处。',
      href: '/practice/pain-management',
      delay: 600,
    },
    {
      icon: Wind,
      titleEn: 'Posture Correction',
      titleZh: '体态矫正',
      descEn: 'Strengthen core muscles and realign spine for improved posture and reduced pain.',
      descZh: '强化核心肌肉和脊柱排列，改善姿势并减少疼痛。',
      href: '/practice/posture-correction',
      delay: 800,
    },
    {
      icon: Sun,
      titleEn: 'Mom-to-be Yoga',
      titleZh: '孕期支持',
      descEn: 'Relax your body and mind before bed for deeper, more restorative sleep patterns.',
      descZh: '睡前放松身心，建立更深层、更有恢复性的睡眠模式。',
      href: '/practice/mom-to-be-yoga',
      delay: 1000,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Your Inner Light Journey"
          titleZh="内在光芒之旅"
          subtitleEn="Discover the transformative power of mindful movement. Each practice is a step toward wholeness."
          subtitleZh="发现正念运动的变革力量。每次练习都是迈向完整的一步。"
        />

        {/* Benefits Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('benefitsOfYoga') : 'Benefits of Mindfulness'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {mounted ? t('benefitsSubtitle') : 'Explore how mindfulness can transform your body, mind, and spirit.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.titleEn} id={benefit.titleEn.toLowerCase().replace(/[^a-z]/g, '')}>
                  <FeatureCard
                    icon={benefit.icon}
                    titleEn={benefit.titleEn}
                    titleZh={benefit.titleZh}
                    descriptionEn={benefit.descEn}
                    descriptionZh={benefit.descZh}
                    href={benefit.href}
                    delay={benefit.delay}
                  />
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
                {mounted ? t('readyToBegin') : 'Ready to Begin Your Journey?'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('ctaSubtitle') : 'Join us for a class and discover the transformative power of yoga.'}
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

export default PracticePage;
