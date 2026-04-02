'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PageContent } from '@/types';
import { useTranslations } from '@/lib/next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface DefaultTemplateProps {
  content: PageContent;
  showBranding?: boolean;
  pageId?: string;
  media?: Array<{ id: string; url: string }>;
}

export function DefaultTemplate({ content, showBranding = true, pageId, media = [] }: DefaultTemplateProps) {
  const t = useTranslations();

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
          {pageId && (media.length > 0 ? (
            <div className="p-8 bg-neutral-50 border-t border-neutral-100">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6 text-center">产品展示</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {media.map((item) => (
                    <div key={item.id} className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                      <img 
                        src={item.url} 
                        alt="产品图片" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-neutral-50 border-t border-neutral-100">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">产品展示</h3>
                <p className="text-neutral-500 mb-4">暂无上传的产品图片</p>
                <p className="text-sm text-neutral-400">在编辑页面上传产品图片以展示在此处</p>
              </div>
            </div>
          ))}

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

              <div className="text-center p-8 bg-neutral-50 rounded-2xl">
                <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white px-8">
                  {content.ctaSection.text}
                </Button>
                {content.ctaSection.subtext && (
                  <p className="text-sm text-neutral-500 mt-3">{content.ctaSection.subtext}</p>
                )}
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
