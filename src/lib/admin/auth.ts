import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export const ADMIN_EMAIL = '123387447@qq.com'

export interface User {
  id: string
  email: string
}

/**
 * 检查用户是否是管理员
 * 优先检查硬编码邮箱，其次检查 user_stats.is_admin 字段
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createAdminClient()
  
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
  
  if (authError || !authUser.user) {
    console.error('Error getting user by id:', authError)
    return false
  }
  
  // 硬编码邮箱检查
  if (authUser.user.email === ADMIN_EMAIL) {
    return true
  }
  
  // 数据库字段检查
  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('is_admin')
    .eq('user_id', userId)
    .single()
  
  if (statsError) {
    return false
  }
  
  return stats?.is_admin === true
}

/**
 * 验证请求的用户是否是管理员
 * 返回用户信息和是否管理员
 */
export async function verifyAdmin(req: NextRequest): Promise<{user: User | null, isAdmin: boolean, error?: string}> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, isAdmin: false, error: 'Unauthorized' }
    }
    
    const userData: User = {
      id: user.id,
      email: user.email!
    }
    
    const adminStatus = await isAdmin(user.id)
    
    return {
      user: userData,
      isAdmin: adminStatus
    }
  } catch (error) {
    console.error('Verify admin error:', error)
    return { user: null, isAdmin: false, error: 'Internal error' }
  }
}
