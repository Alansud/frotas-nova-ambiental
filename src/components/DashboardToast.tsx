'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Notificacao {
  id: string
  veiculoId: string
  placa: string
  modelo: string
  tipo: 'km' | 'data' | 'vencida'
  mensagem: string
}

export default function DashboardToast() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/notificacoes')
      .then(r => r.json())
      .then((data: Notificacao[]) => {
        if (data.length > 0) {
          setNotificacoes(data)
          setVisible(true)
          // Auto-dismiss após 8 segundos
          const t = setTimeout(() => setVisible(false), 8000)
          return () => clearTimeout(t)
        }
      })
      .catch(() => {})
  }, [])

  if (!visible || dismissed || notificacoes.length === 0) return null

  const vencidas = notificacoes.filter(n => n.tipo === 'vencida')
  const isUrgente = vencidas.length > 0

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full rounded-xl shadow-2xl border overflow-hidden transition-all duration-300 ${
        isUrgente ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUrgente ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <svg className={`w-4 h-4 ${isUrgente ? 'text-red-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${isUrgente ? 'text-red-800' : 'text-yellow-800'}`}>
                {vencidas.length > 0
                  ? `${vencidas.length} revisão(ões) vencida(s)!`
                  : `${notificacoes.length} veículo(s) próximo(s) da revisão`}
              </p>
              <div className="mt-1 space-y-0.5">
                {notificacoes.slice(0, 3).map(n => (
                  <p key={n.id} className={`text-xs ${isUrgente ? 'text-red-600' : 'text-yellow-700'}`}>
                    {n.placa}: {n.mensagem}
                  </p>
                ))}
                {notificacoes.length > 3 && (
                  <p className={`text-xs ${isUrgente ? 'text-red-500' : 'text-yellow-600'}`}>
                    + {notificacoes.length - 3} mais...
                  </p>
                )}
              </div>
              <Link
                href="/veiculos"
                className={`inline-block mt-2 text-xs font-semibold underline ${
                  isUrgente ? 'text-red-700' : 'text-yellow-700'
                }`}
              >
                Ver veículos
              </Link>
            </div>
          </div>
          <button
            onClick={() => { setDismissed(true); setVisible(false) }}
            className={`flex-shrink-0 text-lg leading-none font-bold ${
              isUrgente ? 'text-red-400 hover:text-red-700' : 'text-yellow-400 hover:text-yellow-700'
            }`}
          >
            ×
          </button>
        </div>
      </div>
      {/* Barra de progresso para auto-dismiss */}
      <div className={`h-1 ${isUrgente ? 'bg-red-200' : 'bg-yellow-200'}`}>
        <div
          className={`h-full ${isUrgente ? 'bg-red-500' : 'bg-yellow-500'}`}
          style={{ animation: 'shrink 8s linear forwards' }}
        />
      </div>
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
