'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from '@/lib/next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Mail, AlertCircle, Send, CheckCircle } from 'lucide-react'

interface SignupFormProps {
  redirectTo?: string
}

export function SignupForm({ redirectTo = '/drafts' }: SignupFormProps) {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = searchParams.get('redirectTo')
    if (redirect) {
      redirectTo = redirect
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || '发送失败')
      }

      setSuccess(true)

    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
    } finally {
      setLoading(false)
    }
  }

  // Success state - show confirmation message
  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-neutral-900" />
            <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle>{t('auth.magicLinkSent')}</CardTitle>
          <CardDescription>
            {t('auth.magicLinkSentDescription', { email })}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <p className="mb-2">💡 {t('auth.magicLinkHint')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>{t('auth.magicLinkCheckSpam')}</li>
              <li>{t('auth.magicLinkExpiry')}</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setSuccess(false)}
          >
            {t('auth.magicLinkResend')}
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
      </Card>
    )
  }

  // Default signup form
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-neutral-900" />
          <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
        </div>
        <CardTitle>{t('auth.signUpTitle')}</CardTitle>
        <CardDescription>{t('auth.signUpDescriptionMagicLink')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Benefits */}
          <div className="bg-gradient-to-r from-brand/5 to-purple-100 rounded-lg p-4 border border-brand/20">
            <p className="text-sm font-medium text-neutral-800 mb-2">🎁 {t('auth.signupBenefits')}</p>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>✓ {t('auth.benefit3Free')}</li>
              <li>✓ {t('auth.benefitNoPassword')}</li>
              <li>✓ {t('auth.benefitInstant')}</li>
            </ul>
          </div>

          {/* Email */}
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
                autoFocus
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loading || !email}
          >
            {loading ? (
              t('auth.processing')
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t('auth.sendMagicLink')}
              </>
            )}
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
