'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/next-intl';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, SplitSquareVertical, CheckCircle2, ArrowRight } from 'lucide-react';

export function ABSelectionStep() {
  const t = useTranslations();
  const { generationFlow: { idea, brandStyle }, setGenerationStep, setResult } = useAppStore();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

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
        body: JSON.stringify({ idea, brandStyle }),
      });

      const data = await response.json();
      if (data.success) {
        setVersions(data.data.versions);
      } else {
        setError(data.error || 'Failed to generate versions');
      }
    } catch (error) {
      setError('Failed to generate versions');
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
        // 这里简化处理，实际应该使用完整的页面生成流程
        setResult(selected.content, '', '');
        setGenerationStep('result');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">Generating A/B versions...</p>
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
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Product Name</h4>
                      <p className="text-neutral-900">{version.content.productName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Tagline</h4>
                      <p className="text-neutral-900">{version.content.tagline}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-1">Description</h4>
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
