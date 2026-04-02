import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const page_id = request.nextUrl.searchParams.get('page_id');

    if (!page_id) {
      return NextResponse.json(
        { error: 'Missing page_id' },
        { status: 400 }
      );
    }

    const { data: config, error } = await supabase
      .from('analytics_configs')
      .select('*')
      .eq('page_id', page_id)
      .single();

    if (error && error.code === 'PGRST116') {
      // 配置不存在，返回空对象
      return NextResponse.json({
        success: true,
        data: null
      });
    } else if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics config' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { page_id, google_analytics_id, baidu_analytics_id, custom_scripts, enabled } = await request.json();

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

    // 检查是否已存在配置
    const { data: existingConfig } = await supabase
      .from('analytics_configs')
      .select('id')
      .eq('page_id', page_id)
      .single();

    let config;
    if (existingConfig) {
      // 更新现有配置
      const { data: updatedConfig, error: updateError } = await supabase
        .from('analytics_configs')
        .update({
          google_analytics_id,
          baidu_analytics_id,
          custom_scripts,
          enabled: enabled ?? true
        })
        .eq('page_id', page_id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update analytics config' },
          { status: 500 }
        );
      }
      config = updatedConfig;
    } else {
      // 创建新配置
      const { data: newConfig, error: insertError } = await supabase
        .from('analytics_configs')
        .insert({
          page_id,
          google_analytics_id,
          baidu_analytics_id,
          custom_scripts,
          enabled: enabled ?? true
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create analytics config' },
          { status: 500 }
        );
      }
      config = newConfig;
    }

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
