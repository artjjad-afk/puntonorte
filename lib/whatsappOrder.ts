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

// Emojis por código Unicode (a prueba de corrupción por encoding del archivo).
const E = {
  bag:     '\u{1F6CD}\u{FE0F}', // 🛍️
  receipt: '\u{1F9FE}',         // 🧾
  money:   '\u{1F4B0}',         // 💰
  box:     '\u{1F4E6}',         // 📦
  person:  '\u{1F464}',         // 👤
  phone:   '\u{1F4F1}',         // 📱
  pin:     '\u{1F4CD}',         // 📍
  city:    '\u{1F3D9}\u{FE0F}', // 🏙️
  memo:    '\u{1F4DD}',         // 📝
  card:    '\u{1F4B3}',         // 💳
  tag:     '\u{1F516}',         // 🔖
  hands:   '\u{1F64C}',         // 🙌
  spark:   '\u{2728}',          // ✨
}

const LINE = '─'.repeat(20) // ────…

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
    `${E.bag} *NUEVO PEDIDO*  ·  Punto Norte`,
    LINE,
    `${E.receipt} *Productos*`,
    productos,
    '',
    `${E.money} *Total:*  $${d.total.toFixed(2)}`,
    LINE,
    `${E.box} *Datos de envío*`,
    `${E.person} ${d.name}`,
    `${E.phone} ${d.phone}`,
    `${E.pin} ${d.address}`,
    `${E.city} ${d.city}`,
  ]

  if (d.notes) partes.push(`${E.memo} ${d.notes}`)

  partes.push('')
  partes.push(`${E.card} *Pago:*  ${d.paymentLabel}`)
  if (d.orderId != null) partes.push(`${E.tag} *Pedido #${d.orderId}*`)
  partes.push(LINE)
  partes.push(`${E.hands} ¡Gracias por tu compra! ${E.spark}`)

  return encodeURIComponent(partes.join('\n'))
}
