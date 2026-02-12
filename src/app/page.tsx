'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/next-intl';
import { Navbar } from '@/components/navigation/navbar';
import { MobileMenu } from '@/components/navigation/mobile-menu';
import { Sparkles, Zap, Clock, Share2, Menu } from 'lucide-react';
import { IdeaInputSection } from '@/components/sections/idea-input-section';
import { ExampleIdeas } from '@/components/sections/example-ideas';

const ADMIN_EMAIL = '123387447@qq.com';

export default function Home() {
  const t = useTranslations();
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) return;
      const data = await response.json();
      if (data.data?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <Navbar showBackButton={false} onBack={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            {t('home.title')}
            <br />
            {t('home.titleLine2')}
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            {t('home.description')}
            <br />
            {t('home.descriptionLine2')}
          </p>
        </div>

        <IdeaInputSection key={selectedIdea} initialIdea={selectedIdea} />
        <ExampleIdeas onSelectIdea={setSelectedIdea} />

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">{t('home.feature1Title')}</h3>
            <p className="text-neutral-600 text-sm">
              {t('home.feature1Description')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">{t('home.feature2Title')}</h3>
            <p className="text-neutral-600 text-sm">
              {t('home.feature2Description')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">{t('home.feature3Title')}</h3>
            <p className="text-neutral-600 text-sm">
              {t('home.feature3Description')}
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-neutral-100 py-8 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-neutral-500 text-sm">
          {t('home.footer')}
        </div>
      </footer>
    </main>
  );
}
