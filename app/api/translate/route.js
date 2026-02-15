import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Get OpenAI client (lazy initialization)
function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request) {
  try {
    // SECURITY: Check authentication to prevent API key abuse
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { text, targetLanguage, context } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const openai = getOpenAI();
    
    if (!openai) {
      // Return mock response if no API key
      return NextResponse.json({
        translatedText: `Title: [Translated Title in ${targetLanguage}]

Content: [This is a placeholder translation. Please add your OpenAI API key to the .env file to enable automatic translation.]

Original text: ${text.substring(0, 100)}...`,
      });
    }

    const systemPrompt = `You are a professional translator specializing in Ayurveda, wellness, and yoga content. 
Your task is to translate the given text from Chinese to English (or vice versa).
Maintain the original formatting, tone, and any markdown formatting.
Keep the structure with Title: and Content: sections.
Use appropriate terminology for Ayurvedic concepts.`;

    const userPrompt = `Translate the following text to ${targetLanguage}. 
Context: ${context || 'General wellness content'}

Text to translate:
${text}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translatedText = completion.choices[0]?.message?.content;

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}

