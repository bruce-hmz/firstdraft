import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type } = await req.json()

    if (type === 'generation') {
      await supabase.rpc('increment_generation_count', {
        user_id: user.id,
      })
    } else if (type === 'save') {
      await supabase.rpc('increment_save_count', {
        user_id: user.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Increment count error:', error)
    return NextResponse.json(
      { error: 'Failed to increment count' },
      { status: 500 }
    )
  }
}
