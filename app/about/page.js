'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { MapPin, Compass, Sun, Award, Heart, Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const AboutPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Your Inner Journey"
          titleZh="内在光芒之旅"
          subtitleEn="A journey from ancient wisdom to modern healing, rooted in the belief that everyone deserves to find their inner light."
          subtitleZh="从古老智慧到现代疗愈的旅程，根植于每个人都值得找到内心光芒的信念。"
        />

        {/* Teacher Story Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Story */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-warm-coral" />
                  <span className="text-sm text-muted-foreground tracking-widest uppercase">
                    {mounted ? t('fromShanghaiToAuckland') : 'From Shanghai to Auckland'}
                  </span>
                </div>
                
                <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle">
                  <span className="gradient-text">{mounted ? t('journeyOfPurpose') : 'Awakening Path'}</span>
                </h2>

                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p className="animate-fade-in-up animation-delay-200">
                    {mounted ? t('meiLinStory1') : 'Growing up in a small village outside Shanghai, Mei Lin discovered the ancient art of movement through her grandmother\'s tai chi practices at dawn. Those quiet mornings, watching the mist rise over the rice paddies, planted seeds that would bloom decades later.'}
                  </p>
                  <p className="animate-fade-in-up animation-delay-400">
                    {mounted ? t('meiLinStory2') : 'After years in the corporate world left her disconnected from her body and spirit, a chance encounter with a traveling yoga master reignited that childhood wonder. She dedicated herself to deep study, training in India and Thailand.'}
                  </p>
                  <p className="animate-fade-in-up animation-delay-600">
                    {mounted ? t('meiLinStory3') : 'Now calling New Zealand home, Mei Lin weaves Eastern wisdom with modern understanding, helping others find their path back to wholeness—one breath at a time.'}
                  </p>
                </div>

                {/* Philosophy */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                              border border-glow-teal/20 animate-fade-in-up animation-delay-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Compass className="w-6 h-6 text-glow-teal" />
                    <h3 className="font-display text-xl text-foreground">
                      {mounted ? t('teachingPhilosophy') : 'Teaching Philosophy'}
                    </h3>
                  </div>
                  <p className="text-muted-foreground italic">
                    {mounted ? t('philosophyQuote') : '"Unite your mind, body and actions as a way of life, not just on the yoga mat."'}
                  </p>
                </div>
              </div>

              {/* Right - Image/Profile */}
              <div className="animate-fade-in-up animation-delay-400">
                <div className="relative">
                  <div className="absolute inset-0 bg-glow-cyan/10 rounded-3xl blur-2xl transform -rotate-3" />
                  
                  <div className="relative p-8 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                                    flex items-center justify-center border border-glow-cyan/30 box-glow">
                        <Sun className="w-10 h-10 text-glow-cyan animate-pulse-glow" />
                      </div>
                      <div>
                        <h3 className="font-display text-2xl text-foreground">
                          {mounted ? t('meiLin') : 'Mei Lin'}
                        </h3>
                        <p className="text-sm text-glow-cyan">
                          {mounted ? t('yogaTeacherHealer') : 'Yoga Teacher & Healer'}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                        <div className="font-display text-2xl text-glow-cyan">8+</div>
                        <div className="text-xs text-muted-foreground">
                          {mounted ? t('yearsPractice') : 'Years'}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                        <div className="font-display text-2xl text-glow-cyan">500+</div>
                        <div className="text-xs text-muted-foreground">
                          {mounted ? t('studentsGuided') : 'Students'}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                        <div className="font-display text-2xl text-glow-cyan">∞</div>
                        <div className="text-xs text-muted-foreground">
                          {mounted ? t('momentsOfWonder') : 'Moments'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('ourValues') : 'Our Values'}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Heart,
                  titleEn: 'Attitude',
                  titleZh: '态度',
                  descEn: 'Every body is welcome exactly as it is. We meet you where you are on your journey.',
                  descZh: 'Attitude 态度-- Iccha译为：心，意为认识本我、内在的觉醒、开悟，享受自由的灵魂，对应梵语--Shiva，寻找二元世界中的平衡，专注与拓展、给予和接受、释放和获得。',
                },
                {
                  icon: Award,
                  titleEn: 'Alignment',
                  titleZh: '顺位',
                  descEn: 'Deep training and continuous learning to bring you the best of Eastern and Western practices.',
                  descZh: 'Alignment，内在身体的顺位--Prana/气、心绪、及更高意识与外在身体及外在环境的对位（对应我们的瑜伽练习和哲学思想"知行合一"）',
                },
                {
                  icon: Star,
                  titleEn: 'Action',
                  titleZh: '行动',
                  descEn: 'Real transformation through genuine care, not superficial fixes or trends.',
                  descZh: 'Action--探索自我的边界，在梵语中代表Shakti,在行动中全然的接受、臣服、专注，并在每一次尝试中，破茧成蝶。',
                },
              ].map((value, index) => (
                <div 
                  key={value.titleEn}
                  className={`p-6 rounded-2xl border border-glow-cyan/10 bg-card/50 backdrop-blur-sm 
                             hover:border-glow-cyan/30 hover:box-glow transition-all duration-500
                             animate-fade-in-up`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="p-3 rounded-xl bg-glow-cyan/10 mb-4 w-fit">
                    <value.icon className="w-6 h-6 text-glow-cyan" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-2">
                    {mounted ? (t('language') === 'zh' ? value.titleZh : value.titleEn) : value.titleEn}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {mounted ? (t('language') === 'zh' ? value.descZh : value.descEn) : value.descEn}
                  </p>
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
                {mounted ? t('meetYourTeacher') : 'Meet Your Teacher'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('meetTeacherDesc') : 'Book a consultation or drop in for a class to experience the INNER LIGHT difference.'}
              </p>
              <button className="px-8 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                               text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                               transition-all duration-300">
                {mounted ? t('bookFreeConsultation') : 'Book Free Consultation'}
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

export default AboutPage;

