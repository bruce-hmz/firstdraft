'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/app-store';
import { Copy, Check, RefreshCw, Download, Sparkles, Loader2, Save, Edit2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/next-intl';
import type { PageContent } from '@/types';
import { analytics } from '@/lib/analytics';

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
  const [editingField, setEditingField] = useState<string | null>(null);

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

        // Track page shared
        analytics.pageShared(data.data.slug);

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

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSaveEdit = () => {
    setEditingField(null);
  };

  const updateResult = (updates: Partial<PageContent>) => {
    const newResult = { ...result, ...updates };
    setResult(newResult, projectId || '', shareUrl || '');
  };

  const updatePainPoint = (index: number, value: string) => {
    const newPainPoints = [...result.problemSection.painPoints];
    newPainPoints[index] = value;
    updateResult({
      problemSection: {
        ...result.problemSection,
        painPoints: newPainPoints,
      },
    });
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...result.solutionSection.features];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value,
    };
    updateResult({
      solutionSection: {
        ...result.solutionSection,
        features: newFeatures,
      },
    });
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
          {/* Header Section */}
          <div className="bg-neutral-900 text-white p-12 text-center relative">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('result.newProduct')}
            </Badge>

            {editingField === 'productName' ? (
              <div className="mb-4">
                <Input
                  value={result.productName}
                  onChange={(e) => updateResult({ productName: e.target.value })}
                  className="text-4xl md:text-5xl font-bold bg-transparent border-white/20 text-white placeholder-neutral-400"
                  autoFocus
                  onBlur={handleSaveEdit}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
              </div>
            ) : (
              <h1 className="text-4xl md:text-5xl font-bold mb-4 group">
                {result.productName}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit('productName')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-white hover:text-white hover:bg-white/10"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </h1>
            )}

            {editingField === 'tagline' ? (
              <div className="mb-2 max-w-lg mx-auto">
                <Textarea
                  value={result.tagline}
                  onChange={(e) => updateResult({ tagline: e.target.value })}
                  className="text-xl bg-transparent border-white/20 text-white placeholder-neutral-400"
                  autoFocus
                  onBlur={handleSaveEdit}
                />
              </div>
            ) : (
              <p className="text-xl text-neutral-300 mb-2 whitespace-pre-line group relative inline-block">
                {result.tagline}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit('tagline')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-white hover:text-white hover:bg-white/10"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </p>
            )}

            {result.description && (
              editingField === 'description' ? (
                <div className="max-w-lg mx-auto">
                  <Textarea
                    value={result.description}
                    onChange={(e) => updateResult({ description: e.target.value })}
                    className="bg-transparent border-white/20 text-white placeholder-neutral-400"
                    autoFocus
                    onBlur={handleSaveEdit}
                  />
                </div>
              ) : (
                <p className="text-neutral-400 max-w-lg mx-auto group relative">
                  {result.description}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('description')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-white hover:text-white hover:bg-white/10"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </p>
              )
            )}
          </div>

          <div className="p-12 bg-white">
            <div className="max-w-2xl mx-auto">
              {/* Problem Section */}
              {editingField === 'problemHeadline' ? (
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  <Input
                    value={result.problemSection.headline}
                    onChange={(e) => updateResult({
                      problemSection: { ...result.problemSection, headline: e.target.value },
                    })}
                    className="text-2xl font-bold"
                    autoFocus
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                </h2>
              ) : (
                <h2 className="text-2xl font-bold text-neutral-900 mb-4 group">
                  {result.problemSection.headline}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('problemHeadline')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-neutral-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </h2>
              )}

              {editingField === 'problemDescription' ? (
                <Textarea
                  value={result.problemSection.description}
                  onChange={(e) => updateResult({
                    problemSection: { ...result.problemSection, description: e.target.value },
                  })}
                  className="text-neutral-600 mb-8 leading-relaxed"
                  autoFocus
                  onBlur={handleSaveEdit}
                />
              ) : (
                <p className="text-neutral-600 mb-8 leading-relaxed group relative">
                  {result.problemSection.description}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('problemDescription')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-neutral-600"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </p>
              )}

              <div className="space-y-4 mb-12">
                {result.problemSection.painPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    {editingField === `painPoint-${index}` ? (
                      <Textarea
                        value={point}
                        onChange={(e) => updatePainPoint(index, e.target.value)}
                        autoFocus
                        onBlur={handleSaveEdit}
                        className="text-neutral-700"
                      />
                    ) : (
                      <p className="text-neutral-700 flex-1">
                        {point}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(`painPoint-${index}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-neutral-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Solution Section */}
              {editingField === 'solutionHeadline' ? (
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  <Input
                    value={result.solutionSection.headline}
                    onChange={(e) => updateResult({
                      solutionSection: { ...result.solutionSection, headline: e.target.value },
                    })}
                    className="text-2xl font-bold"
                    autoFocus
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                </h2>
              ) : (
                <h2 className="text-2xl font-bold text-neutral-900 mb-4 group">
                  {result.solutionSection.headline}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('solutionHeadline')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-neutral-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </h2>
              )}

              {editingField === 'solutionDescription' ? (
                <Textarea
                  value={result.solutionSection.description}
                  onChange={(e) => updateResult({
                    solutionSection: { ...result.solutionSection, description: e.target.value },
                  })}
                  className="text-neutral-600 mb-8"
                  autoFocus
                  onBlur={handleSaveEdit}
                />
              ) : (
                <p className="text-neutral-600 mb-8 group relative">
                  {result.solutionSection.description}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('solutionDescription')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-neutral-600"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </p>
              )}

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {result.solutionSection.features.map((feature, index) => (
                  <Card key={index} className="p-6 border border-neutral-100 group">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    {editingField === `feature-title-${index}` ? (
                      <Input
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="font-semibold text-neutral-900 mb-2"
                        autoFocus
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      />
                    ) : (
                      <h3 className="font-semibold text-neutral-900 mb-2 group relative">
                        {feature.title}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(`feature-title-${index}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-neutral-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </h3>
                    )}
                    {editingField === `feature-description-${index}` ? (
                      <Textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        className="text-sm text-neutral-600"
                        autoFocus
                        onBlur={handleSaveEdit}
                      />
                    ) : (
                      <p className="text-sm text-neutral-600 group relative">
                        {feature.description}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(`feature-description-${index}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-neutral-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </p>
                    )}
                  </Card>
                ))}
              </div>

              {/* CTA Section */}
              <div className="text-center p-8 bg-neutral-50 rounded-2xl">
                {editingField === 'ctaText' ? (
                  <Input
                    value={result.ctaSection.text}
                    onChange={(e) => updateResult({
                      ctaSection: { ...result.ctaSection, text: e.target.value },
                    })}
                    className="inline-block w-auto text-lg bg-transparent"
                    autoFocus
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                ) : (
                  <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 group relative">
                    {result.ctaSection.text}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('ctaText')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-white hover:text-white hover:bg-black/20 absolute right-2 top-2"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </Button>
                )}
                {result.ctaSection.subtext && editingField === 'ctaSubtext' ? (
                  <Textarea
                    value={result.ctaSection.subtext}
                    onChange={(e) => updateResult({
                      ctaSection: { ...result.ctaSection, subtext: e.target.value },
                    })}
                    className="text-sm text-neutral-500 mt-3 max-w-xs mx-auto"
                    autoFocus
                    onBlur={handleSaveEdit}
                  />
                ) : (
                  result.ctaSection.subtext && (
                    <p className="text-sm text-neutral-500 mt-3 group relative">
                      {result.ctaSection.subtext}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit('ctaSubtext')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 -mt-1 text-neutral-600"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </p>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100">
            <p className="text-sm text-neutral-400">
              {t('result.generatedBy')} FirstDraft AI
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
