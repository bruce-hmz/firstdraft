'use client'

import { useState, useEffect } from 'react'
import { IdeaInputSection } from '@/components/sections/idea-input-section'
import { ExampleIdeas } from '@/components/sections/example-ideas'
import { UserButton } from '@/components/auth/user-button'
import { Sparkles, Zap, Clock, Share2 } from 'lucide-react'
import Link from 'next/link'

const ADMIN_EMAIL = '123387447@qq.com'

export default function Home() {
  const [selectedIdea, setSelectedIdea] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (!response.ok) return
      const data = await response.json()
      if (data.data?.email === ADMIN_EMAIL) {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error('Failed to check admin status:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-neutral-900" />
          <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin" className="text-neutral-600 hover:text-neutral-900 hidden sm:block">
              管理后台
            </Link>
          )}
          <UserButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            那个让你夜不能寐的想法
            <br />
            终于可以见人了
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            别让好想法烂在脑子里。
            <br />
            3分钟，给它一个像样的家。
          </p>
        </div>

        <IdeaInputSection key={selectedIdea} initialIdea={selectedIdea} />

        <ExampleIdeas onSelectIdea={setSelectedIdea} />

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">再等等就凉了</h3>
            <p className="text-neutral-600 text-sm">
              好想法经不起拖延。趁热打铁，现在就给它一个体面的开始
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">它懂你的欲言又止</h3>
            <p className="text-neutral-600 text-sm">
              不用你绞尽脑汁组织语言，AI 帮你把心里话说得漂亮
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">让世界看看你的野心</h3>
            <p className="text-neutral-600 text-sm">
              一个链接就够了。发给朋友、投资人，或者那个一直支持你的家人
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-neutral-100 py-8 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-neutral-500 text-sm">
          © 2024 FirstDraft. Turn your first idea into something real.
        </div>
      </footer>
    </main>
  )
}
