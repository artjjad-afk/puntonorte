import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

export async function GET() {
  try {
    const cats = await prisma.category.findMany({
      where: { active: true },
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
    const cat = await prisma.category.create({
      data: { name, slug, image: image || null, order: order || 0 },
    })
    return NextResponse.json(cat, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
  }
}
