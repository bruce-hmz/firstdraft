'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from '@/lib/next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Mail, Lock, AlertCircle, RefreshCw, Send } from 'lucide-react'

interface SignupFormProps {
  redirectTo?: string
}

export function SignupForm({ redirectTo = '/drafts' }: SignupFormProps) {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingEmailCode, setSendingEmailCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = searchParams.get('redirectTo')
    if (redirect) {
      redirectTo = redirect
    }
  }, [searchParams])

  // 加载图形验证码
  useEffect(() => {
    refreshCaptcha()
  }, [])

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const refreshCaptcha = async (clearInput: boolean = false) => {
    try {
      const response = await fetch('/api/captcha/image')
      const captchaIdFromHeader = response.headers.get('X-Captcha-Id')

      if (captchaIdFromHeader) {
        setCaptchaId(captchaIdFromHeader)
      }

      const svgText = await response.text()
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(svgBlob)
      setCaptchaImage(url)

      // 只在明确需要时才清空输入框
      if (clearInput) {
        setCaptchaCode('')
      }
    } catch (error) {
      console.error('Failed to load captcha:', error)
    }
  }

  const handleSendEmailCode = async () => {
    if (!email) {
      setError('请先输入邮箱地址')
      return
    }

    if (!captchaCode) {
      setError('请先输入图形验证码')
      return
    }

    setSendingEmailCode(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          captchaId,
          captchaCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '发送验证码失败')
      }

      setMessage('验证码已发送到您的邮箱，请查收')
      setCountdown(60) // 60秒倒计时

      // 发送成功后刷新图形验证码（用于下一次），但不清空当前输入
      await refreshCaptcha(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : '发送验证码失败')
      // 发送失败时刷新并清空，让用户重新输入
      await refreshCaptcha(true)
    } finally {
      setSendingEmailCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // 验证邮箱验证码
    if (!emailCode) {
      setError('请输入邮箱验证码')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          emailCode,
          captchaId,
          captchaCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || '注册失败')
      }

      if (data.data?.needsConfirmation) {
        setMessage(`确认邮件已发送至 ${data.data.email}，请检查收件箱并点击确认链接。`)
      } else {
        router.push(redirectTo)
        router.refresh()
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
      await refreshCaptcha(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-neutral-900" />
          <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
        </div>
        <CardTitle>{t('auth.signUpTitle')}</CardTitle>
        <CardDescription>{t('auth.signUpDescription')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          {/* 邮箱 */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* 图形验证码 */}
          <div className="space-y-2">
            <Label htmlFor="captcha">图形验证码</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="captcha"
                  type="text"
                  placeholder="请输入验证码"
                  value={captchaCode}
                  onChange={(e) => setCaptchaCode(e.target.value.toUpperCase())}
                  className="uppercase"
                  maxLength={4}
                  required
                />
              </div>
              <div
                className="h-10 w-32 border rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center overflow-hidden"
                onClick={() => refreshCaptcha(true)}
                title="点击刷新验证码"
              >
                {captchaImage ? (
                  <img src={captchaImage} alt="验证码" className="w-full h-full" />
                ) : (
                  <RefreshCw className="h-4 w-4 animate-spin text-neutral-400" />
                )}
              </div>
            </div>
            <p className="text-xs text-neutral-500">点击图片可刷新验证码</p>
          </div>

          {/* 邮箱验证码 */}
          <div className="space-y-2">
            <Label htmlFor="emailCode">邮箱验证码</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="emailCode"
                  type="text"
                  placeholder="请输入邮箱验证码"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmailCode}
                disabled={sendingEmailCode || countdown > 0 || !email || captchaCode.length < 4}
                className="whitespace-nowrap"
                title={!email ? '请先输入邮箱' : captchaCode.length < 4 ? '请先输入图形验证码' : ''}
              >
                {sendingEmailCode ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    发送中
                  </>
                ) : countdown > 0 ? (
                  `${countdown}秒`
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    发送验证码
                  </>
                )}
              </Button>
            </div>
            {!email && (
              <p className="text-xs text-amber-600">💡 请先输入邮箱地址</p>
            )}
            {email && captchaCode.length < 4 && (
              <p className="text-xs text-amber-600">💡 请先完成图形验证码验证</p>
            )}
          </div>

          {/* 密码 */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? t('auth.processing') : t('auth.signUpButton')}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={() => router.push('/login')}
          >
            {t('auth.hasAccount')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
