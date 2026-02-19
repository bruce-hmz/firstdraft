// 邮件发送工具
// 支持：Gmail SMTP、Resend

import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// 创建 Gmail SMTP 传输器
function createGmailTransporter() {
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS

  if (!SMTP_USER || !SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS, // Gmail 应用专用密码
    },
  })
}

// 使用 Gmail SMTP 发送邮件
async function sendWithGmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const transporter = createGmailTransporter()

  if (!transporter) {
    return { success: false, error: 'Gmail SMTP not configured' }
  }

  const SMTP_USER = process.env.SMTP_USER
  const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log('Email sent via Gmail:', info.messageId)
    return { success: true }
  } catch (error) {
    console.error('Gmail SMTP error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gmail SMTP error'
    }
  }
}

// 使用 Resend 发送邮件
async function sendWithResend(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY

  if (!RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  let fromEmail = process.env.EMAIL_FROM || 'FirstDraft <onboarding@resend.dev>'

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', errorText)

      if (errorText.includes('only send testing emails to your own email address')) {
        return {
          success: false,
          error: 'Resend 免费版只能发送到您自己的验证邮箱'
        }
      }

      if (errorText.includes('domain') && errorText.includes('not verified')) {
        return {
          success: false,
          error: '发件域名未验证'
        }
      }

      return { success: false, error: `Resend API error: ${errorText}` }
    }

    console.log('Email sent via Resend to:', options.to)
    return { success: true }
  } catch (error) {
    console.error('Failed to send email via Resend:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 开发环境的邮件日志
function logEmailForDev(options: EmailOptions): boolean {
  console.log('\n========================================')
  console.log('📧 Email (Development Mode)')
  console.log('========================================')
  console.log('To:', options.to)
  console.log('Subject:', options.subject)
  console.log('Content:', options.text || options.html)
  console.log('========================================\n')
  return true
}

// 发送验证码邮件
export async function sendVerificationEmail(
  email: string,
  code: string,
  expiresInMinutes: number = 10
): Promise<{ success: boolean; message: string }> {
  const subject = '您的验证码 - FirstDraft'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f9f9f9;
          border-radius: 10px;
          padding: 40px;
          margin: 20px 0;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #4F46E5;
          letter-spacing: 8px;
          text-align: center;
          padding: 20px;
          background: white;
          border-radius: 8px;
          margin: 30px 0;
        }
        .footer {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-top: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4F46E5;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">✨ FirstDraft</div>

        <h2>您好！</h2>
        <p>感谢您注册 FirstDraft。请使用以下验证码完成注册：</p>

        <div class="code">${code}</div>

        <p>此验证码将在 <strong>${expiresInMinutes} 分钟</strong> 后失效。</p>

        <p style="color: #999; font-size: 14px;">
          如果您没有请求此验证码，请忽略此邮件。
        </p>

        <div class="footer">
          <p>© ${new Date().getFullYear()} FirstDraft. All rights reserved.</p>
          <p>让每个想法都有一个体面的开始</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
您的验证码是：${code}

此验证码将在 ${expiresInMinutes} 分钟后失效。

如果您没有请求此验证码，请忽略此邮件。

© ${new Date().getFullYear()} FirstDraft
  `.trim()

  // 开发环境：只打印日志（没有任何邮件服务配置时）
  if (process.env.NODE_ENV === 'development' &&
      !process.env.SMTP_USER &&
      !process.env.RESEND_API_KEY) {
    logEmailForDev({ to: email, subject, html, text })
    return { success: true, message: 'Verification code logged to console (dev mode)' }
  }

  // 优先使用 Gmail SMTP
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const result = await sendWithGmail({ to: email, subject, html, text })
    if (result.success) {
      return { success: true, message: 'Verification code sent successfully via Gmail' }
    }
    // Gmail 失败，尝试 Resend
    console.log('Gmail failed, trying Resend...')
  }

  // 使用 Resend 作为备选
  if (process.env.RESEND_API_KEY) {
    const result = await sendWithResend({ to: email, subject, html, text })
    if (result.success) {
      return { success: true, message: 'Verification code sent successfully via Resend' }
    }
    return { success: false, message: result.error || 'Failed to send verification code' }
  }

  return { success: false, message: 'No email service configured' }
}
