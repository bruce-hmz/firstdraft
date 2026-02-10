import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        isLoggedIn: false,
        remainingCredits: 0,
        canGenerate: false,
        canSave: false,
        generationCount: 0,
        saveCount: 0,
      });
    }

    const { data: stats } = await supabase
      .from('user_stats')
      .select('generation_count, save_count, remaining_credits')
      .eq('user_id', user.id)
      .single();

    const remainingCredits = stats?.remaining_credits || 0;
    const generationCount = stats?.generation_count || 0;
    const saveCount = stats?.save_count || 0;
    const canGenerate = remainingCredits > 0;
    const canSave = remainingCredits > 0;

    return NextResponse.json({
      isLoggedIn: true,
      remainingCredits,
      canGenerate,
      canSave,
      generationCount,
      saveCount,
    });
  } catch (error) {
    console.error('Get billing status error:', error);
    return NextResponse.json(
      { error: 'Failed to get billing status' },
      { status: 500 }
    );
  }
}
