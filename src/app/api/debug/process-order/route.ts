import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { orderNo } = await req.json();

    if (!orderNo) {
      return NextResponse.json({ error: 'Order number required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ 
        error: 'Order not found', 
        details: orderError?.message 
      }, { status: 404 });
    }

    if (order.status === 'paid') {
      return NextResponse.json({ 
        message: 'Order already processed',
        order: {
          orderNo: order.order_no,
          status: order.status,
          credits: order.credits,
        }
      });
    }

    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update order', 
        details: updateError.message 
      }, { status: 500 });
    }

    const { error: creditsError } = await supabase.rpc('add_credits', {
      p_user_id: order.user_id,
      p_amount: order.credits,
    });

    if (creditsError) {
      return NextResponse.json({ 
        error: 'Failed to add credits', 
        details: creditsError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order processed successfully',
      order: {
        orderNo: order.order_no,
        status: 'paid',
        credits: order.credits,
        userId: order.user_id,
      }
    });

  } catch (error: any) {
    console.error('Manual order processing error:', error);
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error?.message 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNo = searchParams.get('order_no');

    const supabase = createAdminClient();

    if (orderNo) {
      const { data: order, error } = await supabase
        .from('payment_orders')
        .select('order_no, status, credits, amount_cny, user_id, created_at, paid_at')
        .eq('order_no', orderNo)
        .single();

      if (error || !order) {
        return NextResponse.json({ 
          error: 'Order not found', 
          details: error?.message 
        }, { status: 404 });
      }

      return NextResponse.json({ order });
    } else {
      const { data: orders, error } = await supabase
        .from('payment_orders')
        .select('order_no, status, credits, amount_cny, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        return NextResponse.json({ 
          error: 'Failed to fetch orders', 
          details: error.message 
        }, { status: 500 });
      }

      return NextResponse.json({ orders });
    }
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error?.message 
    }, { status: 500 });
  }
}
