import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserPages, deletePage } from '@/lib/pages/service'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        }
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const pages = await getUserPages(user.id, { limit, offset })

    return NextResponse.json<ApiResponse<typeof pages>>({
      success: true,
      data: pages
    })

  } catch (error) {
    console.error('Get pages error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get pages'
      }
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        }
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('id')

    if (!pageId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Page ID is required'
        }
      }, { status: 400 })
    }

    await deletePage(pageId, user.id)

    return NextResponse.json<ApiResponse<null>>({
      success: true
    })

  } catch (error) {
    console.error('Delete page error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete page'
      }
    }, { status: 500 })
  }
}