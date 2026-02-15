
'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { BookOpen, Calendar, User, Sparkles } from 'lucide-react';

export default function ArticleSection({ tag, title = null }) {
  const { t, mounted, language } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch('/api/admin/articles');
        if (response.ok) {
          const data = await response.json();
          // Filter by tag
          const filtered = data.filter(article => 
            article.tags && article.tags.includes(tag)
          );
          setArticles(filtered);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadArticles();
  }, [tag]);

  const getCategoryLabel = (category) => {
    const categories = {
      general: { en: 'General', zh: '通用' },
      diet: { en: 'Diet & Nutrition', zh: '饮食与营养' },
      wellness: { en: 'Wellness', zh: '养生' },
      meditation: { en: 'Meditation', zh: '冥想' },
      lifestyle: { en: 'Lifestyle', zh: '生活方式' }
    };
    return mounted ? categories[category]?.[language] || categories.general[language] : categories.general.en;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-6 h-6 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (articles.length === 0) {
    return null; // Don't show section if no articles
  }

  return (
    <section className="py-12">
      {title && (
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-glow-cyan/10">
            <BookOpen className="w-5 h-5 text-glow-cyan" />
          </div>
          <h2 className="font-display text-xl text-glow-subtle">
            {title}
          </h2>
        </div>
      )}

      <div className="space-y-6">
        {articles.map((article, index) => {
          const getTitle = () => {
            if (!article.title) return '';
            if (typeof article.title === 'string') return article.title;
            if (language === 'zh' && article.title.zh) return article.title.zh;
            return article.title.en || '';
          };
          
          const getContent = () => {
            if (!article.content) return '';
            if (typeof article.content === 'string') return article.content;
            if (language === 'zh' && article.content.zh) return article.content.zh;
            return article.content.en || '';
          };
          
          return (
            <article
              key={article.id}
              className="p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 
                       hover:border-glow-cyan/30 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-glow-cyan/10 text-glow-cyan border border-glow-cyan/20">
                      {getCategoryLabel(article.category)}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-glow-subtle mb-3">
                    {getTitle()}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {getContent()}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground/60">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

