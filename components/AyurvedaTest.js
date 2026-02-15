'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ayurvedaQuestions, doshaInfo, calculateDoshaScores, interpretDoshaScores, getDoshaRecommendations } from '@/data/ayurveda-test-questions';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { ChevronLeft, ChevronRight, Save, RotateCcw } from 'lucide-react';

const AyurvedaTest = () => {
  const { t, mounted, language } = useLanguage();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  // Check for direct results access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      if (params.get('results') === 'true') {
        const savedResults = localStorage.getItem('ayurveda-test-last-results');
        if (savedResults) {
          setAnswers(JSON.parse(savedResults));
          setShowResults(true);
        } else {
          // Generate sample results if no saved results
          const sampleAnswers = {};
          ayurvedaQuestions.forEach((_, index) => {
            sampleAnswers[index] = Math.floor(Math.random() * 3) + 2;
          });
          setAnswers(sampleAnswers);
          setShowResults(true);
        }
      }
    }
  }, []);
  
  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('ayurveda-test-progress');
    if (saved) {
      const { currentQuestion: savedQuestion, answers: savedAnswers } = JSON.parse(saved);
      setCurrentQuestion(savedQuestion);
      setAnswers(savedAnswers);
    }
  }, []);
  
  // Save progress
  const saveProgress = () => {
    localStorage.setItem('ayurveda-test-progress', JSON.stringify({
      currentQuestion,
      answers
    }));
  };
  
  const handleAnswer = (score) => {
    const newAnswers = { ...answers, [currentQuestion]: score };
    setAnswers(newAnswers);
    saveProgress();
    
    if (currentQuestion < ayurvedaQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      localStorage.setItem('ayurveda-test-last-results', JSON.stringify(newAnswers));
      localStorage.removeItem('ayurveda-test-progress');
      setShowResults(true);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      saveProgress();
    }
  };
  
  const handleNext = () => {
    if (currentQuestion < ayurvedaQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      saveProgress();
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    localStorage.removeItem('ayurveda-test-progress');
  };
  
  const getProgress = () => {
    return Math.round((Object.keys(answers).length / ayurvedaQuestions.length) * 100);
  };
  
  const getDoshaColor = (dosha) => {
    return doshaInfo[dosha].color;
  };
  
  // Landing page - Simplified version without What is Ayurveda, Three Doshas, Disclaimer
  if (!started) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          
          <main className="px-6 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="font-display text-4xl md:text-5xl text-glow-subtle mb-6 animate-fade-in-up">
                  {mounted ? t('ayurvedaTestTitle') : 'Ayurveda Constitution Test'}
                </h1>
                <p className="text-lg text-muted-foreground animate-fade-in-up animation-delay-200">
                  {mounted ? t('ayurvedaTestSubtitle') : 'Discover your unique dosha constitution and personalized wellness recommendations'}
                </p>
              </div>
              
              {/* Test Instructions Only */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                            border border-glow-teal/20 animate-fade-in-up animation-delay-300">
                <h3 className="font-display text-xl text-foreground mb-4">
                  {mounted ? t('ayurvedaHowItWorks') : 'How It Works'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-glow-cyan/20 text-glow-cyan flex items-center justify-center font-medium">
                      1
                    </span>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {mounted ? t('ayurveda24Questions') : '24 Questions'}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {mounted ? t('ayurveda24Desc') : 'Eight questions each for Vata, Pitta, and Kapha. Answer based on your natural tendencies.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-glow-cyan/20 text-glow-cyan flex items-center justify-center font-medium">
                      2
                    </span>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {mounted ? t('ayurvedaLikert') : 'Frequency Scale'}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {mounted ? t('ayurvedaLikertDesc') : 'Rate how often each statement applies to you from 1 (rarely) to 5 (very often).'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-glow-cyan/20 text-glow-cyan flex items-center justify-center font-medium">
                      3
                    </span>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {mounted ? t('ayurvedaPersonalResults') : 'Personalized Results'}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {mounted ? t('ayurvedaPersonalResultsDesc') : 'Get your dosha profile with diet, lifestyle, and exercise recommendations.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-glow-teal/20">
                  <button
                    onClick={() => setStarted(true)}
                    className="w-full py-4 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                             text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                             transition-all duration-300 animate-fade-in-up animation-delay-400"
                  >
                    {mounted ? t('ayurvedaStartTest') : 'Begin the Test'}
                  </button>
                </div>
              </div>
            </div>
          </main>
          
          {/* Footer */}
          <footer className="relative z-10 py-12 px-6 border-t border-border/30">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                {mounted ? t('copyright') : '© 2026 INNER LIGHT · Auckland, New Zealand'}
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }
  
  // Results page
  if (showResults) {
    const scores = calculateDoshaScores(answers);
    const results = interpretDoshaScores(scores);
    const recommendations = getDoshaRecommendations(
      results[0].dosha,
      results[1].percentage >= 40 ? results[1].dosha : null
    );
    
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          
          <main className="px-6 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="font-display text-4xl md:text-5xl text-glow-subtle mb-6 animate-fade-in-up">
                  {mounted ? t('ayurvedaTestComplete') : 'Your Constitution Results'}
                </h1>
                <p className="text-muted-foreground animate-fade-in-up animation-delay-200">
                  {mounted ? t('ayurvedaYourDosha') : 'Based on your responses, here is your unique dosha profile'}
                </p>
              </div>
              
              {/* Primary Dosha Highlight */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-card/80 to-card/60 
                            border border-glow-cyan/30 mb-8 animate-fade-in-up">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center shrink-0 shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, var(--glow-${getDoshaColor(results[0].dosha)}) 0%, var(--glow-${getDoshaColor(results[0].dosha)}-light) 100%)`
                    }}
                  >
                    <span className="text-4xl text-white font-display">
                      {doshaInfo[results[0].dosha].sanskrit}
                    </span>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-display text-glow-cyan mb-2">
                      {language === 'zh' ? doshaInfo[results[0].dosha].zh : doshaInfo[results[0].dosha].en}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-2">
                      {language === 'zh' ? doshaInfo[results[0].dosha].meaning : doshaInfo[results[0].dosha].meaning}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'zh' ? doshaInfo[results[0].dosha].description.zh : doshaInfo[results[0].dosha].description.en}
                    </p>
                  </div>
                </div>
                
                {/* Score bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{mounted ? t('ayurvedaScore') : 'Score'}</span>
                    <span>{results[0].score} / 40 ({results[0].percentage}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 rounded-full"
                      style={{ 
                        width: `${results[0].percentage}%`,
                        background: `linear-gradient(90deg, var(--glow-${getDoshaColor(results[0].dosha)}) 0%, var(--glow-${getDoshaColor(results[0].dosha)}-light) 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* All Dosha Scores */}
              <div className="grid md:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
                {results.map((result, index) => {
                  const info = doshaInfo[result.dosha];
                  return (
                    <div 
                      key={result.dosha}
                      className={`p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 
                               border ${index === 0 ? 'border-glow-cyan/30' : 'border-glow-teal/20'}
                               transition-all duration-300`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, var(--glow-${info.color}) 0%, var(--glow-${info.color}-light) 100%)`
                          }}
                        >
                          <span className="text-white font-display text-sm">{info.sanskrit[0]}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {language === 'zh' ? info.zh : info.en}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {result.score} / 40
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${result.percentage}%`,
                            background: `linear-gradient(90deg, var(--glow-${info.color}) 0%, var(--glow-${info.color}-light) 100%)`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Recommendations */}
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-2xl font-display text-foreground text-center mb-6">
                  {mounted ? t('ayurvedaRecommendations') : 'Personalized Recommendations'}
                </h3>
                
                {/* Diet */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 border border-glow-teal/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🍽️</span>
                    <h4 className="text-xl font-medium text-glow-cyan">
                      {mounted ? t('ayurvedaDiet') : 'Diet Recommendations'}
                    </h4>
                  </div>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {language === 'zh' ? recommendations.primary.diet.zh : recommendations.primary.diet.en}
                  </div>
                </div>
                
                {/* Seasonal Recommendations */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 border border-glow-purple/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🌸</span>
                    <h4 className="text-xl font-medium text-glow-purple">
                      {language === 'zh' ? '季节性调整建议' : 'Seasonal Adjustments'}
                    </h4>
                  </div>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {language === 'zh' ? recommendations.primary.seasonal.zh : recommendations.primary.seasonal.en}
                  </div>
                </div>
                
                {/* Tea Timing */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 border border-glow-cyan/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🍵</span>
                    <h4 className="text-xl font-medium text-glow-cyan">
                      {language === 'zh' ? '日间饮品指南' : 'Daily Tea & Drink Guide'}
                    </h4>
                  </div>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {language === 'zh' ? recommendations.primary.teaTiming.zh : recommendations.primary.teaTiming.en}
                  </div>
                </div>
                
                {/* Lifestyle */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 border border-glow-teal/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🧘</span>
                    <h4 className="text-xl font-medium text-glow-cyan">
                      {mounted ? t('ayurvedaLifestyle') : 'Lifestyle Recommendations'}
                    </h4>
                  </div>
                  <p className="text-muted-foreground">
                    {language === 'zh' ? recommendations.primary.lifestyle.zh : recommendations.primary.lifestyle.en}
                  </p>
                </div>
                
                {/* Exercise */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 border border-glow-teal/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🏃</span>
                    <h4 className="text-xl font-medium text-glow-cyan">
                      {mounted ? t('ayurvedaExercise') : 'Exercise Recommendations'}
                    </h4>
                  </div>
                  <p className="text-muted-foreground">
                    {language === 'zh' ? recommendations.primary.exercise.zh : recommendations.primary.exercise.en}
                  </p>
                </div>
              </div>
              
              {/* CTA */}
              <div className="mt-12 text-center animate-fade-in-up">
                <p className="text-muted-foreground mb-6">
                  {mounted ? t('ayurvedaBookConsultation') : 'Ready to explore your constitution deeper?'}
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-glow-cyan/20 to-glow-purple/20 
                                 border border-glow-cyan/30 rounded-full text-foreground
                                 hover:from-glow-cyan/30 hover:to-glow-purple/30 
                                 hover:border-glow-cyan/50 transition-all duration-300
                                 hover:shadow-lg hover:shadow-glow-cyan/20">
                  {mounted ? t('bookFreeConsultation') : 'Book Free Consultation'}
                </button>
              </div>

              {/* Professional Consultation Reminder */}
              <div className="mt-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-fade-in-up">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-medium text-amber-400 mb-2">
                      {mounted ? t('ayurvedaProfessionalConsultation') : 'For Professional Diagnosis'}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {language === 'zh' 
                        ? '虽然这个自测可以为您提供关于一般体质的宝贵见解，但它无法替代有资质的阿育吠陀医师的综合检查。要获得包括舌诊、脉诊和个性化治疗方案在内的全面分析，我们建议您预约咨询有资质的阿育吠陀医师。'
                        : 'While this self-assessment provides valuable insights into your general constitution, it cannot replace a comprehensive examination by a qualified Ayurvedic practitioner. For a thorough analysis including tongue diagnosis, pulse reading, and personalized treatment plans, we recommend scheduling a consultation with a certified Ayurvedic physician.'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                           text-glow-cyan font-medium hover:bg-glow-cyan/20 transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  {mounted ? t('retakeTest') : 'Retake Test'}
                </button>
              </div>
            </div>
          </main>
          
          {/* Footer */}
          <footer className="relative z-10 py-12 px-6 border-t border-border/30">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                {mounted ? t('copyright') : '© 2026 INNER LIGHT · Auckland, New Zealand'}
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }
  
  // Test in progress
  const question = ayurvedaQuestions[currentQuestion];
  const progress = getProgress();
  const doshaColor = getDoshaColor(question.dosha);
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />
        
        {/* Progress bar */}
        <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-lg border-b border-border/30">
          <div className="max-w-4xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {mounted ? t('questionProgress') : `Question ${currentQuestion + 1} of ${ayurvedaQuestions.length}`}
              </span>
              <span className="text-sm text-glow-cyan">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-glow-teal to-glow-cyan transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        <main className="px-6 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Dosha indicator */}
            <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in-up">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-display shadow-lg shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, var(--glow-${doshaColor}) 0%, var(--glow-${doshaColor}-light) 100%)`
                }}
              >
                {doshaInfo[question.dosha].sanskrit[0]}
              </div>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-lg font-medium text-glow-cyan">
                  {doshaInfo[question.dosha].sanskrit}
                </span>
                <span className="text-sm text-muted-foreground">
                  {language === 'zh' ? doshaInfo[question.dosha].zh : doshaInfo[question.dosha].en}
                </span>
              </div>
            </div>
            
            {/* Question */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up animation-delay-200">
              <h2 className="font-display text-2xl md:text-3xl text-foreground text-center mb-8">
                {language === 'zh' ? question.text.zh : question.text.en}
              </h2>
              
              {/* Likert Scale */}
              <div className="flex flex-col gap-4">
                {/* Scale labels */}
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  {question.options.map((option) => (
                    <span key={option.value} className="w-14 text-center">
                      {language === 'zh' ? option.zh : option.en}
                    </span>
                  ))}
                </div>
                
                {/* Buttons */}
                <div className="flex justify-center gap-1 md:gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswer(score)}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 font-bold text-lg md:text-xl
                                transition-all duration-300 flex-shrink-0 ${
                                  answers[currentQuestion] === score
                                    ? 'border-glow-cyan bg-glow-cyan/20 text-glow-cyan box-glow'
                                    : 'border-glow-teal/40 hover:border-glow-cyan/60 text-muted-foreground hover:text-foreground bg-card/50'
                                }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                
                {/* Number labels */}
                <div className="flex justify-center gap-1 md:gap-2 text-xs text-muted-foreground">
                  <span className="w-12 md:w-14 text-center">1</span>
                  <span className="w-12 md:w-14 text-center">2</span>
                  <span className="w-12 md:w-14 text-center">3</span>
                  <span className="w-12 md:w-14 text-center">4</span>
                  <span className="w-12 md:w-14 text-center">5</span>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  currentQuestion === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                {mounted ? t('previous') : 'Previous'}
              </button>
              
              <button
                onClick={saveProgress}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-muted-foreground 
                         hover:text-foreground transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                {mounted ? t('saveProgress') : 'Save Progress'}
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentQuestion === ayurvedaQuestions.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  currentQuestion === ayurvedaQuestions.length - 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'text-glow-cyan hover:text-glow-cyan-light'
                }`}
              >
                {mounted ? t('next') : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="relative z-10 py-12 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              {mounted ? t('copyright') : '© 2026 INNER LIGHT · Auckland, New Zealand'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AyurvedaTest;

