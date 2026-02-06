import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { nanoid } from 'nanoid'
import { generatePagePrompt, parseAIResponse } from '@/lib/prompts'
import { GeneratePageRequest, PageContent } from '@/types'
import { createClient as createSupabase } from '@/lib/supabase/server'

interface AIModel {
  id: string
  provider: string
  api_key: string
  base_url: string | null
  model_id: string
  is_active: boolean
  is_default: boolean
  created_at: string
}

async function getOpenAIClient() {
  const supabase = await createSupabase()
  
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
    return createAIClient(fallback)
  }

  return createAIClient(model)
}

function createAIClient(model: AIModel) {
  if (model.provider === 'openai' || model.provider === 'custom') {
    return {
      client: new OpenAI({
        apiKey: model.api_key,
        baseURL: model.base_url || undefined,
      }),
      modelId: model.model_id,
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
