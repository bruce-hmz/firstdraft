import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendVerificationEmail } from '@/lib/email'

// 生成6位数字验证码
function generateEmailCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, captchaId, captchaCode } = body

    // 验证参数
    if (!email || !captchaId || !captchaCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 验证图形验证码
    const { data: captchaData, error: captchaError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('code', captchaCode.toUpperCase())
      .eq('type', 'captcha')
      .eq('target', captchaId)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (captchaError || !captchaData) {
      return NextResponse.json(
        { error: 'Invalid or expired captcha' },
        { status: 400 }
      )
    }

    // 标记图形验证码为已使用
    await supabase
      .from('verification_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', captchaData.id)

    // 检查发送频率限制（60秒内只能发送一次）
    const { data: recentCodes } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('type', 'email')
      .eq('target', email)
      .gt('created_at', new Date(Date.now() - 60 * 1000).toISOString())

    if (recentCodes && recentCodes.length > 0) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting a new code' },
        { status: 429 }
      )
    }

    // 生成邮箱验证码
    const emailCode = generateEmailCode()

    // 存储验证码（10分钟过期）
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        code: emailCode,
        type: 'email',
        target: email,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        metadata: {
          created_from: 'send_email_code_api',
          user_agent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        }
      })

    if (insertError) {
      console.error('Failed to store email code:', insertError)
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      )
    }

    // 发送邮件
    const emailResult = await sendVerificationEmail(email, emailCode, 10)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: emailResult.message
    })

  } catch (error) {
    console.error('Send email code error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
