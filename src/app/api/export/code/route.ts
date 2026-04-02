import { NextRequest, NextResponse } from 'next/server';
import { getAIClient } from '@/lib/models/utils';

export async function POST(request: NextRequest) {
  try {
    const { pageContent, format } = await request.json();

    if (!pageContent || !format) {
      return NextResponse.json(
        { error: 'Missing pageContent or format' },
        { status: 400 }
      );
    }

    if (!['html', 'react', 'vue'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use html, react, or vue.' },
        { status: 400 }
      );
    }

    const aiClient = await getAIClient();

    // 生成代码
    const prompt = `
Convert the following product page content into ${format.toUpperCase()} code:

Product Name: ${pageContent.productName}
Tagline: ${pageContent.tagline}
Description: ${pageContent.description}

Problem Section:
Headline: ${pageContent.problemSection.headline}
Description: ${pageContent.problemSection.description}
Pain Points: ${pageContent.problemSection.painPoints.join(', ')}

Solution Section:
Headline: ${pageContent.solutionSection.headline}
Description: ${pageContent.solutionSection.description}
Features:
${pageContent.solutionSection.features.map((f: any) => `  - ${f.title}: ${f.description}`).join('\n')}

CTA Section:
Text: ${pageContent.ctaSection.text}
Subtext: ${pageContent.ctaSection.subtext || ''}

Generate clean, production-ready ${format} code with:
1. Proper structure and indentation
2. Modern best practices
3. Responsive design
4. Clear comments
5. No external dependencies

Format the response as a JSON object with a 'code' field containing the generated code.
`;

    const codeText = await aiClient.chatCompletion([
      {
        role: 'system',
        content: 'You are a professional web developer specializing in clean, efficient code.'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      maxTokens: 4000
    });

    // 清理 AI 生成的内容，移除 markdown 代码块标记
    const cleanCodeText = codeText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    return NextResponse.json({
      success: true,
      data: {
        code: cleanCodeText,
        format,
      },
    });
  } catch (error) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
