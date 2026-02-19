import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, emailCode, captchaId, captchaCode } = await request.json()

    // 验证必填字段
    if (!email || !password || !emailCode) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password and email verification code are required'
        }
      }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const supabase = await createClient()

    // 验证邮箱验证码
    const { data: emailCodeData, error: emailCodeError } = await adminClient
      .from('verification_codes')
      .select('*')
      .eq('code', emailCode)
      .eq('type', 'email')
      .eq('target', email)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (emailCodeError || !emailCodeData) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or expired email verification code'
        }
      }, { status: 400 })
    }

    // 标记邮箱验证码为已使用
    await adminClient
      .from('verification_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', emailCodeData.id)

    // 创建用户
    const { data: { user }, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        created_via: 'signup_api',
        email_verified_at: new Date().toISOString()
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

    // 自动登录用户
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      console.error('Auto sign-in error:', signInError)
      // 虽然登录失败，但用户已经创建成功，返回成功
      return NextResponse.json<ApiResponse<{ user: { id: string; email: string }; needsLogin: boolean }>>({
        success: true,
        data: {
          user: {
            id: user!.id,
            email: user!.email!
          },
          needsLogin: true
        }
      })
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