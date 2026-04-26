import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ManutencaoForm from './ManutencaoForm'

export default async function ManutencaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const veiculo = await prisma.veiculo.findUnique({
    where: { id, ativo: true },
    include: { proximaRevisao: true },
  })

  if (!veiculo) notFound()

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <a
          href={`/veiculos/${id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </a>
        <h1 className="text-xl font-bold text-gray-900">Registrar Manutenção</h1>
        <p className="text-sm text-gray-500 mt-1">
          Frota {veiculo.numeroFrota} — {veiculo.placa} · {veiculo.marca} {veiculo.modelo}
          {veiculo.tipoMedicao === 'hora' && (
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Horímetro
            </span>
          )}
        </p>
      </div>

      <ManutencaoForm
        veiculoId={veiculo.id}
        kmAtualAtual={veiculo.kmAtual}
        kmPrevistoAtual={veiculo.proximaRevisao?.kmPrevisto ?? null}
        dataPrevistaAtual={
          veiculo.proximaRevisao?.dataPrevista
            ? new Date(veiculo.proximaRevisao.dataPrevista).toISOString().split('T')[0]
            : null
        }
        tipoMedicao={veiculo.tipoMedicao}
      />
    </div>
  )
}
