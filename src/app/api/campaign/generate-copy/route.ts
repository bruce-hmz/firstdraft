import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { pageContent } = await request.json();

    if (!pageContent) {
      return NextResponse.json(
        { error: 'Missing pageContent' },
        { status: 400 }
      );
    }

    // 检查 API 密钥
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
1. Start with an eye-catching headline
2. Include emojis and vivid descriptions
3. Share a relatable scenario
4. Highlight the product's benefits
5. End with a call to action
`;
          break;
        case 'jike':
          prompt = `
Generate a casual, conversational post for Jike (即刻) about the following product:

Product Name: ${pageContent.productName}
Tagline: ${pageContent.tagline}
Description: ${pageContent.description}

Key features: ${pageContent.solutionSection.features.map((f: any) => f.title).join(', ')}

The post should:
1. Be friendly and approachable
2. Share a personal experience or observation
3. Highlight the product's unique value
4. Include a question to encourage engagement
5. End with a call to action
`;
          break;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a social media marketing expert specializing in ${platform}. Generate engaging, platform-specific content.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
      });

      return {
        platform,
        copy: response.choices[0].message?.content || ''
      };
    });

    const copies = await Promise.all(copyPromises);

    return NextResponse.json({
      success: true,
      data: {
        copies
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
