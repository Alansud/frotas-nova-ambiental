import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(_req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    // Buscar todos os veículos inativos
    const inativos = await prisma.veiculo.findMany({
      where: { ativo: false },
      select: { id: true, numeroFrota: true }
    })

    if (inativos.length === 0) {
      return NextResponse.json({ message: 'Nenhum veículo inativo encontrado', count: 0 })
    }

    // Deletar um por um para garantir que as relações sejam tratadas
    let deletados = 0
    for (const v of inativos) {
      try {
        await prisma.veiculo.delete({ where: { id: v.id } })
        deletados++
      } catch (e) {
        console.error(`Erro ao deletar veículo ${v.id}:`, e)
      }
    }

    return NextResponse.json({ 
      message: `Limpeza concluída`, 
      encontrados: inativos.length,
      deletados,
      veiculos: inativos.map(v => v.numeroFrota)
    })
  } catch (error) {
    console.error('Erro na limpeza:', error)
    return NextResponse.json({ error: 'Erro ao limpar veículos' }, { status: 500 })
  }
}