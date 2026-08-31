import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// Necesita runtime Node (acceso a fs); no Edge.
export const runtime = 'nodejs'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

const MAX_BYTES = 50 * 1024 * 1024 // 50MB
// Formatos de video permitidos → extensión
const ALLOWED: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
  'video/x-m4v': 'm4v',
}

// POST — sube un video del admin al servidor y devuelve su URL pública.
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    const ext = ALLOWED[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Formato no soportado. Usa MP4, WebM o MOV.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'El video supera el máximo de 50MB.' }, { status: 413 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const dir = path.join(process.cwd(), 'public', 'uploads', 'videos')
    await mkdir(dir, { recursive: true })
    const filename = `${randomUUID()}.${ext}`
    await writeFile(path.join(dir, filename), bytes)

    return NextResponse.json({ url: `/uploads/videos/${filename}` }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al subir el video' }, { status: 500 })
  }
}
