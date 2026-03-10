'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/next-intl';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Zap, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  description: string;
  popular?: boolean;
}

export default function PlansPage() {
  const t = useTranslations();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 默认套餐配置
    setPlans([
      {
        id: 'starter',
        name: t('billing.plans.starter.name'),
        credits: 10,
        price: 9.9,
        currency: 'CNY',
        description: t('billing.plans.starter.description'),
      },
      {
        id: 'pro',
        name: t('billing.plans.pro.name'),
        credits: 50,
        price: 39.9,
        currency: 'CNY',
        description: t('billing.plans.pro.description'),
        popular: true,
      },
      {
        id: 'unlimited',
        name: t('billing.plans.unlimited.name'),
        credits: 200,
        price: 129,
        currency: 'CNY',
        description: t('billing.plans.unlimited.description'),
      },
    ]);
  }, [t]);

  const handlePurchase = async (plan: Plan) => {
    setLoading(true);
    try {
      // 创建支付宝订单
      const response = await fetch('/api/billing/alipay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          credits: plan.credits,
          amount: plan.price,
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.qrCodeUrl) {
        // 跳转到支付页面
        window.location.href = data.data.qrCodeUrl;
      } else {
        alert(data.error?.message || t('errors.paymentError'));
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(t('errors.paymentError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <Link href="/drafts">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            {t('billing.plans.title')}
          </h1>
          <p className="text-xl text-neutral-600">
            {t('billing.plans.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 relative ${
                plan.popular
                  ? 'border-2 border-indigo-500 shadow-xl scale-105'
                  : 'border border-neutral-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {t('billing.plans.popular')}
                </div>
              )}
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-neutral-600 mb-6 min-h-[60px]">
                {plan.description}
              </p>
              <div className="mb-6">
                <div className="text-4xl font-bold text-neutral-900">
                  ¥{plan.price}
                </div>
                <div className="text-neutral-500 flex items-center gap-2 mt-2">
                  <Zap className="h-4 w-4" />
                  {plan.credits} {t('billing.credits')}
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-neutral-700">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{t('billing.features.aiGeneration')}</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-700">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{t('billing.features.shareLink')}</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-700">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{t('billing.features.editAnytime')}</span>
                </li>
              </ul>
              <Button
                className="w-full gap-2"
                disabled={loading}
                onClick={() => handlePurchase(plan)}
              >
                <CreditCard className="h-4 w-4" />
                {t('billing.buyNow')}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
