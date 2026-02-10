import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { alipaySdk } from '@/lib/alipay';

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

    // 获取套餐信息
    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 生成订单号
    const { data: orderNoData } = await supabase.rpc('generate_order_no');
    const orderNo = orderNoData as string;

    // 创建支付订单
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
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 创建支付宝支付表单
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const notifyUrl = `${baseUrl}/api/billing/alipay/notify`;
    const returnUrl = `${baseUrl}/billing/success`;

    const alipayForm = await alipaySdk.exec('alipay.trade.page.pay', {
      notify_url: notifyUrl,
      return_url: returnUrl,
      bizContent: {
        out_trade_no: orderNo,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        total_amount: (plan.price_cny / 100).toFixed(2),
        subject: `${plan.name} - ${plan.credits}次`,
        body: `FirstDraft ${plan.name}，包含${plan.credits}次生成额度`,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNo: orderNo,
      payUrl: alipayForm,
    });
  } catch (error) {
    console.error('Alipay create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create alipay order' },
      { status: 500 }
    );
  }
}
