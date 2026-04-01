import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPage, getShareUrl, PageServiceError } from '@/lib/pages/service'
import type { PageContent, CreatePageInput } from '@/types'

interface SavePageRequest {
  title: string
  content: PageContent
  metadata?: Record<string, unknown>
  anonymousId?: string
}

export async function POST(request: NextRequest) {
  try {
    let body: SavePageRequest
    try {
      body = (await request.json()) as SavePageRequest
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: '请求体不是合法 JSON',
          },
        },
        { status: 400 }
      )
    }

    if (!body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '缺少必要参数',
          },
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const input: CreatePageInput = {
      title: body.title,
      content: body.content,
      metadata: body.metadata || {},
      userId: user?.id,
      anonymousId: !user ? body.anonymousId : undefined,
    }

    const page = await createPage(input)

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: '创建分享链接失败',
          },
        },
        { status: 500 }
      )
    }

    const shareUrl = getShareUrl(page.slug)

    return NextResponse.json({
      success: true,
      data: {
        slug: page.slug,
        shareUrl,
        viewCount: page.view_count,
        createdAt: page.created_at,
      },
    })
  } catch (error) {
    console.error('Create share link error:', error)

    if (error instanceof Error && error.message.includes('Supabase configuration missing')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG_MISSING',
            message: '分享服务暂不可用',
          },
        },
        { status: 503 }
      )
    }

    if (error instanceof PageServiceError) {
      if (error.code === 'CONFIG_MISSING') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: '分享服务暂不可用',
            },
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: '创建分享链接失败',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建分享链接失败',
        },
      },
      { status: 500 }
    )
  }
}
