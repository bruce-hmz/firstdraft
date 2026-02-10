import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    const { data: tableInfo } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'pages')
      .in('column_name', ['id', 'title', 'user_id', 'anonymous_id', 'created_at'])
      .order('ordinal_position')

    return NextResponse.json({
      table_columns: tableInfo,
      message: "用户数据存储在 Supabase 的 auth.users 表中"
    })

  } catch (error) {
    console.error('Table info error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}