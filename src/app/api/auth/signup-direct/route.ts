import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        created_via: 'admin_api'
      }
    })

    if (error) {
      console.error('Admin create user error:', error)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse<{ user: { id: string; email: string } }>>({
      success: true,
      data: {
        user: {
          id: user!.id,
          email: user!.email!
        }
      }
    })

  } catch (error) {
    console.error('Admin signup error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}