'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/next-intl';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function BrandStyleStep() {
  const t = useTranslations();
  const {
    generationFlow: { brandStyle },
    setBrandStyle,
    setGenerationStep,
  } = useAppStore();

  const brandStyles = [
    {
      id: 'default',
      name: t('brandStyle.default.name'),
      description: t('brandStyle.default.description'),
      icon: '🎨',
      color: 'bg-gradient-to-br from-neutral-50 to-neutral-100',
    },
    {
      id: 'minimal-tech',
      name: t('brandStyle.minimalTech.name'),
      description: t('brandStyle.minimalTech.description'),
      icon: '💻',
      color: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    },
    {
      id: 'playful-family',
      name: t('brandStyle.playfulFamily.name'),
      description: t('brandStyle.playfulFamily.description'),
      icon: '👨‍👩‍👧‍👦',
      color: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    },
    {
      id: 'professional-business',
      name: t('brandStyle.professionalBusiness.name'),
      description: t('brandStyle.professionalBusiness.description'),
      icon: '💼',
      color: 'bg-gradient-to-br from-gray-50 to-gray-100',
    },
  ];

  const handleSelect = (styleId: string) => {
    setBrandStyle(styleId);
  };

  const handleNext = () => {
    setGenerationStep('ai-questions');
  };

  const handleBack = () => {
    setGenerationStep('input');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          {t('brandStyle.pageTitle')}
        </h1>
        <p className="text-neutral-600">
          {t('brandStyle.pageDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {brandStyles.map((style) => (
          <motion.div
            key={style.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-6 border-2 cursor-pointer transition-all ${brandStyle === style.id ? 'border-indigo-500 shadow-lg' : 'border-neutral-200 hover:border-neutral-300'}`}
              onClick={() => handleSelect(style.id)}
            >
              <div className={`${style.color} rounded-full w-16 h-16 flex items-center justify-center mb-4`}>
                <span className="text-3xl">{style.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {style.name}
              </h3>
              <p className="text-sm text-neutral-600">
                {style.description}
              </p>
              {brandStyle === style.id && (
                <div className="mt-4 p-2 bg-indigo-50 rounded-md text-sm text-indigo-600">
                  {t('brandStyle.selected')}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-neutral-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>

        <Button
          onClick={handleNext}
          className="glow-brand"
        >
          {t('brandStyle.buttonNext')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
