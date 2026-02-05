import { IdeaInputSection } from '@/components/sections/idea-input-section'
import { Sparkles, Zap, Clock, Share2 } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-neutral-900" />
          <span className="text-xl font-bold text-neutral-900">FirstDraft</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-neutral-600 hover:text-neutral-900 hidden sm:block">
            管理后台
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            把一个模糊的想法
            <br />
            变成真实存在的第一稿
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Turn your first idea into something real.
            <br />
            输入想法，几分钟内生成可分享的产品页面。
          </p>
        </div>

        <IdeaInputSection />

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">几分钟完成</h3>
            <p className="text-neutral-600 text-sm">
              从想法到产品页面只需几分钟，省去 weeks 的设计和开发
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">AI 驱动</h3>
            <p className="text-neutral-600 text-sm">
              智能分析你的产品想法，生成专业的文案和结构
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">一键分享</h3>
            <p className="text-neutral-600 text-sm">
              生成可分享的链接，快速获得反馈和验证
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
