import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const articlesFilePath = path.join(process.cwd(), 'data', 'articles.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(articlesFilePath, 'utf8');
    const articles = JSON.parse(fileContents);

    const sortedArticles = Array.isArray(articles)
      ? articles
          .filter((article) => (article.status || 'published') === 'published')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [];

    return NextResponse.json(sortedArticles);
  } catch (error) {
    console.error('Error reading public articles:', error);
    return NextResponse.json([]);
  }
}
