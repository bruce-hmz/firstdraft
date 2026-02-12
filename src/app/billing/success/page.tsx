'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface OrderInfo {
  orderNo: string;
  planName: string;
  credits: number;
  amount: number;
}

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get('order_no');
  
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
          setError('无法获取订单信息');
          setLoading(false);
          return;
        }

        if (order) {
          const isPro = order.credits >= 1000;
          setOrderInfo({
            orderNo: order.order_no,
            planName: isPro ? 'Pro' : '套餐',
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
        setError('获取订单信息失败');
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
          <p className="text-neutral-600">正在确认您的支付...</p>
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
            {isProPlan ? '欢迎加入 FirstDraft Pro!' : `购买 ${orderInfo?.planName || '套餐'} 成功!`}
          </h1>

          <p className="text-neutral-600 mb-6">
            {isProPlan 
              ? '您的支付已成功处理。现在您可以享受无限次生成和保存功能。'
              : `您的支付已成功处理。您已购买 ${orderInfo?.credits || 0} 次生成额度。`
            }
          </p>

          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-2">
              {isProPlan ? 'Pro 权益' : `${orderInfo?.planName} 权益`}
            </h3>
            <ul className="text-left text-sm text-neutral-600 space-y-2">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {isProPlan ? '无限次生成产品页面' : `${orderInfo?.credits || 0} 次生成产品页面`}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {isProPlan ? '无限次保存和分享' : '按需保存和分享'}
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
            
            {orderInfo && (
              <div className="mt-4 pt-4 border-t border-neutral-200 text-sm text-neutral-500">
                <p>订单号: {orderInfo.orderNo}</p>
                <p>支付金额: ¥{orderInfo.amount.toFixed(2)}</p>
                {orderInfo.credits > 0 && orderInfo.credits < 1000 && (
                  <p className="mt-1 text-amber-600 font-medium">
                    剩余 {orderInfo.credits} 次生成额度
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-amber-600 mb-4">
              {error}，但支付可能已成功处理。
            </p>
          )}

          {processed && (
            <p className="text-sm text-green-600 mb-4">
              ✓ 额度已成功添加到您的账户
            </p>
          )}

          <Link href="/">
            <Button className="w-full bg-neutral-900 hover:bg-neutral-800">
              开始创建
            </Button>
          </Link>
          
          {error && (
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-neutral-500 hover:text-neutral-700 underline"
            >
              刷新页面重试
            </button>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">正在确认您的支付...</p>
        </div>
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
}
