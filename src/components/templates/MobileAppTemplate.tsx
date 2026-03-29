import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PageContent } from '@/types';
import { useTranslations } from '@/lib/next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface MobileAppTemplateProps {
  content: PageContent;
  showBranding?: boolean;
}

export function MobileAppTemplate({ content, showBranding = true }: MobileAppTemplateProps) {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-neutral-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">FirstDraft</span>
          </Link>
          <Link href="/">
            <Button size="sm">{t('drafts.title')}</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: App Preview */}
          <div className="relative">
            <div className="bg-black rounded-[40px] p-3 shadow-xl inline-block mx-auto">
              <div className="w-[270px] h-[540px] bg-white rounded-[32px] overflow-hidden relative">
                {/* Phone screen mockup - content would go here, we just show the placeholder for the generated page */}
                <div className="p-4">
                  <div className="w-full h-8 bg-gray-200 rounded-full mb-4"></div>
                  <div className="space-y-3">
                    <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
                    <div className="w-full h-12 bg-gray-50 rounded"></div>
                    <div className="w-2/3 h-10 bg-indigo-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg">
              <span className="text-sm font-medium">iOS + Android</span>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-0">
              {t('result.newMobileApp')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              {content.productName}
            </h1>
            <p className="text-xl text-neutral-600 mb-6 whitespace-pre-line">
              {content.tagline}
            </p>
            {content.description && (
              <p className="text-neutral-500 mb-8">{content.description}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="bg-black hover:bg-neutral-800 text-white px-8">
                App Store
              </Button>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                Google Play
              </Button>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">
            {content.solutionSection.headline}
          </h2>
          <p className="text-center text-lg text-neutral-600 max-w-3xl mx-auto mb-12">
            {content.solutionSection.description}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {content.solutionSection.features.map((feature, index) => (
              <Card key={index} className="p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">{content.ctaSection.text}</h2>
          {content.ctaSection.subtext && (
            <p className="text-indigo-100 mb-8 text-lg">{content.ctaSection.subtext}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 px-12">
              Download Now
            </Button>
          </div>
        </div>
      </div>

      {showBranding && (
        <footer className="bg-white border-t border-neutral-100 py-6">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-sm text-neutral-400">
              {t('result.generatedBy')} FirstDraft AI
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
