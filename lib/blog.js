export function getArticleTitle(article, language = 'en') {
  if (!article?.title) return '';
  if (typeof article.title === 'string') return article.title;

  if (language === 'zh') {
    return article.title.zh || article.title.en || '';
  }

  return article.title.en || article.title.zh || '';
}

export function getArticleContent(article, language = 'en') {
  if (!article?.content) return '';
  if (typeof article.content === 'string') return article.content;

  if (language === 'zh') {
    return article.content.zh || article.content.en || '';
  }

  return article.content.en || article.content.zh || '';
}

export function createArticleSlug(article) {
  const title = getArticleTitle(article, 'en') || getArticleTitle(article, 'zh') || 'article';
  const slugBase = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

  return `${article?.id || 'article'}${slugBase ? `-${slugBase}` : ''}`;
}

export function findArticleBySlug(articles, slug) {
  if (!slug || !Array.isArray(articles)) return null;
  const id = String(slug).split('-')[0];
  return articles.find((article) => String(article.id) === id) || null;
}

export function getCategoryLabel(category, language = 'en') {
  const categories = {
    general: { en: 'General', zh: '通用' },
    diet: { en: 'Diet & Nutrition', zh: '饮食与营养' },
    wellness: { en: 'Wellness', zh: '养生' },
    meditation: { en: 'Meditation', zh: '冥想' },
    lifestyle: { en: 'Lifestyle', zh: '生活方式' }
  };

  return categories[category]?.[language] || categories.general[language] || categories.general.en;
}

export function formatArticleDate(dateString, language = 'en') {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getArticleExcerpt(article, language = 'en', maxLength = 220) {
  const content = getArticleContent(article, language)
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  return content.length > maxLength
    ? `${content.slice(0, maxLength).trim()}...`
    : content;
}
