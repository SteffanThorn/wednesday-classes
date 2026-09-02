import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';

function toPlainArticle(doc) {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    tags: doc.tags,
    category: doc.category,
    status: doc.status,
    author: doc.author,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function GET() {
  try {
    await dbConnect();
    const articles = await Article.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(articles.map(toPlainArticle));
  } catch (error) {
    console.error('Error reading public articles:', error);
    return NextResponse.json([]);
  }
}
