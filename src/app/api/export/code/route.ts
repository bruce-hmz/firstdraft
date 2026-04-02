import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
2. Responsive design using Tailwind CSS
3. Clear class names
4. No unnecessary comments
5. All content properly integrated

For React/Vue, use functional components and modern syntax.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional frontend developer. Convert product page content into clean, production-ready ${format} code.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
    });

    const code = response.choices[0].message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        code,
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
