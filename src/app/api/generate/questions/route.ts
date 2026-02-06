import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { nanoid } from 'nanoid'
import { generateQuestionsPrompt, parseAIResponse } from '@/lib/prompts'
import { GenerateQuestionsRequest, GenerateQuestionsResponse } from '@/types'
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
