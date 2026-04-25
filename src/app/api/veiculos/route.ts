import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    include: { manutencoes: { orderBy: { data: 'desc' } }, proximaRevisao: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(veiculos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { numeroFrota, placa, modelo, marca, ano, cor, renavam, chassi, fotoUrl, kmAtual, proximaRevisao } = body

  if (!numeroFrota || !placa || !modelo || !marca || !ano) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const veiculo = await prisma.veiculo.create({
    data: {
      numeroFrota: String(numeroFrota).trim(),
      placa: placa.toUpperCase(),
      modelo,
      marca,
      ano: Number(ano),
      cor,
      renavam,
      chassi,
      fotoUrl,
      kmAtual: Number(kmAtual) || 0,
      ...(proximaRevisao?.kmPrevisto && {
        proximaRevisao: {
          create: {
            kmPrevisto: Number(proximaRevisao.kmPrevisto),
            dataPrevista: proximaRevisao.dataPrevista ? new Date(proximaRevisao.dataPrevista) : null,
            observacoes: proximaRevisao.observacoes,
          },
        },
      }),
    },
    include: { proximaRevisao: true },
  })

  return NextResponse.json(veiculo, { status: 201 })
}
