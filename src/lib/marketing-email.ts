// 营销邮件自动化服务
// 支持欢迎序列、功能引导、转化优惠等

import { sendWithSmtp, sendWithResend } from './email'

export interface MarketingEmailData {
  to: string
  userName?: string
  templateId: string
  variables?: Record<string, string>
}

// 邮件模板
const EMAIL_TEMPLATES = {
  // 欢迎邮件 - 注册后立即发送
  welcome: {
    subject: '欢迎来到 FirstDraft 🎉',
    getHtml: (vars: Record<string, string>) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; border-radius: 10px; padding: 40px; margin: 20px 0; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          .footer { font-size: 14px; color: #666; text-align: center; margin-top: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 20px; }
          .highlight { background: #EEF2FF; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ FirstDraft</div>
          <h2>Hi ${vars.name || 'there'}!</h2>
          <p>欢迎加入 FirstDraft！</p>
          <p>你现在离验证你的产品想法只差 <strong>3 分钟</strong>。</p>

          <div class="highlight">
            <strong>🚀 快速开始：</strong>
            <ol>
              <li>访问 <a href="https://firstdraft.work">firstdraft.work</a></li>
              <li>输入你的产品想法</li>
              <li>回答 AI 的几个问题</li>
              <li>获得你的第一个产品页</li>
            </ol>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="https://firstdraft.work" class="button">立即开始 →</a>
          </p>

          <div class="highlight">
            <strong>🎁 新用户福利</strong><br>
            使用优惠码 <code>FIRST10</code> 享首次购买 9 折优惠
          </div>

          <p>有任何问题，直接回复这封邮件，我会亲自回复。</p>
          <p>祝你创造愉快！</p>

          <div class="footer">
            <p>© ${new Date().getFullYear()} FirstDraft</p>
            <p>把一个模糊的想法，变成真实存在的第一稿</p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (vars: Record<string, string>) => `
Hi ${vars.name || 'there'}!

欢迎加入 FirstDraft！

你现在离验证你的产品想法只差 3 分钟。

🚀 快速开始：
1. 访问 firstdraft.work
2. 输入你的产品想法
3. 回答 AI 的几个问题
4. 获得你的第一个产品页

🎁 新用户福利：使用优惠码 FIRST10 享首次购买 9 折优惠

有任何问题，直接回复这封邮件。

© ${new Date().getFullYear()} FirstDraft
    `.trim()
  },

  // 功能引导 - 24小时后
  tips: {
    subject: '用这 3 招让你的落地页更吸引人 ✨',
    getHtml: (vars: Record<string, string>) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; border-radius: 10px; padding: 40px; margin: 20px 0; }
          .tip { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4F46E5; }
          .footer { font-size: 14px; color: #666; text-align: center; margin-top: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ FirstDraft</div>
          <h2>Hi ${vars.name || 'there'}!</h2>
          <p>你生成你的第一个产品页了吗？</p>
          <p>今天分享 3 个让落地页更吸引人的技巧：</p>

          <div class="tip">
            <strong>1. 明确目标用户</strong><br>
            "这是一个帮助 [谁] 解决 [什么问题] 的产品"<br>
            <em>越具体越好。</em>
          </div>

          <div class="tip">
            <strong>2. 突出核心价值</strong><br>
            不要说功能，说好处。<br>
            ❌ "支持多 AI 模型"<br>
            ✅ "选你最顺手的 AI，怎么聊都行"
          </div>

          <div class="tip">
            <strong>3. 行动号召</strong><br>
            告诉用户下一步该做什么。<br>
            "免费试试" "立即开始" "了解更多"
          </div>

          <p><strong>💡 小技巧：</strong>FirstDraft 的 AI 已经帮你优化了这些，但你可以根据反馈继续调整。</p>
          <p>明天我会分享一些成功案例，看看别人是怎么用 FirstDraft 的。</p>
          <p>Stay tuned!</p>

          <div class="footer">
            <p>© ${new Date().getFullYear()} FirstDraft</p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (vars: Record<string, string>) => `
Hi ${vars.name || 'there'}!

你生成你的第一个产品页了吗？

今天分享 3 个让落地页更吸引人的技巧：

1. 明确目标用户
"这是一个帮助 [谁] 解决 [什么问题] 的产品"
越具体越好。

2. 突出核心价值
不要说功能，说好处。
❌ "支持多 AI 模型"
✅ "选你最顺手的 AI，怎么聊都行"

3. 行动号召
告诉用户下一步该做什么。

💡 小技巧：FirstDraft 的 AI 已经帮你优化了这些，但你可以根据反馈继续调整。

© ${new Date().getFullYear()} FirstDraft
    `.trim()
  },

  // 转化优惠 - 72小时后
  conversion: {
    subject: '🎁 限时优惠：48小时内额外 20% off',
    getHtml: (vars: Record<string, string>) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; border-radius: 10px; padding: 40px; margin: 20px 0; }
          .coupon { background: #4F46E5; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .coupon code { font-size: 28px; font-weight: bold; letter-spacing: 4px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          .footer { font-size: 14px; color: #666; text-align: center; margin-top: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 20px; }
          .pricing { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ FirstDraft</div>
          <h2>Hi ${vars.name || 'there'}!</h2>
          <p>你还没有升级到付费版吗？</p>

          <p><strong>限时优惠：</strong></p>
          <p>48小时内使用优惠码 <strong>额外 20% off</strong>（可叠加新用户折扣）</p>

          <div class="coupon">
            <p>优惠码</p>
            <code>FLASH20</code>
          </div>

          <h3>付费版权益：</h3>
          <ul>
            <li>✅ 10-200 次生成额度</li>
            <li>✅ 保存多个草稿</li>
            <li>✅ 访问统计分析</li>
            <li>✅ 优先客服支持</li>
          </ul>

          <h3>为什么升级？</h3>
          <div class="pricing">
            <strong>入门版 ¥9.9</strong> = 一杯奶茶钱验证一个想法<br>
            <strong>专业版 ¥39.9</strong> = 验证 50 个想法（每个 ¥0.8）<br>
            <strong>无限版 ¥129</strong> = 验证 200 个想法（每个 ¥0.65）
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="https://firstdraft.work/pricing" class="button">立即升级 →</a>
          </p>

          <p style="color: #999;">优惠 48 小时后失效。</p>

          <div class="footer">
            <p>© ${new Date().getFullYear()} FirstDraft</p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (vars: Record<string, string>) => `
Hi ${vars.name || 'there'}!

你还没有升级到付费版吗？

🎁 限时优惠：
48小时内使用优惠码 FLASH20 额外 20% off

付费版权益：
✅ 10-200 次生成额度
✅ 保存多个草稿
✅ 访问统计分析
✅ 优先客服支持

为什么升级？
入门版 ¥9.9 = 一杯奶茶钱验证一个想法
专业版 ¥39.9 = 验证 50 个想法
无限版 ¥129 = 验证 200 个想法

👉 立即升级: firstdraft.work/pricing
优惠码: FLASH20

© ${new Date().getFullYear()} FirstDraft
    `.trim()
  }
}

// 发送营销邮件
export async function sendMarketingEmail(data: MarketingEmailData): Promise<{ success: boolean; error?: string }> {
  const template = EMAIL_TEMPLATES[data.templateId as keyof typeof EMAIL_TEMPLATES]

  if (!template) {
    return { success: false, error: `Template not found: ${data.templateId}` }
  }

  const vars = data.variables || {}
  if (data.userName) {
    vars.name = data.userName
  }

  const emailOptions = {
    to: data.to,
    subject: template.subject,
    html: template.getHtml(vars),
    text: template.getText(vars)
  }

  // 优先使用 SMTP
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const result = await sendWithSmtp(emailOptions)
    if (result.success) {
      return { success: true }
    }
  }

  // 使用 Resend 作为备选
  if (process.env.RESEND_API_KEY) {
    const result = await sendWithResend(emailOptions)
    return result
  }

  return { success: false, error: 'No email service configured' }
}

// 获取可用的邮件模板列表
export function getAvailableTemplates() {
  return Object.keys(EMAIL_TEMPLATES)
}
