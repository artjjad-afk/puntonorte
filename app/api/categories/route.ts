import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get('all') === 'true'

    const cats = await prisma.category.findMany({
      where: showAll ? undefined : { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(cats)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { name, slug, image, order } = await req.json()

    // Validación
    if (!name?.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    if (!slug?.trim()) return NextResponse.json({ error: 'El slug es requerido' }, { status: 400 })

    // Verificar slug único
    const existing = await prisma.category.findUnique({ where: { slug: slug.trim() } })
    if (existing) return NextResponse.json({ error: 'Ya existe una categoría con ese slug' }, { status: 400 })

    const cat = await prisma.category.create({
      data: { name: name.trim(), slug: slug.trim(), image: image || null, order: order || 0 },
    })
    return NextResponse.json(cat, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
  }
}
