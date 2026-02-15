'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getAllQuestions, interpretScore } from '@/data/chakra-questions';
import { getChakraInterpretation, chakraInterpretations } from '@/data/chakra-interpretations';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { ChevronLeft, ChevronRight, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const ChakraTest = () => {
  const { t, mounted, language } = useLanguage();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  // Store expanded state for each chakra by sanskrit name
  const [expandedStates, setExpandedStates] = useState({});
  
  const allQuestions = getAllQuestions();
  
  // Check for direct results access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      // Load saved results directly
      if (params.get('results') === 'true') {
        const savedResults = localStorage.getItem('chakra-test-last-results');
        if (savedResults) {
          setAnswers(JSON.parse(savedResults));
          setShowResults(true);
        } else {
          // Generate sample results if no saved results
          const sampleAnswers = {};
          allQuestions.forEach((_, index) => {
            sampleAnswers[index] = Math.floor(Math.random() * 3) + 3;
          });
          setAnswers(sampleAnswers);
          setShowResults(true);
        }
      }
    }
  }, []);
  
  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('chakra-test-progress');
    if (saved) {
      const { currentQuestion: savedQuestion, answers: savedAnswers } = JSON.parse(saved);
      setCurrentQuestion(savedQuestion);
      setAnswers(savedAnswers);
    }
  }, []);
  
  // Save progress
  const saveProgress = () => {
    localStorage.setItem('chakra-test-progress', JSON.stringify({
      currentQuestion,
      answers
    }));
  };
  
  const handleAnswer = (score) => {
    const newAnswers = { ...answers, [currentQuestion]: score };
    setAnswers(newAnswers);
    saveProgress();
    
    // Auto advance
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Test complete - save results for later access
      localStorage.setItem('chakra-test-last-results', JSON.stringify(newAnswers));
      localStorage.removeItem('chakra-test-progress');
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
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      saveProgress();
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    localStorage.removeItem('chakra-test-progress');
  };
  
  const getChakraScores = () => {
    const scores = {};
    allQuestions.forEach((q, index) => {
      if (!scores[q.chakraId]) {
        scores[q.chakraId] = {
          name: q.chakraName,
          sanskrit: q.sanskrit,
          meaning: q.meaning,
          color: q.color,
          total: 0,
          answered: 0
        };
      }
      if (answers[index] !== undefined) {
        scores[q.chakraId].total += answers[index];
        scores[q.chakraId].answered += 1;
      }
    });
    return scores;
  };
  
  const getProgress = () => {
    return Math.round((Object.keys(answers).length / allQuestions.length) * 100);
  };
  
  // Landing page
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
                  {mounted ? t('chakraTestTitle') : 'Chakra Balance Test'}
                </h1>
                <p className="text-lg text-muted-foreground animate-fade-in-up animation-delay-200">
                  {mounted ? t('chakraTestSubtitle') : 'Discover your energy balance through this comprehensive assessment'}
                </p>
              </div>
              
              <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                            border border-glow-teal/20 animate-fade-in-up animation-delay-400">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-glow-cyan/20 text-glow-cyan flex items-center justify-center font-medium">
                      1
                    </span>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        {mounted ? t('test49Questions') : '49 Questions'}
                      </h3>
                      <p className="text-muted-foreground">
                        {mounted ? t('test49Desc') : 'Seven chakras, seven questions each. Answer honestly based on your recent experiences.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-glow-cyan/20 text-glow-cyan flex items-center justify-center font-medium">
                      2
                    </span>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        {mounted ? t('likertScale') : 'Likert Scale'}
                      </h3>
                      <p className="text-muted-foreground">
                        {mounted ? t('likertDesc') : 'Rate each statement from 1 (completely disagree) to 5 (completely agree).'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-glow-cyan/20 text-glow-cyan flex items-center justify-center font-medium">
                      3
                    </span>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        {mounted ? t('personalInsights') : 'Personal Insights'}
                      </h3>
                      <p className="text-muted-foreground">
                        {mounted ? t('personalInsightsDesc') : 'Get detailed analysis of each chakra\'s energy state and personalized suggestions.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-glow-teal/20">
                  <button
                    onClick={() => setStarted(true)}
                    className="w-full py-4 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                             text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                             transition-all duration-300 animate-fade-in-up animation-delay-600"
                  >
                    {mounted ? t('startTest') : 'Begin the Test'}
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
    const chakraScores = getChakraScores();
    
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          
          <main className="px-6 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="font-display text-4xl md:text-5xl text-glow-subtle mb-6 animate-fade-in-up">
                  {mounted ? t('testComplete') : 'Test Complete'}
                </h1>
                <p className="text-muted-foreground animate-fade-in-up animation-delay-200">
                  {mounted ? t('yourResults') : 'Here are your chakra energy results'}
                </p>
              </div>
              
              <div className="grid gap-6">
                {Object.values(chakraScores).map((chakra, index) => {
                  const interpretation = interpretScore(chakra.total);
                  const chakraColor = typeof chakra.color === 'object' ? chakra.color.en : chakra.color;
                  const level = interpretation.status.en === 'Blocked / Low' ? 'low' : 
                               interpretation.status.en === 'Overactive' ? 'overactive' : 'balanced';
                  const detailedInterpretation = getChakraInterpretation(chakra.sanskrit.toLowerCase(), level, language);
                  const expanded = expandedStates[chakra.sanskrit] || false;
                  
                  return (
<div
                      key={chakra.sanskrit}
                      className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/60 
                               border border-glow-teal/20 animate-fade-in-up overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Sanskrit circle + Score */}
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-display shrink-0"
                            style={{ 
                              background: `linear-gradient(135deg, var(--glow-${chakraColor.toLowerCase()}) 0%, var(--glow-${chakraColor.toLowerCase()}-light) 100%)`
                            }}
                          >
                            {chakra.sanskrit}
                          </div>
                          <div className="text-center md:text-left">
                            <div className="text-3xl font-display text-glow-cyan">
                              {chakra.total}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {mounted ? t('totalScore') : 'Total Score'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Right: Name + Status */}
                        <div className="flex flex-col gap-4 items-end">
                          <div className="text-right">
                            <h3 className="font-display text-xl text-foreground">
                              {typeof chakra.name === 'object' 
                                ? (language === 'zh' ? chakra.name.zh : chakra.name.en)
                                : chakra.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {typeof chakra.meaning === 'object'
                                ? (language === 'zh' ? chakra.meaning.zh : chakra.meaning.en)
                                : chakra.meaning}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-medium ${
                              interpretation.status.en === 'Blocked / Low' ? 'text-red-400' :
                              interpretation.status.en === 'Overactive' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {language === 'zh' ? interpretation.status.zh : interpretation.status.en}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {mounted ? t('status') : 'Status'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500 rounded-full"
                          style={{ 
                            width: `${(chakra.total / 35) * 100}%`,
                            background: `linear-gradient(90deg, var(--glow-${chakraColor.toLowerCase()}) 0%, var(--glow-${chakraColor.toLowerCase()}-light) 100%)`
                          }}
                        />
                      </div>
                      
                      {/* Expand button */}
                      <button
                        onClick={() => setExpandedStates(prev => ({
                          ...prev,
                          [chakra.sanskrit]: !prev[chakra.sanskrit]
                        }))}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-glow-teal/10 
                                 text-glow-cyan hover:bg-glow-teal/20 transition-all duration-300 text-sm"
                      >
                        {expanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            {mounted ? t('showLess') : '收起详情'}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            {mounted ? t('showMore') : '查看详情'}
                          </>
                        )}
                      </button>
                      
                      {/* Detailed interpretation - collapsible */}
                      {expanded && detailedInterpretation && (
                        <div className="mt-4 pt-4 border-t border-glow-teal/20 animate-fade-in">
                          {/* Headline */}
                          <h4 className="font-medium text-lg text-glow-cyan mb-2">
                            {detailedInterpretation.headline}
                          </h4>
                          <p className="text-muted-foreground mb-4">
                            {detailedInterpretation.description}
                          </p>
                          
                          {/* Lifestyle patterns */}
                          {detailedInterpretation.lifestylePatterns && (
                            <div className="mb-4">
                              <h5 className="font-medium text-sm text-foreground mb-2">
                                {mounted ? t('lifestylePatterns') : '生活模式'}
                              </h5>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {detailedInterpretation.lifestylePatterns.slice(0, 5).map((pattern, i) => (
                                  <li key={i}>{pattern}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Modern manifestations */}
                          {detailedInterpretation.modernManifestations && (
                            <div className="mb-4 p-4 rounded-xl bg-glow-teal/5 border border-glow-teal/10">
                              <h5 className="font-medium text-sm text-foreground mb-3">
                                {mounted ? t('modernManifestations') : '现代生活表现'}
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {Object.entries(detailedInterpretation.modernManifestations).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium text-glow-cyan capitalize">
                                      {key === 'work' ? (mounted ? t('work') : '工作') :
                                       key === 'relationships' ? (mounted ? t('relationships') : '关系') :
                                       key === 'health' ? (mounted ? t('health') : '健康') :
                                       key === 'mental' ? (mounted ? t('mental') : '心理') : key}:
                                    </span>
                                    <p className="text-muted-foreground mt-1">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Suggestions */}
                          {detailedInterpretation.suggestions && (
                            <div>
                              <h5 className="font-medium text-sm text-foreground mb-3">
                                {mounted ? t('suggestions') : '改善建议'}
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {detailedInterpretation.suggestions.slice(0, 4).map((suggestion, i) => (
                                  <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/30">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-glow-cyan/20 text-glow-cyan">
                                        {suggestion.category}
                                      </span>
                                    </div>
                                    <h6 className="font-medium text-sm">{suggestion.title}</h6>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {suggestion.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
  const question = allQuestions[currentQuestion];
  const progress = getProgress();
  
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
                {mounted ? t('questionProgress') : `Question ${currentQuestion + 1} of ${allQuestions.length}`}
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
{/* Chakra indicator */}
            <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in-up">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-display shadow-lg shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, var(--glow-${question.color.en.toLowerCase()}) 0%, var(--glow-${question.color.en.toLowerCase()}-light) 100%)`
                }}
              >
                {question.sanskrit[0]}
              </div>
              <div className="flex flex-col gap-4 items-start">
                <span className="text-xl font-medium text-glow-cyan">
                  {language === 'zh' ? question.chakraName.zh : question.chakraName.en}
                </span>
                <span className="text-sm text-muted-foreground">
                  {question.sanskrit}
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
              <div className="flex flex-col gap-3">
                {/* Scale labels */}
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span className="w-12 text-center">{mounted ? t('completelyDisagree') : '完全不符合'}</span>
                  <span className="w-12 text-center">{mounted ? t('disagree') : '不太符合'}</span>
                  <span className="w-12 text-center">{mounted ? t('neutral') : '不确定'}</span>
                  <span className="w-12 text-center">{mounted ? t('agree') : '比较符合'}</span>
                  <span className="w-12 text-center">{mounted ? t('completelyAgree') : '完全符合'}</span>
                </div>
                
                {/* Buttons */}
                <div className="flex justify-center gap-1 md:gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswer(score)}
                      className={`w-14 h-14 rounded-full border-2 font-bold text-xl
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
                  <span className="w-14 text-center">1</span>
                  <span className="w-14 text-center">2</span>
                  <span className="w-14 text-center">3</span>
                  <span className="w-14 text-center">4</span>
                  <span className="w-14 text-center">5</span>
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
                disabled={currentQuestion === allQuestions.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  currentQuestion === allQuestions.length - 1
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

export default ChakraTest;

