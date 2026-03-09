'use client';

import { useState } from 'react';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { Shield, Eye, Lock, User, Mail, Calendar, AlertCircle, MapPin } from 'lucide-react';

const PrivacyPage = () => {
  const { t, mounted, language } = useLanguage();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const principles = [
    {
      titleEn: 'Purpose of Collection',
      titleZh: '收集目的',
      descEn: 'We collect your personal information solely for the purpose of processing your yoga class bookings, sending confirmations and reminders, and improving our services. We will not use your information for any unrelated purpose without your consent.',
      descZh: '我们收集您的个人信息仅用于处理瑜伽课程预订、发送确认和提醒，以及改进我们的服务。未经您的同意，我们不会将您的信息用于任何无关目的。',
      icon: '📋',
    },
    {
      titleEn: 'Source of Collection',
      titleZh: '信息来源',
      descEn: 'We collect information directly from you through our booking forms, registration process, and communications with you. We do not collect personal information from third parties without your consent.',
      descZh: '我们通过预订表格、注册流程以及与您的沟通直接从您那里收集信息。未经您的同意，我们不会从第三方收集您的个人信息。',
      icon: '📥',
    },
    {
      titleEn: 'Lawful & Fair Collection',
      titleZh: '合法公正的收集方式',
      descEn: 'We collect your information in a lawful and fair manner, without being unreasonably intrusive. All data collection is transparent and you are informed at the point of collection.',
      descZh: '我们以合法公正的方式收集您的信息，不会进行不合理的侵扰。所有数据收集都是透明的，您在收集时会被告知。',
      icon: '⚖️',
    },
    {
      titleEn: 'Transparency & Notice',
      titleZh: '透明度和通知',
      descEn: 'When collecting your information, we make you aware of: what information we are collecting, the purpose of collection, who we share it with (e.g., payment processors), your rights to access and correct your information, and consequences of not providing information.',
      descZh: '在收集您的信息时，我们会让您了解：我们收集什么信息、收集的目的、与谁共享（例如支付处理商）、您访问和更正信息的权利，以及不提供信息的后果。',
      icon: '👁️',
    },
    {
      titleEn: 'Data Security',
      titleZh: '数据安全',
      descEn: 'We protect your personal information with reasonable security safeguards against loss, unauthorized access, use, modification, disclosure, or other misuse. Our website uses SSL encryption and we follow industry best practices.',
      descZh: '我们采取合理的安全保障措施保护您的个人信息，防止丢失、未经授权的访问、使用、修改、披露或其他滥用。我们的网站使用SSL加密，并遵循行业最佳实践。',
      icon: '🔒',
    },
    {
      titleEn: 'Data Retention',
      titleZh: '数据保留',
      descEn: 'We do not keep your personal information longer than necessary for the purposes for which it was collected. After your relationship with us ends, we will securely delete or anonymize your data in accordance with our retention policy.',
      descZh: '我们不会将您的个人信息保留超过收集目的所需的时间。在我们与您的关系结束后，我们会根据保留政策安全删除或匿名化您的数据。',
      icon: '🗄️',
    },
    {
      titleEn: 'Access & Correction',
      titleZh: '访问和更正',
      descEn: 'You have the right to request access to your personal information and to request correction if it is inaccurate. We will respond to your request within a reasonable timeframe.',
      descZh: '您有权请求访问您的个人信息，并在信息不准确时请求更正。我们会在合理的时间内回复您的请求。',
      icon: '✏️',
    },
    {
      titleEn: 'Use & Disclosure',
      titleZh: '使用和披露',
      descEn: 'We only use or disclose your personal information for the original purpose of collection (or related purposes) unless you have given consent, or an exception under the Privacy Act applies.',
      descZh: '我们仅将您的个人信息用于原始收集目的（或相关目的），除非您已同意，或适用隐私法规定的例外情况。',
      icon: '🤝',
    },
  ];

  const dataWeCollect = [
    { icon: User, labelEn: 'Name', labelZh: '姓名' },
    { icon: Mail, labelEn: 'Email address', labelZh: '电子邮件地址' },
    { icon: Calendar, labelEn: 'Class bookings & preferences', labelZh: '课程预订和偏好' },
    { icon: Shield, labelEn: 'Payment information (processed securely by Stripe)', labelZh: '支付信息（通过Stripe安全处理）' },
  ];

  const thirdParties = [
    { name: 'Stripe', purposeEn: 'Payment processing', purposeZh: '支付处理', url: 'https://stripe.com/privacy' },
    { name: 'Vercel', purposeEn: 'Website hosting', purposeZh: '网站托管', url: 'https://vercel.com/legal/privacy-policy' },
    { name: 'MongoDB', purposeEn: 'Data storage', purposeZh: '数据存储', url: 'https://www.mongodb.com/legal/privacy-policy' },
  ];

  const contactInfo = {
    email: 'innerlightyuki@gmail.com',
    address: 'Village Valley Centre, Ashhurst, New Zealand',
  };

  const handleContactChange = (e) => {
    setContactForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();

    const subject = contactForm.subject || (language === 'zh' ? '隐私咨询' : 'Privacy Inquiry');
    const body = [
      `${language === 'zh' ? '姓名' : 'Name'}: ${contactForm.name}`,
      `${language === 'zh' ? '邮箱' : 'Email'}: ${contactForm.email}`,
      '',
      `${language === 'zh' ? '留言' : 'Message'}:`,
      contactForm.message,
    ].join('\n');

    const mailto = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

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
              {mounted ? (language === 'zh' ? '隐私政策' : 'Privacy Policy') : 'Privacy Policy'}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto 
                        leading-relaxed animate-fade-in-up animation-delay-200 mb-8">
              {mounted 
                ? (language === 'zh' 
                  ? '我们重视您的隐私。本政策解释我们如何根据2020年新西兰隐私法收集、使用和保护您的个人信息。'
                  : 'We respect your privacy. This policy explains how we collect, use, and protect your personal information in accordance with the New Zealand Privacy Act 2020.')
                : 'We respect your privacy. This policy explains how we collect, use, and protect your personal information in accordance with the New Zealand Privacy Act 2020.'}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-glow-cyan/20">
                <AlertCircle className="w-4 h-4 text-glow-cyan" />
                <span className="text-sm">
                  {mounted ? (language === 'zh' ? '符合2020年隐私法' : 'Privacy Act 2020 Compliant') : 'Privacy Act 2020 Compliant'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-glow-cyan/20">
                <Lock className="w-4 h-4 text-glow-cyan" />
                <span className="text-sm">
                  {mounted ? (language === 'zh' ? 'SSL加密保护' : 'SSL Encrypted') : 'SSL Encrypted'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-glow-cyan/20">
                <Eye className="w-4 h-4 text-glow-cyan" />
                <span className="text-sm">
                  {mounted ? (language === 'zh' ? '透明数据处理' : 'Transparent Data Handling') : 'Transparent Data Handling'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Data We Collect */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '我们收集的信息' : 'Information We Collect') : 'Information We Collect'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {mounted 
                  ? (language === 'zh' 
                    ? '我们仅收集为提供我们的服务所必需的信息。'
                    : 'We only collect information that is necessary to provide our services.')
                  : 'We only collect information that is necessary to provide our services.'}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {dataWeCollect.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.labelEn}
                    className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                             hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                             animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-5 h-5 text-glow-cyan" />
                      <h3 className="font-medium text-foreground">
                        {mounted ? (language === 'zh' ? item.labelZh : item.labelEn) : item.labelEn}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Information Privacy Principles */}
        <section className="px-6 py-16 bg-card/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '信息隐私原则' : 'Information Privacy Principles') : 'Information Privacy Principles'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {mounted 
                  ? (language === 'zh' 
                    ? '我们遵循2020年隐私法规定的13项信息隐私原则。以下是与我们业务最相关的原则：'
                    : 'We follow the 13 Information Privacy Principles set out in the Privacy Act 2020. Here are the most relevant to our business:')
                  : 'We follow the 13 Information Privacy Principles set out in the Privacy Act 2020. Here are the most relevant to our business:'}
              </p>
            </div>
            
            <div className="space-y-4">
              {principles.map((principle, index) => (
                <div 
                  key={principle.titleEn}
                  className="p-6 rounded-2xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                           hover:border-glow-cyan/40 transition-all duration-500
                           animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{principle.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-foreground mb-2">
                        {mounted ? (language === 'zh' ? principle.titleZh : principle.titleEn) : principle.titleEn}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {mounted ? (language === 'zh' ? principle.descZh : principle.descEn) : principle.descEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Third Party Services */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '第三方服务' : 'Third Party Services') : 'Third Party Services'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {mounted 
                  ? (language === 'zh' 
                    ? '我们与以下可信的第三方服务提供商合作，仅共享提供服务所必需的数据。'
                    : 'We work with trusted third-party service providers and only share data necessary to provide our services.')
                  : 'We work with trusted third-party service providers and only share data necessary to provide our services.'}
              </p>
            </div>
            
            <div className="bg-card/60 border border-glow-cyan/20 rounded-3xl p-8 animate-fade-in-up animation-delay-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glow-cyan/20">
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {mounted ? (language === 'zh' ? '服务提供商' : 'Provider') : 'Provider'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {mounted ? (language === 'zh' ? '用途' : 'Purpose') : 'Purpose'}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {mounted ? (language === 'zh' ? '隐私政策' : 'Privacy Policy') : 'Privacy Policy'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {thirdParties.map((party, index) => (
                      <tr key={party.name} className="border-b border-glow-cyan/10">
                        <td className="py-3 px-4 text-foreground">{party.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {mounted ? (language === 'zh' ? party.purposeZh : party.purposeEn) : party.purposeEn}
                        </td>
                        <td className="py-3 px-4">
                          <a 
                            href={party.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-glow-cyan hover:text-glow-cyan/80 text-sm"
                          >
                            {mounted ? (language === 'zh' ? '查看' : 'View') : 'View'}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="px-6 py-16 bg-card/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '您的权利' : 'Your Rights') : 'Your Rights'}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                             hover:border-glow-cyan/40 transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                              flex items-center justify-center border border-glow-cyan/30 box-glow mb-4">
                  <Eye className="w-6 h-6 text-glow-cyan" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">
                  {mounted ? (language === 'zh' ? '访问您的信息' : 'Access Your Information') : 'Access Your Information'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {mounted 
                    ? (language === 'zh' 
                      ? '您有权请求获取我们持有的关于您的个人信息的副本。'
                      : 'You have the right to request a copy of the personal information we hold about you.')
                    : 'You have the right to request a copy of the personal information we hold about you.'}
                </p>
              </div>
              
              <div className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                             hover:border-glow-cyan/40 transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                              flex items-center justify-center border border-glow-cyan/30 box-glow mb-4">
                  <User className="w-6 h-6 text-glow-cyan" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">
                  {mounted ? (language === 'zh' ? '更正您的信息' : 'Correct Your Information') : 'Correct Your Information'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {mounted 
                    ? (language === 'zh' 
                      ? '如果您的个人信息不准确，您可以请求我们进行更正。'
                      : 'You have the right to request correction if your personal information is inaccurate.')
                    : 'You have the right to request correction if your personal information is inaccurate.'}
                </p>
              </div>
              
              <div className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                             hover:border-glow-cyan/40 transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                              flex items-center justify-center border border-glow-cyan/30 box-glow mb-4">
                  <Lock className="w-6 h-6 text-glow-cyan" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">
                  {mounted ? (language === 'zh' ? '撤回同意' : 'Withdraw Consent') : 'Withdraw Consent'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {mounted 
                    ? (language === 'zh' 
                      ? '您可以随时撤回对处理您数据的同意。'
                      : 'You may withdraw your consent for the processing of your data at any time.')
                    : 'You may withdraw your consent for the processing of your data at any time.'}
                </p>
              </div>
              
              <div className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                             hover:border-glow-cyan/40 transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                              flex items-center justify-center border border-glow-cyan/30 box-glow mb-4">
                  <Calendar className="w-6 h-6 text-glow-cyan" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">
                  {mounted ? (language === 'zh' ? '投诉' : 'Lodge a Complaint') : 'Lodge a Complaint'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {mounted 
                    ? (language === 'zh' 
                      ? '如果您认为我们违反了隐私法，可以向隐私专员办公室投诉。'
                      : 'If you believe we have breached privacy law, you can lodge a complaint with the Office of the Privacy Commissioner.')
                    : 'If you believe we have breached privacy law, you can lodge a complaint with the Office of the Privacy Commissioner.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl font-light text-glow-subtle mb-4">
                {mounted ? (language === 'zh' ? '联系我们' : 'Contact Us') : 'Contact Us'}
              </h2>
              <p className="text-muted-foreground">
                {mounted 
                  ? (language === 'zh' 
                    ? '如有任何隐私相关问题，请与我们联系。'
                    : 'For any privacy-related inquiries, please contact us.')
                  : 'For any privacy-related inquiries, please contact us.'}
              </p>
            </div>
            
            <div className="bg-card/60 border border-glow-cyan/20 rounded-3xl p-8 animate-fade-in-up animation-delay-200">
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-glow-cyan" />
                  <a href={`mailto:${contactInfo.email}`} className="text-foreground hover:text-glow-cyan transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-glow-cyan shrink-0 mt-1" />
                  <span className="text-foreground">{contactInfo.address}</span>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4 border-t border-glow-cyan/10 pt-6">
                <h3 className="font-display text-xl text-foreground">
                  {mounted ? (language === 'zh' ? '发送邮件' : 'Send an Email') : 'Send an Email'}
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    type="text"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    placeholder={mounted ? (language === 'zh' ? '您的姓名' : 'Your name') : 'Your name'}
                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                  />
                  <input
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    placeholder={mounted ? (language === 'zh' ? '您的邮箱' : 'Your email') : 'Your email'}
                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                  />
                </div>

                <input
                  name="subject"
                  type="text"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  placeholder={mounted ? (language === 'zh' ? '主题（可选）' : 'Subject (optional)') : 'Subject (optional)'}
                  className="w-full px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                />

                <textarea
                  name="message"
                  rows={5}
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  placeholder={mounted ? (language === 'zh' ? '请输入您的问题...' : 'Write your message...') : 'Write your message...'}
                  className="w-full px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan font-medium hover:bg-glow-cyan/30 transition-all"
                >
                  {mounted ? (language === 'zh' ? '发送邮件' : 'Send Email') : 'Send Email'}
                </button>
              </form>
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
            <p className="mt-4 text-xs text-muted-foreground/40">
              {mounted 
                ? (language === 'zh' 
                  ? '最后更新：2024年1月'
                  : 'Last updated: January 2024')
                : 'Last updated: January 2024'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPage;

