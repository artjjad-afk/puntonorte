import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
}

// GET — obtener pedidos (solo admin)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })))
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// POST — crear pedido (público, viene del checkout)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerName, customerPhone, address, city, notes, paymentMethod, items, total } = body

    if (!customerName || !customerPhone || !address || !city || !items || !total) {
      return NextResponse.json({ error: 'Faltan datos del pedido' }, { status: 400 })
    }

    // Validar teléfono venezolano
    const digits = customerPhone.replace(/\D/g, '')
    const local = digits.startsWith('58') ? '0' + digits.slice(2) : digits
    if (!/^0(412|414|416|424|426)\d{7}$/.test(local)) {
      return NextResponse.json({ error: 'Número de teléfono venezolano inválido' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        address,
        city,
        notes: notes || null,
        paymentMethod,
        items: JSON.stringify(items),
        total: parseFloat(total),
        status: 'pending',
      },
    })

    return NextResponse.json({ ...order, items: JSON.parse(order.items) }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
  }
}
