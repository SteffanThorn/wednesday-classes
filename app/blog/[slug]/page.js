'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import {
  createArticleSlug,
  findArticleBySlug,
  formatArticleDate,
  getArticleContent,
  getArticleTitle,
  getCategoryLabel,
} from '@/lib/blog';
import { toSafeArticleHtml } from '@/lib/html-sanitize';

export default function BlogArticlePage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [article, setArticle] = useState(null);
  const [otherArticles, setOtherArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch('/api/articles');
        if (response.ok) {
          const data = await response.json();
          const found = findArticleBySlug(data, slug);
          setArticle(found);
          setOtherArticles(
            data
              .filter((a) => a.id !== found?.id)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          );
        }
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const renderContent = (content) => {
    // Legacy content is plain text (paragraphs separated by a blank line); rich-editor
    // content is sanitized HTML with <br> for line breaks and <br><br> between paragraphs.
    // toSafeArticleHtml() normalizes either case to safe HTML, so splitting on <br><br>
    // works for both.
    const safeHtml = toSafeArticleHtml(content.replace(/\*\*(.*?)\*\*/g, '$1'));

    return safeHtml
      .split(/(?:<br\s*\/?>\s*){2,}/i)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((paragraph, index) => {
        const imageMatch = paragraph.match(/^!\[(.*?)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/);

        if (imageMatch) {
          const [, altText, imageUrl] = imageMatch;
          return (
            <figure key={index} className="mb-6 flex justify-center">
              <img
                src={imageUrl}
                alt={altText || 'Article image'}
                className="w-full max-w-sm rounded-2xl border border-border/40"
                loading="lazy"
              />
            </figure>
          );
        }

        return (
          <p
            key={index}
            className="text-muted-foreground leading-8 mb-5"
            dangerouslySetInnerHTML={{ __html: paragraph }}
          />
        );
      });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />

      <div className="relative z-10">
        <Header />

        <main className="px-6 pb-16">
          <div className="max-w-6xl mx-auto pt-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-glow-cyan hover:text-glow-subtle transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'zh' ? '返回博客' : 'Back to Blog'}</span>
            </Link>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
              </div>
            ) : !article ? (
              <div className="p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 text-center">
                <h1 className="font-display text-2xl text-glow-subtle mb-3">
                  {language === 'zh' ? '文章未找到' : 'Article not found'}
                </h1>
                <p className="text-muted-foreground mb-5">
                  {language === 'zh'
                    ? '这篇文章可能已被删除，或链接已发生变化。'
                    : 'This article may have been removed or the link may have changed.'}
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-all"
                >
                  {language === 'zh' ? '查看所有文章' : 'View all posts'}
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
                <article className="p-6 md:p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/40">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs bg-glow-cyan/10 text-glow-cyan border border-glow-cyan/20">
                      {getCategoryLabel(article.category, language)}
                    </span>
                    {article.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs bg-glow-purple/10 text-glow-subtle border border-glow-purple/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <h1 className="font-display text-3xl md:text-5xl text-glow-subtle mb-5">
                    {getArticleTitle(article, language)}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/70 mb-8 pb-6 border-b border-border/30">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {article.author || 'Yuki'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatArticleDate(article.createdAt, language)}
                    </span>
                    {article.tags?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {article.tags.join(', ')}
                      </span>
                    )}
                  </div>

                  <div>
                    {renderContent(getArticleContent(article, language))}
                  </div>
                </article>

                {/* Sidebar — other posts, so clicking "Read more" into an
                    article never dead-ends without a way to keep browsing. */}
                {otherArticles.length > 0 && (
                  <aside className="lg:sticky lg:top-24 p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40">
                    <h2 className="font-display text-lg text-glow-subtle mb-3">
                      {language === 'zh' ? '更多文章' : 'More Articles'}
                    </h2>
                    <div className="divide-y divide-border/20">
                      {otherArticles.slice(0, 8).map((a) => (
                        <Link key={a.id} href={`/blog/${createArticleSlug(a)}`} className="block group py-3 first:pt-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-glow-cyan transition-colors leading-snug">
                            {getArticleTitle(a, language)}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatArticleDate(a.createdAt, language)}
                          </p>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/blog"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs text-glow-cyan hover:text-glow-subtle transition-colors"
                    >
                      {language === 'zh' ? '查看所有文章 →' : 'View all posts →'}
                    </Link>
                  </aside>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
