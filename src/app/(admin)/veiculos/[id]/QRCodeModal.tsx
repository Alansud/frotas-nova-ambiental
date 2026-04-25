'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  veiculoId: string
  placa: string
  modelo: string
}

export default function QRCodeModal({ veiculoId, placa, modelo }: Props) {
  const [open, setOpen] = useState(false)

  function handlePrint() {
    window.print()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
        style={{ borderColor: '#0056A6', color: '#0056A6' }}
      >
        QR Code
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">QR Code do Veículo</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">
                ×
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Image
                src="/logo-nova-ambiental.jpg"
                alt="Nova Ambiental"
                width={80}
                height={80}
                className="rounded-xl object-contain"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qrcode/${veiculoId}`}
                alt="QR Code"
                width={250}
                height={250}
                className="rounded-lg border border-gray-100"
              />
              <div className="text-center">
                <p className="font-bold text-lg" style={{ color: '#0056A6' }}>{placa}</p>
                <p className="text-sm text-gray-600">{modelo}</p>
                <p className="text-xs text-gray-400 mt-1">Escaneie para ver o histórico de revisões</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePrint}
                className="flex-1 text-white font-semibold py-2 rounded-lg text-sm"
                style={{ background: '#0056A6' }}
              >
                Imprimir
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagina de impressao */}
      <div className="hidden print:flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/logo-nova-ambiental.jpg"
              alt="Nova Ambiental"
              width={64}
              height={64}
              className="rounded-xl object-contain"
            />
            <span className="font-bold text-xl" style={{ color: '#0056A6' }}>Nova Ambiental</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/qrcode/${veiculoId}`} alt="QR Code" width={300} height={300} />
          <p className="text-2xl font-bold">{placa}</p>
          <p className="text-lg text-gray-600">{modelo}</p>
          <p className="text-sm text-gray-400">Escaneie para ver o histórico de revisões</p>
        </div>
      </div>
    </>
  )
}
