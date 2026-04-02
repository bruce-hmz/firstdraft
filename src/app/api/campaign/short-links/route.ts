import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 生成随机短码
function generateShortCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { campaign_id, original_url, platform } = await request.json();

    if (!campaign_id || !original_url || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 生成唯一短码
    let short_code;
    let exists = true;
    while (exists) {
      short_code = generateShortCode();
      const { data } = await supabase
        .from('short_links')
        .select('id')
        .eq('short_code', short_code)
        .single();
      exists = !!data;
    }

    const { data, error } = await supabase
      .from('short_links')
      .insert({
        campaign_id,
        original_url,
        short_code,
        platform,
        clicks: 0
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        short_url: `${process.env.NEXT_PUBLIC_APP_URL}/r/${short_code}`
      },
    });
  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Missing campaign_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('short_links')
      .select('*')
      .eq('campaign_id', campaign_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 添加完整的短链接 URL
    const linksWithUrl = data.map(link => ({
      ...link,
      short_url: `${process.env.NEXT_PUBLIC_APP_URL}/r/${link.short_code}`
    }));

    return NextResponse.json({
      success: true,
      data: linksWithUrl,
    });
  } catch (error) {
    console.error('Error getting short links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
