import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await prisma.aIModel.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: models })
  } catch (error) {
    console.error('Get models error:', error)
    return NextResponse.json(
      { success: false, error: { message: '获取失败' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, provider, apiKey, baseUrl, modelId, description, isActive, isDefault } = body

    if (isDefault) {
      await prisma.aIModel.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const model = await prisma.aIModel.create({
      data: {
        name,
        provider,
        apiKey,
        baseUrl,
        modelId,
        description,
        isActive,
        isDefault,
      },
    })

    return NextResponse.json({ success: true, data: model })
  } catch (error) {
    console.error('Create model error:', error)
    return NextResponse.json(
      { success: false, error: { message: '创建失败' } },
      { status: 500 }
    )
  }
}
