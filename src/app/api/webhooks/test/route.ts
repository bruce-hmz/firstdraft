import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function sendWebhook(url: string, secret: string | null, payload: any) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-FirstDraft-Event': 'webhook.test',
      'X-FirstDraft-Timestamp': Date.now().toString(),
    };

    if (secret) {
      // 生成签名（简单实现）
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

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { webhook_id } = await request.json();

    if (!webhook_id) {
      return NextResponse.json(
        { error: 'Missing webhook_id' },
        { status: 400 }
      );
    }

    // 获取 Webhook 配置
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhook_id)
      .single();

    if (webhookError || !webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // 发送测试事件
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook event',
        test: true,
      },
    };

    const result = await sendWebhook(
      webhook.url,
      webhook.secret,
      testPayload
    );

    return NextResponse.json({
      success: true,
      data: {
        webhook_id,
        test_result: result,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
