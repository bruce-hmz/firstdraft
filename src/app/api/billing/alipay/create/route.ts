import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function formatPrivateKey(key: string): string {
  let cleanKey = key.trim();
  
  if (cleanKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    const match = cleanKey.match(/-----BEGIN RSA PRIVATE KEY-----\n?([\s\S]*?)\n?-----END RSA PRIVATE KEY-----/);
    if (match) {
      const body = match[1].replace(/\s+/g, '');
      const formattedBody = body.match(/.{1,64}/g)?.join('\n') || body;
      return `-----BEGIN RSA PRIVATE KEY-----\n${formattedBody}\n-----END RSA PRIVATE KEY-----`;
    }
  }
  
  if (cleanKey.includes('-----BEGIN') && cleanKey.includes('-----END')) {
    const headerMatch = cleanKey.match(/(-----BEGIN\w+-----)([\s\S]*?)(-----END\w+-----)/);
    if (headerMatch) {
      const body = headerMatch[2].replace(/\s+/g, '');
      const formattedBody = body.match(/.{1,64}/g)?.join('\n') || body;
      
      const rawHeader = headerMatch[1];
      let header = '-----BEGIN RSA PRIVATE KEY-----';
      if (rawHeader.includes('PRIVATEKEY') && !rawHeader.includes('RSA')) {
        header = '-----BEGIN PRIVATE KEY-----';
        return `${header}\n${formattedBody}\n-----END PRIVATE KEY-----`;
      }
      return `${header}\n${formattedBody}\n-----END RSA PRIVATE KEY-----`;
    }
  }
  
  const cleanBody = cleanKey.replace(/\s+/g, '');
  const formattedBody = cleanBody.match(/.{1,64}/g)?.join('\n') || cleanBody;
  return `-----BEGIN RSA PRIVATE KEY-----\n${formattedBody}\n-----END RSA PRIVATE KEY-----`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const { data: orderNoData } = await supabase.rpc('generate_order_no');
    const orderNo = orderNoData as string;

    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        plan_id: planId,
        order_no: orderNo,
        credits: plan.credits,
        amount_cny: plan.price_cny,
        provider: 'alipay',
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Create order error:', orderError);
      return NextResponse.json({ 
        error: 'Failed to create order', 
        details: orderError.message 
      }, { status: 500 });
    }

    const appId = process.env.ALIPAY_APP_ID;
    const privateKey = process.env.ALIPAY_PRIVATE_KEY;
    const gateway = process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do';

    if (!appId || !privateKey) {
      return NextResponse.json({ 
        error: 'Missing Alipay configuration',
        details: `APP_ID: ${appId ? 'set' : 'missing'}, PRIVATE_KEY: ${privateKey ? 'set' : 'missing'}`
      }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/billing/success?order_no=${orderNo}`;
    const totalAmount = (plan.price_cny / 100).toFixed(2);
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const bizContent = JSON.stringify({
      out_trade_no: orderNo,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: totalAmount,
      subject: `${plan.name}`,
      body: `包含${plan.credits}次生成额度`,
    });

    const params: Record<string, string> = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      format: 'JSON',
      return_url: returnUrl,
      notify_url: `${baseUrl}/api/billing/alipay/notify`,
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: timestamp,
      version: '1.0',
      biz_content: bizContent,
    };

    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    console.log('Sign string preview:', signString.substring(0, 100));

    try {
      const crypto = await import('crypto');
      const formattedKey = formatPrivateKey(privateKey);
      const sign = crypto.createSign('RSA-SHA256').update(signString, 'utf8').sign(formattedKey, 'base64');
      params.sign = sign;

      const queryString = sortedKeys
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const payUrl = `${gateway}?${queryString}&sign=${encodeURIComponent(sign)}`;

      return NextResponse.json({
        orderId: order.id,
        orderNo: orderNo,
        payUrl: payUrl,
        type: 'redirect',
      });
    } catch (signError: any) {
      console.error('Sign error:', signError);
      return NextResponse.json({
        error: 'Failed to sign request',
        details: signError.message,
        hint: '请检查 ALIPAY_PRIVATE_KEY 格式。应包含 -----BEGIN RSA PRIVATE KEY----- 和 -----END RSA PRIVATE KEY-----',
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Alipay create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create alipay order', details: error?.message },
      { status: 500 }
    );
  }
}
