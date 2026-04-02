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

    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('page_id', page_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch webhooks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: webhooks
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
    const supabase = await createClient();
    const { page_id, url, secret, enabled, events } = await request.json();

    if (!page_id || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // 创建 Webhook 配置
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .insert({
        page_id,
        url,
        secret,
        enabled: enabled ?? true,
        events: events ?? { subscription: true }
      })
      .select()
      .single();

    if (webhookError) {
      return NextResponse.json(
        { error: 'Failed to create webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: webhook
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { id, url, secret, enabled, events } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing webhook id' },
        { status: 400 }
      );
    }

    // 更新 Webhook 配置
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .update({
        ...(url && { url }),
        ...(secret !== undefined && { secret }),
        ...(enabled !== undefined && { enabled }),
        ...(events && { events })
      })
      .eq('id', id)
      .select()
      .single();

    if (webhookError) {
      return NextResponse.json(
        { error: 'Failed to update webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: webhook
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing webhook id' },
        { status: 400 }
      );
    }

    // 删除 Webhook 配置
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
