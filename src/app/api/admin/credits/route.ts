import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase'

/**
 * POST /api/admin/credits
 * 给用户充值额度（管理员权限）
 * Body: { userId: string, amount: number }
 */
export async function POST(req: NextRequest) {
  try {
    // 验证管理员权限
    const { isAdmin, error } = await verifyAdmin(req)
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { message: error || 'Forbidden' } },
        { status: 403 }
      )
    }
    
    // 解析请求体
    const body = await req.json()
    const { userId, amount } = body
    
    // 验证参数
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid userId or amount' } },
        { status: 400 }
      )
    }
    
    const supabase = await createAdminClient()
    
    // 调用 admin_add_credits 函数
    const { error: rpcError } = await supabase.rpc('admin_add_credits', {
      target_user_id: userId,
      amount: amount
    })
    
    if (rpcError) {
      console.error('Admin add credits error:', rpcError)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to add credits: ' + rpcError.message } },
        { status: 500 }
      )
    }
    
    // 获取更新后的用户信息
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('remaining_credits, generation_count, save_count')
      .eq('user_id', userId)
      .single()
    
    if (statsError) {
      console.error('Error getting updated stats:', statsError)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        addedAmount: amount,
        newBalance: stats?.remaining_credits ?? amount,
        generationCount: stats?.generation_count ?? 0,
        saveCount: stats?.save_count ?? 0,
      }
    })
    
  } catch (error) {
    console.error('Admin credits API error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
