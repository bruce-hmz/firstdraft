'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/next-intl';
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
  const t = useTranslations();
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
        alert(t('billing.paymentError'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(t('billing.paymentUnavailable'));
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
          {t('billing.loading')}
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
          <h3 className="text-xl font-bold text-neutral-900 mb-4">{t('billing.loadFailed')}</h3>
          <p className="text-neutral-600 mb-4">
            {t('billing.loadFailedDescription')}
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">
            {t('common.close')}
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
              {t('billing.title')}
            </h3>
            <p className="text-neutral-600">
              {t('billing.description')}
            </p>
          </div>

          {/* Plan selection */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={selectedPlan === plan.id
                  ? 'relative p-6 rounded-xl border-2 cursor-pointer transition-all border-blue-500 bg-blue-50'
                  : 'relative p-6 rounded-xl border-2 cursor-pointer transition-all border-neutral-200 hover:border-neutral-300'
                }
              >
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {t('billing.recommended')}
                  </div>
                )}

                <div className="text-center">
                  <h4 className="font-semibold text-neutral-900 mb-1">{t(`billing.plans.${index}.name`)}</h4>
                  <p className="text-sm text-neutral-500 mb-4">{t(`billing.plans.${index}.description`)}</p>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-neutral-900">{'¥' + formatPrice(plan.price_cny)}</span>
                  </div>

                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {plan.credits} <span className="text-sm font-normal text-neutral-500">{t('common.times')}</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {'¥' + ((plan.price_cny / plan.credits / 100).toFixed(2)) + t('common.per_time')}
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

          {/* Payment method selection */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-neutral-700 mb-4 text-center">{t('billing.selectPayment')}</h4>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setPaymentMethod('alipay')}
                className={paymentMethod === 'alipay'
                  ? 'flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-all border-blue-500 bg-blue-50'
                  : 'flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-all border-neutral-200 hover:border-neutral-300'
                }
              >
                <Wallet className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{t('billing.alipay')}</span>
              </button>

              <button
                onClick={() => setPaymentMethod('stripe')}
                className={paymentMethod === 'stripe'
                  ? 'flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-all border-purple-500 bg-purple-50'
                  : 'flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-all border-neutral-200 hover:border-neutral-300'
                }
              >
                <CreditCard className="h-5 w-5 text-purple-500" />
                <span className="font-medium">{t('billing.creditCard')}</span>
                {paymentMethod === 'stripe' && selectedPlanData && (
                  <span className="text-xs text-neutral-500">
                    {formatPrice(selectedPlanData.price_usd || selectedPlanData.price_cny)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Payment button */}
          <div className="space-y-3">
            <Button
              onClick={handlePay}
              disabled={loading || !selectedPlan}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 sm:h-auto"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {paymentMethod === 'alipay' ? t('billing.alipayPay') : t('billing.cardPay')}
                  <span className="mx-2">·</span>
                  <span>
                    {paymentMethod === 'alipay'
                      ? '¥' + (selectedPlanData ? formatPrice(selectedPlanData.price_cny) : '0.00')
                      : '$' + (selectedPlanData ? formatPrice(selectedPlanData.price_usd || selectedPlanData.price_cny) : '0.00')
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
                {t('billing.later')}
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-neutral-400 mt-4">
            {t('billing.terms')}
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
