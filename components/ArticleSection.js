
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowRight, BookOpen, Calendar, Sparkles, User } from 'lucide-react';
import {
  createArticleSlug,
  formatArticleDate,
  getArticleExcerpt,
  getArticleTitle,
  getCategoryLabel,
} from '@/lib/blog';

export default function ArticleSection({ tag = null, title = null, maxItems = 3, showEmptyState = true }) {
  const { language } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch('/api/articles');
        if (response.ok) {
          const data = await response.json();
          const filtered = tag
            ? data.filter(article => article.tags && article.tags.includes(tag))
            : data;

          const sortedArticles = filtered
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, maxItems);

          setArticles(sortedArticles);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadArticles();
  }, [tag, maxItems]);



  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-6 h-6 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (articles.length === 0) {
    if (!showEmptyState) {
      return null;
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

        <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40">
          <div className="flex items-center gap-2 mb-3 text-glow-cyan">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'zh' ? '内容更新中' : 'Blog updates are coming soon'}
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {language === 'zh'
              ? '新的博客文章会自动显示在这里，客户页面仅提供阅读功能。'
              : 'New blog posts will automatically appear here, and the customer side is read-only.'}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-glow-cyan hover:text-glow-subtle transition-colors"
          >
            <span>{language === 'zh' ? '打开博客页面' : 'Open the blog page'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
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
        {articles.map((article, index) => (
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
                    {getCategoryLabel(article.category, language)}
                  </span>
                </div>
                <h3 className="font-display text-xl text-glow-subtle mb-3">
                  <Link href={`/blog/${createArticleSlug(article)}`} className="hover:text-glow-cyan transition-colors">
                    {getArticleTitle(article, language)}
                  </Link>
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {getArticleExcerpt(article, language, 220)}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground/60">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatArticleDate(article.createdAt, language)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/blog/${createArticleSlug(article)}`}
                    className="inline-flex items-center gap-2 text-glow-cyan hover:text-glow-subtle transition-colors"
                  >
                    <span>{language === 'zh' ? '阅读全文' : 'Read more'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

