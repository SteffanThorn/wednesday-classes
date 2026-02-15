'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Input } from '@/components/UI/Input';
import { Textarea } from '@/components/UI/Textarea';
import { Button } from '@/components/UI/Button';
import { Zap, Sun, Heart, Wind, Calendar, Clock, User, Mail, Phone } from 'lucide-react';

const FirstClassBookingForm = () => {
  const { t, mounted, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    classType: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const classOptions = [
    {
      id: 'mindfulness',
      icon: Zap,
      titleEn: 'Mindfulness',
      titleZh: '正念冥想',
      descEn: 'Perfect for beginners. Gentle Hatha yoga with mindful awareness.',
      descZh: '非常适合初学者。温和的哈他瑜伽配合正念觉察。',
    },
    {
      id: 'outdoor',
      icon: Sun,
      titleEn: 'Outdoor Yoga',
      titleZh: '户外瑜伽',
      descEn: 'Connect with nature in our garden sessions.',
      descZh: '在我们的花园课程中与自然连接。',
    },
    {
      id: 'mom-to-be',
      icon: Heart,
      titleEn: 'Mom-to-be',
      titleZh: '孕妈妈',
      descEn: 'Nurturing practice designed for expectant mothers.',
      descZh: '为准妈妈设计的滋养练习。',
    },
    {
      id: 'insight-flow',
      icon: Wind,
      titleEn: 'Insight Flow',
      titleZh: '内观流',
      descEn: 'Dynamic flow with music for those ready to move.',
      descZh: '配合音乐的动态流动，适合准备好运动的人。',
    },
  ];

  const timeSlots = [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Backend - Send form data to API endpoint
    // For now, just show success state
    setSubmitted(true);
    console.log('Booking submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClassSelect = (classId) => {
    setFormData({
      ...formData,
      classType: classId,
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
          {mounted ? t('firstClassSuccess') : 'Booking Received!'}
        </h3>
        <p className="text-muted-foreground">
          {mounted ? t('firstClassSuccessDesc') : 'Thank you for booking your first class with us. We will confirm your appointment within 24 hours.'}
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-glow-cyan hover:text-glow-cyan/80 transition-colors"
        >
          {mounted ? t('sendAnother') : 'Book another class'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Class Selection */}
      <div>
        <label className="block text-sm text-muted-foreground mb-4">
          {mounted ? t('selectClass') : 'Select Class'} <span className="text-glow-cyan">*</span>
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          {classOptions.map((cls) => {
            const Icon = cls.icon;
            const isSelected = formData.classType === cls.id;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => handleClassSelect(cls.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300
                          ${isSelected 
                            ? 'border-glow-cyan/50 bg-card/70 box-glow' 
                            : 'border-glow-cyan/20 bg-card/50 hover:border-glow-cyan/40'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                ${isSelected 
                                  ? 'bg-glow-cyan/20' 
                                  : 'bg-glow-cyan/10'}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-glow-cyan' : 'text-glow-cyan/70'}`} />
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-glow-subtle' : 'text-foreground'}`}>
                    {mounted ? (language === 'zh' ? cls.titleZh : cls.titleEn) : cls.titleEn}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mounted ? (language === 'zh' ? cls.descZh : cls.descEn) : cls.descEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name and Email */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            <User className="w-4 h-4 inline mr-2" />
            {mounted ? t('yourName') : 'Your Name'} <span className="text-glow-cyan">*</span>
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
            <Mail className="w-4 h-4 inline mr-2" />
            {mounted ? t('emailAddress') : 'Email Address'} <span className="text-glow-cyan">*</span>
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

      {/* Phone */}
      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          {mounted ? t('phoneNumber') : 'Phone Number'}
        </label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder={mounted ? t('phonePlaceholder') : '+64 XX XXX XXXX'}
          className="bg-card/50 border-glow-cyan/20 focus:border-glow-cyan/50"
        />
      </div>

      {/* Date and Time */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            {mounted ? t('preferredDate') : 'Preferred Date'}
          </label>
          <Input
            name="preferredDate"
            type="date"
            value={formData.preferredDate}
            onChange={handleChange}
            className="bg-card/50 border-glow-cyan/20 focus:border-glow-cyan/50"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            {mounted ? t('preferredTime') : 'Preferred Time'}
          </label>
          <select
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 
                     focus:border-glow-cyan/50 text-foreground focus:outline-none"
          >
            <option value="">{mounted ? t('selectClassPlaceholder') : 'Choose a time...'}</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          {mounted ? t('additionalNotes') : 'Additional Notes'}
        </label>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder={mounted ? t('notesPlaceholder') : 'Tell us about any injuries, concerns, or goals...'}
          rows={4}
          className="bg-card/50 border-glow-cyan/20 focus:border-glow-cyan/50 resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit"
        disabled={!formData.name || !formData.email || !formData.classType}
        className="w-full py-4 rounded-xl bg-glow-cyan/10 border border-glow-cyan/30 
                 text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mounted ? t('submitBooking') : 'Confirm Booking'}
      </Button>

      <p className="text-xs text-muted-foreground/60 text-center">
        {mounted ? t('bookingNote') : 'We will confirm your appointment within 24 hours.'}
      </p>
    </form>
  );
};

export default FirstClassBookingForm;

