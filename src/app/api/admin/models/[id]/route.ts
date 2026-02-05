import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, provider, apiKey, baseUrl, modelId, description, isActive, isDefault } = body

    if (isDefault) {
      await prisma.aIModel.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const model = await prisma.aIModel.update({
      where: { id },
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
    console.error('Update model error:', error)
    return NextResponse.json(
      { success: false, error: { message: '更新失败' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.aIModel.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete model error:', error)
    return NextResponse.json(
      { success: false, error: { message: '删除失败' } },
      { status: 500 }
    )
  }
}
