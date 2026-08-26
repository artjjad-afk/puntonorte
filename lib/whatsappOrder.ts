// Generador del mensaje de pedido por WhatsApp — fuente única de verdad
// para checkout y confirmación. Usa escapes Unicode en los emojis para que
// nunca se corrompan por la codificación del archivo.

export type WAOrderItem = {
  name: string
  size?: string | null
  color?: string | null
  quantity: number
  price: number
}

export type WAOrderData = {
  items: WAOrderItem[]
  total: number
  name: string
  phone: string
  address: string
  city: string
  notes?: string | null
  paymentLabel: string
  orderId?: number | null
}

// Sin emojis a propósito: la app de WhatsApp que usa la tienda los muestra
// como "�" cuando llegan por enlace wa.me. Usamos negritas, divisores y
// caracteres seguros (─ · •) que sí se renderizan bien.
const LINE = '─'.repeat(24) // ────…

export function buildOrderWAMessage(d: WAOrderData): string {
  const productos = d.items.map(i => {
    const variante = [
      i.size ? `Talla ${i.size}` : null,
      i.color ? `Color ${i.color}` : null,
    ].filter(Boolean).join(' · ')
    const totalLinea = (i.price * i.quantity).toFixed(2)
    return `• *${i.name}*\n   ${i.quantity} × $${i.price.toFixed(2)} = $${totalLinea}` +
      (variante ? `\n   _${variante}_` : '')
  }).join('\n\n')

  const partes: string[] = [
    '*NUEVO PEDIDO*  ·  Punto Norte',
    LINE,
    '*PRODUCTOS*',
    productos,
    '',
    `*TOTAL:*  $${d.total.toFixed(2)}`,
    LINE,
    '*DATOS DE ENVÍO*',
    `*Nombre:*  ${d.name}`,
    `*Teléfono:*  ${d.phone}`,
    `*Dirección:*  ${d.address}`,
    `*Ciudad:*  ${d.city}`,
  ]

  if (d.notes) partes.push(`*Notas:*  ${d.notes}`)

  partes.push('')
  partes.push(`*Pago:*  ${d.paymentLabel}`)
  if (d.orderId != null) partes.push(`*Pedido #${d.orderId}*`)
  partes.push(LINE)
  partes.push('_¡Gracias por tu compra!_')

  return encodeURIComponent(partes.join('\n'))
}
