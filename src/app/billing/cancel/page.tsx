'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-10 w-10 text-neutral-400" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            支付已取消
          </h1>

          <p className="text-neutral-600 mb-6">
            您随时可以返回升级。免费用户仍可使用基础功能。
          </p>

          <div className="space-y-3">
            <Link href="/">
              <Button variant="outline" className="w-full">
                返回首页
              </Button>
            </Link>

            <Link href="/">
              <Button className="w-full bg-neutral-900 hover:bg-neutral-800">
                继续免费使用
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
