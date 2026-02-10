import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    console.log('API: Fetching pricing plans...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: 'Server configuration error', plans: [] },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, anonKey);
    
    const { data: plans, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('API: Get plans error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch plans', details: error.message, plans: [] },
        { status: 500 }
      );
    }

    console.log(`API: Found ${plans?.length || 0} plans`);
    
    if (!plans || plans.length === 0) {
      return NextResponse.json(
        { error: 'No active plans found', plans: [] },
        { status: 200 }
      );
    }

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error('API: Get plans exception:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error?.message || 'Unknown error', plans: [] },
      { status: 500 }
    );
  }
}
