'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/next-intl';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Smartphone, ShoppingCart, Layout } from 'lucide-react';
import Link from 'next/link';

const templates = [
  {
    id: 'default',
    name: 'SaaS 产品模板',
    description: '适合软件产品、SaaS服务，经典落地页布局',
    icon: Layout,
  },
  {
    id: 'mobile-app',
    name: '移动应用模板',
    description: '适合手机App，突出预览展示和应用商店下载',
    icon: Smartphone,
  },
  {
    id: 'physical-product',
    name: '实体商品模板',
    description: '适合实体产品，突出图片位置和购物体验',
    icon: ShoppingCart,
  },
];

export default function TemplateSelectPage() {
  const t = useTranslations();
  const router = useRouter();
  const { generationFlow: { idea, template }, setTemplate, setGenerationStep } = useAppStore();

  if (!idea) {
    router.push('/');
    return null;
  }

  const handleSelect = (templateId: string) => {
    setTemplate(templateId);
    setGenerationStep('questions');
    router.push('/generate');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>重新输入想法</span>
        </Link>

        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          选择页面模板
        </h1>
        <p className="text-neutral-600 mb-8">
          为「{idea}」选择最适合的展示模板
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {templates.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <Card
                key={tmpl.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                  template === tmpl.id
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-transparent hover:border-neutral-200'
                }`}
                onClick={() => handleSelect(tmpl.id)}
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{tmpl.name}</h3>
                <p className="text-sm text-neutral-600">{tmpl.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
