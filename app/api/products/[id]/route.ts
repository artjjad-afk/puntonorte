import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

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
    const { name, price, originalPrice, category, subcategory, description, images, sizes, colors, badge, inStock, featured, active } = body

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(price && { price: parseFloat(price) }),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        ...(category && { category }),
        subcategory: subcategory || null,
        ...(description && { description: description.trim() }),
        ...(images && { images: JSON.stringify(Array.isArray(images) ? images : [images]) }),
        sizes: sizes?.length ? JSON.stringify(sizes) : null,
        colors: colors?.length ? JSON.stringify(colors) : null,
        badge: badge || null,
        ...(inStock !== undefined && { inStock }),
        ...(featured !== undefined && { featured }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images),
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
