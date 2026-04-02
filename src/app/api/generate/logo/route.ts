import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productName, brandStyle = 'default' } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: 'Missing productName' },
        { status: 400 }
      );
    }

    // 生成 Logo 提示词
    const prompts = [
      `A modern, minimalist logo for "${productName}", clean design, professional, suitable for a tech startup`,
      `A creative logo for "${productName}", vibrant colors, playful, memorable`,
      `A sleek logo for "${productName}", professional, corporate style, timeless design`,
      `A unique logo for "${productName}", innovative, forward-thinking, suitable for a modern brand`,
      `A simple yet distinctive logo for "${productName}", easy to recognize, versatile`
    ];

    // 调用 OpenAI DALL-E 生成 Logo
    const logoPromises = prompts.map(async (prompt, index) => {
      try {
        const response = await openai.images.generate({
          prompt,
          n: 1,
          size: '1024x1024',
        });

        const imageUrl = response.data && response.data.length > 0 ? response.data[0].url : '';
        return {
          id: index + 1,
          url: imageUrl,
          prompt,
        };
      } catch (error) {
        console.error(`Error generating logo ${index + 1}:`, error);
        return null;
      }
    });

    const logoResults = await Promise.all(logoPromises);
    const validLogos = logoResults.filter((logo): logo is { id: number; url: string; prompt: string } => logo !== null);

    if (validLogos.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate logos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        logos: validLogos,
      },
    });
  } catch (error) {
    console.error('Error generating logos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
