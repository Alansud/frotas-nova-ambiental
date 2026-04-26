'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  veiculoId: string
  kmAtualAtual: number
  kmPrevistoAtual: number | null
  dataPrevistaAtual: string | null
  tipoMedicao?: string | null
}

export default function ManutencaoForm({
  veiculoId,
  kmAtualAtual,
  kmPrevistoAtual,
  dataPrevistaAtual,
  tipoMedicao,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isHora = tipoMedicao === 'hora'
  const unidade = isHora ? 'h' : 'km'
  const labelAtual = isHora ? 'Horímetro Atual' : 'KM Atual do Veículo'
  const labelNaData = isHora ? 'Leitura do Horímetro na Manutenção *' : 'KM no Momento da Manutenção *'
  const labelAtualField = isHora ? `Horímetro atual (hodômetro)` : 'KM Atual (hodômetro)'
  const labelProximoField = isHora ? 'Horímetro da Próxima Revisão (h)' : 'KM da Próxima Revisão'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const body = {
      veiculoId,
      data: fd.get('data'),
      kmNaData: fd.get('kmNaData'),
      novoKmAtual: fd.get('novoKmAtual'),
      mecanico: fd.get('mecanico'),
      servicos: fd.get('servicos'),
      observacoes: fd.get('observacoes'),
      custo: fd.get('custo'),
      novoKmPrevisto: fd.get('novoKmPrevisto'),
      novaDataPrevista: fd.get('novaDataPrevista'),
    }

    const res = await fetch('/api/manutencoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push(`/veiculos/${veiculoId}`)
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error || 'Erro ao registrar manutenção')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dados da manutenção */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Dados da Manutenção
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Data *" name="data" type="date" required />
          <Field label={labelNaData} name="kmNaData" type="number" placeholder={isHora ? '1250' : '50000'} required />
        </div>
        <Field label="Mecânico *" name="mecanico" placeholder="Nome do mecânico" required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serviços realizados / Peças trocadas *
          </label>
          <textarea
            name="servicos"
            required
            rows={4}
            placeholder="Ex: Troca de óleo 10W40 (5L), filtro de óleo, filtro de ar, verificação de freios..."
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="observacoes"
            rows={2}
            placeholder="Observações adicionais..."
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Field label="Custo (R$)" name="custo" type="number" placeholder="0.00" />
      </div>

      {/* Atualização de hodômetro/horímetro */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {labelAtual}
          </h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
            Atual: {kmAtualAtual.toLocaleString('pt-BR')} {unidade}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {isHora
            ? 'Informe a leitura atual do horímetro. Será atualizado automaticamente se for maior que o valor registrado.'
            : 'Informe o KM atual do hodômetro. Será atualizado automaticamente se for maior que o valor registrado.'}
        </p>
        <Field
          label={labelAtualField}
          name="novoKmAtual"
          type="number"
          placeholder={String(kmAtualAtual)}
        />
      </div>

      {/* Próxima revisão */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Próxima Revisão
          </h2>
          {kmPrevistoAtual && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              Previsto: {kmPrevistoAtual.toLocaleString('pt-BR')} {unidade}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Atualize o {isHora ? 'horímetro' : 'KM'} e/ou data da próxima revisão após esta manutenção.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={labelProximoField}
            name="novoKmPrevisto"
            type="number"
            placeholder={kmPrevistoAtual ? String(kmPrevistoAtual) : isHora ? 'Ex: 2000' : 'Ex: 80000'}
          />
          <Field
            label="Data da Próxima Revisão"
            name="novaDataPrevista"
            type="date"
            defaultValue={dataPrevistaAtual ?? ''}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 text-white font-semibold py-3.5 rounded-xl disabled:opacity-60 text-base"
          style={{ background: '#00A651' }}
        >
          {loading ? 'Registrando...' : 'Registrar Manutenção'}
        </button>
        <a
          href={`/veiculos/${veiculoId}`}
          className="flex-1 text-center border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 text-base"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}

function Field({
  label, name, type = 'text', placeholder, required, defaultValue,
}: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
