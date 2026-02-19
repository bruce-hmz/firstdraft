import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 生成随机验证码字符串
function generateCaptchaCode(length: number = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 排除容易混淆的字符 I, O, 0, 1, L
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 生成随机颜色
function randomColor(min: number, max: number): string {
  const r = Math.floor(Math.random() * (max - min) + min)
  const g = Math.floor(Math.random() * (max - min) + min)
  const b = Math.floor(Math.random() * (max - min) + min)
  return `rgb(${r},${g},${b})`
}

// 生成 SVG 验证码图片
function generateCaptchaSVG(code: string): string {
  const width = 150
  const height = 50
  const fontSize = 36

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#f0f0f0"/>`

  // 添加干扰点
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    svg += `<circle cx="${x}" cy="${y}" r="1" fill="${randomColor(100, 200)}" opacity="0.5"/>`
  }

  // 添加干扰线
  for (let i = 0; i < 5; i++) {
    const x1 = Math.random() * width
    const y1 = Math.random() * height
    const x2 = Math.random() * width
    const y2 = Math.random() * height
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
             stroke="${randomColor(100, 200)}" stroke-width="1" opacity="0.5"/>`
  }

  // 绘制验证码文字
  for (let i = 0; i < code.length; i++) {
    const x = 20 + i * 32
    const y = 35
    const rotate = (Math.random() - 0.5) * 30 // 随机旋转角度
    const color = randomColor(0, 100)

    svg += `
      <text x="${x}" y="${y}"
            font-family="Arial, sans-serif"
            font-size="${fontSize}"
            font-weight="bold"
            fill="${color}"
            transform="rotate(${rotate} ${x} ${y})"
            style="user-select: none;">
        ${code[i]}
      </text>`
  }

  svg += `</svg>`
  return svg
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // 生成验证码
    const code = generateCaptchaCode(4)

    // 生成唯一的 captcha ID
    const captchaId = crypto.randomUUID()

    // 将验证码存储到数据库（5分钟过期）
    const { error } = await supabase
      .from('verification_codes')
      .insert({
        code: code,
        type: 'captcha',
        target: captchaId,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        metadata: {
          created_from: 'captcha_api',
          user_agent: request.headers.get('user-agent')
        }
      })

    if (error) {
      console.error('Failed to store captcha:', error)
      return NextResponse.json(
        { error: 'Failed to generate captcha' },
        { status: 500 }
      )
    }

    // 生成 SVG 图片
    const svg = generateCaptchaSVG(code)

    // 返回 SVG 和 captcha ID
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Captcha-Id': captchaId // 通过响应头传递 captcha ID
      }
    })

  } catch (error) {
    console.error('Captcha generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
