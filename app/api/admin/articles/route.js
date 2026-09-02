import { NextResponse } from 'next/server';
import { auth } from '@/auth';
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

// GET - Read all articles (drafts included) - admin only, matching the rest of /api/admin/*.
// Public visitors read published articles via /api/articles instead.
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await dbConnect();
    const articles = await Article.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json(articles.map(toPlainArticle));
  } catch (error) {
    console.error('Error reading articles:', error);
    return NextResponse.json([]);
  }
}

// POST - Save articles (admin only)
// The admin UI always sends the FULL current article list (it loads everything via GET,
// edits/adds/removes one entry client-side, then resends the whole array) - so saving means
// making the collection match that array exactly: upsert everything present, delete anything
// that's been dropped from it.
export async function POST(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { articles } = body;

    if (!Array.isArray(articles)) {
      return NextResponse.json(
        { error: 'articles must be an array' },
        { status: 400 }
      );
    }

    await dbConnect();

    const now = new Date();
    const incomingIds = articles.map((a) => String(a.id));

    await Article.deleteMany({ id: { $nin: incomingIds } });

    for (const article of articles) {
      await Article.findOneAndUpdate(
        { id: String(article.id) },
        {
          $set: {
            id: String(article.id),
            title: article.title || { en: '', zh: '' },
            content: article.content || { en: '', zh: '' },
            tags: article.tags || [],
            category: article.category || 'ayurveda',
            status: article.status || 'published',
            author: article.author || 'Yuki',
            createdAt: article.createdAt ? new Date(article.createdAt) : now,
            updatedAt: now,
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Articles saved successfully' });
  } catch (error) {
    console.error('Error saving articles:', error);
    return NextResponse.json(
      { error: 'Failed to save articles: ' + error.message },
      { status: 500 }
    );
  }
}

