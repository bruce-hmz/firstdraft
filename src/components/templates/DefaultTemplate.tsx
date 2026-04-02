'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PageContent } from '@/types';
import { useTranslations } from '@/lib/next-intl';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface DefaultTemplateProps {
  content: PageContent;
  showBranding?: boolean;
  pageId?: string;
}

export function DefaultTemplate({ content, showBranding = true, pageId }: DefaultTemplateProps) {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pageId) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: pageId,
          email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setEmail('');
      } else {
        setError(data.error || '订阅失败，请重试');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
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
            <Link href="/">
              <Button size="sm">{t('drafts.title')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-none">
          <div className="bg-neutral-900 text-white p-12 text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-0">
              {t('result.newProduct')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.productName}</h1>
            <p className="text-xl text-neutral-300 mb-2 whitespace-pre-line">{content.tagline}</p>
            {content.description && <p className="text-neutral-400 max-w-lg mx-auto">{content.description}</p>}
          </div>

          {/* 产品图片展示 */}
          {pageId && (
            <div className="p-8 bg-neutral-50 border-t border-neutral-100">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6 text-center">产品展示</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* 这里可以通过 API 获取并展示上传的图片 */}
                  <div className="aspect-video bg-neutral-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-neutral-400" />
                  </div>
                  <div className="aspect-video bg-neutral-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-neutral-400" />
                  </div>
                  <div className="aspect-video bg-neutral-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-neutral-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                {content.problemSection.headline}
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                {content.problemSection.description}
              </p>

              <div className="space-y-4 mb-12">
                {content.problemSection.painPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-neutral-700">{point}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                {content.solutionSection.headline}
              </h2>
              <p className="text-neutral-600 mb-8">
                {content.solutionSection.description}
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {content.solutionSection.features.map((feature, index) => (
                  <Card key={index} className="p-6 border border-neutral-100">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-600">{feature.description}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center p-8 bg-neutral-50 rounded-2xl mb-8">
                <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white px-8">
                  {content.ctaSection.text}
                </Button>
                {content.ctaSection.subtext && (
                  <p className="text-sm text-neutral-500 mt-3">{content.ctaSection.subtext}</p>
                )}
              </div>

              {/* Waitlist Subscription Form */}
              <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">加入我们的等待名单</h3>
                <p className="text-neutral-600 mb-6">获取产品更新和早期访问权限</p>
                <div className="max-w-md mx-auto space-y-4">
                  {submitted ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-700">订阅成功！感谢您的关注。</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-red-700">{error}</p>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          placeholder="输入您的邮箱"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <Button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                          disabled={submitting}
                        >
                          {submitting ? '订阅中...' : '订阅'}
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500">
                        我们尊重您的隐私，不会向您发送垃圾邮件
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showBranding && (
            <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100">
              <p className="text-sm text-neutral-400">
                {t('result.generatedBy')} FirstDraft AI
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
