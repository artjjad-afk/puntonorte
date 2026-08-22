import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

/* Tipos para los items del pedido */
interface OrderItem {
  product: { name: string; price: number }
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const { status } = await req.json()

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const orderId = parseInt(id)
    if (isNaN(orderId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    // Obtener el pedido actual para conocer su estado previo
    const current = await prisma.order.findUnique({ where: { id: orderId } })
    if (!current) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    const prevStatus  = current.status
    const items: OrderItem[] = JSON.parse(current.items)

    // ── Lógica de stock ──
    // Solo actuar si el estado realmente cambia
    if (prevStatus !== status) {

      // CASO 1: confirmed → descontar stock
      if (status === 'confirmed' && prevStatus !== 'confirmed') {
        // Verificar que haya stock suficiente antes de descontar
        for (const item of items) {
          // Buscar el producto por nombre (es lo que se guarda en el pedido)
          const product = await prisma.product.findFirst({
            where: { name: item.product.name },
            select: { id: true, stock: true, name: true },
          })
          if (!product) continue
          if (product.stock < item.quantity) {
            return NextResponse.json({
              error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
            }, { status: 400 })
          }
        }

        // Todo tiene stock — descontar en transacción atómica
        await prisma.$transaction(async (tx) => {
          // Actualizar estado del pedido
          await tx.order.update({ where: { id: orderId }, data: { status } })

          // Descontar stock de cada producto
          for (const item of items) {
            const product = await tx.product.findFirst({
              where: { name: item.product.name },
              select: { id: true, stock: true },
            })
            if (!product) continue

            const newStock = Math.max(0, product.stock - item.quantity)
            await tx.product.update({
              where: { id: product.id },
              data: {
                stock:   newStock,
                inStock: newStock > 0,
              },
            })
          }
        })

        const updated = await prisma.order.findUnique({ where: { id: orderId } })
        return NextResponse.json({ ...updated, items: JSON.parse(updated!.items) })
      }

      // CASO 2: cancelled desde confirmed → devolver stock
      if (status === 'cancelled' && prevStatus === 'confirmed') {
        await prisma.$transaction(async (tx) => {
          // Actualizar estado del pedido
          await tx.order.update({ where: { id: orderId }, data: { status } })

          // Devolver stock a cada producto
          for (const item of items) {
            const product = await tx.product.findFirst({
              where: { name: item.product.name },
              select: { id: true, stock: true },
            })
            if (!product) continue

            const newStock = product.stock + item.quantity
            await tx.product.update({
              where: { id: product.id },
              data: {
                stock:   newStock,
                inStock: newStock > 0,
              },
            })
          }
        })

        const updated = await prisma.order.findUnique({ where: { id: orderId } })
        return NextResponse.json({ ...updated, items: JSON.parse(updated!.items) })
      }
    }

    // CASO 3: cualquier otro cambio de estado — solo actualizar estado
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    return NextResponse.json({ ...order, items: JSON.parse(order.items) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const orderId = parseInt(id)
    if (isNaN(orderId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    // Verificar acceso: admin O token correcto
    const { searchParams } = new URL(req.url)
    const tokenParam  = searchParams.get('token')
    const adminAccess = isAdmin(req)

    if (!adminAccess && tokenParam !== order.accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { customerName, customerPhone, address, city, notes, paymentMethod, total, status } = order
    return NextResponse.json({
      id: order.id,
      customerName, customerPhone,
      address, city, notes,
      paymentMethod, total, status,
      items: JSON.parse(order.items),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
