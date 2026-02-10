'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react'

interface AuthFormProps {
  mode?: 'signin' | 'signup'
}

export function AuthForm({ mode = 'signin' }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [redirectTo, setRedirectTo] = useState('/drafts')

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setRedirectTo(searchParams.get('redirectTo') || '/drafts')
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const endpoint = mode === 'signup' && isDevelopment ? '/api/auth/signup-direct' : '/api/auth/signin'
      const payload = mode === 'signup' && isDevelopment 
        ? { email, password }
        : { email, password, action: mode }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Authentication failed')
      }

      if (data.data?.needsConfirmation) {
        setMessage(`确认邮件已发送至 ${data.data.email}，请检查收件箱并点击确认链接。如果没有收到，请检查垃圾邮件文件夹。`)
        return
      }

      router.push(redirectTo)
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    const newMode = mode === 'signin' ? 'signup' : 'signin'
    const newUrl = newMode === 'signin' ? '/login' : '/signup'
    router.push(newUrl + (redirectTo !== '/drafts' ? `?redirectTo=${redirectTo}` : ''))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-neutral-900" />
          <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
        </div>
        <CardTitle>
          {mode === 'signin' ? '登录账户' : '创建账户'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin' 
            ? '登录以管理您的页面草稿' 
            : '创建账户以保存和管理您的页面'
          }
        </CardDescription>
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

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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
            {loading ? '处理中...' : mode === 'signin' ? '登录' : '创建账户'}
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-sm"
            onClick={toggleMode}
          >
            {mode === 'signin' 
              ? '还没有账户？点击注册' 
              : '已有账户？点击登录'
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}