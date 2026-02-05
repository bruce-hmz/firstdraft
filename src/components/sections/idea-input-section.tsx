'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useRouter } from 'next/navigation';

const exampleIdeas = [
  '一个帮助自由职业者管理客户和项目的工具',
  '让远程团队更有效协作的社交平台',
  '帮助新手父母记录宝宝成长的应用',
];

export function IdeaInputSection() {
  const [idea, setIdea] = useState('');
  const { setIdea: setStoreIdea, setQuestions, setGenerationStep, setLoading, setError } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!idea.trim() || idea.trim().length < 5) {
      setError('请输入至少5个字符的产品想法');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError(null);
    setStoreIdea(idea);

    try {
      const response = await fetch('/api/generate/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || '生成问题失败');
      }

      setQuestions(data.data.questions);
      setGenerationStep('questions');
      router.push('/generate');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误，请重试');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="relative">
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="描述你的产品想法..."
            className="min-h-[160px] text-lg p-6 resize-none border-2 border-neutral-200 focus:border-neutral-400 rounded-2xl bg-white/50 backdrop-blur-sm"
            disabled={isSubmitting}
          />
          <div className="absolute bottom-4 right-4 text-sm text-neutral-400">
            {idea.length} 字
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || idea.trim().length < 5}
          size="lg"
          className="w-full h-14 text-lg font-medium rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              思考中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              开始构建
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        <div className="pt-6">
          <p className="text-sm text-neutral-500 mb-3">没有思路？试试这些：</p>
          <div className="flex flex-wrap gap-2">
            {exampleIdeas.map((example, index) => (
              <button
                key={index}
                onClick={() => setIdea(example)}
                className="text-sm px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
