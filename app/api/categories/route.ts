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
    const showAll  = searchParams.get('all')    === 'true'
    const homeOnly = searchParams.get('home')   === 'true'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = showAll ? undefined : homeOnly ? { active: true, showInHome: true } : { active: true }
    const cats = await prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    // Si la categoría tiene imageData (base64), usarla como image
    const parsed = cats.map(c => ({
      ...c,
      image: c.imageData ?? c.image ?? null,
    }))

    return NextResponse.json(parsed)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { name, slug, image, imageData, order } = await req.json()

    if (!name?.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    if (!slug?.trim()) return NextResponse.json({ error: 'El slug es requerido' }, { status: 400 })

    // Validar orden
    const orderNum = parseInt(order)
    if (!orderNum || orderNum < 1) {
      return NextResponse.json({ error: 'El orden debe ser mayor a 0' }, { status: 400 })
    }

    // Verificar orden único
    const orderExists = await prisma.category.findFirst({ where: { order: orderNum } })
    if (orderExists) {
      return NextResponse.json({ error: `Ya existe una categoría con orden ${orderNum}` }, { status: 400 })
    }

    const existing = await prisma.category.findUnique({ where: { slug: slug.trim() } })
    if (existing) return NextResponse.json({ error: 'Ya existe una categoría con ese slug' }, { status: 400 })

    // Backstop de seguridad. Las imágenes se optimizan en el cliente (~<1MB),
    // así que este tope es solo para casos límite (p.ej. data URL pegado).
    if (imageData && imageData.length > 9_000_000) {
      return NextResponse.json({ error: 'La imagen es demasiado grande.' }, { status: 400 })
    }

    const cat = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        image: imageData ? null : (image || null),
        imageData: imageData || null,
        order: order || 0,
        showInNav: true,
      },
    })

    return NextResponse.json({ ...cat, image: cat.imageData ?? cat.image ?? null }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
  }
}
