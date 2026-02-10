import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        }
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse<{ id: string; email: string }>>({
      success: true,
      data: {
        id: user.id,
        email: user.email!
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}