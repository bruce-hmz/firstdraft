import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// 转换 snake_case -> camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj && typeof obj === 'object') {
    const newObj: any = {}
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      newObj[camelKey] = toCamelCase(obj[key])
    }
    return newObj
  }
  return obj
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, provider, apiKey, baseUrl, modelId, description, isActive, isDefault } = body

    const supabase = await createAdminClient()

    if (isDefault) {
      // 先取消其他默认模型
      const { error: updateError } = await supabase
        .from('ai_models')
        .update({ is_default: false })
        .eq('is_default', true)
        .neq('id', id)
      if (updateError) throw updateError
    }

    const { data: model, error } = await supabase
      .from('ai_models')
      .update({
        name,
        provider,
        api_key: apiKey,
        base_url: baseUrl,
        model_id: modelId,
        description,
        is_active: isActive,
        is_default: isDefault,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: toCamelCase(model) })
  } catch (error) {
    console.error('Update model error:', error)
    return NextResponse.json(
      { success: false, error: { message: '更新失败' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete model error:', error)
    return NextResponse.json(
      { success: false, error: { message: '删除失败' } },
      { status: 500 }
    )
  }
}
