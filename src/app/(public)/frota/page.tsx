import { prisma } from '@/lib/prisma'
import FrotaListaClient from './FrotaListaClient'

export const metadata = {
  title: 'Frota Nova Ambiental — Consulta de Revisões',
}

export default async function FrotaPage() {
  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    select: {
      id: true,
      numeroFrota: true,
      placa: true,
      modelo: true,
      marca: true,
      ano: true,
      fotoUrl: true,
      kmAtual: true,
    },
    orderBy: { numeroFrota: 'asc' },
  })

  return <FrotaListaClient veiculos={veiculos} />
}
