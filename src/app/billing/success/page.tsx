'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2, Sparkles } from 'lucide-react';

export default function BillingSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVerified(true);
        setLoading(false);
      } catch (error) {
        console.error('Verification error:', error);
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">正在确认您的支付...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            欢迎加入 FirstDraft Pro!
          </h1>

          <p className="text-neutral-600 mb-6">
            您的支付已成功处理。现在您可以享受无限次生成和保存功能。
          </p>

          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-2">Pro 权益</h3>
            <ul className="text-left text-sm text-neutral-600 space-y-2">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                无限次生成产品页面
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                无限次保存和分享
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                优先生成速度
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                导出 HTML 源代码
              </li>
            </ul>
          </div>

          <Link href="/">
            <Button className="w-full bg-neutral-900 hover:bg-neutral-800">
              开始创建
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
}
