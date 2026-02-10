'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'

interface IdeaInputSectionProps {
  initialIdea?: string
}

export function IdeaInputSection({ initialIdea = '' }: IdeaInputSectionProps) {
  const [idea, setIdeaState] = useState(initialIdea)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { setIdea, setGenerationStep } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!idea.trim() || idea.trim().length < 5) {
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          你的想法是什么？
        </CardTitle>
        <CardDescription>
          用几句话描述你的产品想法，AI 会帮你把它变成一个完整的产品页面
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            placeholder="例如：一个帮助开发者快速找到代码片段的工具..."
            value={idea}
            onChange={(e) => setIdeaState(e.target.value)}
            className="min-h-32 resize-none text-base"
            disabled={isGenerating}
          />
          
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={isGenerating || !idea.trim() || idea.trim().length < 5}
              className="gap-2 px-8"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  开始生成
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}