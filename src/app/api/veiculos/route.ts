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
  const { numeroFrota, placa, modelo, marca, ano, cor, renavam, chassi, fotoUrl, kmAtual, tipoMedicao, proximaRevisao } = body

  if (!numeroFrota || !placa || !modelo || !marca || !ano) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  try {
    const veiculo = await prisma.veiculo.create({
      data: {
        numeroFrota: String(numeroFrota).trim(),
        placa: placa.toUpperCase(),
        modelo,
        marca,
        ano: Number(ano),
        cor: cor || null,
        renavam: renavam || null,
        chassi: chassi || null,
        fotoUrl: fotoUrl || null,
        kmAtual: Number(kmAtual) || 0,
        tipoMedicao: tipoMedicao === 'hora' ? 'hora' : 'km',
        ...(proximaRevisao?.kmPrevisto && {
          proximaRevisao: {
            create: {
              kmPrevisto: Number(proximaRevisao.kmPrevisto),
              dataPrevista: proximaRevisao.dataPrevista ? new Date(proximaRevisao.dataPrevista) : null,
              observacoes: proximaRevisao.observacoes || null,
            },
          },
        }),
      },
      include: { proximaRevisao: true },
    })

    return NextResponse.json(veiculo, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('Unique constraint') || message.includes('UNIQUE constraint failed')) {
      if (message.includes('numeroFrota')) {
        return NextResponse.json({ error: 'Já existe um veículo com esse número de frota' }, { status: 409 })
      }
      if (message.includes('placa')) {
        return NextResponse.json({ error: 'Já existe um veículo com essa placa' }, { status: 409 })
      }
    }
    console.error('[POST /api/veiculos]', message)
    return NextResponse.json({ error: 'Erro ao cadastrar veículo' }, { status: 500 })
  }
}
