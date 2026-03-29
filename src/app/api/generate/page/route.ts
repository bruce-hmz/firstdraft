import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { generatePagePrompt, parseAIResponse } from '@/lib/prompts'
import { createAdminClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
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
    const body: GeneratePageRequest & { metadata?: { template?: string } } = await request.json()
    const { idea, answers, language = 'zh-CN', metadata } = body

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

    // 检查用户登录和额度
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    // 检查额度
    const { data: success, error: deductError } = await supabase.rpc('deduct_credits', {
      user_id: user.id,
      amount: 1,
    });

    if (deductError) {
      console.error('Deduct credits error:', deductError);
      return NextResponse.json(
        { success: false, error: { code: 'DEDUCT_FAILED', message: '额度扣减失败: ' + deductError.message } },
        { status: 500 }
      );
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'INSUFFICIENT_CREDITS', message: '额度不足，请充值后继续' } },
        { status: 400 }
      );
    }

    const client = await getAIClient()
    const prompt = generatePagePrompt(idea, answers, language)

    const systemPrompt = language === 'zh-CN'
      ? '你是一个专业的产品文案撰写专家和着陆页设计师。'
      : 'You are a professional product copywriter and landing page designer.';

    const content = await client.chatCompletion([
      {
        role: 'system',
        content: systemPrompt,
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
