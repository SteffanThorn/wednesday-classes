'use client';

import { useLanguage } from '@/hooks/useLanguage';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Software Engineer',
    avatar: '陈',
    color: 'from-glow-cyan to-glow-teal'
  },
  {
    id: 2,
    name: 'Emma Wilson',
    role: 'Marketing Director',
    avatar: '苏',
    color: 'from-glow-purple to-glow-cyan'
  },
  {
    id: 3,
    name: 'Lisa Thompson',
    role: 'New Mother',
    avatar: '李',
    color: 'from-glow-teal to-glow-purple'
  }
];

const TestimonialsColumn = () => {
  const { language, t, mounted } = useLanguage();

  return (
    <section className="px-6 py-16 md:py-24 relative">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-glow-cyan/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light 
                       text-glow animate-fade-in-up">
            {mounted ? t('testimonialsTitle') : 'Student Stories'}
          </h2>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto 
                      leading-relaxed animate-fade-in-up animation-delay-200">
            {mounted ? t('testimonialsSubtitle') : 'Real experiences from our community of mindful practitioners.'}
          </p>
          
          {/* Decorative divider */}
          <div className="mt-8 flex items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-glow-cyan/50" />
            <div className="w-2 h-2 rounded-full bg-glow-purple animate-pulse-glow" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-glow-cyan/50" />
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="glass-dark rounded-2xl p-6 md:p-8 
                       border border-border/30 hover:border-glow-cyan/30
                       transition-all duration-500 hover:transform hover:-translate-y-2
                       hover:box-glow animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 0.2}s` }}
            >
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.color} 
                              flex items-center justify-center text-white font-display text-xl
                              shadow-lg shadow-glow-cyan/20`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                  {language === 'zh' ? (
                      <>
                        {testimonial.name === 'Sarah Chen' && '陈思雨'}
                        {testimonial.name === 'Emma Wilson' && '苏瑞雪'}
                        {testimonial.name === 'Lisa Thompson' && '李夏'}
                      </>
                    ) : (
                      testimonial.name
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'zh' ? (
                      <>
                        {testimonial.role === 'Software Engineer' && '软件工程师'}
                        {testimonial.role === 'Marketing Director' && '市场总监'}
                        {testimonial.role === 'New Mother' && '新手妈妈'}
                      </>
                    ) : (
                      testimonial.role
                    )}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <div className="relative">
                <span className="absolute -top-4 -left-2 text-6xl text-glow-cyan/20 font-display">
                  "
                </span>
                <p className="text-muted-foreground leading-relaxed italic relative z-10">
                  {language === 'zh' ? (
                    <>
                      {testimonial.id === 1 && '在Yuki老师的课堂上，我找到了内心的平静。这里的正念练习彻底改变了我应对压力的方式。每次课后，我都感觉与自己更加连接。'}
                      {testimonial.id === 2 && '作为一个高压职业者，我尝试过很多放松方式，但这里的课程真正触及了我的灵魂。Yuki老师的指导温柔而有力，帮我重新发现了生活的美好。'}
                      {testimonial.id === 3 && '孕产瑜伽课程是我孕期最珍贵的礼物。Yuki老师不仅教会我如何与宝宝建立连接，还帮助我度过了身体和情绪上的挑战。强烈推荐给所有准妈妈！'}
                    </>
                  ) : (
                    <>
                      {testimonial.id === 1 && 'I found inner peace in Yuki\'s classes. The mindfulness practices here have completely transformed how I handle stress. After each session, I feel more connected to myself.'}
                      {testimonial.id === 2 && 'As a high-pressure professional, I\'ve tried many relaxation methods, but these sessions truly touch my soul. Yuki\'s guidance is gentle yet powerful, helping me rediscover the beauty of life.'}
                      {testimonial.id === 3 && 'The prenatal yoga classes were the most precious gift of my pregnancy. Yuki helped me connect with my baby and navigate the physical and emotional challenges. Highly recommend for all expecting mothers!'}
                    </>
                  )}
                </p>
                <span className="absolute -bottom-8 right-0 text-6xl text-glow-purple/20 font-display">
                  "
                </span>
              </div>

              {/* Rating Stars */}
              <div className="mt-6 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    className="w-5 h-5 text-glow-cyan animate-soft-pulse"
                    style={{ animationDelay: `${star * 0.1}s` }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            {mounted ? t('testimonialsCTA') : 'Ready to write your own story?'}
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-glow-cyan/20 to-glow-purple/20 
                           border border-glow-cyan/30 rounded-full text-foreground
                           hover:from-glow-cyan/30 hover:to-glow-purple/30 
                           hover:border-glow-cyan/50 transition-all duration-300
                           hover:shadow-lg hover:shadow-glow-cyan/20
                           animate-fade-in-up animation-delay-600">
            {mounted ? t('bookFirstClass') : 'Book Your First Class'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsColumn;

