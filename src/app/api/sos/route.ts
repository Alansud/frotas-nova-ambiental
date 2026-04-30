import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Rate limiting simples em memória (para produção, considere Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hora em ms
const RATE_LIMIT_MAX = 3 // máximo de 3 alertas por IP por hora

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // Novo período ou primeira requisição
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false // Limite excedido
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Obter IP do cliente
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown'

    // Verificar rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Muitos alertas enviados. Tente novamente em 1 hora.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { veiculoId, fotoUrl, descricao, latitude, longitude, contato } = body

    // Validações básicas
    if (!veiculoId || !descricao || descricao.trim().length < 5) {
      return NextResponse.json(
        { error: 'Veículo e descrição são obrigatórios (mínimo 5 caracteres)' },
        { status: 400 }
      )
    }

    // Verificar se o veículo existe e está ativo
    const veiculo = await prisma.veiculo.findUnique({
      where: { id: veiculoId, ativo: true },
      select: { id: true, numeroFrota: true, modelo: true },
    })

    if (!veiculo) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      )
    }

    // Validar tamanho da foto (máximo 5MB em base64)
    if (fotoUrl && fotoUrl.length > 7 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A foto é muito grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    // Criar o alerta SOS
    const alerta = await prisma.sosAlerta.create({
      data: {
        veiculoId,
        fotoUrl: fotoUrl || null,
        descricao: descricao.trim(),
        latitude: latitude || null,
        longitude: longitude || null,
        contato: contato?.trim() || null,
        status: 'pendente',
      },
    })

    return NextResponse.json({
      success: true,
      alerta: {
        id: alerta.id,
        veiculo: `${veiculo.numeroFrota} - ${veiculo.modelo}`,
        createdAt: alerta.createdAt,
      },
    })
  } catch (error) {
    console.error('[SOS] Erro ao criar alerta:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar o alerta' },
      { status: 500 }
    )
  }
}

// Endpoint para listar alertas (para o dashboard admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pendente'

    const alertas = await prisma.sosAlerta.findMany({
      where: { status },
      include: {
        veiculo: {
          select: {
            id: true,
            numeroFrota: true,
            modelo: true,
            placa: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ alertas })
  } catch (error) {
    console.error('[SOS] Erro ao listar alertas:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar alertas' },
      { status: 500 }
    )
  }
}
