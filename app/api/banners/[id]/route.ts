import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

// PUT — actualizar banner (solo admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const bannerId = parseInt(id)
    if (isNaN(bannerId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const body = await req.json()

    const banner = await prisma.banner.update({
      where: { id: bannerId },
      data: {
        ...(body.titulo      !== undefined && { titulo:      body.titulo.trim() }),
        ...(body.subtitulo   !== undefined && { subtitulo:   body.subtitulo?.trim() || null }),
        ...(body.etiqueta    !== undefined && { etiqueta:    body.etiqueta?.trim()  || null }),
        ...(body.descripcion !== undefined && { descripcion: body.descripcion?.trim() || null }),
        ...(body.linkUrl     !== undefined && { linkUrl:     body.linkUrl.trim() }),
        ...(body.linkTexto   !== undefined && { linkTexto:   body.linkTexto.trim() }),
        ...(body.precioDesde !== undefined && { precioDesde: body.precioDesde ? parseFloat(body.precioDesde) : null }),
        ...(body.active      !== undefined && { active:      body.active }),
        ...(body.orden       !== undefined && { orden:       parseInt(body.orden) || 0 }),
        // Imagen: si viene imageData usar esa, si viene imagen URL usar esa
        ...(body.imageData !== undefined && {
          imageData: body.imageData || null,
          imagen:    body.imageData ? null : (body.imagen?.trim() || null),
        }),
        ...(body.imagen !== undefined && body.imageData === undefined && {
          imagen:    body.imagen?.trim() || null,
        }),
      },
    })

    return NextResponse.json({ ...banner, imagen: banner.imageData ?? banner.imagen ?? null })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al actualizar banner' }, { status: 500 })
  }
}

// DELETE — eliminar banner (solo admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const bannerId = parseInt(id)
    if (isNaN(bannerId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    await prisma.banner.delete({ where: { id: bannerId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al eliminar banner' }, { status: 500 })
  }
}
