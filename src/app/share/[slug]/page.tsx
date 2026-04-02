import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase';
import { getTemplate, TemplateType } from '@/components/templates';
import type { PageContent } from '@/types';

function coerceString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string' && v.trim().length > 0) as string[];
}

function coercePageContent(raw: unknown): PageContent {
  const r = (raw || {}) as any;
  const problem = r.problemSection || {};
  const solution = r.solutionSection || {};
  const cta = r.ctaSection || {};

  const painPoints = coerceStringArray(problem.painPoints);
  const featuresRaw = Array.isArray(solution.features) ? solution.features : [];
  const features = featuresRaw
    .map((f: any) => ({
      title: coerceString(f?.title, 'Feature'),
      description: coerceString(f?.description, ''),
      icon: typeof f?.icon === 'string' ? f.icon : undefined,
    }))
    .filter((f: any) => f.title || f.description);

  return {
    productName: coerceString(r.productName, coerceString(r.title, 'Untitled')),
    tagline: coerceString(r.tagline, ''),
    description: typeof r.description === 'string' ? r.description : '',
    problemSection: {
      headline: coerceString(problem.headline, ''),
      description: coerceString(problem.description, ''),
      painPoints,
    },
    solutionSection: {
      headline: coerceString(solution.headline, ''),
      description: coerceString(solution.description, ''),
      features,
    },
    ctaSection: {
      text: coerceString(cta.text, 'Get Started'),
      subtext: typeof cta.subtext === 'string' ? cta.subtext : undefined,
    },
  };
}

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

interface MediaItem {
  id: string;
  url: string;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('pages')
      .select('title, content')
      .eq('slug', resolvedParams.slug)
      .single();

    if (error || !data) {
      return {
        title: '页面未找到 - FirstDraft',
        description: '页面不存在或已被删除',
      };
    }

    const content = coercePageContent(data.content);
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
  } catch (error) {
    console.error('Share generateMetadata error:', error);
    return {
      title: 'FirstDraft',
      description: '由 FirstDraft AI 生成的产品落地页',
    };
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const resolvedParams = await params;
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .single();

    // 获取页面关联的媒体文件
    let media: MediaItem[] = [];
    if (data) {
      const { data: mediaData } = await supabase
        .from('media')
        .select('id, url')
        .eq('page_id', data.id)
        .order('created_at', { ascending: false });
      media = (mediaData as MediaItem[] | null) || [];
    }

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
    const content = coercePageContent(pageData.content);
    const TemplateComponent = getTemplate((pageData.template as TemplateType) || TemplateType.DEFAULT);

    // 获取分析配置
    let analyticsConfig = null;
    try {
      const { data: config } = await supabase
        .from('analytics_configs')
        .select('*')
        .eq('page_id', pageData.id)
        .single();
      analyticsConfig = config;
    } catch (error) {
      console.warn('Error fetching analytics config:', error);
    }

    // Increment view count asynchronously (best effort)
    void (async () => {
      try {
        const { error: rpcError } = await supabase.rpc('increment_view_count', { page_slug: resolvedParams.slug });
        if (rpcError) {
          console.warn('increment_view_count failed:', rpcError);
        }
      } catch (error) {
        console.warn('Error incrementing view count:', error);
      }
    })();

    return (
      <>
        {/* Google Analytics */}
        {analyticsConfig?.google_analytics_id && analyticsConfig?.enabled && (
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.google_analytics_id}`}
          />
        )}
        {analyticsConfig?.google_analytics_id && analyticsConfig?.enabled && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsConfig.google_analytics_id}');
              `
            }}
          />
        )}

        {/* Baidu Analytics */}
        {analyticsConfig?.baidu_analytics_id && analyticsConfig?.enabled && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                var _hmt = _hmt || [];
                (function() {
                  var hm = document.createElement("script");
                  hm.src = "https://hm.baidu.com/hm.js?${analyticsConfig.baidu_analytics_id}";
                  var s = document.getElementsByTagName("script")[0];
                  s.parentNode.insertBefore(hm, s);
                })();
              `
            }}
          />
        )}

        {/* Custom Scripts */}
        {analyticsConfig?.custom_scripts && analyticsConfig?.enabled && (
          <script
            dangerouslySetInnerHTML={{
              __html: analyticsConfig.custom_scripts
            }}
          />
        )}

        <TemplateComponent content={content} pageId={pageData.id} media={media} />
      </>
    );
  } catch (error) {
    console.error('Share page error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">页面暂时不可用</h1>
          <p className="text-neutral-600 mb-6">服务端发生错误，请稍后重试。</p>
          <a href="/drafts">
            <button className="px-4 py-2 bg-black text-white rounded-md">我的草稿</button>
          </a>
        </div>
      </div>
    );
  }
}
