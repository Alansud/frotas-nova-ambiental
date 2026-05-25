'use client'

import { useState } from 'react'

interface AtualizarKmFormProps {
  veiculoId: string
  kmAtual: number
  tipoMedicao?: string | null
}

export default function AtualizarKmForm({ veiculoId, kmAtual, tipoMedicao }: AtualizarKmFormProps) {
  const unidade = tipoMedicao === 'hora' ? 'h' : 'km'
  const label = tipoMedicao === 'hora' ? 'Horas' : 'KM'

  const [novoKm, setNovoKm] = useState('')
  const [atualizadoPor, setAtualizadoPor] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [erro, setErro] = useState('')
  const [kmConfirmado, setKmConfirmado] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const novoKmNum = Number(novoKm.replace(/\D/g, ''))

    if (!novoKm || isNaN(novoKmNum) || novoKmNum <= 0) {
      setErro(`Informe um valor de ${label} válido.`)
      return
    }

    setStatus('loading')
    setErro('')

    try {
      const res = await fetch(`/api/veiculos/${veiculoId}/atualizar-km`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novoKm: novoKmNum, atualizadoPor }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Erro ao atualizar.')
        setStatus('error')
        return
      }

      setKmConfirmado(data.kmAtual)
      setStatus('success')
      setNovoKm('')
      setAtualizadoPor('')
    } catch {
      setErro('Falha na conexão. Tente novamente.')
      setStatus('error')
    }
  }

  function handleReset() {
    setStatus('idle')
    setErro('')
    setKmConfirmado(null)
    setNovoKm('')
    setAtualizadoPor('')
  }

  if (status === 'success' && kmConfirmado !== null) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl"
            style={{ background: '#16a34a' }}
          >
            ✓
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">
              {label} atualizado com sucesso!
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Novo {label}: <strong className="text-gray-800">{kmConfirmado.toLocaleString('pt-BR')} {unidade}</strong>
            </p>
          </div>
          <button
            onClick={handleReset}
            className="mt-1 text-sm underline"
            style={{ color: '#0056A6' }}
          >
            Atualizar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Atualizar {label}</h2>
      <p className="text-xs text-gray-400 mb-4">
        {label} atual: <strong className="text-gray-600">{kmAtual.toLocaleString('pt-BR')} {unidade}</strong>
        &nbsp;· O novo valor deve ser maior que o atual.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Novo {label} <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={kmAtual + 1}
            value={novoKm}
            onChange={(e) => {
              setNovoKm(e.target.value)
              if (erro) setErro('')
            }}
            placeholder={`Ex: ${(kmAtual + 100).toLocaleString('pt-BR')}`}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status === 'loading'}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Seu nome <span className="text-gray-300">(opcional)</span>
          </label>
          <input
            type="text"
            value={atualizadoPor}
            onChange={(e) => setAtualizadoPor(e.target.value)}
            placeholder="Ex: João Silva"
            maxLength={80}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status === 'loading'}
          />
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !novoKm}
          className="w-full text-white font-semibold py-3 rounded-lg text-sm transition-opacity disabled:opacity-50"
          style={{ background: '#0056A6' }}
        >
          {status === 'loading' ? 'Atualizando…' : `Atualizar ${label}`}
        </button>
      </form>
    </div>
  )
}
