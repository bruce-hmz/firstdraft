import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      results.checks.env = { ok: false, error: 'Missing Supabase env vars' };
      return NextResponse.json(results);
    }

    results.checks.env = { ok: true, url: supabaseUrl };

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check pricing_plans table
    const { data: plans, error: plansError } = await supabase
      .from('pricing_plans')
      .select('*');

    if (plansError) {
      results.checks.pricing_plans = { 
        ok: false, 
        error: plansError.message,
        code: plansError.code 
      };
    } else {
      results.checks.pricing_plans = { 
        ok: true, 
        count: plans?.length || 0,
        data: plans 
      };
    }

    // Check user_stats table
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .limit(1);

    if (statsError) {
      results.checks.user_stats = { 
        ok: false, 
        error: statsError.message,
        code: statsError.code 
      };
    } else {
      results.checks.user_stats = { 
        ok: true,
        hasRemainingCredits: userStats?.[0]?.hasOwnProperty('remaining_credits') || false
      };
    }

    // Check payment_orders table
    const { data: orders, error: ordersError } = await supabase
      .from('payment_orders')
      .select('*')
      .limit(1);

    if (ordersError) {
      results.checks.payment_orders = { 
        ok: false, 
        error: ordersError.message,
        code: ordersError.code 
      };
    } else {
      results.checks.payment_orders = { ok: true };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error?.message,
    }, { status: 500 });
  }
}
