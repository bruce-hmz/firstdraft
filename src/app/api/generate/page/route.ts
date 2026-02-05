import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { nanoid } from 'nanoid'
import { generatePagePrompt, parseAIResponse } from '@/lib/prompts'
import { GeneratePageRequest, PageContent } from '@/types'
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
    const body: GeneratePageRequest = await request.json()
    const { idea, answers } = body

    if (!idea || idea.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请输入有效的产品想法',
          },
        },
        { status: 400 }
      )
    }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请回答问题以生成页面',
          },
        },
        { status: 400 }
      )
    }

    const { client: openai, modelId } = await getOpenAIClient()
    const prompt = generatePagePrompt(idea, answers)

    const completion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的产品文案撰写专家和着陆页设计师。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('AI响应为空')
    }

    const pageContent = parseAIResponse<PageContent>(content)
    const projectId = `proj_${nanoid(10)}`
    const slug = nanoid(8)
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${slug}`

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        page: pageContent,
        shareUrl,
        isPro: false,
      },
    })
  } catch (error) {
    console.error('Generate page error:', error)

    const message = error instanceof Error ? error.message : '生成页面失败，请稍后重试'

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
