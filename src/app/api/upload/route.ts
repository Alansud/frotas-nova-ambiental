import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 })
  }

  // Limite de 5MB — Netlify Functions têm teto de 6MB no API Gateway
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 })
  }

  try {
    const bytes = await file.arrayBuffer()
    const inputBuffer = Buffer.from(bytes)

    // Comprimir: redimensionar para no máximo 800px, qualidade 65%, converter para webp
    const compressedBuffer = await sharp(inputBuffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 65 })
      .toBuffer()

    const base64 = `data:image/webp;base64,${compressedBuffer.toString('base64')}`

    return NextResponse.json({ url: base64 })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Erro no upload'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
