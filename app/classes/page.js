'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ClassCard from '@/components/ClassCard';
import BookingModal from '@/components/BookingModal';
import { Zap, Heart, Users } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

const WEDNESDAY_CLASS = {
  name: 'Beginner Yoga',
  time: '6:00 PM',
  location: 'Village Valley Centre, Ashhurst',
  price: 15
};

const FRIDAY_CLASS = {
  name: 'Beginner Yoga',
  time: '2:00 PM',
  location: 'Village Valley Centre, Ashhurst',
  price: 15
};

const ClassesPage = () => {
  const { t, mounted } = useLanguage();
  const [isWednesdayModalOpen, setIsWednesdayModalOpen] = useState(false);
  const [isFridayModalOpen, setIsFridayModalOpen] = useState(false);
  
  // Motherscope waitlist state
  const [motherScopeLoading, setMotherScopeLoading] = useState(false);
  const [motherScopeEmail, setMotherScopeEmail] = useState('');
  const [motherScopeMessage, setMotherScopeMessage] = useState('');
  
  // One-on-One waitlist state
  const [oneOnOneLoading, setOneOnOneLoading] = useState(false);
  const [oneOnOneEmail, setOneOnOneEmail] = useState('');
  const [oneOnOneMessage, setOneOnOneMessage] = useState('');

  const handleMotherScopeSubmit = async (e) => {
    e.preventDefault();
    setMotherScopeLoading(true);
    setMotherScopeMessage('');

    try {
      const response = await fetch('/api/motherscope/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: motherScopeEmail })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setMotherScopeMessage('Success! Check your email for next steps.');
      setMotherScopeEmail('');
    } catch (err) {
      setMotherScopeMessage(err.message || 'Error joining waitlist. Please try again.');
    } finally {
      setMotherScopeLoading(false);
    }
  };

  const handleOneOnOneSubmit = async (e) => {
    e.preventDefault();
    setOneOnOneLoading(true);
    setOneOnOneMessage('');

    try {
      const response = await fetch('/api/one-on-one/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: oneOnOneEmail })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setOneOnOneMessage('Success! Check your email for next steps.');
      setOneOnOneEmail('');
    } catch (err) {
      setOneOnOneMessage(err.message || 'Error joining waitlist. Please try again.');
    } finally {
      setOneOnOneLoading(false);
    }
  };

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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Beginner Yoga - Wednesday */}
              <div className="relative group cursor-pointer" onClick={() => setIsWednesdayModalOpen(true)}>
                <ClassCard
                  icon={Zap}
                  titleEn="Beginner Yoga"
                  titleZh="初级瑜伽"
                  descriptionEn="6PM Every Wednesday"
                  descriptionZh="每周三晚上6点"
                  duration="60 min"
                  level="Beginner"
                  price="$15/class"
                  additionalInfo="B.Y.O mat"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsWednesdayModalOpen(true);
                  }}
                />
              </div>

              {/* Beginner Yoga - Friday */}
              <div className="relative group cursor-pointer" onClick={() => setIsFridayModalOpen(true)}>
                <ClassCard
                  icon={Heart}
                  titleEn="Beginner Yoga"
                  titleZh="初级瑜伽"
                  descriptionEn="2PM Every Friday"
                  descriptionZh="每周五下午2点"
                  duration="60 min"
                  level="Beginner"
                  price="$15/class"
                  additionalInfo="B.Y.O mat"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsFridayModalOpen(true);
                  }}
                />
              </div>

              {/* Motherscope - Waitlist */}
              <div className="p-6 rounded-3xl border border-glow-purple/30 bg-card/60 backdrop-blur-sm hover:box-glow transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glow-purple/20 to-glow-cyan/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-glow-purple" />
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
                
                {/* Waitlist Form */}
                <form onSubmit={handleMotherScopeSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={motherScopeEmail}
                    onChange={(e) => setMotherScopeEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-glow-cyan/30 text-foreground 
                             placeholder-muted-foreground focus:outline-none focus:border-glow-cyan/60 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={motherScopeLoading || !motherScopeEmail.trim()}
                    className="w-full py-3 px-6 rounded-xl bg-glow-purple/20 border border-glow-purple/40 
                             text-glow-purple font-medium hover:bg-glow-purple/30 hover:box-glow 
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {motherScopeLoading ? 'Sending...' : 'Join the Waitlist'}
                  </button>
                  {motherScopeMessage && (
                    <p className={`text-sm text-center ${
                      motherScopeMessage.includes('Success') 
                        ? 'text-glow-cyan' 
                        : 'text-red-500'
                    }`}>
                      {motherScopeMessage}
                    </p>
                  )}
                </form>
              </div>

              {/* One-on-One Personal Sessions - Waitlist */}
              <div className="p-6 rounded-3xl border border-glow-cyan/30 bg-card/60 backdrop-blur-sm hover:box-glow transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glow-cyan/20 to-glow-purple/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-glow-cyan" />
                  </div>
                  <h3 className="font-display text-2xl text-glow-subtle">One-on-One Sessions</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <p className="text-muted-foreground">Personalized yoga tailored completely to your unique needs, goals, and lifestyle.</p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• Completely personalized practice</li>
                    <li>• Flexible scheduling</li>
                    <li>• Focused on your specific goals</li>
                  </ul>
                  <p className="text-foreground font-semibold">$100 per 60-minute session</p>
                  <p className="text-foreground">Work one-on-one with Yuki to create the perfect practice for you.</p>
                </div>
                
                {/* Waitlist Form */}
                <form onSubmit={handleOneOnOneSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={oneOnOneEmail}
                    onChange={(e) => setOneOnOneEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-glow-cyan/30 text-foreground 
                             placeholder-muted-foreground focus:outline-none focus:border-glow-cyan/60 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={oneOnOneLoading || !oneOnOneEmail.trim()}
                    className="w-full py-3 px-6 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 
                             text-glow-cyan font-medium hover:bg-glow-cyan/30 hover:box-glow 
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {oneOnOneLoading ? 'Sending...' : 'Express Interest'}
                  </button>
                  {oneOnOneMessage && (
                    <p className={`text-sm text-center ${
                      oneOnOneMessage.includes('Success') 
                        ? 'text-glow-cyan' 
                        : 'text-red-500'
                    }`}>
                      {oneOnOneMessage}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="mt-2 text-xs text-muted-foreground/60">
              {mounted ? t('footerMotto') : 'Breathe deeply. Move gently. Live fully.'}
            </p>
          </div>
        </footer>
      </div>

      {/* Wednesday Booking Modal */}
      <BookingModal
        isOpen={isWednesdayModalOpen}
        onClose={() => setIsWednesdayModalOpen(false)}
        classDetails={WEDNESDAY_CLASS}
        dayOfWeek="wednesday"
      />

      {/* Friday Booking Modal */}
      <BookingModal
        isOpen={isFridayModalOpen}
        onClose={() => setIsFridayModalOpen(false)}
        classDetails={FRIDAY_CLASS}
        dayOfWeek="friday"
      />
    </div>
  );
};

export default ClassesPage;

