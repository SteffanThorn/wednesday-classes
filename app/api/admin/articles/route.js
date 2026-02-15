import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// SECURITY: Use environment variable for admin password
// Never hardcode passwords in production code
const ADMIN_PASSWORD = process.env.ADMIN_ARTICLES_PASSWORD;

const articlesFilePath = path.join(process.cwd(), 'data', 'articles.json');

// Ensure data directory exists
async function ensureDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Read articles (public - articles are displayed on the website)
export async function GET() {
  try {
    await ensureDirectory();
    const fileContents = await fs.readFile(articlesFilePath, 'utf8');
    const articles = JSON.parse(fileContents);
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error reading articles:', error);
    // Return empty array if file doesn't exist
    return NextResponse.json([]);
  }
}

// POST - Save articles (requires password from environment)
export async function POST(request) {
  try {
    // SECURITY: Require password to be configured
    if (!ADMIN_PASSWORD) {
      console.error('ADMIN_ARTICLES_PASSWORD is not set in environment variables');
      return NextResponse.json(
        { error: 'Admin functionality is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { articles, password } = body;

    // Verify password matches environment variable
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid password' },
        { status: 401 }
      );
    }

    // Ensure directory exists
    await ensureDirectory();

    // Write articles to file
    await fs.writeFile(
      articlesFilePath,
      JSON.stringify(articles, null, 2),
      'utf8'
    );

    return NextResponse.json({ success: true, message: 'Articles saved successfully' });
  } catch (error) {
    console.error('Error saving articles:', error);
    return NextResponse.json(
      { error: 'Failed to save articles: ' + error.message },
      { status: 500 }
    );
  }
}

