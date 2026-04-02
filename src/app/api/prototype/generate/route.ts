import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { pageContent } = await request.json();

    if (!pageContent) {
      return NextResponse.json(
        { error: 'Missing pageContent' },
        { status: 400 }
      );
    }

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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a UX designer specializing in interactive prototypes. Create a detailed interactive prototype specification.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
    });

    const prototypeText = response.choices[0].message?.content || '';

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
