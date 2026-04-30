import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const alerta = await prisma.sosAlerta.update({
      where: { id },
      data: {
        status: 'resolvido',
        resolvidoAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, alerta })
  } catch (error) {
    console.error('[SOS] Erro ao resolver alerta:', error)
    return NextResponse.json(
      { error: 'Erro ao marcar alerta como resolvido' },
      { status: 500 }
    )
  }
}
