'use client';

import { useTranslations } from '@/lib/next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, MessageCircle, QrCode } from 'lucide-react';

interface PaywallProps {
  onClose?: () => void;
}

export function Paywall({ onClose }: PaywallProps) {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-white">
          <div className="text-center">
            {/* 图标 */}
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>

            {/* 标题 */}
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
              {t('billing.followTitle')}
            </h3>

            {/* 描述 */}
            <p className="text-neutral-600 mb-8 leading-relaxed">
              {t('billing.followDescription')}
            </p>

            {/* 公众号信息卡片 */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 mb-6 border border-green-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-neutral-500">{t('billing.wechatOfficialAccount')}</p>
                  <p className="text-lg font-bold text-neutral-900">麻瓜补习社</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600">
                {t('billing.followInstructions')}
              </p>
            </div>

            {/* 提示 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 {t('billing.followHint')}
              </p>
            </div>

            {/* 按钮 */}
            <div className="space-y-3">
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                >
                  {t('common.close')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
