import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
  const payload = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const orderNo = session.metadata?.orderNo;
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || '0');

        if (!orderId || !userId) {
          console.error('Missing metadata in session:', session.metadata);
          break;
        }

        // 更新订单状态
        const { data: order } = await supabase
          .from('payment_orders')
          .update({
            status: 'paid',
            provider_order_no: session.payment_intent as string,
            paid_at: new Date().toISOString(),
            provider_response: session,
          })
          .eq('id', orderId)
          .eq('status', 'pending')
          .select()
          .single();

        if (!order) {
          console.log('Order not found or already processed:', orderId);
          break;
        }

        // 增加用户次数
        await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_amount: credits,
        });

        console.log('Payment processed:', orderNo, 'Credits added:', credits);
        break;
      }

      case 'charge.refunded': {
        // 处理退款逻辑（可选）
        const charge = event.data.object as Stripe.Charge;
        console.log('Refund processed:', charge.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
