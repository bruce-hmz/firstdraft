import { NextRequest, NextResponse } from 'next/server'
import { sendMarketingEmail } from '@/lib/marketing-email'

// POST /api/marketing/email - 发送营销邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, userName, templateId, variables } = body

    if (!to || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, templateId' },
        { status: 400 }
      )
    }

    const result = await sendMarketingEmail({
      to,
      userName,
      templateId,
      variables
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Marketing email error:', error)
    return NextResponse.json(
      { error: 'Failed to send marketing email' },
      { status: 500 }
    )
  }
}

// GET /api/marketing/email/templates - 获取可用模板列表
export async function GET() {
  const templates = [
    { id: 'welcome', name: '欢迎邮件', description: '注册后立即发送' },
    { id: 'tips', name: '功能引导', description: '24小时后发送' },
    { id: 'conversion', name: '转化优惠', description: '72小时后发送' }
  ]

  return NextResponse.json({ templates })
}
