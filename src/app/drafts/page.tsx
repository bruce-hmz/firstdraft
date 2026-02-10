'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { DraftList } from '@/components/drafts/draft-list'
import Link from 'next/link'

export default function DraftsPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-neutral-900" />
                <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
              </div>
            </Link>
            
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-neutral-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline">创建新页面</Button>
            </Link>
            <form action="/api/auth/signout" method="post">
              <Button variant="ghost" type="submit">
                登出
              </Button>
            </form>
          </div>
        </nav>

        <DraftList />
      </div>
    </main>
  )
}