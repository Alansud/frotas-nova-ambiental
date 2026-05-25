import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const veiculo = await prisma.veiculo.findUnique({
    where: { id, ativo: true },
    select: { id: true, kmAtual: true },
  })

  if (!veiculo) {
    return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const novoKm = Number(body.novoKm)
  const atualizadoPor: string = body.atualizadoPor?.toString().trim() || ''

  if (!Number.isFinite(novoKm) || novoKm <= 0) {
    return NextResponse.json({ error: 'KM inválido' }, { status: 400 })
  }

  if (novoKm <= veiculo.kmAtual) {
    return NextResponse.json(
      { error: `O novo KM (${novoKm.toLocaleString('pt-BR')}) deve ser maior que o atual (${veiculo.kmAtual.toLocaleString('pt-BR')})` },
      { status: 400 }
    )
  }

  const updated = await prisma.veiculo.update({
    where: { id },
    data: {
      kmAtual: novoKm,
      updatedAt: new Date(),
    },
    select: { kmAtual: true },
  })

  // Log de auditoria simples no console (pode ser expandido para banco futuramente)
  console.log(
    `[atualizar-km] veiculoId=${id} kmAnterior=${veiculo.kmAtual} kmNovo=${novoKm}` +
      (atualizadoPor ? ` por="${atualizadoPor}"` : '')
  )

  return NextResponse.json({ ok: true, kmAtual: updated.kmAtual })
}
