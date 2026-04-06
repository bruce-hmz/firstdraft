import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/drafts`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      }
    })

    if (error) {
      console.error('Magic link error:', error)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: error.message
        }
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse<{ email: string }>>({
      success: true,
      data: { email }
    })

  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}
