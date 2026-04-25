'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'

interface Veiculo {
  id: string
  numeroFrota: string
  placa: string
  modelo: string
  marca: string
  ano: number
  fotoUrl: string | null
  kmAtual: number
}

interface Props {
  veiculos: Veiculo[]
}

function formatKm(km: number) {
  return km.toLocaleString('pt-BR') + ' km'
}

export default function FrotaListaClient({ veiculos }: Props) {
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    const termo = busca.toUpperCase().trim()
    if (!termo) return veiculos
    return veiculos.filter(
      (v) =>
        v.numeroFrota.toUpperCase().includes(termo) ||
        v.modelo.toUpperCase().includes(termo) ||
        v.marca.toUpperCase().includes(termo)
    )
  }, [busca, veiculos])

  return (
    <div className="min-h-screen" style={{ background: '#f0f4fa' }}>
      {/* Header */}
      <div className="text-white py-6 px-4 shadow-md" style={{ background: '#0056A6' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/logo-nova-ambiental.jpg"
              alt="Nova Ambiental"
              width={56}
              height={56}
              className="rounded-xl object-contain bg-white flex-shrink-0 shadow"
            />
            <div>
              <p className="font-bold text-xl leading-tight">Nova Ambiental</p>
              <p className="text-blue-200 text-sm">Consulta de Revisões da Frota</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar por número da frota, modelo ou marca..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[48px]"
              style={{ background: 'rgba(255,255,255,0.95)' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-xs text-gray-500 mb-4">
          {filtrados.length === veiculos.length
            ? `${veiculos.length} veículo${veiculos.length !== 1 ? 's' : ''} na frota`
            : `${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''}`}
        </p>

        {filtrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <svg
              className="w-12 h-12 text-gray-200 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1.293 1.293A1 1 0 005 18h1m0 0a2 2 0 104 0m4 0a2 2 0 104 0m0 0h2l.293-.293A1 1 0 0021 17V10l-3-4H13"
              />
            </svg>
            <p className="text-gray-400">Nenhum veículo encontrado.</p>
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="mt-3 text-sm font-semibold"
                style={{ color: '#0056A6' }}
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtrados.map((v) => (
              <Link
                key={v.id}
                href={`/frota/${v.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Foto */}
                <div className="relative h-40 bg-gray-100 flex-shrink-0">
                  {v.fotoUrl ? (
                    <Image src={v.fotoUrl} alt={v.modelo} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-14 h-14 text-gray-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1.293 1.293A1 1 0 005 18h1m0 0a2 2 0 104 0m4 0a2 2 0 104 0m0 0h2l.293-.293A1 1 0 0021 17V10l-3-4H13"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Frota</p>
                    <p className="text-xl font-bold leading-tight" style={{ color: '#0056A6' }}>
                      {v.numeroFrota}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {v.marca} {v.modelo} · {v.ano}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Placa: {v.placa}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">KM: {formatKm(v.kmAtual)}</p>
                    <span
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: '#0056A6' }}
                    >
                      Ver histórico
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
