'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NovoVeiculoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoUrl, setFotoUrl] = useState('')
  const [tipoMedicao, setTipoMedicao] = useState<'km' | 'hora'>('km')

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoPreview(URL.createObjectURL(file))

    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) setFotoUrl(data.url)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const body = {
      numeroFrota: fd.get('numeroFrota'),
      placa: fd.get('placa'),
      modelo: fd.get('modelo'),
      marca: fd.get('marca'),
      ano: fd.get('ano'),
      cor: fd.get('cor'),
      renavam: fd.get('renavam'),
      chassi: fd.get('chassi'),
      kmAtual: fd.get('kmAtual'),
      tipoMedicao,
      fotoUrl,
      proximaRevisao: {
        kmPrevisto: fd.get('kmPrevisto'),
        dataPrevista: fd.get('dataPrevista'),
        observacoes: fd.get('obsRevisao'),
      },
    }

    const res = await fetch('/api/veiculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const v = await res.json()
      router.push(`/veiculos/${v.id}`)
    } else {
      const d = await res.json()
      setError(d.error || 'Erro ao cadastrar veículo')
    }
    setLoading(false)
  }

  const isHora = tipoMedicao === 'hora'

  return (
    <div className="max-w-2xl mx-auto px-1">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 min-h-[44px] px-2 flex items-center">
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Novo Veículo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Foto do Veículo</h2>
          <div className="flex items-center gap-4">
            <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              {fotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 text-xs text-center px-2">Sem foto</span>
              )}
            </div>
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center text-sm font-medium px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 min-h-[44px]">
                  📷 Câmera
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFoto}
                />
              </label>
              <label className="cursor-pointer">
                <span className="inline-flex items-center text-sm font-medium px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 min-h-[44px]">
                  🖼️ Galeria
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFoto}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Informacoes basicas */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Informações do Veículo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Número da Frota *" name="numeroFrota" placeholder="001" required />
            <Field label="Placa *" name="placa" placeholder="ABC-1234" required />
            <Field label="Modelo *" name="modelo" placeholder="Sprinter 415" required />
            <Field label="Marca *" name="marca" placeholder="Mercedes-Benz" required />
            <Field label="Ano *" name="ano" type="number" placeholder="2022" required />
            <Field label="Cor" name="cor" placeholder="Branco" />

            {/* Tipo de Medicao */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Medição *</label>
              <select
                value={tipoMedicao}
                onChange={(e) => setTipoMedicao(e.target.value as 'km' | 'hora')}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="km">Quilometragem (KM)</option>
                <option value="hora">Horímetro (Horas)</option>
              </select>
            </div>

            <Field
              label={isHora ? 'Horímetro Atual (h)' : 'KM Atual'}
              name="kmAtual"
              type="number"
              placeholder={isHora ? 'Ex: 1250' : '0'}
            />
            <Field label="RENAVAM" name="renavam" placeholder="00000000000" />
            <div className="sm:col-span-2">
              <Field label="Chassi" name="chassi" placeholder="9BW..." />
            </div>
          </div>
        </div>

        {/* Proxima revisao */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Próxima Revisão</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label={isHora ? 'Horímetro Previsto (h)' : 'KM Previsto'}
              name="kmPrevisto"
              type="number"
              placeholder={isHora ? '2000' : '50000'}
            />
            <Field label="Data Prevista" name="dataPrevista" type="date" />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                name="obsRevisao"
                rows={3}
                placeholder="Troca de óleo, filtros, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-3">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <button
            type="submit"
            disabled={loading}
            className="text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-60 min-h-[48px] text-base"
            style={{ background: '#0056A6' }}
          >
            {loading ? 'Salvando...' : 'Cadastrar Veículo'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 min-h-[48px] text-base"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, name, type = 'text', placeholder, required
}: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
