import { NextRequest, NextResponse } from 'next/server';
import { getAIClient } from '@/lib/models/utils';

export async function POST(request: NextRequest) {
  try {
    const { pageContent } = await request.json();

    if (!pageContent) {
      return NextResponse.json(
        { error: 'Missing pageContent' },
        { status: 400 }
      );
    }

    const aiClient = await getAIClient();

    // 生成 SEO 优化内容
    const prompt = `
Given the following product page content, generate SEO-optimized meta tags, keywords, and SEO-friendly copy:

Product Name: ${pageContent.productName}
Tagline: ${pageContent.tagline}
Description: ${pageContent.description}

Problem Section:
${pageContent.problemSection.headline}
${pageContent.problemSection.description}

Solution Section:
${pageContent.solutionSection.headline}
${pageContent.solutionSection.description}

Features:
${pageContent.solutionSection.features.map((f: any) => f.title).join(', ')}

Generate:
1. Meta title (under 60 characters)
2. Meta description (under 160 characters)
3. 5-10 relevant keywords
4. SEO-friendly page title
5. SEO-friendly meta description

Format the response as a JSON object with these fields.
`;

    const seoText = await aiClient.chatCompletion([
      {
        role: 'system',
        content: 'You are an SEO specialist specializing in technical SEO and content optimization.'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      maxTokens: 1000
    });

    // 清理 AI 生成的内容，移除 markdown 代码块标记
    const cleanSeoText = seoText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // 尝试解析 JSON
    let seoContent;
    try {
      seoContent = JSON.parse(cleanSeoText);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse SEO content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: seoContent,
    });
  } catch (error) {
    console.error('Error optimizing SEO:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
