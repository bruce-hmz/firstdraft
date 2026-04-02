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

    // 生成交互式原型
    const prompt = `
Create an interactive prototype for the following product page:

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

CTA Section:
${pageContent.ctaSection.text}

Generate a JSON object with:
1. Interactive elements (buttons, links, etc.)
2. Navigation flow between sections
3. Mock interactions for buttons
4. Animation effects
5. Responsive design breakpoints

Format the response as a JSON object.
`;

    const prototypeText = await aiClient.chatCompletion([
      {
        role: 'system',
        content: 'You are a UX/UI designer specializing in interactive prototypes.'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      maxTokens: 2000
    });

    // 尝试解析 JSON
    let prototypeContent;
    try {
      prototypeContent = JSON.parse(prototypeText);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse prototype content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prototypeContent,
    });
  } catch (error) {
    console.error('Error generating prototype:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
