/**
 * One-time migration: seed the existing data/articles.json content into MongoDB
 * (new `articles` collection), since the blog admin API is being switched from
 * writing to a local JSON file (which fails on Vercel - read-only filesystem,
 * causing "Failed to save article") to reading/writing MongoDB instead.
 *
 * Safe to re-run: upserts by the article's `id` field, so it won't create duplicates.
 *
 * Run with:
 *   node scripts/migrate-articles-to-mongodb-2026-08.mjs
 */

import dotenv from 'dotenv';
import { createRequire } from 'module';
import { readFile } from 'fs/promises';
import path from 'path';

dotenv.config({ path: '.env.local' });

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set.');
  process.exit(1);
}

const articleSchema = new mongoose.Schema({}, { strict: false, collection: 'articles' });

async function run() {
  const filePath = path.join(process.cwd(), 'data', 'articles.json');
  const raw = await readFile(filePath, 'utf8');
  const articles = JSON.parse(raw);

  if (!Array.isArray(articles)) {
    console.error('❌  data/articles.json did not contain an array.');
    process.exit(1);
  }

  console.log(`📄  Found ${articles.length} article(s) in data/articles.json\n`);

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('🔗  Connected to MongoDB\n');

  const Article = mongoose.models.ScriptArticle || mongoose.model('ScriptArticle', articleSchema);

  const now = new Date();
  let upserted = 0;

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
          updatedAt: article.updatedAt ? new Date(article.updatedAt) : now,
        },
      },
      { upsert: true }
    );
    upserted += 1;
    console.log(`  ✅ Upserted: ${article.id} - ${article.title?.en || article.title?.zh || '(untitled)'}`);
  }

  console.log(`\n🎉  Done. ${upserted} article(s) migrated.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
