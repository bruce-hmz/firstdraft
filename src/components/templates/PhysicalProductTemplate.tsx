'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PageContent } from '@/types';
import { useTranslations } from '@/lib/next-intl';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface PhysicalProductTemplateProps {
  content: PageContent;
  showBranding?: boolean;
}

export function PhysicalProductTemplate({ content, showBranding = true }: PhysicalProductTemplateProps) {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <nav className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-neutral-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">FirstDraft</span>
          </Link>
          <Link href="/">
            <Button size="sm">{t('drafts.title')}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section with Product Image */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="mb-4 bg-amber-100 text-amber-700 border-0">
              {t('result.newProduct')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
              {content.productName}
            </h1>
            <p className="text-xl text-neutral-600 mb-8 whitespace-pre-line leading-relaxed">
              {content.tagline}
            </p>
            {content.description && (
              <p className="text-neutral-500 mb-10">{content.description}</p>
            )}
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-6 text-lg gap-2">
              <ShoppingCart className="h-5 w-5" />
              {content.ctaSection.text}
            </Button>
            {content.ctaSection.subtext && (
              <p className="text-sm text-neutral-500 mt-4">{content.ctaSection.subtext}</p>
            )}
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl shadow-xl flex items-center justify-center">
              {/* Product image placeholder - user can replace with actual product image */}
              <div className="text-8xl text-amber-300">
                <ShoppingCart />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pain Points */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6 text-center">
            {content.problemSection.headline}
          </h2>
          <p className="text-center text-lg text-neutral-600 mb-12 leading-relaxed">
            {content.problemSection.description}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {content.problemSection.painPoints.map((point, index) => (
              <Card key={index} className="p-6 border border-neutral-200 bg-white">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <span className="text-red-600 text-sm">✕</span>
                </div>
                <p className="text-neutral-700">{point}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features/Benefits */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
          {content.solutionSection.headline}
        </h2>
        <p className="text-center text-lg text-neutral-600 max-w-3xl mx-auto mb-12">
          {content.solutionSection.description}
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {content.solutionSection.features.map((feature, index) => (
            <Card key={index} className="p-8 border border-neutral-200 shadow-sm">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {showBranding && (
        <footer className="bg-white border-t border-neutral-100 py-6">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-neutral-400">
              {t('result.generatedBy')} FirstDraft AI
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
