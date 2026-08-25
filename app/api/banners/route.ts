import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

// GET — devuelve el banner activo (público)
export async function GET() {
  try {
    const banner = await prisma.banner.findFirst({
      where: { active: true },
      orderBy: { orden: 'asc' },
    })
    return NextResponse.json(banner ?? null)
  } catch (e) {
    console.error(e)
    return NextResponse.json(null)
  }
}

// POST — crear banner (solo admin)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { titulo, subtitulo, etiqueta, descripcion, linkUrl, linkTexto, imagen, imageData, precioDesde, active, orden } = body

    if (!titulo?.trim()) return NextResponse.json({ error: 'El título es requerido' }, { status: 400 })
    if (!linkUrl?.trim()) return NextResponse.json({ error: 'La URL del botón es requerida' }, { status: 400 })
    if (!linkTexto?.trim()) return NextResponse.json({ error: 'El texto del botón es requerido' }, { status: 400 })

    // Limitar base64 a 2MB
    if (imageData && imageData.length > 2_800_000) {
      return NextResponse.json({ error: 'La imagen es demasiado grande. Máximo 2MB.' }, { status: 400 })
    }

    const banner = await prisma.banner.create({
      data: {
        titulo:      titulo.trim(),
        subtitulo:   subtitulo?.trim() || null,
        etiqueta:    etiqueta?.trim()  || null,
        descripcion: descripcion?.trim() || null,
        linkUrl:     linkUrl.trim(),
        linkTexto:   linkTexto.trim(),
        imagen:      imageData ? null : (imagen?.trim() || null),
        imageData:   imageData || null,
        precioDesde: precioDesde ? parseFloat(precioDesde) : null,
        active:      active ?? true,
        orden:       orden || 0,
      },
    })

    return NextResponse.json({ ...banner, imagen: banner.imageData ?? banner.imagen ?? null }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al crear banner' }, { status: 500 })
  }
}
