import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { nanoid } from 'nanoid'
import { generateQuestionsPrompt, parseAIResponse } from '@/lib/prompts'
import { GenerateQuestionsRequest, GenerateQuestionsResponse } from '@/types'
import { prisma } from '@/lib/prisma'

async function getOpenAIClient() {
  const model = await prisma.aIModel.findFirst({
    where: { isActive: true, isDefault: true },
  })

  if (!model) {
    const fallback = await prisma.aIModel.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    if (!fallback) {
      throw new Error('未配置 AI 模型，请先前往管理后台配置')
    }
    return createClient(fallback)
  }

  return createClient(model)
}

function createClient(model: { provider: string; apiKey: string; baseUrl: string | null; modelId: string }) {
  if (model.provider === 'openai' || model.provider === 'custom') {
    return {
      client: new OpenAI({
        apiKey: model.apiKey,
        baseURL: model.baseUrl || undefined,
      }),
      modelId: model.modelId,
    }
  }

  throw new Error(`不支持的模型提供商: ${model.provider}`)
}

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

    const { client: openai, modelId } = await getOpenAIClient()
    const prompt = generateQuestionsPrompt(idea)

    const completion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的产品经理和创业顾问，擅长帮助用户澄清产品想法。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('AI响应为空')
    }

    const parsed = parseAIResponse<{ questions: GenerateQuestionsResponse['questions'] }>(content)

    return NextResponse.json({
      success: true,
      data: {
        questions: parsed.questions,
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
