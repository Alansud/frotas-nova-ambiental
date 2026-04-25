'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Notificacao {
  id: string
  veiculoId: string
  placa: string
  modelo: string
  tipo: 'km' | 'data' | 'vencida'
  mensagem: string
  kmFaltando?: number
  diasFaltando?: number
}

export default function NotificacoesHeader() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [open, setOpen] = useState(false)
  const [carregado, setCarregado] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notificacoes')
      .then(r => r.json())
      .then((data: Notificacao[]) => {
        setNotificacoes(data)
        setCarregado(true)
      })
      .catch(() => setCarregado(true))
  }, [])

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const vencidas = notificacoes.filter(n => n.tipo === 'vencida')
  const total = notificacoes.length

  if (!carregado) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        title="Notificações"
      >
        {/* Ícone de sino */}
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Badge de contagem */}
        {total > 0 && (
          <span className={`absolute -top-1 -right-1 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${vencidas.length > 0 ? 'bg-red-500' : 'bg-yellow-500'}`}>
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Notificações</h3>
            {total > 0 && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${vencidas.length > 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {total} alerta{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {total === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-400">Tudo em dia!</p>
              </div>
            ) : (
              notificacoes.map(n => (
                <Link
                  key={n.id}
                  href={`/veiculos/${n.veiculoId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${n.tipo === 'vencida' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{n.placa} — {n.modelo}</p>
                    <p className={`text-xs mt-0.5 ${n.tipo === 'vencida' ? 'text-red-600' : 'text-yellow-700'}`}>
                      {n.mensagem}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {total > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <Link
                href="/veiculos"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-center block w-full"
                style={{ color: '#0056A6' }}
              >
                Ver todos os veículos →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
