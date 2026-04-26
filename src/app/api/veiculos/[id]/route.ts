import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const veiculo = await prisma.veiculo.findUnique({
    where: { id },
    include: {
      manutencoes: { orderBy: { data: 'desc' } },
      proximaRevisao: true,
    },
  })
  if (!veiculo) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(veiculo)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { numeroFrota, placa, modelo, marca, ano, cor, renavam, chassi, fotoUrl, kmAtual, tipoMedicao, proximaRevisao } = body

  const veiculo = await prisma.veiculo.update({
    where: { id },
    data: {
      ...(numeroFrota !== undefined && { numeroFrota: String(numeroFrota).trim() }),
      placa: placa?.toUpperCase(),
      modelo,
      marca,
      ano: ano ? Number(ano) : undefined,
      cor,
      renavam,
      chassi,
      fotoUrl,
      kmAtual: kmAtual !== undefined ? Number(kmAtual) : undefined,
      ...(tipoMedicao !== undefined && { tipoMedicao: tipoMedicao === 'hora' ? 'hora' : 'km' }),
    },
  })

  // Upsert proximaRevisao
  if (proximaRevisao?.kmPrevisto) {
    await prisma.proximaRevisao.upsert({
      where: { veiculoId: id },
      update: {
        kmPrevisto: Number(proximaRevisao.kmPrevisto),
        dataPrevista: proximaRevisao.dataPrevista ? new Date(proximaRevisao.dataPrevista) : null,
        observacoes: proximaRevisao.observacoes || null,
      },
      create: {
        veiculoId: id,
        kmPrevisto: Number(proximaRevisao.kmPrevisto),
        dataPrevista: proximaRevisao.dataPrevista ? new Date(proximaRevisao.dataPrevista) : null,
        observacoes: proximaRevisao.observacoes || null,
      },
    })
  }

  return NextResponse.json(veiculo)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.veiculo.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json({ ok: true })
}
