import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import {
  calcularStatusRevisao, statusLabel, statusColor,
  formatDate, formatMedicao
} from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import EditarVeiculoForm from './EditarVeiculoForm'

export default async function VeiculoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const veiculo = await prisma.veiculo.findUnique({
    where: { id, ativo: true },
    include: {
      manutencoes: { orderBy: { data: 'desc' } },
      proximaRevisao: true,
    },
  })

  if (!veiculo) notFound()

  const status = calcularStatusRevisao(veiculo)
  const isHora = veiculo.tipoMedicao === 'hora'

  return (
    <>
      {veiculo.fotoUrl && (
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          <Image
            src={veiculo.fotoUrl}
            alt=""
            fill
            className="object-cover opacity-[0.05] blur-sm"
            priority
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link href="/veiculos" className="text-sm text-gray-500 hover:text-gray-700">
              ← Frotas
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Frota {veiculo.numeroFrota} — {veiculo.modelo}
            </h1>
            <p className="text-gray-500 text-sm">
              {veiculo.placa} · {veiculo.marca} · {veiculo.ano}
              {isHora && (
                <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Horímetro
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/veiculos/${veiculo.id}/manutencao`}
              className="text-white text-sm font-semibold px-4 py-3 rounded-lg min-h-[44px] flex items-center"
              style={{ background: '#00A651' }}
            >
              + Manutenção
            </Link>
            <a
              href={`/api/veiculos/${veiculo.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold px-4 py-3 rounded-lg min-h-[44px] flex items-center border"
              style={{ borderColor: '#0056A6', color: '#0056A6' }}
            >
              ↓ PDF
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {veiculo.fotoUrl ? (
                <Image src={veiculo.fotoUrl} alt={veiculo.modelo} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  Sem foto
                </div>
              )}
            </div>
            <div className="p-4 space-y-1 text-sm">
              <p><span className="text-gray-500">Frota:</span> <strong>{veiculo.numeroFrota}</strong></p>
              <p><span className="text-gray-500">Placa:</span> <strong>{veiculo.placa}</strong></p>
              <p>
                <span className="text-gray-500">{isHora ? 'Horímetro:' : 'KM Atual:'}</span>{' '}
                <strong>{formatMedicao(veiculo.kmAtual, veiculo.tipoMedicao)}</strong>
              </p>
              {veiculo.cor && <p><span className="text-gray-500">Cor:</span> {veiculo.cor}</p>}
              {veiculo.renavam && <p><span className="text-gray-500">RENAVAM:</span> {veiculo.renavam}</p>}
              {veiculo.chassi && <p><span className="text-gray-500">Chassi:</span> {veiculo.chassi}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Próxima Revisão</h2>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(status)}`}>
                {statusLabel(status)}
              </span>
            </div>
            {veiculo.proximaRevisao ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">{isHora ? 'Horímetro previsto:' : 'KM previsto:'}</span>{' '}
                  <strong>{formatMedicao(veiculo.proximaRevisao.kmPrevisto, veiculo.tipoMedicao)}</strong>
                </p>
                <p><span className="text-gray-500">Data prevista:</span> <strong>{formatDate(veiculo.proximaRevisao.dataPrevista)}</strong></p>
                {veiculo.proximaRevisao.observacoes && (
                  <p><span className="text-gray-500">Obs:</span> {veiculo.proximaRevisao.observacoes}</p>
                )}
                {status !== 'ok' && (
                  <div className={`mt-3 p-3 rounded-lg text-xs ${
                    status === 'vencida' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {status === 'vencida'
                      ? 'Esta revisão está vencida! Agende a manutenção imediatamente.'
                      : 'A revisão está próxima do prazo. Agende em breve.'
                    }
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Nenhuma revisão agendada.</p>
            )}
            <div className="mt-4 pt-4 border-t border-gray-50">
              <EditarVeiculoForm veiculo={veiculo} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Histórico de Manutenções ({veiculo.manutencoes.length})
            </h2>
          </div>
          {veiculo.manutencoes.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma manutenção registrada.</p>
          ) : (
            <div className="space-y-4">
              {veiculo.manutencoes.map(m => (
                <div key={m.id} className="border-l-4 pl-4 py-2" style={{ borderColor: '#0056A6' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatDate(m.data)} · {formatMedicao(m.kmNaData, veiculo.tipoMedicao)}
                      </p>
                      <p className="text-xs text-gray-500">Mecânico: {m.mecanico}</p>
                    </div>
                    {m.custo && (
                      <span className="text-xs text-gray-500 font-medium">R$ {m.custo.toFixed(2)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{m.servicos}</p>
                  {m.observacoes && (
                    <p className="text-xs text-gray-500 mt-1">{m.observacoes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
