import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

const shareLinks = new Map<string, { page: any; viewCount: number; createdAt: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, pageContent } = body;

    if (!projectId || !pageContent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '缺少必要参数',
          },
        },
        { status: 400 }
      );
    }

    const slug = nanoid(8);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${slug}`;
    
    shareLinks.set(slug, {
      page: pageContent,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        slug,
        shareUrl,
      },
    });
  } catch (error) {
    console.error('Create share link error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建分享链接失败',
        },
      },
      { status: 500 }
    );
  }
}
