// Generador del mensaje de pedido por WhatsApp — fuente única de verdad
// para checkout y confirmación.
//
// Los emojis se ven perfectos cuando el mensaje se compone desde el celular,
// pero WhatsApp Web/Escritorio los corrompe (aparecen como "�") por el salto
// navegador→app. Por eso detectamos el dispositivo: en móvil enviamos la
// versión con emojis; en PC, una versión limpia (negritas + divisores) que
// se ve bien en todas partes.

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

// ¿El mensaje se está componiendo desde un teléfono?
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  if (nav.userAgentData && typeof nav.userAgentData.mobile === 'boolean') {
    return nav.userAgentData.mobile
  }
  return /Android|iPhone|iPad|iPod|Mobile|Windows Phone|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Lista de productos (igual en ambas versiones)
function listaProductos(d: WAOrderData): string {
  return d.items.map(i => {
    const variante = [
      i.size ? `Talla ${i.size}` : null,
      i.color ? `Color ${i.color}` : null,
    ].filter(Boolean).join(' · ')
    const totalLinea = (i.price * i.quantity).toFixed(2)
    return `• *${i.name}*\n   ${i.quantity} × $${i.price.toFixed(2)} = $${totalLinea}` +
      (variante ? `\n   _${variante}_` : '')
  }).join('\n\n')
}

// Versión con emojis (móvil)
function conEmojis(d: WAOrderData): string {
  const partes: string[] = [
    `${E.bag} *NUEVO PEDIDO*  ·  Punto Norte`,
    LINE,
    `${E.receipt} *Productos*`,
    listaProductos(d),
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
  return partes.join('\n')
}

// Versión limpia sin emojis (PC / WhatsApp Web)
function sinEmojis(d: WAOrderData): string {
  const partes: string[] = [
    '*NUEVO PEDIDO*  ·  Punto Norte',
    LINE,
    '*PRODUCTOS*',
    listaProductos(d),
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
  return partes.join('\n')
}

export function buildOrderWAMessage(d: WAOrderData): string {
  const msg = isMobileDevice() ? conEmojis(d) : sinEmojis(d)
  return encodeURIComponent(msg)
}
