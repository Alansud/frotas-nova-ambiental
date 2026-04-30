import { prisma } from '@/lib/prisma'
import { calcularStatusRevisao, statusLabel, statusColor, formatDate, formatMedicao } from '@/types'
import Link from 'next/link'
import FrotaQRCodeModal from '../veiculos/FrotaQRCodeModal'
import DashboardCharts from '@/components/DashboardCharts'
import SOSAlertsSection from '@/components/SOSAlertsSection'

export default async function DashboardPage() {
  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    include: { manutencoes: true, proximaRevisao: true },
    orderBy: { createdAt: 'desc' },
  })

  const totalVeiculos = veiculos.length

  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const manutencoesEsseMes = await prisma.manutencao.count({
    where: { createdAt: { gte: inicioMes } },
  })

  const statusCounts = { ok: 0, atencao: 0, vencida: 0, 'sem-previsao': 0 }
  for (const v of veiculos) {
    statusCounts[calcularStatusRevisao(v)]++
  }

  const alertaTotal = statusCounts.vencida + statusCounts.atencao

  const veiculosAlerta = veiculos
    .filter(v => {
      const s = calcularStatusRevisao(v)
      return s === 'vencida' || s === 'atencao'
    })
    .sort((a, b) => {
      const sa = calcularStatusRevisao(a)
      const sb = calcularStatusRevisao(b)
      if (sa === 'vencida' && sb !== 'vencida') return -1
      if (sb === 'vencida' && sa !== 'vencida') return 1
      return 0
    })

  // --- Dados para gráficos ---

  // Gastos mensais (últimos 6 meses)
  const gastosMensais = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1)
      const inicio = new Date(d.getFullYear(), d.getMonth(), 1)
      const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const mes = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      return prisma.manutencao
        .findMany({ where: { data: { gte: inicio, lte: fim } }, select: { custo: true } })
        .then(ms => ({
          mes,
          total: parseFloat(ms.reduce((s, m) => s + (m.custo ?? 0), 0).toFixed(2)),
          count: ms.length,
        }))
    })
  )

  // Tipos de serviço por categoria (parse de palavras-chave)
  const todasManutencoes = await prisma.manutencao.findMany({ select: { servicos: true } })
  const categorias: Record<string, number> = {
    'Óleo/Filtros': 0,
    'Freios': 0,
    'Pneus': 0,
    'Elétrica': 0,
    'Outros': 0,
  }
  for (const m of todasManutencoes) {
    const s = m.servicos.toLowerCase()
    if (s.includes('óleo') || s.includes('oleo') || s.includes('filtro')) {
      categorias['Óleo/Filtros']++
    } else if (s.includes('freio') || s.includes('pastil') || s.includes('disco')) {
      categorias['Freios']++
    } else if (s.includes('pneu') || s.includes('borracha') || s.includes('estepe')) {
      categorias['Pneus']++
    } else if (s.includes('bateria') || s.includes('elétric') || s.includes('eletric') || s.includes('alternador')) {
      categorias['Elétrica']++
    } else {
      categorias['Outros']++
    }
  }
  const tiposServico = Object.entries(categorias)
    .filter(([, v]) => v > 0)
    .map(([nome, value]) => ({ nome, value }))

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {alertaTotal > 0 && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${
              statusCounts.vencida > 0 ? 'bg-red-500' : 'bg-yellow-500'
            }`}>
              {alertaTotal} alerta{alertaTotal !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">Visão geral da frota Nova Ambiental</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 font-medium">Total de Veículos</p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#0056A6' }}>{totalVeiculos}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 font-medium">Manutenções este mês</p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#00A651' }}>{manutencoesEsseMes}</p>
        </div>
        <div className={`rounded-xl shadow-sm p-5 ${
          alertaTotal > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-100'
        }`}>
          <p className="text-sm text-gray-500 font-medium">Atenção necessária</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-3xl font-bold ${alertaTotal > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
              {alertaTotal}
            </p>
            {alertaTotal > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Revisar</span>
            )}
          </div>
        </div>
        <div className={`rounded-xl shadow-sm p-5 ${
          statusCounts.vencida > 0 ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100'
        }`}>
          <p className="text-sm text-gray-500 font-medium">Revisões vencidas</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-3xl font-bold ${statusCounts.vencida > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {statusCounts.vencida}
            </p>
            {statusCounts.vencida > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Urgente</span>
            )}
          </div>
        </div>
      </div>

      {/* Acoes rapidas */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/veiculos/novo"
          className="text-white text-sm font-semibold px-4 py-3 rounded-lg transition-colors min-h-[44px] flex items-center"
          style={{ background: '#0056A6' }}
        >
          + Novo Veículo
        </Link>
        <Link
          href="/veiculos"
          className="border text-sm font-semibold px-4 py-3 rounded-lg transition-colors hover:bg-gray-50 min-h-[44px] flex items-center"
          style={{ borderColor: '#0056A6', color: '#0056A6' }}
        >
          Ver todas as frotas
        </Link>
        <FrotaQRCodeModal />
      </div>

      {/* Alertas SOS - Componente Client-Side com polling */}
      <SOSAlertsSection />

      {/* Gráficos */}
      <DashboardCharts gastosMensais={gastosMensais} tiposServico={tiposServico} />

      {/* Veiculos com alerta */}
      {veiculosAlerta.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Veículos que precisam de atenção</h2>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${
              statusCounts.vencida > 0 ? 'bg-red-500' : 'bg-yellow-500'
            }`}>
              {veiculosAlerta.length}
            </span>
          </div>
          <div className="space-y-3">
            {veiculosAlerta.map(v => {
              const status = calcularStatusRevisao(v)
              return (
                <div key={v.id} className={`flex items-center justify-between py-3 px-4 rounded-lg border ${
                  status === 'vencida' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
                }`}>
                  <div>
                    <p className="font-semibold text-gray-900">Frota {v.numeroFrota} — {v.modelo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {v.placa} · {formatMedicao(v.kmAtual, v.tipoMedicao)}
                      {v.proximaRevisao && (
                        <> · Revisão: {formatMedicao(v.proximaRevisao.kmPrevisto, v.tipoMedicao)}
                          {v.proximaRevisao.dataPrevista && <> · {formatDate(v.proximaRevisao.dataPrevista)}</>}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(status)}`}>
                      {statusLabel(status)}
                    </span>
                    <Link
                      href={`/veiculos/${v.id}`}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: '#0056A6' }}
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {alertaTotal === 0 && totalVeiculos > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#e8f7ef' }}>
            <svg className="w-6 h-6" style={{ color: '#00A651' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900">Tudo em dia!</p>
          <p className="text-sm text-gray-500 mt-1">Todos os veículos estão com as revisões em dia.</p>
        </div>
      )}
    </div>
  )
}
