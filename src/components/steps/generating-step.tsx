'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export function GeneratingStep() {
  const steps = [
    '分析你的产品想法...',
    '提炼核心价值主张...',
    '撰写产品文案...',
    '设计页面结构...',
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-neutral-900 animate-spin" />
        </div>
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-6 w-6 text-amber-500" />
        </motion.div>
      </motion.div>

      <h3 className="text-xl font-medium text-neutral-900 mt-8 mb-4">
        AI 正在构建你的产品页面
      </h3>

      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.8 }}
            className="flex items-center gap-3 text-neutral-600"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-neutral-300"
              animate={{
                backgroundColor: ['#d4d4d4', '#171717', '#d4d4d4'],
              }}
              transition={{
                duration: 2,
                delay: index * 0.8,
                repeat: Infinity,
                repeatDelay: steps.length * 0.8 - 2,
              }}
            />
            <span className="text-sm">{step}</span>
          </motion.div>
        ))}
      </div>

      <p className="text-sm text-neutral-400 mt-8">
        预计需要 10-20 秒
      </p>
    </div>
  );
}
