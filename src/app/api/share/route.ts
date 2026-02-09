import { NextRequest, NextResponse } from 'next/server'
import { createPage, getShareUrl } from '@/lib/pages/service'
import type { PageContent, CreatePageInput } from '@/types'

interface SavePageRequest {
  title: string
  content: PageContent
  metadata?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const body: SavePageRequest = await request.json()

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

    const input: CreatePageInput = {
      title: body.title,
      content: body.content,
      metadata: body.metadata || {},
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

    const errorMessage = error instanceof Error ? error.message : '创建分享链接失败'

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMessage,
        },
      },
      { status: 500 }
    )
  }
}
