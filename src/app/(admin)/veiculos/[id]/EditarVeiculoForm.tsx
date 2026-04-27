'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Veiculo, ProximaRevisao } from '@prisma/client'

type Props = {
  veiculo: Veiculo & { proximaRevisao: ProximaRevisao | null }
}

export default function EditarVeiculoForm({ veiculo }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fotoUrl, setFotoUrl] = useState(veiculo.fotoUrl || '')
  const [fotoPreview, setFotoPreview] = useState(veiculo.fotoUrl || '')
  const [tipoMedicao, setTipoMedicao] = useState<'km' | 'hora'>(
    (veiculo.tipoMedicao as 'km' | 'hora') ?? 'km'
  )
  const [semPlaca, setSemPlaca] = useState(veiculo.placa === 'NA')

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
      placa: semPlaca ? 'NA' : fd.get('placa'),
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

    const res = await fetch(`/api/veiculos/${veiculo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setOpen(false)
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error || 'Erro ao atualizar')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Deseja remover o veículo ${veiculo.numeroFrota} — ${veiculo.placa}?`)) return
    await fetch(`/api/veiculos/${veiculo.id}`, { method: 'DELETE' })
    router.push('/veiculos')
  }

  const pr = veiculo.proximaRevisao
  const dataPrevistaValue = pr?.dataPrevista
    ? new Date(pr.dataPrevista).toISOString().split('T')[0]
    : ''
  const isHora = tipoMedicao === 'hora'

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(true)}
          className="text-sm font-medium px-4 py-2 rounded-lg border hover:bg-gray-50 min-h-[44px]"
          style={{ borderColor: '#0056A6', color: '#0056A6' }}
        >
          Editar Veículo
        </button>
        <button
          onClick={handleDelete}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 min-h-[44px]"
        >
          Remover
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Editar Veículo</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Foto */}
              <div className="flex items-center gap-3">
                <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {fotoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem foto</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 min-h-[44px] flex items-center">
                    📷 Câmera
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoto} />
                  </label>
                  <label className="cursor-pointer text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 min-h-[44px] flex items-center">
                    🖼️ Galeria
                    <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FField label="Nº Frota *" name="numeroFrota" defaultValue={veiculo.numeroFrota} required />
                
                {/* Placa com opção "Sem placa" */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-600">
                      {semPlaca ? 'Placa (Sem placa)' : 'Placa *'}
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={semPlaca}
                        onChange={(e) => setSemPlaca(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Sem placa
                    </label>
                  </div>
                  <input
                    name="placa"
                    type="text"
                    defaultValue={veiculo.placa === 'NA' ? '' : veiculo.placa}
                    required={!semPlaca}
                    disabled={semPlaca}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <FField label="Modelo *" name="modelo" defaultValue={veiculo.modelo} required />
                <FField label="Marca *" name="marca" defaultValue={veiculo.marca} required />
                <FField label="Ano *" name="ano" type="number" defaultValue={String(veiculo.ano)} required />
                <FField label="Cor" name="cor" defaultValue={veiculo.cor || ''} />

                {/* Tipo de Medicao */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Medição</label>
                  <select
                    value={tipoMedicao}
                    onChange={(e) => setTipoMedicao(e.target.value as 'km' | 'hora')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="km">KM</option>
                    <option value="hora">Horímetro (h)</option>
                  </select>
                </div>

                <FField
                  label={isHora ? 'Horímetro Atual (h)' : 'KM Atual'}
                  name="kmAtual"
                  type="number"
                  defaultValue={String(veiculo.kmAtual)}
                />
                <FField label="RENAVAM" name="renavam" defaultValue={veiculo.renavam || ''} />
                <FField label="Chassi" name="chassi" defaultValue={veiculo.chassi || ''} />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Próxima Revisão</p>
                <div className="grid grid-cols-2 gap-3">
                  <FField
                    label={isHora ? 'Horímetro Previsto (h)' : 'KM Previsto'}
                    name="kmPrevisto"
                    type="number"
                    defaultValue={String(pr?.kmPrevisto || '')}
                  />
                  <FField label="Data Prevista" name="dataPrevista" type="date" defaultValue={dataPrevistaValue} />
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                    <textarea name="obsRevisao" defaultValue={pr?.observacoes || ''} rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-60 min-h-[44px]"
                  style={{ background: '#0056A6' }}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 min-h-[44px]">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function FField({ label, name, type = 'text', defaultValue, required }: {
  label: string; name: string; type?: string; defaultValue?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}
