import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { normalizeVideos } from '@/lib/videos'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

// GET — obtener un producto por ID o slug
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const isNumeric = /^\d+$/.test(id)

    const product = await prisma.product.findFirst({
      where: isNumeric ? { id: parseInt(id) } : { slug: id },
    })

    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images || '[]'),
      videos: product.videos ? JSON.parse(product.videos) : [],
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      colors: product.colors ? JSON.parse(product.colors) : [],
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// PUT — actualizar producto (solo admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { name, price, originalPrice, category, subcategory, description, images, videos, sizes, colors, badge, featured, active } = body

    // Calcular inStock automáticamente si se envía stock
    const stockNum = body.stock !== undefined ? parseInt(body.stock) : undefined
    const inStockCalc = stockNum !== undefined ? stockNum > 0 : undefined

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name        !== undefined && name        && { name: name.trim() }),
        ...(price       !== undefined && price       && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(category    !== undefined && category    && { category }),
        ...(subcategory !== undefined && { subcategory: subcategory || null }),
        ...(description !== undefined && description && { description: description.trim() }),
        ...(images      !== undefined && images      && { images: JSON.stringify(Array.isArray(images) ? images : [images]) }),
        ...(videos      !== undefined && (() => { const v = normalizeVideos(videos); return { videos: v.length ? JSON.stringify(v) : null } })()),
        ...(body.videoFirst !== undefined && { videoFirst: Boolean(body.videoFirst) }),
        ...(sizes       !== undefined && { sizes:  sizes?.length  ? JSON.stringify(sizes)  : null }),
        ...(colors      !== undefined && { colors: colors?.length ? JSON.stringify(colors) : null }),
        ...(badge       !== undefined && { badge: badge || null }),
        ...(stockNum !== undefined && !isNaN(stockNum) && stockNum >= 0 && {
          stock:   stockNum,
          inStock: inStockCalc,
        }),
        ...(body.inStock !== undefined && stockNum === undefined && { inStock: body.inStock }),
        ...(featured    !== undefined && { featured }),
        ...(active      !== undefined && { active }),
        ...(body.showInOffers !== undefined && { showInOffers: Boolean(body.showInOffers) }),
      },
    })

    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images || '[]'),
      videos: product.videos ? JSON.parse(product.videos) : [],
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      colors: product.colors ? JSON.parse(product.colors) : [],
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE — eliminar producto (solo admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.product.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
