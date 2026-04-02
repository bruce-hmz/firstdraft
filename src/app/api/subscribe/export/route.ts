import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const page_id = request.nextUrl.searchParams.get('page_id');

    if (!page_id) {
      return NextResponse.json(
        { error: 'Missing page_id' },
        { status: 400 }
      );
    }

    // 验证页面是否存在
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('id')
      .eq('id', page_id)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // 获取订阅数据
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('email, name, created_at, metadata')
      .eq('page_id', page_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    // 生成 CSV
    const headers = ['Email', 'Name', 'Created At', 'Metadata'];
    const rows = subscriptions.map(sub => [
      sub.email,
      sub.name || '',
      sub.created_at,
      JSON.stringify(sub.metadata || {})
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // 返回 CSV 文件
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=subscriptions-${page_id}.csv`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
