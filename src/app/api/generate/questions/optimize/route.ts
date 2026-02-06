import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { createAIClient } from '@/lib/models/client'
import { generateQuestionsPrompt, parseAIResponse } from '@/lib/prompts'
import { Question } from '@/lib/questions/preset'

const CACHE = new Map<string, { questions: Question[]; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60

function getCachedQuestions(idea: string): Question[] | null {
  const cached = CACHE.get(idea)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.questions
  }
  return null
}

function setCachedQuestions(idea: string, questions: Question[]) {
  CACHE.set(idea, { questions, timestamp: Date.now() })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idea } = body

    if (!idea || idea.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: { message: '想法太短' } },
        { status: 400 }
      )
    }

    const cached = getCachedQuestions(idea)
    if (cached) {
      return NextResponse.json({ success: true, data: { questions: cached } })
    }

    const supabase = await createAdminClient()
    const { data: model, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .eq('is_default', true)
      .maybeSingle()

    if (error || !model) {
      return NextResponse.json(
        { success: false, error: { message: '未配置AI模型' } },
        { status: 500 }
      )
    }

    const client = createAIClient({
      provider: model.provider,
      apiKey: model.api_key,
      baseUrl: model.base_url,
      modelId: model.model_id,
    })

    const prompt = generateQuestionsPrompt(idea)

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 3000)
    })

    const aiPromise = client.chatCompletion([
      { role: 'system', content: '你是专业的产品经理和创业顾问。' },
      { role: 'user', content: prompt },
    ], { temperature: 0.7, maxTokens: 1000 })

    const content = await Promise.race([aiPromise, timeoutPromise])

    if (!content) {
      throw new Error('AI响应为空')
    }

    const parsed = parseAIResponse<{ questions: Question[] }>(content)
    setCachedQuestions(idea, parsed.questions)

    return NextResponse.json({ success: true, data: { questions: parsed.questions } })
  } catch (error) {
    console.error('AI优化问题失败:', error)
    return NextResponse.json(
      { success: false, error: { message: '优化超时，请使用当前问题' } },
      { status: 200 }
    )
  }
}
