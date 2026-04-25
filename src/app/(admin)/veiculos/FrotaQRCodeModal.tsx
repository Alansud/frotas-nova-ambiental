'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function FrotaQRCodeModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 min-h-[44px]"
        style={{ borderColor: '#0056A6', color: '#0056A6' }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 4h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
          />
        </svg>
        QR Code da Frota
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            {/* Header do modal */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">QR Code da Frota</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            {/* QR Code + info */}
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-2xl border-2 shadow-sm" style={{ borderColor: '#e8eef7' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/qrcode"
                  alt="QR Code da Frota Nova Ambiental"
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Image
                    src="/logo-nova-ambiental.jpg"
                    alt="Nova Ambiental"
                    width={36}
                    height={36}
                    className="rounded-md object-contain"
                  />
                  <p className="font-bold text-base" style={{ color: '#0056A6' }}>
                    Nova Ambiental
                  </p>
                </div>
                <p className="text-sm text-gray-600">Frota completa — consulta de revisões</p>
                <p className="text-xs text-gray-400">Escaneie para consultar revisões</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 text-white font-semibold py-3.5 rounded-xl text-base transition-colors"
                style={{ background: '#0056A6' }}
              >
                Imprimir
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl text-base hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout de impressão */}
      <div className="frota-print-layout hidden print:flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo-nova-ambiental.jpg"
              alt="Nova Ambiental"
              width={72}
              height={72}
              className="rounded-xl object-contain"
            />
            <span className="font-bold text-3xl" style={{ color: '#0056A6' }}>
              Nova Ambiental
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/qrcode" alt="QR Code" width={320} height={320} />
          <div>
            <p className="text-2xl font-bold mt-2" style={{ color: '#0056A6' }}>
              Frota Nova Ambiental
            </p>
            <p className="text-base text-gray-600 mt-1">Escaneie para consultar revisões</p>
            <p className="text-sm text-gray-400 mt-0.5">novaambientalfrotas.com.br/frota</p>
          </div>
        </div>
      </div>
    </>
  )
}
