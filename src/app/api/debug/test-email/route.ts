import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

// 测试邮件发送 API
// 使用方法: GET /api/debug/test-email?email=your@email.com

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({
        error: 'Email parameter required',
        usage: 'GET /api/debug/test-email?email=your@email.com'
      }, { status: 400 })
    }

    // 检查配置
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const resendApiKey = process.env.RESEND_API_KEY

    // 生成测试验证码
    const testCode = Math.floor(100000 + Math.random() * 900000).toString()

    console.log(`Testing email send to: ${email}`)
    console.log(`Gmail SMTP configured: ${!!(smtpUser && smtpPass)}`)
    console.log(`Resend configured: ${!!resendApiKey}`)

    // 发送邮件
    const result = await sendVerificationEmail(email, testCode, 10)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully!',
        details: {
          to: email,
          code: testCode,
          service: smtpUser ? 'Gmail SMTP' : 'Resend',
          note: 'Check your inbox (and spam folder)'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        details: {
          gmailConfigured: !!(smtpUser && smtpPass),
          resendConfigured: !!resendApiKey
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
