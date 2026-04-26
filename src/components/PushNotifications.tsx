'use client'

import { useEffect } from 'react'

export default function PushNotifications() {
  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('[SW] Falha ao registrar:', err)
      })
    }

    // Verificar revisões pendentes e notificar
    checkAndNotify()
  }, [])

  return null
}

async function checkAndNotify() {
  if (!('Notification' in window)) return

  // Solicitar permissão se ainda não decidida
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }

  if (Notification.permission !== 'granted') return

  try {
    const res = await fetch('/api/notificacoes')
    if (!res.ok) return

    const notifs: Array<{ veiculoId: string; mensagem: string }> = await res.json()
    if (!Array.isArray(notifs) || notifs.length === 0) return

    const count = notifs.length
    const body =
      count === 1
        ? notifs[0].mensagem
        : `${count} veículos precisam de atenção. Acesse o dashboard para ver detalhes.`

    // Usar service worker para exibir notificação (suporta dispositivos móveis)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification('Nova Ambiental Frotas', {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'revisao-alerta',
        data: { url: '/dashboard' },
      } as NotificationOptions)
    } else {
      // Fallback: Notification API direta
      new Notification('Nova Ambiental Frotas', { body, icon: '/icon-192.png' })
    }
  } catch (err) {
    console.error('[PushNotifications] Erro:', err)
  }
}
