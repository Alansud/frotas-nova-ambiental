'use client'

import { useEffect, useState } from 'react'

interface AlertasResponse {
  vencidas: number
  atencao: number
}

export default function AlertToast() {
  const [dados, setDados] = useState<AlertasResponse | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch('/api/alertas')
      .then((res) => res.json())
      .then((data: AlertasResponse) => {
        setDados(data)
        if (data.vencidas > 0 || data.atencao > 0) {
          setVisible(true)
        }
      })
      .catch(() => {
        // silently ignore fetch errors
      })
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => setVisible(false), 8000)
    return () => window.clearTimeout(timer)
  }, [visible])

  if (!visible || !dados) return null

  const partes: string[] = []
  if (dados.vencidas > 0)
    partes.push(
      `${dados.vencidas} ${dados.vencidas === 1 ? 'veículo com revisão vencida' : 'veículos com revisão vencida'}`
    )
  if (dados.atencao > 0)
    partes.push(
      `${dados.atencao} ${dados.atencao === 1 ? 'veículo próximo da revisão' : 'veículos próximos da revisão'}`
    )

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm rounded-xl border border-amber-200 bg-white shadow-lg">
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
          !
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Atenção nas revisões</p>
          <p className="mt-1 text-sm text-gray-600">{partes.join(' e ')}.</p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-lg leading-none text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  )
}
