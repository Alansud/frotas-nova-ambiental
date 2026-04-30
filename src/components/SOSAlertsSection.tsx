'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from '@/lib/date'

interface SosAlerta {
  id: string
  veiculoId: string
  fotoUrl: string | null
  descricao: string
  latitude: number | null
  longitude: number | null
  contato: string | null
  status: string
  createdAt: string
  veiculo: {
    id: string
    numeroFrota: string
    modelo: string
    placa: string
  }
}

export default function SOSAlertsSection() {
  const [alertas, setAlertas] = useState<SosAlerta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAlerta, setSelectedAlerta] = useState<SosAlerta | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [hasNewAlerts, setHasNewAlerts] = useState(false)

  const fetchAlertas = useCallback(async () => {
    try {
      const response = await fetch('/api/sos?status=pendente')
      if (!response.ok) throw new Error('Erro ao carregar alertas')
      
      const data = await response.json()
      const newAlertas: SosAlerta[] = data.alertas
      
      // Verificar se há novos alertas (comparando com os existentes)
      if (alertas.length > 0 && newAlertas.length > alertas.length) {
        setHasNewAlerts(true)
        playAlertSound()
      }
      
      setAlertas(newAlertas)
      setError('')
    } catch (err) {
      setError('Erro ao carregar alertas SOS')
    } finally {
      setIsLoading(false)
    }
  }, [alertas.length])

  // Som de alerta
  const playAlertSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/alert.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {
        // Ignora erro se o navegador bloquear autoplay
      })
    } catch {
      // Ignora erro se o áudio não estiver disponível
    }
  }, [])

  // Polling para novos alertas a cada 30 segundos
  useEffect(() => {
    fetchAlertas()
    const interval = setInterval(fetchAlertas, 30000)
    return () => clearInterval(interval)
  }, [fetchAlertas])

  // Reset flag de novos alertas após 5 segundos
  useEffect(() => {
    if (hasNewAlerts) {
      const timer = setTimeout(() => setHasNewAlerts(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [hasNewAlerts])

  const handleResolver = async (alertaId: string) => {
    setIsResolving(true)
    try {
      const response = await fetch(`/api/sos/${alertaId}/resolver`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Erro ao resolver alerta')
      
      // Atualizar lista
      setAlertas((prev) => prev.filter((a) => a.id !== alertaId))
      setSelectedAlerta(null)
    } catch (err) {
      setError('Erro ao marcar alerta como resolvido')
    } finally {
      setIsResolving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Alertas SOS</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  if (alertas.length === 0) {
    return null // Não mostrar seção se não houver alertas pendentes
  }

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${hasNewAlerts ? 'border-red-400 animate-pulse' : 'border-red-200'} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasNewAlerts ? 'bg-red-600 animate-bounce' : 'bg-red-100'}`}>
              <svg className={`w-6 h-6 ${hasNewAlerts ? 'text-white' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Alertas SOS</h2>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {alertas.length}
                </span>
                {hasNewAlerts && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    NOVO
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">Problemas reportados pelos motoristas</p>
            </div>
          </div>
          <button
            onClick={fetchAlertas}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Atualizar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="border border-red-100 bg-red-50 rounded-lg p-4 hover:bg-red-100 transition-colors cursor-pointer"
              onClick={() => setSelectedAlerta(alerta)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      Frota {alerta.veiculo.numeroFrota}
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-sm text-gray-600">{alerta.veiculo.modelo}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{alerta.veiculo.placa}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">{alerta.descricao}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDistanceToNow(alerta.createdAt)}
                    </span>
                    {alerta.latitude && alerta.longitude && (
                      <span className="flex items-center gap-1 text-green-600">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Com localização
                      </span>
                    )}
                    {alerta.contato && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Com contato
                      </span>
                    )}
                    {alerta.fotoUrl && (
                      <span className="flex items-center gap-1 text-purple-600">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Com foto
                      </span>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedAlerta && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isResolving && setSelectedAlerta(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Alerta SOS</h2>
                  <p className="text-red-100 text-xs">{formatDistanceToNow(selectedAlerta.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlerta(null)}
                disabled={isResolving}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Veículo */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Veículo</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg" style={{ color: '#0056A6' }}>
                    Frota {selectedAlerta.veiculo.numeroFrota}
                  </span>
                </div>
                <p className="text-gray-600">{selectedAlerta.veiculo.modelo}</p>
                <p className="text-sm text-gray-500">Placa: {selectedAlerta.veiculo.placa}</p>
                <Link
                  href={`/veiculos/${selectedAlerta.veiculo.id}`}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium hover:underline"
                  style={{ color: '#0056A6' }}
                >
                  Ver detalhes do veículo
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>

              {/* Descrição */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Problema Reportado</p>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedAlerta.descricao}</p>
              </div>

              {/* Foto */}
              {selectedAlerta.fotoUrl && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Foto</p>
                  <img
                    src={selectedAlerta.fotoUrl}
                    alt="Foto do problema"
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Localização */}
              {selectedAlerta.latitude && selectedAlerta.longitude && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Localização</p>
                  <a
                    href={`https://www.google.com/maps?q=${selectedAlerta.latitude},${selectedAlerta.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ver no Google Maps
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Contato */}
              {selectedAlerta.contato && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contato do Reportante</p>
                  <div className="flex items-center gap-2 text-gray-800">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {selectedAlerta.contato}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedAlerta(null)}
                  disabled={isResolving}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => handleResolver(selectedAlerta.id)}
                  disabled={isResolving}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResolving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resolvendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Marcar como Resolvido
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
