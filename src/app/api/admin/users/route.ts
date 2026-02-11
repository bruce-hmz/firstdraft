import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase'

/**
 * GET /api/admin/users?email=xxx
 * 查询用户信息（管理员权限）
 */
export async function GET(req: NextRequest) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await verifyAdmin(req)
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { message: error || 'Forbidden' } },
        { status: 403 }
      )
    }
    
    // 获取查询参数
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: 'Email is required' } },
        { status: 400 }
      )
    }
    
    const supabase = await createAdminClient()
    
    // 从 auth.users 查找用户
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error listing users:', userError)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to query users' } },
        { status: 500 }
      )
    }
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }
    
    // 获取用户统计信息
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('remaining_credits, generation_count, save_count')
      .eq('user_id', user.id)
      .single()
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        remainingCredits: stats?.remaining_credits ?? 3,
        generationCount: stats?.generation_count ?? 0,
        saveCount: stats?.save_count ?? 0,
      }
    })
    
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
