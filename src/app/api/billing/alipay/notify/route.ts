import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AlipaySdk } from 'alipay-sdk';

const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  signType: 'RSA2',
});

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const params: Record<string, string> = {};
    
    body.forEach((value, key) => {
      params[key] = value.toString();
    });

    // 验证签名
    const isValid = alipaySdk.checkNotifySign(params);
    
    if (!isValid) {
      console.error('Invalid alipay notify signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const tradeStatus = params.trade_status;
    const orderNo = params.out_trade_no;
    const alipayOrderNo = params.trade_no;

    console.log('Alipay notify received:', { orderNo, tradeStatus, alipayOrderNo });

    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      const supabase = createAdminClient();

      // 查询订单
      const { data: order } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('order_no', orderNo)
        .eq('status', 'pending')
        .single();

      if (!order) {
        console.log('Order not found or already processed:', orderNo);
        return NextResponse.json('success'); // 支付宝需要返回 success
      }

      // 更新订单状态
      await supabase
        .from('payment_orders')
        .update({
          status: 'paid',
          provider_order_no: alipayOrderNo,
          paid_at: new Date().toISOString(),
          provider_response: params,
        })
        .eq('id', order.id);

      // 增加用户次数
      await supabase.rpc('add_credits', {
        p_user_id: order.user_id,
        p_amount: order.credits,
      });

      console.log('Order processed successfully:', orderNo, 'Credits added:', order.credits);
    }

    // 支付宝需要返回 'success' 字符串
    return new NextResponse('success', {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Alipay notify error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
