import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 调用数据库函数扣减次数
    const { data: success, error } = await supabase.rpc('deduct_credits', {
      user_id: user.id,
      amount: 1,
    });

    if (error) {
      console.error('Deduct credits error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to deduct credits' },
        { status: 500 }
      );
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deduct credits error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
