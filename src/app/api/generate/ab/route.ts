import { NextRequest, NextResponse } from 'next/server';
import { getAIClient } from '@/lib/models/utils';

export async function POST(request: NextRequest) {
  try {
    const { idea, brandStyle = 'default', language = 'zh-CN' } = await request.json();

    if (!idea) {
      return NextResponse.json(
        { error: 'Missing idea' },
        { status: 400 }
      );
    }

    const aiClient = await getAIClient();

    // 根据语言生成对应提示词
    let rationalPrompt, emotionalPrompt;
    
    if (language === 'zh-CN') {
      // 中文提示词
      rationalPrompt = `
生成一个专注于理性功能和实用性的产品页面文案，基于以下想法：

"${idea}"

品牌风格：${brandStyle}

包含：
1. 产品名称
2. 标语（专注于功能优势）
3. 描述（强调技术特性和实用价值）
4. 问题部分（具体痛点和逻辑解决方案）
5. 解决方案部分（详细功能和技术规格）
6. 行动号召（专注于实际成果）

请以JSON对象格式返回这些字段。
`;
      
      emotionalPrompt = `
生成一个专注于情感吸引力和用户体验的产品页面文案，基于以下想法：

"${idea}"

品牌风格：${brandStyle}

包含：
1. 产品名称
2. 标语（唤起情感共鸣）
3. 描述（强调用户体验和情感收益）
4. 问题部分（情感痛点和产品如何让用户感受）
5. 解决方案部分（产品如何改善情感状态）
6. 行动号召（专注于情感成果）

请以JSON对象格式返回这些字段。
`;
    } else {
      // 英文提示词
      rationalPrompt = `
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
      
      emotionalPrompt = `
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
    }

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

    // 清理 AI 生成的内容，移除 markdown 代码块标记
    const cleanContent = (content: string) => {
      // 移除 markdown 代码块标记
      let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      // 移除开头和结尾的空白
      cleaned = cleaned.trim();
      return cleaned;
    };

    const cleanRationalContent = cleanContent(rationalContent);
    const cleanEmotionalContent = cleanContent(emotionalContent);

    // 尝试解析 JSON
    try {
      const rationalData = JSON.parse(cleanRationalContent);
      const emotionalData = JSON.parse(cleanEmotionalContent);

      return NextResponse.json({
        success: true,
        data: {
          versions: [
            {
              id: 'rational',
              name: language === 'zh-CN' ? '理性版（功能导向）' : 'Rational (Feature-focused)',
              description: language === 'zh-CN' ? '专注于功能、实用性和实际收益' : 'Focuses on features, functionality, and practical benefits',
              content: rationalData
            },
            {
              id: 'emotional',
              name: language === 'zh-CN' ? '感性版（体验导向）' : 'Emotional (Experience-focused)',
              description: language === 'zh-CN' ? '专注于用户体验、情感收益和故事讲述' : 'Focuses on user experience, emotional benefits, and storytelling',
              content: emotionalData
            }
          ]
        },
      });
    } catch (error) {
      // 尝试提取有效的 JSON 部分
      try {
        const rationalClean = cleanRationalContent.replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, '$1');
        const emotionalClean = cleanEmotionalContent.replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, '$1');
        
        const rationalData = JSON.parse(rationalClean);
        const emotionalData = JSON.parse(emotionalClean);
        
        return NextResponse.json({
          success: true,
          data: {
            versions: [
              {
                id: 'rational',
                name: language === 'zh-CN' ? '理性版（功能导向）' : 'Rational (Feature-focused)',
                description: language === 'zh-CN' ? '专注于功能、实用性和实际收益' : 'Focuses on features, functionality, and practical benefits',
                content: rationalData
              },
              {
                id: 'emotional',
                name: language === 'zh-CN' ? '感性版（体验导向）' : 'Emotional (Experience-focused)',
                description: language === 'zh-CN' ? '专注于用户体验、情感收益和故事讲述' : 'Focuses on user experience, emotional benefits, and storytelling',
                content: emotionalData
              }
            ]
          },
        });
      } catch (cleanError) {
        return NextResponse.json(
          { error: 'Failed to parse generated content' },
          { status: 500 }
        );
      }
    }


  } catch (error) {
    console.error('Error generating A/B versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
