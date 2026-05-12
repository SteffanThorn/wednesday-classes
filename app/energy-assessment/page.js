'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { useLanguage } from '@/hooks/useLanguage';

export default function EnergyAssessmentPage() {
  const router = useRouter();
  const { language, t, mounted } = useLanguage();

  const assessmentOptions = [
    {
      id: 'ayurveda',
      nameEn: 'Ayurveda Assessment',
      nameZh: '阿育吠陀体质测试',
      descEn: 'Discover your Ayurvedic body type (Dosha) and receive personalized wellness recommendations.',
      descZh: '探索你的阿育吠陀体质（三法能量），获得个性化的健康建议。',
      icon: '🌿',
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/30',
      hoverColor: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20',
      path: '/ayurveda-test'
    },
    {
      id: 'chakra',
      nameEn: 'Chakra Energy Test',
      nameZh: '脉轮能量测试',
      descEn: 'Assess your chakra balance and discover which energy centers need attention.',
      descZh: '评估你的脉轮平衡状况，发现哪些能量中心需要关注。',
      icon: '✨',
      color: 'from-violet-500/20 to-purple-600/20',
      borderColor: 'border-violet-500/30',
      hoverColor: 'hover:border-violet-500/50 hover:shadow-violet-500/20',
      path: '/chakra-test'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />

        {/* Page Header */}
        <section className="px-6 pt-12 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-5xl md:text-6xl text-glow-subtle mb-6">
              {mounted ? (language === 'zh' ? '身体能量测试' : 'Body Energy Assessment') : 'Body Energy Assessment'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {mounted ? (language === 'zh' 
                ? '探索你的身体能量，发现适合你的瑜伽修行之路。' 
                : 'Explore your body energy and discover the yoga practice path that suits you best.')
                : 'Explore your body energy and discover the yoga practice path that suits you best.'}
            </p>
          </div>
        </section>

        {/* Assessment Options Grid */}
        <section className="px-6 py-12 md:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {assessmentOptions.map((option) => (
                <Link
                  key={option.id}
                  href={option.path}
                  className={`group p-8 rounded-2xl bg-gradient-to-br ${option.color}
                             border ${option.borderColor} transition-all duration-300
                             ${option.hoverColor} hover:shadow-lg cursor-pointer
                             hover:scale-105 transform`}
                >
                  <div className="flex flex-col h-full">
                    {/* Icon */}
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {option.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      {mounted ? (language === 'zh' ? option.nameZh : option.nameEn) : option.nameEn}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6 flex-grow">
                      {mounted ? (language === 'zh' ? option.descZh : option.descEn) : option.descEn}
                    </p>

                    {/* CTA Text */}
                    <div className="inline-flex items-center gap-2 text-glow-cyan font-medium group-hover:gap-3 transition-all duration-300">
                      {mounted ? (language === 'zh' ? '开始测试' : 'Start Test') : 'Start Test'}
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="px-6 py-12 bg-glow-cyan/5 border-t border-glow-cyan/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              {mounted ? (language === 'zh' ? '为什么要进行能量测试？' : 'Why Take These Tests?') : 'Why Take These Tests?'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4">
                <h4 className="font-semibold text-glow-cyan mb-2">
                  {mounted ? (language === 'zh' ? '个性化体验' : 'Personalized Experience') : 'Personalized Experience'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {mounted ? (language === 'zh' 
                    ? '了解你独特的身体类型，获得专门为你设计的修行建议。'
                    : 'Understand your unique body type and receive practice recommendations tailored just for you.')
                    : 'Understand your unique body type and receive practice recommendations tailored just for you.'}
                </p>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-violet-400 mb-2">
                  {mounted ? (language === 'zh' ? '能量平衡' : 'Energy Balance') : 'Energy Balance'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {mounted ? (language === 'zh'
                    ? '发现需要加强的能量中心，通过针对性的瑜伽练习实现整体平衡。'
                    : 'Discover which energy centers need attention and achieve holistic balance through targeted practices.')
                    : 'Discover which energy centers need attention and achieve holistic balance through targeted practices.'}
                </p>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-emerald-400 mb-2">
                  {mounted ? (language === 'zh' ? '古老智慧' : 'Ancient Wisdom') : 'Ancient Wisdom'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {mounted ? (language === 'zh'
                    ? '基于几千年的传统阿育吠陀和瑜伽哲学的科学方法。'
                    : 'Scientific approach based on thousands of years of traditional Ayurvedic and yoga philosophy.')
                    : 'Scientific approach based on thousands of years of traditional Ayurvedic and yoga philosophy.'}
                </p>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-amber-400 mb-2">
                  {mounted ? (language === 'zh' ? '深度自我认识' : 'Self-Knowledge') : 'Self-Knowledge'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {mounted ? (language === 'zh'
                    ? '通过理解你的能量类型，更深入地了解自己，改善生活质量。'
                    : 'Gain deeper self-awareness by understanding your energy type and improve your quality of life.')
                    : 'Gain deeper self-awareness by understanding your energy type and improve your quality of life.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground mb-6">
              {mounted ? (language === 'zh'
                ? '准备好探索你的内在能量？选择上面的一个测试开始吧。'
                : 'Ready to explore your inner energy? Choose one of the assessments above to get started.')
                : 'Ready to explore your inner energy? Choose one of the assessments above to get started.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-all duration-300"
            >
              {mounted ? (language === 'zh' ? '返回首页' : 'Back to Home') : 'Back to Home'}
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              {mounted ? (language === 'zh' ? '© 2026 INNER LIGHT · 新西兰·奥克兰' : '© 2026 INNER LIGHT · Auckland, New Zealand') : '© 2026 INNER LIGHT · Auckland, New Zealand'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
