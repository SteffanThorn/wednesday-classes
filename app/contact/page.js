'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ContactForm from '@/components/ContactForm';
import FAQAccordion from '@/components/FAQAccordion';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const ContactPage = () => {
  const { t, mounted } = useLanguage();

  const faqs = [
    {
      questionEn: 'Do I need to bring my own mindfulness mat?',
      questionZh: '我需要带自己的正念垫吗？',
      answerEn: 'We provide mindfulness mats and all necessary props at no additional cost. However, if you prefer to use your own mat, you are welcome to bring it. We also have a selection of mats available for purchase.',
      answerZh: '我们免费提供正念垫和所有必要的道具。但是，如果您喜欢使用自己的垫子，欢迎带来。我们也有可供购买的垫子选择。',
    },
    {
      questionEn: 'What should I wear to class?',
      questionZh: '上课应该穿什么？',
      answerEn: 'Wear comfortable, stretchy clothing that allows you to move freely. We practice barefoot, so no shoes are needed on the mat. Avoid clothing with metal zippers or buckles that could be uncomfortable during floor work.',
      answerZh: '穿舒适、有弹性的衣服，让你能够自由活动。我们赤脚练习，所以不需要脱鞋。避免穿带有金属拉链或扣子的衣服，在地板运动时可能会不舒服。',
    },
    {
      questionEn: 'Can beginners join any class?',
      questionZh: '初学者可以参加任何课程吗？',
      answerEn: 'Yes! Our Mindfulness classes are designed for all levels including complete beginners. Our teachers offer modifications and variations to suit every body. If you\'re completely new, we recommend starting with our morning sessions.',
      answerZh: '可以！我们的正念课程适合所有级别，包括完全初学者。我们的老师提供修改和变化以适应每种身体。如果您完全是初学者，我们建议从早间课程开始。',
    },
    {
      questionEn: 'Is Mom-to-be Mindfulness Practice safe for all trimesters?',
      questionZh: '孕妈妈正念练习对所有孕期都安全吗？',
      answerEn: 'Our Mom-to-be Mindfulness Practice classes are designed for all trimesters and are led by Yuki who is certified in prenatal mindfulness. However, we recommend consulting with your healthcare provider before starting any new exercise program.',
      answerZh: '我们的孕妈妈正念练习课程适合所有孕期，由产前正念认证的Yuki老师授课。但是，我们建议在开始任何新的锻炼计划之前咨询您的医疗保健提供者。',
    },
    {
      questionEn: 'What is your cancellation policy?',
      questionZh: '您的取消政策是什么？',
      answerEn: 'We require at least 12 hours notice for cancellations to receive a full credit. Late cancellations or no-shows will be charged the full class fee. This helps us maintain small, intimate class sizes.',
      answerZh: '我们需要至少12小时通知取消才能获得全额积分。迟到取消或未出席将收取全额课程费用。这有助于我们保持小规模的亲密课堂规模。',
    },
    {
      questionEn: 'Do you offer private sessions?',
      questionZh: '您提供私教课程吗？',
      answerEn: 'Yes! Our VIP (1 on 1) sessions are perfect for those seeking personalized attention. These can be scheduled at your convenience and customized to your specific goals, whether it\'s injury recovery, advanced practice, or learning the basics.',
      answerZh: '可以！我们的私教课程非常适合寻求个性化关注的人。这些可以按照您方便的时间安排，并可根据您的具体目标进行定制，无论是受伤康复、高级练习还是学习基础知识。',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Get in Touch"
          titleZh="联系我们"
          subtitleEn="We\'d love to hear from you. Whether you have questions about classes, want to book a session, or simply want to say hello."
          subtitleZh='我们很想收到您的来信。无论您对课程有疑问，想预约一节课，还是只是想打个招呼。'
        />

        {/* Contact Info & Form Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left - Contact Info */}
              <div className="space-y-8 animate-fade-in-up">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                    {mounted ? t('sendUsMessage') : 'Send Us a Message'}
                  </h2>
                  <p className="text-muted-foreground">
                    {mounted ? t('contactSubtitle') : 'Fill out the form and we\'ll get back to you within 24 hours.'}
                  </p>
                </div>

                {/* Contact Methods */}
                <div className="space-y-4">
                  {[
                    {
                      icon: MapPin,
                      titleEn: 'Studio Location',
                      titleZh: '工作室位置',
                      contentEn: '123 Wellness Street, Auckland 1010',
                      contentZh: '奥克兰健康街123号，邮编1010',
                    },
                    {
                      icon: Phone,
                      titleEn: 'Phone',
                      titleZh: '电话',
                      contentEn: '+64 21 123 4567',
                      contentZh: '+64 21 123 4567',
                    },
                    {
                      icon: Mail,
                      titleEn: 'Email',
                      titleZh: '电子邮件',
                      contentEn: 'hello@luminousyoga.nz',
                      contentZh: 'hello@luminousyoga.nz',
                    },
                    {
                      icon: Clock,
                      titleEn: 'Studio Hours',
                      titleZh: '工作室时间',
                      contentEn: 'Mon-Fri: 6AM - 8PM\nSat-Sun: 8AM - 4PM',
                      contentZh: '周一至周五：早上6点 - 晚上8点\n周六至周日：早上8点 - 下午4点',
                    },
                  ].map((item, index) => (
                    <div 
                      key={item.titleEn}
                      className="flex items-start gap-4 p-4 rounded-2xl border border-glow-cyan/10 
                               bg-card/50 hover:border-glow-cyan/30 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-3 rounded-xl bg-glow-cyan/10">
                        <item.icon className="w-5 h-5 text-glow-cyan" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-foreground mb-1">
                          {mounted ? (t('language') === 'zh' ? item.titleZh : item.titleEn) : item.titleEn}
                        </h3>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {mounted ? (t('language') === 'zh' ? item.contentZh : item.contentEn) : item.contentEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="font-display text-lg text-foreground mb-4">
                    {mounted ? t('followUs') : 'Follow Us'}
                  </h3>
                  <div className="flex gap-4">
                    {[
                      { icon: Instagram, label: 'Instagram' },
                      { icon: Facebook, label: 'Facebook' },
                      { icon: MessageCircle, label: 'WeChat' },
                    ].map((social) => (
                      <button 
                        key={social.label}
                        className="p-3 rounded-xl bg-glow-cyan/10 border border-glow-cyan/30 
                                 text-glow-cyan hover:bg-glow-cyan/20 hover:box-glow
                                 transition-all duration-300"
                      >
                        <social.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Contact Form */}
              <div className="animate-fade-in-up animation-delay-200">
                <div className="p-8 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('faq') : 'Frequently Asked Questions'}
              </h2>
              <p className="text-muted-foreground">
                {mounted ? t('faqSubtitle') : 'Find answers to common questions about our classes and studio.'}
              </p>
            </div>

            <FAQAccordion faqs={faqs} />
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="h-96 rounded-3xl border border-glow-cyan/20 bg-card/30 overflow-hidden 
                        animate-fade-in-up">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br 
                            from-glow-purple/5 to-glow-cyan/5">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-glow-cyan mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {mounted ? t('mapPlaceholder') : 'Interactive map coming soon'}
                  </p>
                </div>
              </div>
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

export default ContactPage;

