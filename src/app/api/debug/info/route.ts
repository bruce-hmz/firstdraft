import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 10
    })
    
    if (usersError) {
      console.error('List users error:', usersError)
    }

    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, title, user_id, anonymous_id, created_at')
      .limit(5)

    if (pagesError) {
      console.error('List pages error:', pagesError)
    }

    return NextResponse.json({
      users: users?.users?.map(u => ({
        id: u.id,
        email: u.email,
        email_confirmed: !!u.email_confirmed_at,
        created_at: u.created_at
      })) || [],
      pages: pages || [],
      database_info: {
        users_count: users?.users?.length || 0,
        pages_count: pages?.length || 0,
        pages_with_user: pages?.filter(p => p.user_id)?.length || 0,
        pages_with_anonymous: pages?.filter(p => p.anonymous_id)?.length || 0
      }
    })

  } catch (error) {
    console.error('Debug info error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}