'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { Copy, Check, RefreshCw, Download, Sparkles, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/next-intl';

export function ResultStep() {
  const t = useTranslations();
  const {
    generationFlow: { result, shareUrl, idea, projectId },
    setResult,
    resetFlow,
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState(projectId ? shareUrl : '');

  if (!result) return null;

  const handleSaveAndShare = async () => {
    console.log('Initiating save and share process...');
    if (saving) return;

    try {
      setSaving(true);
      console.log('Starting save process...');

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: result.productName,
          content: result,
          metadata: {
            originalIdea: idea,
            template: 'default',
          },
          anonymousId: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }),
      });

      console.log('API response status:', response.status);

      const data = await response.json();
      console.log('API response data:', JSON.stringify(data, null, 2));

      if (data.success && data.data) {
        const newShareUrl = data.data.shareUrl;
        console.log('✓ Share URL generated:', newShareUrl);
        setCurrentShareUrl(newShareUrl);
        setResult(result, data.data.slug, newShareUrl);

        await navigator.clipboard.writeText(newShareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error('✗ Failed to save page:', data.error);
        const errorMsg = data.error?.message || t('errors.saveError');
        alert(t('errors.saveError') + ': ' + errorMsg);
      }
    } catch (error) {
      console.error('✗ Exception during save:', error);
      alert(t('errors.saveError') + ': ' + error);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (currentShareUrl) {
      await navigator.clipboard.writeText(currentShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{t('result.title')}</h2>
          <p className="text-neutral-500 mt-1">{t('result.description')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetFlow}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('result.restart')}
          </Button>
          <Button
            onClick={currentShareUrl ? handleCopy : handleSaveAndShare}
            variant={copied ? 'secondary' : 'default'}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('result.saving')}
              </>
            ) : copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('common.copied')}
              </>
            ) : currentShareUrl ? (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {t('result.copyLink')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('result.saveAndShare')}
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden border-2 border-neutral-200">
          <div className="bg-neutral-900 text-white p-12 text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('result.newProduct')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{result.productName}</h1>
            <p className="text-xl text-neutral-300 mb-2">{result.tagline}</p>
            <p className="text-neutral-400 max-w-lg mx-auto">{result.description}</p>
          </div>

          <div className="p-12 bg-white">
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
              {t('result.generatedBy')}
            </p>
          </div>
        </Card>
      </motion.div>

      {currentShareUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Link href={currentShareUrl} target="_blank">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {t('result.previewShare')}
            </Button>
          </Link>
        </motion.div>
      )}

    </div>
  );
}
