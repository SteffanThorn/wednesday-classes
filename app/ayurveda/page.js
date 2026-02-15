'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';
import ArticleSection from '@/components/ArticleSection';

const AyurvedaPage = () => {
  const { t, mounted, language } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Ayurveda"
          titleZh="阿育吠陀"
          subtitleEn="Ancient wisdom for modern healing. Explore articles about Ayurveda, the science of life."
          subtitleZh="古老智慧，现代疗愈。探索关于阿育吠陀（生命科学）的文章。"
        />

        {/* What is Ayurveda */}
        <section className="px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-card/80 to-card/60 
                          border border-glow-teal/20">
              <h2 className="font-display text-2xl md:text-3xl text-glow-cyan mb-6 text-center">
                {mounted ? t('ayurvedaWhatIsAyurveda') : 'What is Ayurveda?'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  {language === 'zh' 
                    ? '阿育吠陀（Ayurveda）是"生命科学"的意思，是世界上最古老的疗愈体系之一，起源于5000多年前的印度。它基于一个核心原则：健康和福祉取决于思想、身体和精神之间的微妙平衡。'
                    : 'Ayurveda, meaning "science of life" in Sanskrit, is one of the world\'s oldest healing systems, originating in India over 5,000 years ago. It is based on the principle that health and wellness depend on a delicate balance between the mind, body, and spirit.'
                  }
                </p>
                <p>
                  {language === 'zh' 
                    ? '与西方医学主要关注疾病症状不同，阿育吠陀致力于从根本上解决失衡问题，通过整体方法来促进和谐与预防保健。它认为每个人都由三种生命能量（Dosha）组成：瓦塔（Vata）、皮塔（Pitta）和卡法（Kapha），这些能量的平衡决定了我们的体质、健康状况和性格特点。'
                    : 'Unlike Western medicine that primarily focuses on disease symptoms, Ayurveda addresses the root cause of imbalance through a holistic approach to promote harmony and preventive care. It recognizes that everyone is composed of three life energies called Doshas: Vata, Pitta, and Kapha, whose balance determines our constitution, health, and personality traits.'
                  }
                </p>
                <p>
                  {language === 'zh' 
                    ? '在我们的阿育吠陀页面，您可以通过体质测试了解自己的独特体质类型，并阅读关于阿育吠陀饮食、生活方式和实践的文章，帮助您达到身心平衡，享受更健康、更和谐的生活。'
                    : 'On our Ayurveda page, you can take a constitution test to discover your unique body type and read articles about Ayurvedic diet, lifestyle, and practices to help you achieve balance and enjoy a healthier, more harmonious life.'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Three Doshas */}
        <section className="px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl text-glow-cyan mb-8 text-center">
              {mounted ? t('ayurvedaThreeDoshas') : 'The Three Doshas'}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Vata */}
              <div 
                className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 
                         border border-glow-cyan/20 hover:border-glow-cyan/40 transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ 
                    background: `linear-gradient(135deg, var(--glow-cyan) 0%, var(--glow-cyan-light) 100%)`
                  }}
                >
                  <span className="text-white font-display">V</span>
                </div>
                <h3 className="text-xl font-display text-foreground mb-2">
                  Vata {language === 'zh' ? '瓦塔' : ''}
                </h3>
                <p className="text-xs text-glow-cyan mb-3">
                  {language === 'zh' ? '风与空元素' : 'Air & Ether'}
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '体型' : 'Body Type'}:</span> {language === 'zh' ? '纤瘦、轻盈、骨感' : 'Slender, light, bony'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '皮肤' : 'Skin'}:</span> {language === 'zh' ? '干燥、较冷、粗糙' : 'Dry, cool, rough'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '能量' : 'Energy'}:</span> {language === 'zh' ? '波动大，易疲惫' : 'Variable, easily fatigued'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '性格' : 'Personality'}:</span> {language === 'zh' ? '创意、敏捷、活跃' : 'Creative, quick, active'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '特质' : 'Qualities'}:</span> {language === 'zh' ? '干、轻、冷、粗糙' : 'Dry, light, cold, rough'}</p>
                </div>
              </div>
              
              {/* Pitta */}
              <div 
                className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 
                         border border-glow-purple/20 hover:border-glow-purple/40 transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ 
                    background: `linear-gradient(135deg, var(--glow-purple) 0%, var(--glow-purple-light) 100%)`
                  }}
                >
                  <span className="text-white font-display">P</span>
                </div>
                <h3 className="text-xl font-display text-foreground mb-2">
                  Pitta {language === 'zh' ? '皮塔' : ''}
                </h3>
                <p className="text-xs text-glow-purple mb-3">
                  {language === 'zh' ? '火与水元素' : 'Fire & Water'}
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '体型' : 'Body Type'}:</span> {language === 'zh' ? '中等、健壮、肌肉型' : 'Medium, athletic, muscular'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '皮肤' : 'Skin'}:</span> {language === 'zh' ? '油性、温暖、易长痘' : 'Oily, warm, prone to acne'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '能量' : 'Energy'}:</span> {language === 'zh' ? '强烈、稳定' : 'Intense, steady'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '性格' : 'Personality'}:</span> {language === 'zh' ? '果断、聪明、有野心' : 'Decisive, intelligent, ambitious'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '特质' : 'Qualities'}:</span> {language === 'zh' ? '热、锐、轻、油' : 'Hot, sharp, light, oily'}</p>
                </div>
              </div>
              
              {/* Kapha */}
              <div 
                className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 
                         border border-glow-teal/20 hover:border-glow-teal/40 transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ 
                    background: `linear-gradient(135deg, var(--glow-teal) 0%, var(--glow-teal-light) 100%)`
                  }}
                >
                  <span className="text-white font-display">K</span>
                </div>
                <h3 className="text-xl font-display text-foreground mb-2">
                  Kapha {language === 'zh' ? '卡法' : ''}
                </h3>
                <p className="text-xs text-glow-teal mb-3">
                  {language === 'zh' ? '地与水元素' : 'Earth & Water'}
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '体型' : 'Body Type'}:</span> {language === 'zh' ? '结实、圆润、丰满' : 'Solid, round, well-built'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '皮肤' : 'Skin'}:</span> {language === 'zh' ? '光滑、柔软、凉润' : 'Smooth, soft, cool'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '能量' : 'Energy'}:</span> {language === 'zh' ? '稳定、持久、缓慢' : 'Steady, enduring, slow'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '性格' : 'Personality'}:</span> {language === 'zh' ? '平静、耐心、善良' : 'Calm, patient, nurturing'}</p>
                  <p><span className="font-medium text-foreground">{language === 'zh' ? '特质' : 'Qualities'}:</span> {language === 'zh' ? '重、慢、凉、油' : 'Heavy, slow, cool, oily'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-medium text-amber-400 mb-2">
                    {mounted ? t('ayurvedaDisclaimerTitle') : 'Important Disclaimer'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'zh' 
                      ? '本测试仅为教育目的提供的简易自测工具。虽然它可以帮助您了解自己的一般体质，但这不是医学诊断。要获得最准确的阿育吠陀体质评估，请咨询有资质的阿育吠陀医师，他们将通过面诊（包括舌诊、脉诊等）进行综合评估。'
                      : 'This test is a simplified self-assessment tool for educational purposes only. While it can provide insights into your general constitution, it is not a medical diagnosis. For the most accurate Ayurvedic constitution assessment, please consult a qualified Ayurvedic practitioner who will conduct an in-person examination including tongue diagnosis and pulse reading.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ayurveda Test CTA */}
        <section className="px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="font-display text-2xl md:text-3xl text-glow-cyan mb-2">
                    {mounted ? t('ayurvedaTestTitle') : 'Discover Your Dosha'}
                  </h2>
                  <p className="text-muted-foreground">
                    {mounted ? t('ayurvedaTestSubtitle') : 'Take our Ayurvedic constitution test to understand your unique body type'}
                  </p>
                </div>
                <a 
                  href="/ayurveda-test"
                  className="px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                           text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                           transition-all duration-300 whitespace-nowrap"
                >
                  {mounted ? t('ayurvedaStartTest') : 'Take the Test'}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <ArticleSection 
              tag="ayurveda" 
              title={mounted ? t('ayurvedaArticles') : 'Ayurveda Articles'}
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-6 border-t border-border/30">
          <div className="max-w-5xl mx-auto text-center">
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

export default AyurvedaPage;

