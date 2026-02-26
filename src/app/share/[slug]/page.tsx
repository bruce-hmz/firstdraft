'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/next-intl';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ArrowLeft, Loader2 } from 'lucide-react';
import type { PageContent } from '@/types';

interface SharePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: PageContent;
  view_count: number;
  created_at: string;
}

export default function SharePage({ params }: SharePageProps) {
  const t = useTranslations();
  const [slug, setSlug] = useState<string>('');
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
      fetchPageData(resolvedParams.slug);
    });
  }, [params]);

  const fetchPageData = async (pageSlug: string) => {
    console.log('Fetching page data for slug:', pageSlug);
    
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', pageSlug)
        .eq('status', 'active')
        .single();

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          setError('PAGE_NOT_FOUND');
        } else {
          setError('FETCH_ERROR');
        }
        return;
      }

      console.log('Page data found:', data);
      setPageData(data as PageData);

      // Increment view count asynchronously
      supabase.rpc('increment_view_count', { page_slug: pageSlug })
    } catch (err) {
      console.error('Failed to fetch page:', err);
      setError('FETCH_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error === 'PAGE_NOT_FOUND') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">404</h1>
          <p className="text-neutral-600 mb-6">{t('errors.genericError')}</p>
          <Link href="/">
            <Button>{t('nav.myDrafts')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">{t('errors.error')}</h1>
          <p className="text-neutral-600 mb-6">{t('errors.tryAgain')}</p>
          <Button onClick={() => window.location.reload()}>{t('common.refresh')}</Button>
        </div>
      </div>
    );
  }

  const { content } = pageData;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-neutral-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-neutral-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">FirstDraft</span>
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  {t('common.copied')}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  {t('result.copyLink')}
                </>
              )}
            </Button>
            <Link href="/">
              <Button size="sm">{t('drafts.title')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-none">
          <div className="bg-neutral-900 text-white p-12 text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-0">
              {t('result.newProduct')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.productName}</h1>
            <p className="text-xl text-neutral-300 mb-2 whitespace-pre-line">{content.tagline}</p>
            <p className="text-neutral-400 max-w-lg mx-auto">{content.description}</p>
          </div>

          <div className="p-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                {content.problemSection.headline}
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                {content.problemSection.description}
              </p>

              <div className="space-y-4 mb-12">
                {content.problemSection.painPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-neutral-700">{point}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                {content.solutionSection.headline}
              </h2>
              <p className="text-neutral-600 mb-8">
                {content.solutionSection.description}
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {content.solutionSection.features.map((feature, index) => (
                  <Card key={index} className="p-6 border border-neutral-100">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-600">{feature.description}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center p-8 bg-neutral-50 rounded-2xl">
                <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white px-8">
                  {content.ctaSection.text}
                </Button>
                {content.ctaSection.subtext && (
                  <p className="text-sm text-neutral-500 mt-3">{content.ctaSection.subtext}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100">
            <p className="text-sm text-neutral-400">
              {t('result.generatedBy')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
