'use client'

import { useState } from 'react'
import Image from 'next/image'
import NotificacoesHeader from '@/components/NotificacoesHeader'

export default function NavbarAdmin() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="text-white shadow-lg" style={{ background: '#0056A6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <a href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Image
                src="/logo-nova-ambiental.jpg"
                alt="Nova Ambiental"
                width={40}
                height={40}
                className="rounded-md object-contain bg-white flex-shrink-0"
                priority
              />
              <span className="font-bold text-base sm:text-lg tracking-wide text-white truncate hidden sm:block">
                Nova Ambiental — Frotas
              </span>
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-4 text-sm mr-2">
              <a href="/dashboard" className="hover:text-blue-200 transition-colors">
                Dashboard
              </a>
              <a href="/veiculos" className="hover:text-blue-200 transition-colors">
                Frotas
              </a>
            </div>

            {/* Notifications bell */}
            <NotificacoesHeader />

            {/* Signout (desktop) */}
            <a
              href="/api/auth/signout"
              className="hidden sm:block bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors text-sm ml-1"
            >
              Sair
            </a>

            {/* Hamburger button (mobile only) */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="sm:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors ml-1"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-blue-700" style={{ background: '#004a8f' }}>
          <div className="px-4 py-2 space-y-1">
            <a href="/dashboard" className="flex items-center py-3 px-3 rounded-lg text-white hover:bg-white/10 text-sm font-medium min-h-[44px]" onClick={() => setMenuOpen(false)}>
              Dashboard
            </a>
            <a href="/veiculos" className="flex items-center py-3 px-3 rounded-lg text-white hover:bg-white/10 text-sm font-medium min-h-[44px]" onClick={() => setMenuOpen(false)}>
              Frotas
            </a>
            <a href="/api/auth/signout" className="flex items-center py-3 px-3 rounded-lg text-white hover:bg-white/10 text-sm font-medium min-h-[44px]">
              Sair
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
