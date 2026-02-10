'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Zap, CreditCard, Check, Wallet } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  credits: number;
  price_cny: number;
  price_usd: number;
}

interface PaywallProps {
  onClose?: () => void;
}

export function Paywall({ onClose }: PaywallProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'stripe'>('alipay');
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('Fetching plans...');
      const res = await fetch('/api/billing/plans');
      const data = await res.json();
      console.log('Plans response:', data);
      
      if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
        setPlans(data.plans);
        setSelectedPlan(data.plans[1]?.id || data.plans[0]?.id);
      } else {
        console.error('No plans returned or invalid format:', data);
        setPlans([]);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans([]);
    } finally {
      setFetchingPlans(false);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const handlePay = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const endpoint = paymentMethod === 'alipay' 
        ? '/api/billing/alipay/create' 
        : '/api/billing/checkout';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      const data = await res.json();

      if (data.url || data.payUrl) {
        window.location.href = data.url || data.payUrl;
      } else {
        alert('创建支付会话失败，请重试');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('支付系统暂时不可用');
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  if (fetchingPlans) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          加载套餐...
        </div>
      </motion.div>
    );
  }

  if (plans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <Card className="p-8 max-w-md w-full text-center">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">加载失败</h3>
          <p className="text-neutral-600 mb-4">
            无法加载套餐信息。请检查数据库迁移是否已执行。
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">
            关闭
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl"
      >
        <Card className="p-8 bg-white">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              购买生成额度
            </h3>
            <p className="text-neutral-600">
              选择合适的套餐，开始创建你的产品页面
            </p>
          </div>

          {/* 套餐选择 */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`
                  relative p-6 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedPlan === plan.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    推荐
                  </div>
                )}
                
                <div className="text-center">
                  <h4 className="font-semibold text-neutral-900 mb-1">{plan.name}</h4>
                  <p className="text-sm text-neutral-500 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-neutral-900">¥{formatPrice(plan.price_cny)}</span>
                  </div>
                  
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {plan.credits} <span className="text-sm font-normal text-neutral-500">次</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    约 ¥{(plan.price_cny / plan.credits / 100).toFixed(2)}/次
                  </p>

                  {selectedPlan === plan.id && (
                    <div className="absolute top-4 right-4 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 支付方式选择 */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-neutral-700 mb-4 text-center">选择支付方式</h4>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPaymentMethod('alipay')}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all
                  ${paymentMethod === 'alipay'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                <Wallet className="h-5 w-5 text-blue-500" />
                <span className="font-medium">支付宝</span>
              </button>

              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all
                  ${paymentMethod === 'stripe'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                <CreditCard className="h-5 w-5 text-purple-500" />
                <span className="font-medium">信用卡/借记卡</span>
                {paymentMethod === 'stripe' && selectedPlanData && (
                  <span className="text-xs text-neutral-500">
                    ${formatPrice(selectedPlanData.price_usd || selectedPlanData.price_cny)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 支付按钮 */}
          <div className="space-y-3">
            <Button
              onClick={handlePay}
              disabled={loading || !selectedPlan}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {paymentMethod === 'alipay' ? '支付宝支付' : '信用卡支付'}
                  <span className="mx-2">·</span>
                  <span>
                    {paymentMethod === 'alipay' 
                      ? `¥${selectedPlanData ? formatPrice(selectedPlanData.price_cny) : '0.00'}`
                      : `$${selectedPlanData ? formatPrice(selectedPlanData.price_usd || selectedPlanData.price_cny) : '0.00'}`
                    }
                  </span>
                </>
              )}
            </Button>

            {onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-neutral-500"
              >
                稍后再说
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-neutral-400 mt-4">
            支付即表示您同意我们的服务条款。额度永久有效，可随时使用。
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
