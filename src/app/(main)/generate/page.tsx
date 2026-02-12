'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/next-intl';
import { useAppStore } from '@/stores/app-store';
import { QuestionsStep } from '@/components/steps/questions-step';
import { GeneratingStep } from '@/components/steps/generating-step';
import { ResultStep } from '@/components/steps/result-step';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GeneratePage() {
  const router = useRouter();
  const t = useTranslations();
  const {
    generationFlow: { step, idea, error },
    setGenerationStep,
    resetFlow,
  } = useAppStore();

  useEffect(() => {
    if (step === 'input') {
      router.push('/');
    }
  }, [step, router]);

  const handleBack = () => {
    if (step === 'result') {
      setGenerationStep('questions');
    } else if (step === 'questions') {
      resetFlow();
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        {step !== 'generating' && step !== 'result' && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-8 text-neutral-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {step === 'questions' && (
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              {t('generate.pageTitle')}
            </h1>
            <p className="text-neutral-600 mb-8">
              {t('generate.pageDescription')}
            </p>
            <QuestionsStep />
          </div>
        )}

        {step === 'generating' && <GeneratingStep />}

        {step === 'result' && <ResultStep />}
      </div>
    </main>
  );
}
