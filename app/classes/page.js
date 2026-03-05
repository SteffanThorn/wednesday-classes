'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ClassCard from '@/components/ClassCard';
import { Zap, Heart, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const ClassesPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Classes"
          titleZh="课程"
          subtitleEn="Book A Class That Suits You"
          subtitleZh="预订适合您的课程"
        />

        {/* Classes Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Beginner Yoga - Wednesday */}
              <ClassCard
                icon={Zap}
                titleEn="Beginner Yoga"
                titleZh="初级瑜伽"
                descriptionEn="6pm Every Wednesday"
                descriptionZh="每周三晚上6点"
                duration="60 min"
                level="Beginner"
                price="$15/class"
                additionalInfo="B.Y.O mat"
                href="/wednesday-classes"
              />

              {/* Beginner Yoga - Thursday */}
              <ClassCard
                icon={Sun}
                titleEn="Beginner Yoga"
                titleZh="初级瑜伽"
                descriptionEn="12pm Every Thursday"
                descriptionZh="每周四中午12点"
                duration="60 min"
                level="Beginner"
                price="$15/class"
                additionalInfo="B.Y.O mat"
                href="/classes/thursday"
              />

              {/* Motherscope - Waitlist */}
              <div className="p-6 rounded-3xl border border-glow-purple/30 bg-card/60 backdrop-blur-sm hover:box-glow transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glow-purple/20 to-glow-cyan/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-glow-purple" />
                  </div>
                  <h3 className="font-display text-2xl text-glow-subtle">Motherscope</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <p className="text-muted-foreground">Many mothers experience a range of side effects including:</p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• Pelvic discomfort</li>
                    <li>• Core weakness</li>
                    <li>• Urinary leakage</li>
                  </ul>
                  <p className="text-foreground">But these are common and treatable with the right support.</p>
                  <p className="text-foreground">Yoga helps you re-awaken the deep core muscles and rebuild stability & safety.</p>
                </div>
                
                <a 
                  href="/motherscope"
                  className="block w-full text-center py-3 px-6 rounded-xl bg-glow-purple/20 border border-glow-purple/40 
                           text-glow-purple font-medium hover:bg-glow-purple/30 hover:box-glow 
                           transition-all duration-300"
                >
                  Join the Waitlist
                </a>
              </div>
            </div>
          </div>
        </section>
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

