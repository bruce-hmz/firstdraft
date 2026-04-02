import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createClient();
  const { code } = params;

  try {
    // 查找短链接
    const { data: link, error: linkError } = await supabase
      .from('short_links')
      .select('id, original_url')
      .eq('short_code', code)
      .single();

    if (linkError || !link) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // 记录点击数据
    await supabase
      .from('link_clicks')
      .insert({
        short_link_id: link.id,
        ip_address: request.ip || '',
        user_agent: request.headers.get('user-agent') || '',
        referer: request.headers.get('referer') || ''
      });

    // 更新点击计数
    await supabase
      .from('short_links')
      .update({ clicks: supabase.raw('clicks + 1'), updated_at: new Date().toISOString() })
      .eq('id', link.id);

    // 重定向到原始 URL
    return NextResponse.redirect(link.original_url);
  } catch (error) {
    console.error('Error handling short link:', error);
    return NextResponse.redirect(new URL('/404', request.url));
  }
}
