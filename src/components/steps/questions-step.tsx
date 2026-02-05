'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Loader2, SkipForward } from 'lucide-react';

export function QuestionsStep() {
  const {
    generationFlow: { questions, answers, isLoading },
    setAnswer,
    setGenerationStep,
    setResult,
    setLoading,
    setError,
    generationFlow: { idea },
  } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

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
    setLoading(true);
    setError(null);
    setGenerationStep('generating');

    try {
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
        throw new Error(data.error?.message || '生成页面失败');
      }

      setResult(data.data.page, data.data.projectId, data.data.shareUrl);
      setGenerationStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setGenerationStep('questions');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (!currentQuestion) return null;

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
        <p className="text-sm text-neutral-500 mt-2 text-right">
          {currentIndex + 1} / {questions.length}
        </p>
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
            <p className="text-sm text-neutral-500 mt-3">
              示例：{currentQuestion.example}
            </p>
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
          返回
        </Button>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-neutral-500"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            跳过
          </Button>

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : currentIndex === questions.length - 1 ? (
              <>
                生成页面
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                下一个
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
