import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: models, error } = await supabase
      .from('ai_models')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: models })
  } catch (error) {
    console.error('Get models error:', error)
    return NextResponse.json(
      { success: false, error: { message: '获取失败' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, provider, apiKey, baseUrl, modelId, description, isActive, isDefault } = body

    const supabase = await createClient()

    if (isDefault) {
      // 先取消其他默认模型
      const { error: updateError } = await supabase
        .from('ai_models')
        .update({ is_default: false })
        .eq('is_default', true)
      if (updateError) throw updateError
    }

    const { data: model, error } = await supabase
      .from('ai_models')
      .insert({
        name,
        provider,
        api_key: apiKey,
        base_url: baseUrl,
        model_id: modelId,
        description,
        is_active: isActive,
        is_default: isDefault,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: model })
  } catch (error) {
    console.error('Create model error:', error)
    return NextResponse.json(
      { success: false, error: { message: '创建失败' } },
      { status: 500 }
    )
  }
}
