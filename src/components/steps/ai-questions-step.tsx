'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/next-intl';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

export function AIQuestionsStep() {
  const { generationFlow: { idea }, setGenerationStep } = useAppStore();
  
  const onComplete = () => {
    setGenerationStep('questions');
  };
  
  const onSkip = () => {
    setGenerationStep('questions');
  };
  const t = useTranslations();
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [idea]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
      });

      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions);
        // 初始化答案对象
        const initialAnswers: Record<string, string> = {};
        data.data.questions.forEach((q: string) => {
          initialAnswers[q] = '';
        });
        setAnswers(initialAnswers);
      } else {
        setError(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      setError('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value
    }));

    if (value.trim().length > 0) {
      setCompleted(prev => new Set(prev).add(question));
    } else {
      setCompleted(prev => {
        const newSet = new Set(prev);
        newSet.delete(question);
        return newSet;
      });
    }
  };

  const handleComplete = () => {
    onComplete(answers);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">AI {t('common.analyzing')} your idea...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={fetchQuestions} variant="outline">
            {t('common.retry')}
          </Button>
          <Button onClick={onSkip} variant="outline">
            {t('common.skip')}
          </Button>
        </div>
      </div>
    );
  }

  const allAnswered = completed.size === questions.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2 text-blue-500" />
          {t('aiQuestions.title')}
        </h2>
        <p className="text-neutral-600 mb-6">
          {t('aiQuestions.description')}
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {completed.has(question) ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-neutral-900 font-medium mb-3">
                    {question}
                  </p>
                  <Input
                    value={answers[question] || ''}
                    onChange={(e) => handleAnswerChange(question, e.target.value)}
                    placeholder={t('aiQuestions.answerPlaceholder')}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <Button variant="outline" onClick={onSkip}>
          {t('common.skip')}
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!allAnswered}
          className="flex items-center"
        >
          {t('aiQuestions.continue')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
