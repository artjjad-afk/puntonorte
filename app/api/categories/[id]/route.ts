import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { id } = await params
    const body = await req.json()
    const cat = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.name  !== undefined && { name:   body.name }),
        ...(body.slug  !== undefined && { slug:   body.slug }),
        ...(body.image !== undefined && { image:  body.image }),
        ...(body.order !== undefined && {
          order: Number.isFinite(parseInt(body.order))
            ? parseInt(body.order)
            : 0
        }),
        ...(body.active !== undefined && { active: body.active }),
      },
    })
    return NextResponse.json(cat)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { id } = await params
    await prisma.category.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
