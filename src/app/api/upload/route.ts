import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

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

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  const result = await cloudinary.uploader.upload(base64, {
    folder: 'frotas-nova-ambiental',
    resource_type: 'image',
  })

  return NextResponse.json({ url: result.secure_url })
}
