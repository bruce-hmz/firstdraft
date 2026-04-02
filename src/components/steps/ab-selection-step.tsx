'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/next-intl';
import { useLanguage } from '@/hooks/use-language';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, SplitSquareVertical, CheckCircle2, ArrowRight } from 'lucide-react';

export function ABSelectionStep() {
  const t = useTranslations();
  const { locale } = useLanguage();
  const { generationFlow: { idea, brandStyle }, setGenerationStep, setResult } = useAppStore();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  // 将 snake_case 转换为 camelCase
  const snakeToCamel = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(snakeToCamel);
    }
    
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {} as any);
  };

  const splitIntoThree = (text: unknown): string[] => {
    const raw = typeof text === 'string' ? text : '';
    const cleaned = raw.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
    if (!cleaned) return [];

    // 先按中文句号/感叹号等切成段落
    const sentenceParts = cleaned
      .split(/[。！？!?；;]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentenceParts.length >= 3) return sentenceParts.slice(0, 3);

    // 再按顿号/英文逗号切
    const clauseParts = cleaned
      .split(/[、,]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
    if (clauseParts.length >= 3) return clauseParts.slice(0, 3);

    // 最后兜底：按字符长度切三段（保证至少 1-3 段都有内容）
    const partSize = Math.ceil(cleaned.length / 3);
    const parts = [
      cleaned.slice(0, partSize).trim(),
      cleaned.slice(partSize, partSize * 2).trim(),
      cleaned.slice(partSize * 2).trim(),
    ].filter(Boolean);

    if (parts.length === 0) return [];
    if (parts.length >= 3) return parts.slice(0, 3);

    // 不足 3 段时用最后一段补齐，让模板的 grid 能正确展开
    while (parts.length < 3) parts.push(parts[parts.length - 1]);
    return parts.slice(0, 3);
  };

  useEffect(() => {
    generateVersions();
  }, [idea, brandStyle]);

  const generateVersions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/ab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, brandStyle, language: locale }),
      });

      const data = await response.json();
      if (data.success) {
        setVersions(data.data.versions);
      } else {
        setError(data.error || t('abSelection.failedToGenerateVersions'));
      }
    } catch (error) {
      setError(t('abSelection.failedToGenerateVersions'));
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
  };

  const handleContinue = () => {
    if (selectedVersion) {
      const selected = versions.find(v => v.id === selectedVersion);
      if (selected) {
        // 转换 snake_case 为 camelCase
        const camelCaseContent = snakeToCamel(selected.content);

        const problemText = typeof camelCaseContent.problemSection === 'string' ? camelCaseContent.problemSection : '';
        const solutionText = typeof camelCaseContent.solutionSection === 'string' ? camelCaseContent.solutionSection : '';
        const painPoints = splitIntoThree(problemText);
        const featureDescriptions = splitIntoThree(solutionText);

        const ctaText =
          typeof camelCaseContent.cta === 'string'
            ? camelCaseContent.cta
            : typeof camelCaseContent.ctaSection === 'string'
              ? camelCaseContent.ctaSection
              : typeof camelCaseContent.ctaSection?.text === 'string'
                ? camelCaseContent.ctaSection.text
                : '';
        
        // 转换 API 返回的结构为 PageContent 结构
        const pageContent = {
          productName: camelCaseContent.productName || '',
          tagline: camelCaseContent.tagline || '',
          description: camelCaseContent.description || '',
          problemSection: {
            headline: t('common.problem'),
            description: problemText || '',
            painPoints: painPoints.length > 0 ? painPoints : [problemText || '']
          },
          solutionSection: {
            headline: t('common.solution'),
            description: solutionText || '',
            features:
              featureDescriptions.length > 0
                ? featureDescriptions.map((desc) => ({
                    title: t('common.coreFeatures'),
                    description: desc,
                  }))
                : [
                    {
                      title: t('common.coreFeatures'),
                      description: solutionText || '',
                    },
                  ],
          },
          ctaSection: {
            text: ctaText || '',
            subtext: ''
          }
        };
        
        setResult(pageContent, '', '');
        setGenerationStep('result');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">{t('abSelection.generatingVersions')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={generateVersions} variant="outline">
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center">
          <SplitSquareVertical className="h-6 w-6 mr-2 text-blue-500" />
          {t('abSelection.title')}
        </h2>
        <p className="text-neutral-600 mb-6">
          {t('abSelection.description')}
        </p>
      </div>

      <div className="space-y-6">
        {versions.map((version) => (
          <motion.div
            key={version.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: versions.indexOf(version) * 0.1 }}
          >
            <Card
              className={`p-6 border-2 cursor-pointer transition-all ${selectedVersion === version.id ? 'border-blue-500 shadow-lg' : 'border-neutral-200 hover:border-neutral-300'}`}
              onClick={() => handleVersionSelect(version.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {selectedVersion === version.id ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium">
                      {versions.indexOf(version) + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {version.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {version.description}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">{t('abSelection.productNameLabel')}</h4>
                      <p className="text-neutral-900">{version.content.product_name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">{t('abSelection.taglineLabel')}</h4>
                      <p className="text-neutral-900">{version.content.tagline}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">{t('abSelection.descriptionLabel')}</h4>
                      <p className="text-neutral-600 line-clamp-2">{version.content.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedVersion}
          className="flex items-center"
        >
          {t('abSelection.continue')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
