import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

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
        amount_usd: plan.price_usd,
        provider: 'stripe',
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Create order error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 创建 Stripe Checkout 会话
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let session;
    if (plan.stripe_price_id) {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripe_price_id,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/billing/cancel`,
        metadata: {
          orderId: order.id,
          orderNo: orderNo,
          userId: user.id,
          credits: plan.credits,
        },
      });
    } else {
      // 动态创建价格
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan.name} - ${plan.credits} Credits`,
                description: `FirstDraft ${plan.name}，包含${plan.credits}次生成额度`,
              },
              unit_amount: plan.price_usd || plan.price_cny,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/billing/cancel`,
        metadata: {
          orderId: order.id,
          orderNo: orderNo,
          userId: user.id,
          credits: plan.credits,
        },
      });
    }

    return NextResponse.json({
      orderId: order.id,
      orderNo: orderNo,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
