'use client'

import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyDraftsStateProps {
  onNewDraft: () => void
}

export function EmptyDraftsState({ onNewDraft }: EmptyDraftsStateProps) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-neutral-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        还没有页面草稿
      </h3>
      
      <p className="text-neutral-600 mb-6 max-w-sm mx-auto">
        开始创建您的第一个产品页面吧！只需要一个想法，AI 帮您完成其余工作。
      </p>

      <div className="flex gap-3 justify-center">
        <Button onClick={onNewDraft} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          创建新页面
        </Button>
        
        <Link href="/">
          <Button variant="outline">
            了解更多
          </Button>
        </Link>
      </div>
    </div>
  )
}