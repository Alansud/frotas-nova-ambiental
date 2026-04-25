import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { calcularStatusRevisao, statusLabel, statusColor, formatDate, formatKm } from '@/types'
import Image from 'next/image'
import Footer from '@/components/Footer'

export default async function VeiculoPublicoPage({
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

  return (
    <div className="min-h-screen" style={{ background: '#f0f4fa' }}>
      {/* Marca d'água: foto do veículo como background fullscreen */}
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

      {/* Header */}
      <div className="text-white py-6 px-4 shadow-md" style={{ background: '#0056A6' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Image
            src="/logo-nova-ambiental.jpg"
            alt="Nova Ambiental"
            width={48}
            height={48}
            className="rounded-xl object-contain bg-white flex-shrink-0 shadow"
          />
          <div>
            <p className="font-bold text-lg leading-tight">Nova Ambiental</p>
            <p className="text-blue-200 text-xs">Histórico de Manutenção</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Info do veiculo */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative h-48 bg-gray-100">
            {veiculo.fotoUrl ? (
              <Image src={veiculo.fotoUrl} alt={veiculo.modelo} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                Sem foto
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Frota</p>
                <h1 className="text-2xl font-bold leading-tight" style={{ color: '#0056A6' }}>{veiculo.numeroFrota}</h1>
                <p className="text-gray-600">{veiculo.marca} {veiculo.modelo} · {veiculo.ano}</p>
                <p className="text-gray-400 text-sm mt-0.5">Placa: {veiculo.placa}</p>
                {veiculo.cor && <p className="text-gray-400 text-sm">{veiculo.cor}</p>}
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(status)}`}>
                {statusLabel(status)}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-600">
              <span className="font-medium">KM Atual: </span>{formatKm(veiculo.kmAtual)}
            </div>
          </div>
        </div>

        {/* Proxima revisao */}
        {veiculo.proximaRevisao && (
          <div className={`rounded-xl shadow-sm p-5 ${
            status === 'vencida' ? 'bg-red-50 border border-red-200' :
            status === 'atencao' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <h2 className="font-semibold text-gray-900 mb-3">Próxima Revisão</h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">KM previsto: </span>
                <strong>{formatKm(veiculo.proximaRevisao.kmPrevisto)}</strong>
              </p>
              {veiculo.proximaRevisao.dataPrevista && (
                <p>
                  <span className="text-gray-500">Data prevista: </span>
                  <strong>{formatDate(veiculo.proximaRevisao.dataPrevista)}</strong>
                </p>
              )}
              {veiculo.proximaRevisao.observacoes && (
                <p className="text-gray-600 mt-2">{veiculo.proximaRevisao.observacoes}</p>
              )}
            </div>
          </div>
        )}

        {/* Historico */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            Histórico ({veiculo.manutencoes.length} registro{veiculo.manutencoes.length !== 1 ? 's' : ''})
          </h2>

          {veiculo.manutencoes.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma manutenção registrada.</p>
          ) : (
            <div className="space-y-5">
              {veiculo.manutencoes.map((m, i) => (
                <div key={m.id} className="relative pl-6">
                  {/* Linha da timeline */}
                  {i < veiculo.manutencoes.length - 1 && (
                    <div className="absolute left-2 top-4 bottom-0 w-0.5 bg-gray-100" />
                  )}
                  {/* Dot */}
                  <div
                    className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow"
                    style={{ background: '#0056A6' }}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900">{formatDate(m.data)}</p>
                      <span className="text-xs text-gray-400">·</span>
                      <p className="text-xs text-gray-500">{formatKm(m.kmNaData)}</p>
                      {m.custo && (
                        <>
                          <span className="text-xs text-gray-400">·</span>
                          <p className="text-xs text-gray-500">R$ {m.custo.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">Mecânico: {m.mecanico}</p>
                    <p className="text-sm text-gray-700">{m.servicos}</p>
                    {m.observacoes && (
                      <p className="text-xs text-gray-500 mt-1">{m.observacoes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
