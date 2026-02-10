import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { generatePagePrompt, parseAIResponse } from '@/lib/prompts'
import { createAdminClient } from '@/lib/supabase'
import { createAIClient } from '@/lib/models/client'
import { GeneratePageRequest, PageContent } from '@/types'

async function getAIClient() {
  const supabase = await createAdminClient()
  
  const { data: model, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('is_active', true)
    .eq('is_default', true)
    .maybeSingle()

  if (error) throw error

  if (!model) {
    const { data: fallback, error: fallbackError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fallbackError) throw fallbackError
    if (!fallback) {
      throw new Error('未配置 AI 模型，请先前往管理后台配置')
    }
    return createAIClient({
      provider: fallback.provider,
      apiKey: fallback.api_key,
      baseUrl: fallback.base_url,
      modelId: fallback.model_id,
    })
  }

  return createAIClient({
    provider: model.provider,
    apiKey: model.api_key,
    baseUrl: model.base_url,
    modelId: model.model_id,
  })
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

    const client = await getAIClient()
    const prompt = generatePagePrompt(idea, answers)

    const content = await client.chatCompletion([
      {
        role: 'system',
        content: '你是一个专业的产品文案撰写专家和着陆页设计师。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.7,
      maxTokens: 2000,
    })

    if (!content) {
      throw new Error('AI响应为空')
    }

    const pageContent = parseAIResponse<PageContent>(content)

    return NextResponse.json({
      success: true,
      data: {
        page: pageContent,
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
