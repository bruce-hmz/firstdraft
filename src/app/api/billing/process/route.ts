import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(req: NextRequest) {
  try {
    const { orderNo } = await req.json();

    if (!orderNo) {
      return NextResponse.json({ error: 'Order number required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    console.log('[process-order] Processing order:', orderNo);

    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (orderError || !order) {
      console.error('[process-order] Order not found:', orderError);
      return NextResponse.json({ 
        error: 'Order not found', 
        details: orderError?.message 
      }, { status: 404 });
    }

    console.log('[process-order] Order found:', order.order_no, 'status:', order.status, 'credits:', order.credits);

    if (order.status === 'paid') {
      console.log('[process-order] Order already paid');
      return NextResponse.json({ 
        success: true,
        message: 'Order already processed',
        credits: order.credits,
      });
    }

    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', order.id);

    if (updateError) {
      console.error('[process-order] Update failed:', updateError);
      return NextResponse.json({ error: 'Update failed', details: updateError.message }, { status: 500 });
    }

    console.log('[process-order] Calling add_credits for user:', order.user_id, 'amount:', order.credits);

    const { error: rpcError } = await supabase.rpc('add_credits', {
      p_user_id: order.user_id,
      p_amount: order.credits,
    });

    if (rpcError) {
      console.error('[process-order] Add credits failed:', rpcError);
      return NextResponse.json({ error: 'Add credits failed', details: rpcError.message }, { status: 500 });
    }

    console.log('[process-order] Credits added successfully');

    return NextResponse.json({
      success: true,
      message: 'Credits added successfully',
      credits: order.credits,
    });

  } catch (error: any) {
    console.error('[process-order] Internal error:', error);
    return NextResponse.json({ error: 'Internal error', details: error?.message }, { status: 500 });
  }
}
