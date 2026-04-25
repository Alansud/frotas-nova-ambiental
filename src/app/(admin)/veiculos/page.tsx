import { prisma } from '@/lib/prisma'
import { calcularStatusRevisao, statusLabel, statusColor, formatKm } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import FrotaQRCodeModal from './FrotaQRCodeModal'

export default async function VeiculosPage() {
  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    include: { manutencoes: true, proximaRevisao: true },
    orderBy: { numeroFrota: 'asc' },
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Frotas</h1>
          <p className="text-gray-500 text-sm mt-1">{veiculos.length} veículo(s) cadastrado(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <FrotaQRCodeModal />
          <Link
            href="/veiculos/novo"
            className="text-white text-sm font-semibold px-4 py-3 rounded-lg min-h-[44px] flex items-center"
            style={{ background: '#0056A6' }}
          >
            + Novo Veículo
          </Link>
        </div>
      </div>

      {veiculos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-lg">Nenhum veículo cadastrado ainda.</p>
          <Link
            href="/veiculos/novo"
            className="inline-block mt-4 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ background: '#0056A6' }}
          >
            Cadastrar primeiro veículo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {veiculos.map(v => {
            const status = calcularStatusRevisao(v)
            return (
              <Link
                key={v.id}
                href={`/veiculos/${v.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="relative h-40 bg-gray-100">
                  {v.fotoUrl ? (
                    <Image
                      src={v.fotoUrl}
                      alt={v.modelo}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1.293 1.293A1 1 0 005 18h1m0 0a2 2 0 104 0m4 0a2 2 0 104 0m0 0h2l.293-.293A1 1 0 0021 17V10l-3-4H13" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">Frota {v.numeroFrota}</p>
                      <p className="text-xs text-gray-500">{v.placa}</p>
                      <p className="text-sm text-gray-600">{v.marca} {v.modelo} · {v.ano}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(status)}`}>
                      {statusLabel(status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    KM atual: {formatKm(v.kmAtual)}
                  </p>
                  {v.proximaRevisao && (
                    <p className="text-xs text-gray-400">
                      Próx. revisão: {formatKm(v.proximaRevisao.kmPrevisto)}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
