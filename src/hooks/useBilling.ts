'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';

interface BillingState {
  isLoggedIn: boolean;
  remainingCredits: number;
  generationCount: number;
  saveCount: number;
  canGenerate: boolean;
  canSave: boolean;
  loading: boolean;
}

interface PaywallCheck {
  blocked: boolean;
  reason: 'credits' | null;
  message: string;
}

export function useBilling() {
  const { user } = useAppStore();
  const [billing, setBilling] = useState<BillingState>({
    isLoggedIn: false,
    remainingCredits: 0,
    generationCount: 0,
    saveCount: 0,
    canGenerate: false,
    canSave: false,
    loading: true,
  });

  const fetchBillingStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/status');
      const data = await res.json();

      setBilling({
        isLoggedIn: data.isLoggedIn,
        remainingCredits: data.remainingCredits || 0,
        generationCount: data.generationCount || 0,
        saveCount: data.saveCount || 0,
        canGenerate: data.canGenerate,
        canSave: data.canSave,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch billing status:', error);
      setBilling(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchBillingStatus();
  }, [fetchBillingStatus, user?.id]);

  const checkPaywall = useCallback((): PaywallCheck => {
    if (billing.loading) {
      return { blocked: false, reason: null, message: '' };
    }

    if (!billing.isLoggedIn) {
      return {
        blocked: true,
        reason: 'credits',
        message: '请先登录以使用生成和保存功能',
      };
    }

    if (billing.remainingCredits <= 0) {
      return {
        blocked: true,
        reason: 'credits',
        message: `剩余次数不足（${billing.remainingCredits}次）。购买额度以继续使用。`,
      };
    }

    return { blocked: false, reason: null, message: '' };
  }, [billing]);

  const deductCredit = useCallback(async () => {
    if (!billing.isLoggedIn) return false;

    try {
      const res = await fetch('/api/billing/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.success) {
        setBilling(prev => ({
          ...prev,
          remainingCredits: prev.remainingCredits - 1,
          canGenerate: prev.remainingCredits - 1 > 0,
          canSave: prev.remainingCredits - 1 > 0,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to deduct credit:', error);
      return false;
    }
  }, [billing.isLoggedIn]);

  return {
    ...billing,
    checkPaywall,
    deductCredit,
    refresh: fetchBillingStatus,
  };
}
