import { stripHtmlToPlainText } from './html-sanitize';

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
  const slugStr = String(slug);
  // First try: exact id match against the full slug prefix
  // Build candidate id by progressively consuming hyphen-separated segments
  const segments = slugStr.split('-');
  for (let i = segments.length; i >= 1; i--) {
    const candidate = segments.slice(0, i).join('-');
    const found = articles.find((article) => String(article.id) === candidate);
    if (found) return found;
  }
  return null;
}

export function getCategoryLabel(category, language = 'en') {
  const categories = {
    ayurveda: { en: 'Ayurveda', zh: '阿育吠陀' }
  };

  return categories[category]?.[language] || categories.ayurveda[language] || categories.ayurveda.en;
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
  const content = stripHtmlToPlainText(getArticleContent(article, language))
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  return content.length > maxLength
    ? `${content.slice(0, maxLength).trim()}...`
    : content;
}
