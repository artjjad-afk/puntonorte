import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// GET — obtener todos los productos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const showAll = searchParams.get('all') === 'true'
    const activeParam = searchParams.get('active')

    // showAll solo permitido para admins autenticados
    if (showAll && !isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const active = showAll ? undefined : activeParam !== 'false'
    const where: Record<string, unknown> = {}
    if (active !== undefined) where.active = active
    if (category && category !== 'all') where.category = category
    if (featured === 'true') where.featured = true

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })

    const parsed = products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      sizes: p.sizes ? JSON.parse(p.sizes) : [],
      colors: p.colors ? JSON.parse(p.colors) : [],
    }))

    return NextResponse.json(parsed)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

// POST — crear producto (solo admin)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, price, originalPrice, category, subcategory, description, images, sizes, colors, badge, inStock, featured } = body

    if (!name || !price || !category || !description) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Generar slug único
    let slug = slugify(name)
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        subcategory: subcategory || null,
        description: description.trim(),
        images: JSON.stringify(Array.isArray(images) ? images : [images]),
        sizes: sizes?.length ? JSON.stringify(sizes) : null,
        colors: colors?.length ? JSON.stringify(colors) : null,
        badge: badge || null,
        inStock: inStock ?? true,
        featured: featured ?? false,
        active: true,
      },
    })

    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images),
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      colors: product.colors ? JSON.parse(product.colors) : [],
    }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
