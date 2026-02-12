'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { useBilling } from '@/hooks/useBilling';
import { Paywall } from '@/components/billing/Paywall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Loader2, SkipForward, Sparkles, Check } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  placeholder: string;
  example: string;
}

interface QuestionTemplate {
  keywords: string[];
  key: string;
}

const QUESTION_TEMPLATES: QuestionTemplate[] = [
  { keywords: ['开发者', '代码', '编程', '开发', '程序员', '工程师', '技术', 'API', 'snippet', 'git', 'developer', 'code', 'programming', 'dev', 'engineer', 'tech'], key: 'dev-tool' },
  { keywords: ['宝宝', '婴儿', '育儿', '孩子', '成长记录', '宝妈', '奶爸', '亲子', 'baby', 'parent', 'child', 'parenting', 'growth'], key: 'parenting' },
  { keywords: ['睡眠', '失眠', '助眠', '健康', 'sleep', 'insomnia', 'health', 'tracker'], key: 'health' },
];

function getQuestionsForIdea(t: (key: string) => string, idea: string): Question[] {
  const ideaLower = idea.toLowerCase();
  
  const matches = QUESTION_TEMPLATES.map(template => {
    const matchCount = template.keywords.filter(kw => 
      ideaLower.includes(kw.toLowerCase())
    ).length;
    return { key: template.key, matchCount };
  }).filter(m => m.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);
  
  const templateKey = matches.length > 0 ? matches[0].key : 'default';
  
  const questions: Question[] = [];
  for (let i = 0; i < 3; i++) {
    const questionText = t(`questions.${templateKey}.${i}.question`);
    if (questionText && questionText !== `questions.${templateKey}.${i}.question`) {
      questions.push({
        id: t(`questions.${templateKey}.${i}.id`),
        question: questionText,
        placeholder: t(`questions.${templateKey}.${i}.placeholder`),
        example: t(`questions.${templateKey}.${i}.example`),
      });
    }
  }
  
  if (questions.length === 0) {
    for (let i = 0; i < 3; i++) {
      questions.push({
        id: t(`questions.default.${i}.id`),
        question: t(`questions.default.${i}.question`),
        placeholder: t(`questions.default.${i}.placeholder`),
        example: t(`questions.default.${i}.example`),
      });
    }
  }
  
  return questions;
}

export function QuestionsStep() {
  const t = useTranslations();
  const {
    generationFlow: { questions, answers, isLoading, idea },
    setAnswer,
    setQuestions,
    setGenerationStep,
    setResult,
    setLoading,
    setError,
  } = useAppStore();

  const { checkPaywall, deductCredit } = useBilling();
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeStatus, setOptimizeStatus] = useState<'idle' | 'loading' | 'success' | 'timeout'>('idle');
  
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (questions.length === 0 && idea) {
      const newQuestions = getQuestionsForIdea(t, idea);
      setQuestions(newQuestions);
    }
  }, [questions.length, idea, t, setQuestions]);

  useEffect(() => {
    setCurrentIndex(0);
    setOptimizeStatus('idle');
  }, [questions]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizeStatus('loading');
    
    try {
      const response = await fetch('/api/generate/questions/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.questions) {
        setQuestions(data.data.questions);
        setOptimizeStatus('success');
      } else {
        setOptimizeStatus('timeout');
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      setOptimizeStatus('timeout');
    } finally {
      setIsOptimizing(false);
      setTimeout(() => setOptimizeStatus('idle'), 3000);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setGenerationStep('input');
    }
  };

  const handleSkip = () => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, '');
    }
    handleNext();
  };

  const handleSubmit = async () => {
    const check = checkPaywall();
    if (check.blocked) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setError(null);
    setGenerationStep('generating');

    try {
      const deductSuccess = await deductCredit();
      if (!deductSuccess) {
        setShowPaywall(true);
        setLoading(false);
        setGenerationStep('questions');
        return;
      }

      const response = await fetch('/api/generate/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          answers,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || t('errors.generateError'));
      }

      setResult(data.data.page, '', '');
      setGenerationStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.genericError'));
      setGenerationStep('questions');
    } finally {
      setLoading(false);
    }
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (showPaywall) {
    return <Paywall onClose={() => setShowPaywall(false)} />;
  }

  if (!currentQuestion) return null;

  const getOptimizeButtonContent = () => {
    switch (optimizeStatus) {
      case 'loading':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('generate.aiOptimizing')}
          </>
        );
      case 'success':
        return (
          <>
            <Check className="mr-2 h-4 w-4" />
            {t('generate.optimized')}
          </>
        );
      case 'timeout':
        return (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {t('generate.currentSufficient')}
          </>
        );
      default:
        return (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {t('generate.aiOptimize')}
          </>
        );
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-8">
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-neutral-900"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-neutral-500">
            {t('generate.progressLabel', { current: currentIndex + 1, total: questions.length })}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOptimize}
            disabled={isOptimizing || optimizeStatus === 'success'}
            className="text-neutral-500 hover:text-neutral-900"
          >
            {getOptimizeButtonContent()}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <Label className="text-xl font-medium text-neutral-900 mb-4 block">
              {currentQuestion.question}
            </Label>
            <Input
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="h-14 text-lg border-2 border-neutral-200 focus:border-neutral-400 rounded-xl"
            />
            <div className="mt-4">
              <p className="text-sm text-neutral-500 mb-2">{t('generate.selectExample')}</p>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.example.split(/[,，、]/).map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAnswer(currentQuestion.id, example.trim())}
                    className="text-sm px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                  >
                    {example.trim()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-neutral-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-neutral-500"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            {t('generate.buttonSkip')}
          </Button>

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('generate.generating')}
              </>
            ) : currentIndex === questions.length - 1 ? (
              <>
                {t('generate.buttonGenerate')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                {t('generate.buttonNext')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
