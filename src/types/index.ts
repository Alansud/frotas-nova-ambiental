import type { Veiculo, Manutencao, ProximaRevisao } from '@prisma/client'

export type VeiculoComRelacoes = Veiculo & {
  manutencoes: Manutencao[]
  proximaRevisao: ProximaRevisao | null
}

export type StatusRevisao = 'ok' | 'atencao' | 'vencida' | 'sem-previsao'

export function calcularStatusRevisao(
  veiculo: VeiculoComRelacoes
): StatusRevisao {
  const revisao = veiculo.proximaRevisao
  if (!revisao) return 'sem-previsao'

  const kmVencido = veiculo.kmAtual >= revisao.kmPrevisto
  const hoje = new Date()
  const dataVencida = revisao.dataPrevista ? new Date(revisao.dataPrevista) <= hoje : false
  const diffDias = revisao.dataPrevista
    ? (new Date(revisao.dataPrevista).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    : Infinity
  const dataProxima = diffDias <= 30 && diffDias > 0
  const kmProximo = revisao.kmPrevisto - veiculo.kmAtual <= 1000

  if (kmVencido || dataVencida) return 'vencida'
  if (kmProximo || dataProxima) return 'atencao'
  return 'ok'
}

export function statusLabel(status: StatusRevisao) {
  switch (status) {
    case 'ok': return 'Em dia'
    case 'atencao': return 'Atenção'
    case 'vencida': return 'Vencida'
    case 'sem-previsao': return 'Sem previsão'
  }
}

export function statusColor(status: StatusRevisao) {
  switch (status) {
    case 'ok': return 'bg-green-100 text-green-800'
    case 'atencao': return 'bg-yellow-100 text-yellow-800'
    case 'vencida': return 'bg-red-100 text-red-800'
    case 'sem-previsao': return 'bg-gray-100 text-gray-600'
  }
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatKm(km: number): string {
  return km.toLocaleString('pt-BR') + ' km'
}
