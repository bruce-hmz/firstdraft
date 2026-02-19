'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/lib/next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sparkles, ArrowRight, LogIn } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'

interface IdeaInputSectionProps {
  initialIdea?: string
}

export function IdeaInputSection({ initialIdea = '' }: IdeaInputSectionProps) {
  const t = useTranslations()
  const [idea, setIdeaState] = useState(initialIdea)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const router = useRouter()
  const { setIdea, setGenerationStep } = useAppStore()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(!!data.data?.email)
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('Failed to check auth:', error)
      setIsLoggedIn(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!idea.trim() || idea.trim().length < 5) {
      return
    }

    // 检查登录状态
    if (!isLoggedIn) {
      setShowLoginDialog(true)
      return
    }

    setIsGenerating(true)

    try {
      setIdea(idea.trim())
      setGenerationStep('questions')
      router.push('/generate')
    } catch (error) {
      console.error('Failed to start generation:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGoToLogin = () => {
    setShowLoginDialog(false)
    router.push('/login')
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto hover-lift transition-all duration-300">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {t('home.ideaInputTitle')}
          </CardTitle>
          <CardDescription>
            {t('home.ideaInputDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              placeholder={t('home.ideaPlaceholder')}
              value={idea}
              onChange={(e) => setIdeaState(e.target.value)}
              className="min-h-32 resize-none text-base focus-glow border-2 border-neutral-200 focus:border-indigo-400 transition-all"
              disabled={isGenerating}
            />

            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={isGenerating || !idea.trim() || idea.trim().length < 5}
                className="gap-2 px-8 glow-brand"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('home.processing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t('home.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 登录提示弹窗 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-center text-xl">
              {t('auth.loginRequired')}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t('auth.loginRequiredDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleGoToLogin}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {t('nav.login')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}