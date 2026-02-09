'use client';

import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface SharePageProps {
  params: {
    slug: string;
  };
}

export default function SharePage({ params }: SharePageProps) {
  const [copied, setCopied] = useState(false);
  
  const result = {
    productName: '示例产品',
    tagline: '终于有人懂我们的难处了',
    description: '这不是又一个工具，而是真正理解我们处境的伙伴',
    problemSection: {
      headline: '你是不是也经历过这些',
      description: '每次都告诉自己下次会更好，但下次还是一样。我们不是不够努力，只是用错了方法。',
      painPoints: [
        '深夜还在整理客户信息，明天又要面对同样的混乱',
        '团队开会各说各的，散会后谁也不知道该干嘛',
        '想给宝宝留下美好回忆，结果被各种APP搞得焦头烂额'
      ],
    },
    solutionSection: {
      headline: '这次，真的不一样了',
      description: '我们花了无数个夜晚，终于找到了那个让一切变得简单的答案。不是什么黑科技，就是真正懂你的设计。',
      features: [
        { title: '它记得你忘记的', description: '客户信息、项目进度，自动整理，再也不用手忙脚乱', icon: '🧠' },
        { title: '让对话回到正轨', description: '不是又一个聊天工具，而是让团队真正在协作的平台', icon: '💬' },
        { title: '温暖不麻烦', description: '一个按钮记录成长，剩下的时间用来陪伴而不是操作', icon: '🌱' },
      ],
    },
    ctaSection: {
      text: '给自己一个机会',
      subtext: '先试试看，不喜欢随时离开，我们不挽留',
    },
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-neutral-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-neutral-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">FirstDraft</span>
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  复制链接
                </>
              )}
            </Button>
            <Link href="/">
              <Button size="sm">创建我的</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-none">
          <div className="bg-neutral-900 text-white p-12 text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-0">
              新产品
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{result.productName}</h1>
            <p className="text-xl text-neutral-300 mb-2">{result.tagline}</p>
            <p className="text-neutral-400 max-w-lg mx-auto">{result.description}</p>
          </div>

          <div className="p-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                {result.problemSection.headline}
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                {result.problemSection.description}
              </p>

              <div className="space-y-4 mb-12">
                {result.problemSection.painPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-neutral-700">{point}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                {result.solutionSection.headline}
              </h2>
              <p className="text-neutral-600 mb-8">
                {result.solutionSection.description}
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {result.solutionSection.features.map((feature, index) => (
                  <Card key={index} className="p-6 border border-neutral-100">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-600">{feature.description}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center p-8 bg-neutral-50 rounded-2xl">
                <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white px-8">
                  {result.ctaSection.text}
                </Button>
                {result.ctaSection.subtext && (
                  <p className="text-sm text-neutral-500 mt-3">{result.ctaSection.subtext}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100">
            <p className="text-sm text-neutral-400">
              由 FirstDraft 生成
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
