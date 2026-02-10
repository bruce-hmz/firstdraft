import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()

    let result

    if (action === 'signup') {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
        }
      })
    } else {
      result = await supabase.auth.signInWithPassword({
        email,
        password
      })
    }

    if (result.error) {
      let errorCode = 'INTERNAL_ERROR'
      let errorMessage = result.error.message

      if (result.error.message.includes('Invalid login credentials')) {
        errorCode = 'UNAUTHORIZED'
        errorMessage = 'Invalid email or password'
      } else if (result.error.message.includes('User already registered')) {
        errorCode = 'VALIDATION_ERROR'
        errorMessage = 'Email already registered'
      }

      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        }
      }, { status: 400 })
    }

    if (action === 'signup' && !result.data.user?.email_confirmed_at) {
      return NextResponse.json<ApiResponse<{ needsConfirmation: boolean; email: string }>>({
        success: true,
        data: { needsConfirmation: true, email: result.data.user!.email! }
      })
    }

    return NextResponse.json<ApiResponse<{ user: { id: string; email: string } }>>({
      success: true,
      data: {
        user: {
          id: result.data.user!.id,
          email: result.data.user!.email!
        }
      }
    })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}