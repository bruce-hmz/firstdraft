import { NextRequest, NextResponse } from 'next/server';
import { getAIClient } from '@/lib/models/utils';

export async function POST(request: NextRequest) {
  try {
    const { idea, brandStyle = 'default' } = await request.json();

    if (!idea) {
      return NextResponse.json(
        { error: 'Missing idea' },
        { status: 400 }
      );
    }

    const aiClient = await getAIClient();

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
5. Solution section (how the product improves emotional well-being)
6. CTA (focused on emotional outcomes)

Format the response as a JSON object with these fields.
`;

    // 并行生成两个版本
    const [rationalContent, emotionalContent] = await Promise.all([
      aiClient.chatCompletion([
        {
          role: 'system',
          content: 'You are a professional copywriter specializing in product marketing.'
        },
        {
          role: 'user',
          content: rationalPrompt
        }
      ], {
        maxTokens: 2000
      }),
      aiClient.chatCompletion([
        {
          role: 'system',
          content: 'You are a professional copywriter specializing in emotional marketing.'
        },
        {
          role: 'user',
          content: emotionalPrompt
        }
      ], {
        maxTokens: 2000
      })
    ]);

    // 尝试解析 JSON
    try {
      const rationalData = JSON.parse(rationalContent);
      const emotionalData = JSON.parse(emotionalContent);

      return NextResponse.json({
        success: true,
        data: {
          versions: [
            {
              id: 'rational',
              name: 'Rational (Feature-focused)',
              description: 'Focuses on features, functionality, and practical benefits',
              content: rationalData
            },
            {
              id: 'emotional',
              name: 'Emotional (Experience-focused)',
              description: 'Focuses on user experience, emotional benefits, and storytelling',
              content: emotionalData
            }
          ]
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse generated content' },
        { status: 500 }
      );
    }


  } catch (error) {
    console.error('Error generating A/B versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
