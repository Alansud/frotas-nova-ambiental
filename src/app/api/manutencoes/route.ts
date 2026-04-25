import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const {
    veiculoId,
    data,
    kmNaData,
    novoKmAtual,
    mecanico,
    servicos,
    observacoes,
    custo,
    novoKmPrevisto,
    novaDataPrevista,
  } = body

  if (!veiculoId || !data || !kmNaData || !mecanico || !servicos) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const manutencao = await prisma.manutencao.create({
    data: {
      veiculoId,
      data: new Date(data),
      kmNaData: Number(kmNaData),
      mecanico,
      servicos,
      observacoes: observacoes || null,
      custo: custo ? Number(custo) : null,
    },
  })

  // Atualiza kmAtual do veiculo:
  // usa novoKmAtual se informado, senão usa kmNaData — sempre pega o maior entre os dois e o atual
  const veiculo = await prisma.veiculo.findUnique({ where: { id: veiculoId } })
  if (veiculo) {
    const candidatos = [veiculo.kmAtual, Number(kmNaData)]
    if (novoKmAtual) candidatos.push(Number(novoKmAtual))
    const maiorKm = Math.max(...candidatos)

    if (maiorKm > veiculo.kmAtual) {
      await prisma.veiculo.update({
        where: { id: veiculoId },
        data: { kmAtual: maiorKm },
      })
    }

    // Atualiza ProximaRevisao se novos valores foram informados
    if (novoKmPrevisto) {
      await prisma.proximaRevisao.upsert({
        where: { veiculoId },
        update: {
          kmPrevisto: Number(novoKmPrevisto),
          dataPrevista: novaDataPrevista ? new Date(novaDataPrevista) : undefined,
        },
        create: {
          veiculoId,
          kmPrevisto: Number(novoKmPrevisto),
          dataPrevista: novaDataPrevista ? new Date(novaDataPrevista) : null,
        },
      })
    } else if (novaDataPrevista) {
      // Só atualizou a data sem alterar o km
      const revisaoExistente = await prisma.proximaRevisao.findUnique({ where: { veiculoId } })
      if (revisaoExistente) {
        await prisma.proximaRevisao.update({
          where: { veiculoId },
          data: { dataPrevista: new Date(novaDataPrevista) },
        })
      }
    }
  }

  return NextResponse.json(manutencao, { status: 201 })
}
