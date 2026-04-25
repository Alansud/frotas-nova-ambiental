import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularStatusRevisao } from '@/types'

export async function GET() {
  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    include: { manutencoes: true, proximaRevisao: true },
  })

  let vencidas = 0
  let atencao = 0

  for (const veiculo of veiculos) {
    const status = calcularStatusRevisao(veiculo)
    if (status === 'vencida') vencidas++
    if (status === 'atencao') atencao++
  }

  return NextResponse.json({ vencidas, atencao })
}
