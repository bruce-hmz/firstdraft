import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase';
import { getTemplate, TemplateType } from '@/components/templates';
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
  template?: string;
  view_count: number;
  created_at: string;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = createAdminClient();
  
  const { data } = await supabase
    .from('pages')
    .select('title, content')
    .eq('slug', resolvedParams.slug)
    .eq('status', 'active')
    .single();

  if (!data) {
    return {
      title: '页面未找到 - FirstDraft',
      description: '页面不存在或已被删除',
    };
  }

  const content = data.content as PageContent;
  const description = content.description || content.tagline || `由 FirstDraft AI 生成的产品落地页`;

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${siteUrl}/share/${resolvedParams.slug}`;

  return {
    title: `${content.productName} | FirstDraft`,
    description,
    openGraph: {
      title: content.productName,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.productName,
      description,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const resolvedParams = await params;
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">404</h1>
          <p className="text-neutral-600 mb-6">页面不存在</p>
          <a href="/drafts">
            <button className="px-4 py-2 bg-black text-white rounded-md">我的草稿</button>
          </a>
        </div>
      </div>
    );
  }

  const pageData = data as PageData;
  const { content, template } = pageData;
  const TemplateComponent = getTemplate(template as TemplateType);

  // Increment view count asynchronously
  void supabase.rpc('increment_view_count', { page_slug: resolvedParams.slug });

  return <TemplateComponent content={content} />;
}
