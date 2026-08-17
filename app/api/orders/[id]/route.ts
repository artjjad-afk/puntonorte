import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { jwt.verify(token, process.env.JWT_SECRET!); return true } catch { return false }
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
  // GET requiere token de acceso del pedido O ser admin
  // El token se genera al crear el pedido y viaja por query param: ?token=...
  try {
    const { id } = await params
    const orderId = parseInt(id)
    if (isNaN(orderId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    // Verificar acceso: admin O token correcto
    const { searchParams } = new URL(req.url)
    const tokenParam = searchParams.get('token')
    const adminAccess = isAdmin(req)

    if (!adminAccess && tokenParam !== order.accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo devolver los campos necesarios para la confirmación
    const { customerName, customerPhone, address, city, notes, paymentMethod, total, status } = order
    return NextResponse.json({
      id: order.id,
      customerName,
      customerPhone,
      address,
      city,
      notes,
      paymentMethod,
      total,
      status,
      items: JSON.parse(order.items),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
