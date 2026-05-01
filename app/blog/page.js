'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowRight, BookOpen, Calendar, FilePenLine, Sparkles, Tag, User } from 'lucide-react';
import {
  createArticleSlug,
  formatArticleDate,
  getArticleExcerpt,
  getArticleTitle,
  getCategoryLabel,
} from '@/lib/blog';

export default function BlogPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await fetch('/api/articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        }
      } catch (error) {
        console.error('Error loading blog articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  const categories = useMemo(() => {
    return ['all', ...new Set(articles.map((article) => article.category).filter(Boolean))];
  }, [articles]);

  const tags = useMemo(() => {
    return ['all', ...new Set(articles.flatMap((article) => article.tags || []))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesTag = selectedTag === 'all' || article.tags?.includes(selectedTag);
      return matchesCategory && matchesTag;
    });
  }, [articles, selectedCategory, selectedTag]);

  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />

      <div className="relative z-10">
        <Header />

        <main className="px-6 pb-16">
          <section className="max-w-6xl mx-auto pt-4 pb-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glow-cyan/10 border border-glow-cyan/20 text-glow-cyan mb-6">
              <BookOpen className="w-4 h-4" />
              <span>{language === 'zh' ? '阅读博客' : 'Read the Blog'}</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl text-glow-subtle mb-4">
              {language === 'zh' ? 'Inner Light 博客' : 'Inner Light Blog'}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {language === 'zh'
                ? '这里会展示后台发布的所有文章，客户只能阅读，不能编辑。'
                : 'All articles published from the admin area appear here for customers to read only.'}
            </p>

            {isAdmin && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/admin/articles?new=true"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-all duration-300"
                >
                  <FilePenLine className="w-4 h-4" />
                  <span>{language === 'zh' ? '写新的Blog' : 'Write New Blog'}</span>
                </Link>

                <Link
                  href="/admin/articles?view=drafts"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-glow-purple/10 border border-glow-purple/30 text-glow-subtle hover:bg-glow-purple/20 transition-all duration-300"
                >
                  <span>{language === 'zh' ? '打开草稿箱' : 'Open Draft Box'}</span>
                </Link>
              </div>
            )}
          </section>

          <section className="max-w-6xl mx-auto mb-8">
            <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'zh' ? '按分类筛选' : 'Filter by category'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        selectedCategory === category
                          ? 'bg-glow-cyan/20 text-glow-cyan border-glow-cyan/50'
                          : 'bg-background/40 text-muted-foreground border-border/40 hover:border-glow-cyan/30'
                      }`}
                    >
                      {category === 'all'
                        ? (language === 'zh' ? '全部' : 'All')
                        : getCategoryLabel(category, language)}
                    </button>
                  ))}
                </div>
              </div>

              {tags.length > 1 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'zh' ? '按标签筛选' : 'Filter by tag'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          selectedTag === tag
                            ? 'bg-glow-purple/20 text-glow-subtle border-glow-purple/50'
                            : 'bg-background/40 text-muted-foreground border-border/40 hover:border-glow-purple/30'
                        }`}
                      >
                        {tag === 'all'
                          ? (language === 'zh' ? '全部标签' : 'All tags')
                          : tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 text-center">
                <Sparkles className="w-8 h-8 text-glow-cyan mx-auto mb-3" />
                <h2 className="font-display text-2xl text-glow-subtle mb-2">
                  {language === 'zh' ? '还没有文章' : 'No blog posts yet'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'zh'
                    ? '后台发布的新文章会自动显示在这里。'
                    : 'New articles published from the admin area will automatically appear here.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredArticles.map((article) => (
                  <article
                    key={article.id}
                    className="p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 hover:border-glow-cyan/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
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

                    <h2 className="font-display text-2xl text-glow-subtle mb-3">
                      {getArticleTitle(article, language)}
                    </h2>

                    <p className="text-muted-foreground leading-relaxed mb-5">
                      {getArticleExcerpt(article, language, 260)}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/70">
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

                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/blog/${createArticleSlug(article)}`}
                          className="inline-flex items-center gap-2 text-glow-cyan hover:text-glow-subtle transition-colors"
                        >
                          <span>{language === 'zh' ? '阅读全文' : 'Read more'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>

                        {isAdmin && (
                          <Link
                            href={`/admin/articles?edit=${article.id}`}
                            className="inline-flex items-center gap-2 text-glow-subtle hover:text-glow-cyan transition-colors"
                          >
                            <span>{language === 'zh' ? '编辑文章' : 'Edit Post'}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
