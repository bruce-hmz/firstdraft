import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function sendWebhook(url: string, secret: string | null, payload: any) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-FirstDraft-Event': 'subscription.created',
      'X-FirstDraft-Timestamp': Date.now().toString(),
    };

    if (secret) {
      const signature = Buffer.from(
        JSON.stringify(payload) + secret
      ).toString('base64');
      headers['X-FirstDraft-Signature'] = signature;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    return { success: response.ok };
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    return { success: false };
  }
}

async function triggerWebhooks(supabase: any, pageId: string, subscriptionData: any) {
  try {
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('url, secret')
      .eq('page_id', pageId)
      .eq('enabled', true);

    if (webhooks && webhooks.length > 0) {
      const payload = {
        event: 'subscription.created',
        timestamp: new Date().toISOString(),
        data: subscriptionData,
      };

      // 并行发送所有 Webhook
      const promises = webhooks.map((webhook: any) =>
        sendWebhook(webhook.url, webhook.secret, payload)
      );

      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { page_id, email, name, metadata } = await request.json();

    if (!page_id || !email) {
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

    // 创建订阅
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        page_id,
        email,
        name,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (subscriptionError) {
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // 触发 Webhook 通知
    await triggerWebhooks(supabase, page_id, subscription);

    return NextResponse.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('page_id', page_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
