import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const veiculo = await prisma.veiculo.findUnique({ where: { id } })
  if (!veiculo) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const baseUrl = req.headers.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const url = `${protocol}://${baseUrl}/veiculo/${id}`

  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 300,
    margin: 2,
    color: { dark: '#0056A6', light: '#ffffff' },
  })

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="qrcode-${veiculo.placa}.png"`,
    },
  })
}
