import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    if (!idea || idea.trim().length < 5) {
      return NextResponse.json(
        { error: 'Idea is too short' },
        { status: 400 }
      );
    }

    // 分析用户想法并生成追问问题
    const prompt = `
You are an AI product consultant. Analyze the following product idea and generate 3-5 specific, actionable questions to help the user clarify their product concept.

The questions should focus on:
1. Target audience
2. Core features
3. Unique value proposition
4. Business model
5. Technical requirements

Product idea: "${idea}"

Return only the questions, each on a new line, numbered 1-5.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an AI product consultant who helps entrepreneurs clarify their product ideas by asking insightful questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
    });

    const questionsText = response.choices[0].message?.content || '';
    const questions = questionsText
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        // 移除数字编号
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        return cleaned;
      })
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        questions,
      },
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
