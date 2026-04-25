import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface Notificacao {
  id: string
  veiculoId: string
  placa: string
  modelo: string
  tipo: 'km' | 'data' | 'vencida'
  mensagem: string
  kmFaltando?: number
  diasFaltando?: number
}

export async function GET() {
  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    include: { proximaRevisao: true },
  })

  const notificacoes: Notificacao[] = []
  const hoje = new Date()

  for (const v of veiculos) {
    const pr = v.proximaRevisao
    if (!pr) continue

    const kmFaltando = pr.kmPrevisto - v.kmAtual
    const diasFaltando = pr.dataPrevista
      ? Math.ceil((new Date(pr.dataPrevista).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      : null

    // Vencida por km
    if (kmFaltando <= 0) {
      notificacoes.push({
        id: `km-${v.id}`,
        veiculoId: v.id,
        placa: v.placa,
        modelo: v.modelo,
        tipo: 'vencida',
        mensagem: `Revisão vencida! KM excedido em ${Math.abs(kmFaltando).toLocaleString('pt-BR')} km`,
        kmFaltando,
      })
      continue
    }

    // Vencida por data
    if (diasFaltando !== null && diasFaltando <= 0) {
      notificacoes.push({
        id: `data-${v.id}`,
        veiculoId: v.id,
        placa: v.placa,
        modelo: v.modelo,
        tipo: 'vencida',
        mensagem: `Revisão vencida há ${Math.abs(diasFaltando)} dia(s)`,
        diasFaltando,
      })
      continue
    }

    // Atenção por km (faltam <= 1000 km)
    if (kmFaltando <= 1000) {
      notificacoes.push({
        id: `km-${v.id}`,
        veiculoId: v.id,
        placa: v.placa,
        modelo: v.modelo,
        tipo: 'km',
        mensagem: `Revisão próxima: faltam ${kmFaltando.toLocaleString('pt-BR')} km`,
        kmFaltando,
      })
    }

    // Atenção por data (faltam <= 7 dias)
    if (diasFaltando !== null && diasFaltando <= 7 && diasFaltando > 0) {
      notificacoes.push({
        id: `data-${v.id}`,
        veiculoId: v.id,
        placa: v.placa,
        modelo: v.modelo,
        tipo: 'data',
        mensagem: `Revisão em ${diasFaltando} dia(s)`,
        diasFaltando,
      })
    }
  }

  // Ordena: vencidas primeiro, depois por menor km/dias faltando
  notificacoes.sort((a, b) => {
    if (a.tipo === 'vencida' && b.tipo !== 'vencida') return -1
    if (b.tipo === 'vencida' && a.tipo !== 'vencida') return 1
    const aVal = a.kmFaltando ?? a.diasFaltando ?? 0
    const bVal = b.kmFaltando ?? b.diasFaltando ?? 0
    return aVal - bVal
  })

  return NextResponse.json(notificacoes)
}
