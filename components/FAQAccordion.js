'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ChevronDown } from 'lucide-react';

const FAQAccordion = ({ faqs }) => {
  const { t, mounted } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div 
          key={index}
          className="rounded-2xl border border-glow-cyan/10 bg-card/50 backdrop-blur-sm 
                   overflow-hidden animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left
                     hover:bg-glow-cyan/5 transition-colors duration-300"
          >
            <span className="font-display text-lg text-foreground pr-4">
              {mounted ? (t('language') === 'zh' ? faq.questionZh : faq.questionEn) : faq.questionEn}
            </span>
            <ChevronDown 
              className={`w-5 h-5 text-glow-cyan transition-transform duration-300 flex-shrink-0
                        ${openIndex === index ? 'rotate-180' : ''}`}
            />
          </button>
          
          {openIndex === index && (
            <div className="px-6 pb-4 text-muted-foreground leading-relaxed border-t border-glow-cyan/10 mt-2 pt-4">
              {mounted ? (t('language') === 'zh' ? faq.answerZh : faq.answerEn) : faq.answerEn}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;

