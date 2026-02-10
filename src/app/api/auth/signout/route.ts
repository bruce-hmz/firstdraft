import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to sign out'
        }
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true
    })

  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}