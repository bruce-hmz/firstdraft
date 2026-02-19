'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from '@/lib/next-intl';

interface OrderInfo {
  orderNo: string;
  planName: string;
  credits: number;
  amount: number;
}

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get('order_no');
  const t = useTranslations();
  
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (!orderNo) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        const { data: order, error: orderError } = await supabase
          .from('payment_orders')
          .select('order_no, credits, amount_cny, status')
          .eq('order_no', orderNo)
          .single();

        if (orderError) {
          console.error('Fetch order error:', orderError);
          setError(t('errors.genericError'));
          setLoading(false);
          return;
        }

        if (order) {
          const isPro = order.credits >= 1000;
          setOrderInfo({
            orderNo: order.order_no,
            planName: isPro ? 'Pro' : t('billing.success.plan'),
            credits: order.credits,
            amount: order.amount_cny / 100,
          });

          if (order.status === 'pending') {
            const res = await fetch('/api/billing/process', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderNo: order.order_no }),
            });
            const result = await res.json();
            if (result.success) {
              setProcessed(true);
              setTimeout(() => window.location.reload(), 2000);
            } else {
              console.error('Process order failed:', result);
            }
          } else {
            setProcessed(true);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(t('errors.genericError'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [orderNo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">{t('billing.success.verifying')}</p>
        </div>
      </div>
    );
  }

  const isProPlan = orderInfo && (orderInfo.planName.toLowerCase().includes('pro') || orderInfo.credits >= 1000);

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
            {isProPlan ? t('billing.success.welcomePro') : t('billing.success.purchaseSuccess')}
          </h1>

          <p className="text-neutral-600 mb-6">
            {isProPlan 
              ? t('billing.success.successMessagePro')
              : t('billing.success.successMessageCredits', { credits: orderInfo?.credits || 0 })
            }
          </p>

          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-2">
              {isProPlan ? t('billing.success.proBenefits') : t('billing.success.planBenefits', { planName: orderInfo?.planName || '' })}
            </h3>
            <ul className="text-left text-sm text-neutral-600 space-y-2">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {isProPlan ? t('billing.success.unlimitedGenerations') : t('billing.success.creditsGenerations', { credits: orderInfo?.credits || 0 })}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {isProPlan ? t('billing.success.unlimitedSaves') : t('billing.success.onDemandSaves')}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {t('billing.success.prioritySpeed')}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {t('billing.success.exportHTML')}
              </li>
            </ul>
            
            {orderInfo && (
              <div className="mt-4 pt-4 border-t border-neutral-200 text-sm text-neutral-500">
                <p>{t('billing.success.orderNumber')}: {orderInfo.orderNo}</p>
                <p>{t('billing.success.paymentAmount')}: ¥{orderInfo.amount.toFixed(2)}</p>
                {orderInfo.credits > 0 && orderInfo.credits < 1000 && (
                  <p className="mt-1 text-amber-600 font-medium">
                    {t('billing.success.remainingCredits', { credits: orderInfo.credits })}
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-amber-600 mb-4">
              {error}. {t('billing.success.verificationError')}
            </p>
          )}

          {processed && (
            <p className="text-sm text-green-600 mb-4">
              {t('billing.success.creditsAdded')}
            </p>
          )}

          <Link href="/">
            <Button className="w-full bg-neutral-900 hover:bg-neutral-800">
              {t('billing.success.startCreating')}
            </Button>
          </Link>
          
          {error && (
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-neutral-500 hover:text-neutral-700 underline"
            >
              {t('billing.success.refreshRetry')}
            </button>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

function SuccessPageFallback() {
  const t = useTranslations();
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600">{t('billing.success.verifying')}</p>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<SuccessPageFallback />}>
      <BillingSuccessContent />
    </Suspense>
  );
}
