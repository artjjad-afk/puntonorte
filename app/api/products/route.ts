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
    const showAll  = searchParams.get('all')    === 'true'
    const offersOnly = searchParams.get('offers') === 'true'
    const activeParam = searchParams.get('active')
    const q = searchParams.get('q')?.trim()

    if (showAll && !isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const active = showAll ? undefined : activeParam !== 'false'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {}
    if (active !== undefined) where.active = active
    if (category && category !== 'all') where.category = category
    if (featured === 'true') where.featured = true
    if (offersOnly) where.showInOffers = true

    // Búsqueda por texto — busca en nombre, descripción y categoría
    if (q) {
      where.OR = [
        { name:        { contains: q } },
        { description: { contains: q } },
        { category:    { contains: q } },
      ]
    }

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
    const { name, price, originalPrice, category, subcategory, description, images, sizes, colors, badge, featured } = body

    if (!name || !price || !category || !description) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Validar stock
    const stockNum = parseInt(body.stock ?? '0')
    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json({ error: 'El stock debe ser un número mayor o igual a 0' }, { status: 400 })
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
        stock:    stockNum,
        inStock:  stockNum > 0,  // calculado automáticamente
        featured: featured ?? false,
        active:   body.active ?? true,
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
