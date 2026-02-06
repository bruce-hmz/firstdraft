import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsForIdea } from '@/lib/questions/preset'
import { GenerateQuestionsRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await request.json()
    const { idea } = body

    if (!idea || idea.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请输入有效的产品想法（至少5个字符）',
          },
        },
        { status: 400 }
      )
    }

    const questions = getQuestionsForIdea(idea)

    return NextResponse.json({
      success: true,
      data: {
        questions,
      },
    })
  } catch (error) {
    console.error('Generate questions error:', error)

    const message = error instanceof Error ? error.message : '生成问题失败，请稍后重试'

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AI_GENERATION_FAILED',
          message,
        },
      },
      { status: 500 }
    )
  }
}
