import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularStatusRevisao } from '@/types'

export async function GET() {
  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    select: {
      id: true,
      kmAtual: true,
      tipoMedicao: true,
      proximaRevisao: {
        select: {
          kmPrevisto: true,
          dataPrevista: true,
        },
      },
    },
  })

  let vencidas = 0
  let atencao = 0

  for (const veiculo of veiculos) {
    const status = calcularStatusRevisao(veiculo as unknown as import('@/types').VeiculoComRelacoes)
    if (status === 'vencida') vencidas++
    if (status === 'atencao') atencao++
  }

  return NextResponse.json({ vencidas, atencao })
}
