'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Input } from '@/components/UI/Input';
import { Textarea } from '@/components/UI/Textarea';
import { Button } from '@/components/UI/Button';

const ContactForm = () => {
  const { t, mounted } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Backend - Send form data to API endpoint
    // For now, just show success state
    setSubmitted(true);
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                    border border-glow-teal/30 text-center animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-glow-teal/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-glow-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2">
          {mounted ? t('messageSent') : 'Message Sent!'}
        </h3>
        <p className="text-muted-foreground">
          {mounted ? t('messageSentDesc') : 'Thank you for reaching out. We will get back to you soon.'}
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-glow-cyan hover:text-glow-cyan/80 transition-colors"
        >
          {mounted ? t('sendAnother') : 'Send another message'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            {mounted ? t('yourName') : 'Your Name'}
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={mounted ? t('namePlaceholder') : 'Enter your name'}
            required
            className="bg-card/50 border-glow-cyan/20 focus:border-glow-cyan/50"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            {mounted ? t('emailAddress') : 'Email Address'}
          </label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={mounted ? t('emailPlaceholder') : 'your@email.com'}
            required
            className="bg-card/50 border-glow-cyan/20 focus:border-glow-cyan/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          {mounted ? t('subject') : 'Subject'}
        </label>
        <Input
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder={mounted ? t('subjectPlaceholder') : 'How can we help you?'}
          required
          className="bg-card/50 border-glow-cyan/20 focus:border-glow-cyan/50"
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          {mounted ? t('message') : 'Message'}
        </label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={mounted ? t('messagePlaceholder') : 'Tell us more...'}
          rows={5}
          required
          className="bg-card/50 border-glow-cyan/20 focus:border-glow-cyan/50 resize-none"
        />
      </div>

      <Button 
        type="submit"
        className="w-full py-4 rounded-xl bg-glow-cyan/10 border border-glow-cyan/30 
                 text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                 transition-all duration-300"
      >
        {mounted ? t('sendMessage') : 'Send Message'}
      </Button>

      <p className="text-xs text-muted-foreground/60 text-center">
        {mounted ? t('formNote') : 'We typically respond within 24 hours.'}
      </p>
    </form>
  );
};

export default ContactForm;

