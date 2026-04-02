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

    // 生成各平台的宣发文案
    const platforms = ['twitter', 'xiaohongshu', 'jike'];
    const copyPromises = platforms.map(async (platform) => {
      let prompt = '';
      
      switch (platform) {
        case 'twitter':
          prompt = `
Generate a concise, engaging Twitter/X post for the following product:

Product Name: ${pageContent.productName}
Tagline: ${pageContent.tagline}
Description: ${pageContent.description}

Key features: ${pageContent.solutionSection.features.map((f: any) => f.title).join(', ')}

The post should:
1. Be under 280 characters
2. Include a compelling hook
3. Highlight the key benefit
4. Include relevant hashtags
5. End with a call to action
`;
          break;
        case 'xiaohongshu':
          prompt = `
Generate a lively, visually descriptive Xiaohongshu (Little Red Book) post for the following product:

Product Name: ${pageContent.productName}
Tagline: ${pageContent.tagline}
Description: ${pageContent.description}

Key features: ${pageContent.solutionSection.features.map((f: any) => f.title).join(', ')}

The post should:
1. Be engaging and visually descriptive
2. Include emoji to make it lively
3. Highlight the product's unique features
4. Include a personal experience or scenario
5. End with a call to action
`;
          break;
        case 'jike':
          prompt = `
Generate a concise, insightful Jike (即刻) post for the following product:

Product Name: ${pageContent.productName}
Tagline: ${pageContent.tagline}
Description: ${pageContent.description}

Key features: ${pageContent.solutionSection.features.map((f: any) => f.title).join(', ')}

The post should:
1. Be concise and to the point
2. Highlight the product's unique value
3. Include a thought-provoking angle
4. Be relatable to tech-savvy users
5. End with a call to action
`;
          break;
      }

      const copy = await aiClient.chatCompletion([
        {
          role: 'system',
          content: 'You are a social media copywriter specializing in tech products.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        maxTokens: 500
      });

      return {
        platform,
        copy
      };
    });

    const copyResults = await Promise.all(copyPromises);

    return NextResponse.json({
      success: true,
      data: {
        copies: copyResults
      },
    });
  } catch (error) {
    console.error('Error generating promotion copies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
