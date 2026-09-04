import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

interface SaleItemIn { productId: number; quantity: number; price?: number }

// POST — registrar una venta presencial (en tienda). Solo admin.
// Crea un pedido ya CONFIRMADO con canal 'store' y descuenta el stock, todo
// en una transacción atómica. No cuenta como venta web (source = 'store').
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const rawItems: SaleItemIn[] = Array.isArray(body.items) ? body.items : []
    const paymentMethod = String(body.paymentMethod ?? 'Efectivo').slice(0, 50)
    const customerName = String(body.customerName ?? '').trim().slice(0, 200) || 'Venta en tienda'
    const notes = body.notes ? String(body.notes).trim().slice(0, 500) : null

    // Normalizar y validar los renglones
    const items = rawItems
      .map(i => ({ productId: parseInt(String(i.productId)), quantity: parseInt(String(i.quantity)), price: i.price != null ? parseFloat(String(i.price)) : null }))
      .filter(i => Number.isFinite(i.productId) && Number.isFinite(i.quantity) && i.quantity > 0)

    if (items.length === 0) return NextResponse.json({ error: 'Agrega al menos un producto a la venta' }, { status: 400 })
    if (items.length > 100) return NextResponse.json({ error: 'Demasiados productos en la venta' }, { status: 400 })

    const order = await prisma.$transaction(async (tx) => {
      // 1) Verificar stock y armar los renglones con el precio a usar
      const built: { productId: number; name: string; price: number; quantity: number }[] = []
      for (const it of items) {
        const p = await tx.product.findUnique({ where: { id: it.productId }, select: { id: true, name: true, price: true, stock: true } })
        if (!p) throw new Error(`Producto no encontrado (id ${it.productId})`)
        if (p.stock < it.quantity) throw new Error(`Stock insuficiente para "${p.name}". Disponible: ${p.stock}, solicitado: ${it.quantity}`)
        const price = (it.price != null && it.price >= 0) ? it.price : p.price
        built.push({ productId: p.id, name: p.name, price, quantity: it.quantity })
      }

      const total = built.reduce((s, b) => s + b.price * b.quantity, 0)

      // 2) Crear el pedido ya confirmado, canal tienda
      const created = await tx.order.create({
        data: {
          customerName,
          customerPhone: '-',
          address: 'Venta presencial en tienda',
          city: '-',
          notes,
          paymentMethod,
          items: JSON.stringify(built.map(b => ({ productId: b.productId, product: { name: b.name, price: b.price }, quantity: b.quantity }))),
          total,
          status: 'confirmed',
          source: 'store',
        },
      })

      // 3) Descontar stock
      for (const b of built) {
        const p = await tx.product.findUnique({ where: { id: b.productId }, select: { stock: true } })
        const newStock = Math.max(0, (p?.stock ?? 0) - b.quantity)
        await tx.product.update({ where: { id: b.productId }, data: { stock: newStock, inStock: newStock > 0 } })
      }

      return created
    })

    return NextResponse.json({ ...order, items: JSON.parse(order.items) }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al registrar la venta'
    console.error(e)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
