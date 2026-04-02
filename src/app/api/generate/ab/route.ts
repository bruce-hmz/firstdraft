import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { idea, brandStyle = 'default' } = await request.json();

    if (!idea) {
      return NextResponse.json(
        { error: 'Missing idea' },
        { status: 400 }
      );
    }

    // 生成理性版本文案
    const rationalPrompt = `
Generate a product page copy focused on rational features and functionality for the following idea:

"${idea}"

Brand style: ${brandStyle}

Include:
1. Product name
2. Tagline (focused on functional benefits)
3. Description (emphasizing technical features and practical value)
4. Problem section (specific pain points and logical solutions)
5. Solution section (detailed features with technical specifications)
6. CTA (focused on practical outcomes)

Format the response as a JSON object with these fields.
`;

    // 生成感性版本文案
    const emotionalPrompt = `
Generate a product page copy focused on emotional appeal and user experience for the following idea:

"${idea}"

Brand style: ${brandStyle}

Include:
1. Product name
2. Tagline (evoking emotional response)
3. Description (emphasizing user experience and emotional benefits)
4. Problem section (emotional pain points and how the product makes users feel)
5. Solution section (features presented through emotional benefits)
6. CTA (focused on emotional outcomes)

Format the response as a JSON object with these fields.
`;

    // 并行生成两个版本
    const [rationalResponse, emotionalResponse] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional copywriter specializing in rational, feature-focused product descriptions.'
          },
          {
            role: 'user',
            content: rationalPrompt
          }
        ],
        max_tokens: 2000,
      }),
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional copywriter specializing in emotional, user-centered product descriptions.'
          },
          {
            role: 'user',
            content: emotionalPrompt
          }
        ],
        max_tokens: 2000,
      })
    ]);

    // 解析响应
    const rationalText = rationalResponse.choices[0].message?.content || '';
    const emotionalText = emotionalResponse.choices[0].message?.content || '';

    // 尝试解析 JSON
    let rationalContent, emotionalContent;
    try {
      rationalContent = JSON.parse(rationalText);
      emotionalContent = JSON.parse(emotionalText);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse generated content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        versions: [
          {
            id: 'rational',
            name: 'Rational (Feature-focused)',
            description: 'Focuses on features, functionality, and practical benefits',
            content: rationalContent
          },
          {
            id: 'emotional',
            name: 'Emotional (Experience-focused)',
            description: 'Focuses on user experience, emotional benefits, and storytelling',
            content: emotionalContent
          }
        ]
      },
    });
  } catch (error) {
    console.error('Error generating A/B versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
