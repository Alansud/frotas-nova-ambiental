'use client'

import { useEffect, useState } from 'react'

interface Props {
  vencidas: number
  proximas: number
}

function formatarQuantidade(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`
}

export default function ReviewAlertToast({ vencidas, proximas }: Props) {
  const total = vencidas + proximas
  const [visible, setVisible] = useState(total > 0)

  useEffect(() => {
    if (total === 0) {
      setVisible(false)
      return
    }

    setVisible(true)
    const timeout = window.setTimeout(() => setVisible(false), 5000)

    return () => window.clearTimeout(timeout)
  }, [total, vencidas, proximas])

  if (!visible || total === 0) return null

  const partes: string[] = []
  if (vencidas > 0) partes.push(formatarQuantidade(vencidas, 'veículo com revisão vencida', 'veículos com revisão vencida'))
  if (proximas > 0) partes.push(formatarQuantidade(proximas, 'veículo próximo da revisão', 'veículos próximos da revisão'))

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm rounded-xl border border-amber-200 bg-white shadow-lg">
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          !
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Atenção nas revisões</p>
          <p className="mt-1 text-sm text-gray-600">
            {partes.join(' e ')}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-sm text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  )
}