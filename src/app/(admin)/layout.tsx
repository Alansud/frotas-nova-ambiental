import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { calcularStatusRevisao } from '@/types'
import { redirect } from 'next/navigation'
import ReviewAlertToast from '@/components/admin/ReviewAlertToast'
import AlertToast from '@/components/AlertToast'
import NavbarAdmin from '@/components/admin/NavbarAdmin'
import Footer from '@/components/Footer'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    include: { manutencoes: true, proximaRevisao: true },
  })

  const notificacoes = veiculos.reduce(
    (acc, veiculo) => {
      const status = calcularStatusRevisao(veiculo)
      if (status === 'vencida') acc.vencidas += 1
      if (status === 'atencao') acc.proximas += 1
      return acc
    },
    { vencidas: 0, proximas: 0 }
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <ReviewAlertToast
        vencidas={notificacoes.vencidas}
        proximas={notificacoes.proximas}
      />
      <AlertToast />
      <NavbarAdmin />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
