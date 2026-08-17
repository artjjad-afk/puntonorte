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

    // Validar items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El pedido no tiene productos' }, { status: 400 })
    }
    if (items.length > 50) {
      return NextResponse.json({ error: 'Demasiados productos en el pedido' }, { status: 400 })
    }

    // Calcular el total en el servidor — no confiar en el cliente
    const serverTotal = items.reduce((sum: number, item: { product: { price: number }; quantity: number }) => {
      const price  = parseFloat(String(item.product?.price ?? 0))
      const qty    = parseInt(String(item.quantity ?? 1))
      if (isNaN(price) || isNaN(qty) || price < 0 || qty < 1) return sum
      return sum + price * qty
    }, 0)

    // Tolerar diferencia mínima por redondeo (máx $0.10)
    const clientTotal = parseFloat(String(total))
    if (Math.abs(serverTotal - clientTotal) > 0.10) {
      console.warn(`Total mismatch: client=${clientTotal} server=${serverTotal}`)
      return NextResponse.json({ error: 'El total del pedido no coincide. Por favor recarga la página.' }, { status: 400 })
    }

    // Generar token de acceso único para que solo el cliente pueda ver su pedido
    const accessToken = crypto.randomUUID().replace(/-/g, '')

    const order = await prisma.order.create({
      data: {
        customerName:  customerName.trim().slice(0, 200),
        customerPhone,
        address:       address.trim().slice(0, 500),
        city:          city.trim().slice(0, 100),
        notes:         notes ? notes.trim().slice(0, 500) : null,
        paymentMethod,
        items: JSON.stringify(items),
        total: serverTotal,
        status: 'pending',
        accessToken,
      },
    })

    return NextResponse.json({
      ...order,
      items: JSON.parse(order.items),
      accessToken, // se devuelve al cliente para acceder a la confirmación
    }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
  }
}
