import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { data, kmNaData, mecanico, servicos, observacoes, custo } = body

  const manutencao = await prisma.manutencao.update({
    where: { id },
    data: {
      data: data ? new Date(data) : undefined,
      kmNaData: kmNaData ? Number(kmNaData) : undefined,
      mecanico,
      servicos,
      observacoes: observacoes || null,
      custo: custo ? Number(custo) : null,
    },
  })

  return NextResponse.json(manutencao)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.manutencao.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
