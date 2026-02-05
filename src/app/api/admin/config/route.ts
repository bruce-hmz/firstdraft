import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const configs = await prisma.adminConfig.findMany({
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({ success: true, data: configs })
  } catch (error) {
    console.error('Get configs error:', error)
    return NextResponse.json(
      { success: false, error: { message: '获取失败' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { configs } = body

    for (const config of configs) {
      await prisma.adminConfig.upsert({
        where: { key: config.key },
        update: {
          value: config.value,
          description: config.description,
        },
        create: {
          key: config.key,
          value: config.value,
          description: config.description,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save configs error:', error)
    return NextResponse.json(
      { success: false, error: { message: '保存失败' } },
      { status: 500 }
    )
  }
}
