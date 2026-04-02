import { NextRequest, NextResponse } from 'next/server';
import { getAIClient } from '@/lib/models/utils';

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    if (!idea || idea.trim().length < 5) {
      return NextResponse.json(
        { error: 'Idea is too short' },
        { status: 400 }
      );
    }

    const aiClient = await getAIClient();

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

    const questionsText = await aiClient.chatCompletion([
      {
        role: 'system',
        content: 'You are an AI product consultant who helps entrepreneurs clarify their product ideas by asking insightful questions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      maxTokens: 500
    });
    const questions = questionsText
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => {
        // 移除数字编号
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        return cleaned;
      })
      .filter((q: string) => q.length > 0)
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
