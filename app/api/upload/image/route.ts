import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

const MAX_BYTES = 8 * 1024 * 1024 // 8MB (las imágenes ya llegan comprimidas ~<1MB)
const ALLOWED: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

// POST — sube una imagen del admin al servidor y devuelve su URL pública.
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió ninguna imagen' }, { status: 400 })
    }
    const ext = ALLOWED[file.type]
    if (!ext) return NextResponse.json({ error: 'Formato de imagen no soportado' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'La imagen es demasiado grande' }, { status: 413 })

    const bytes = Buffer.from(await file.arrayBuffer())
    const dir = path.join(process.cwd(), 'public', 'uploads', 'images')
    await mkdir(dir, { recursive: true })
    const filename = `${randomUUID()}.${ext}`
    await writeFile(path.join(dir, filename), bytes)

    return NextResponse.json({ url: `/uploads/images/${filename}` }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
  }
}
