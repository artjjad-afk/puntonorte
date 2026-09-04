/**
 * Lógica de agregación para el módulo de Reportes del admin.
 * Funciones puras (reciben `now` para poder testear) que calculan ingresos,
 * ventas por producto/categoría, serie temporal e inventario.
 */

// Estados que cuentan como venta concretada (ingreso real).
export const PAID_STATUSES = ['confirmed', 'shipped', 'delivered']

export interface ReportOrderItem {
  product: { name: string; price: number }
  quantity: number
}
export interface ReportOrder {
  id: number
  total: number
  status: string
  createdAt: string
  paymentMethod: string
  items: ReportOrderItem[]
  customerName: string
  source?: string // 'web' | 'store'
}
export interface ReportProduct {
  id: number
  name: string
  price: number
  cost?: number | null // precio de compra (privado)
  category: string
  stock: number
  active?: boolean
}

export type Preset = 'semana' | 'mes' | 'trimestre' | 'anio' | 'todo' | 'custom'

/** Devuelve el rango [from, to] (Date o null) para un preset o rango custom. */
export function getRange(
  preset: Preset,
  fromStr?: string,
  toStr?: string,
  now: Date = new Date(),
): { from: Date | null; to: Date | null } {
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)

  switch (preset) {
    case 'semana': {
      // Desde el lunes de esta semana
      const day = (now.getDay() + 6) % 7 // 0 = lunes
      const monday = new Date(now); monday.setDate(now.getDate() - day)
      return { from: startOfDay(monday), to: endOfToday }
    }
    case 'mes':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfToday }
    case 'trimestre': {
      const q = Math.floor(now.getMonth() / 3) * 3
      return { from: new Date(now.getFullYear(), q, 1), to: endOfToday }
    }
    case 'anio':
      return { from: new Date(now.getFullYear(), 0, 1), to: endOfToday }
    case 'todo':
      return { from: null, to: null }
    case 'custom': {
      const from = fromStr ? new Date(fromStr + 'T00:00:00') : null
      const to = toStr ? new Date(toStr + 'T23:59:59') : null
      return { from, to }
    }
    default:
      return { from: null, to: null }
  }
}

/** Filtra pedidos pagados dentro del rango. */
export function paidOrdersInRange(orders: ReportOrder[], from: Date | null, to: Date | null): ReportOrder[] {
  return orders.filter(o => {
    if (!PAID_STATUSES.includes(o.status)) return false
    const t = new Date(o.createdAt).getTime()
    if (from && t < from.getTime()) return false
    if (to && t > to.getTime()) return false
    return true
  })
}

export interface SalesRow { name: string; units: number; revenue: number }
export interface Aggregation {
  ingresos: number
  pedidos: number
  ticket: number
  unidades: number
  porProducto: SalesRow[]
  porCategoria: SalesRow[]
  serie: { label: string; ingresos: number }[]
  porMetodo: { metodo: string; pedidos: number; monto: number }[]
  porCanal: { canal: string; pedidos: number; monto: number }[]
}

/** Agrega ventas de los pedidos ya filtrados. `products` sirve para mapear producto→categoría. */
export function aggregate(orders: ReportOrder[], products: ReportProduct[], from: Date | null, to: Date | null): Aggregation {
  const catByName = new Map<string, string>()
  for (const p of products) catByName.set(p.name, p.category)

  const ingresos = orders.reduce((s, o) => s + (o.total || 0), 0)
  const pedidos = orders.length
  const ticket = pedidos ? ingresos / pedidos : 0

  const prodMap = new Map<string, SalesRow>()
  const catMap = new Map<string, SalesRow>()
  let unidades = 0
  for (const o of orders) {
    for (const it of o.items || []) {
      const name = it.product?.name ?? '—'
      const qty = it.quantity || 0
      const rev = (it.product?.price ?? 0) * qty
      unidades += qty
      const pr = prodMap.get(name) ?? { name, units: 0, revenue: 0 }
      pr.units += qty; pr.revenue += rev; prodMap.set(name, pr)
      const cat = catByName.get(name) ?? 'Sin categoría'
      const cr = catMap.get(cat) ?? { name: cat, units: 0, revenue: 0 }
      cr.units += qty; cr.revenue += rev; catMap.set(cat, cr)
    }
  }

  // Método de pago
  const metMap = new Map<string, { metodo: string; pedidos: number; monto: number }>()
  for (const o of orders) {
    const m = o.paymentMethod || '—'
    const e = metMap.get(m) ?? { metodo: m, pedidos: 0, monto: 0 }
    e.pedidos += 1; e.monto += o.total || 0; metMap.set(m, e)
  }

  // Canal: web vs tienda
  const canalMap = new Map<string, { canal: string; pedidos: number; monto: number }>()
  for (const o of orders) {
    const canal = o.source === 'store' ? 'Tienda' : 'Web'
    const e = canalMap.get(canal) ?? { canal, pedidos: 0, monto: 0 }
    e.pedidos += 1; e.monto += o.total || 0; canalMap.set(canal, e)
  }

  // Serie temporal: diaria si el rango es corto (<=62 días), mensual si es largo.
  const times = orders.map(o => new Date(o.createdAt).getTime())
  const minT = from ? from.getTime() : Math.min(...(times.length ? times : [Date.now()]))
  const maxT = to ? to.getTime() : Math.max(...(times.length ? times : [Date.now()]))
  const spanDays = (maxT - minT) / 86400000
  const daily = spanDays <= 62
  const serieMap = new Map<string, number>()
  const keyOf = (d: Date) => daily
    ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    : `${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
  const sortKey = (d: Date) => daily
    ? d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
    : d.getFullYear() * 100 + d.getMonth()
  const serieSort = new Map<string, number>()
  for (const o of orders) {
    const d = new Date(o.createdAt)
    const k = keyOf(d)
    serieMap.set(k, (serieMap.get(k) ?? 0) + (o.total || 0))
    serieSort.set(k, sortKey(d))
  }
  const serie = Array.from(serieMap.entries())
    .map(([label, ingresos]) => ({ label, ingresos }))
    .sort((a, b) => (serieSort.get(a.label)! - serieSort.get(b.label)!))

  const byRevDesc = (a: SalesRow, b: SalesRow) => b.revenue - a.revenue
  return {
    ingresos, pedidos, ticket, unidades,
    porProducto: Array.from(prodMap.values()).sort(byRevDesc),
    porCategoria: Array.from(catMap.values()).sort(byRevDesc),
    serie,
    porMetodo: Array.from(metMap.values()).sort((a, b) => b.monto - a.monto),
    porCanal: Array.from(canalMap.values()).sort((a, b) => b.monto - a.monto),
  }
}

export interface InventoryRow { name: string; category: string; stock: number; price: number; cost: number; value: number; costValue: number; sinCosto: boolean }
export interface InventorySummary {
  valorVenta: number
  valorCosto: number        // inversión: Σ stock × precio de compra
  gananciaPotencial: number // valorVenta − valorCosto (si se vende todo el stock)
  sinCosto: number          // productos sin costo cargado (la inversión queda incompleta)
  unidades: number
  totalProductos: number
  agotados: number
  bajoStock: number
  filas: InventoryRow[]
  porCategoria: { name: string; unidades: number; valor: number; costo: number }[]
}

/** Resumen del inventario actual (no depende del rango de fechas). */
export function inventorySummary(products: ReportProduct[]): InventorySummary {
  const filas: InventoryRow[] = products.map(p => {
    const stock = p.stock || 0
    const price = p.price || 0
    const hasCost = p.cost != null
    const cost = hasCost ? (p.cost as number) : 0
    return {
      name: p.name, category: p.category, stock, price, cost,
      value: stock * price, costValue: stock * cost, sinCosto: !hasCost,
    }
  })
  const valorVenta = filas.reduce((s, r) => s + r.value, 0)
  const valorCosto = filas.reduce((s, r) => s + r.costValue, 0)
  const unidades = filas.reduce((s, r) => s + r.stock, 0)
  const agotados = filas.filter(r => r.stock === 0).length
  const bajoStock = filas.filter(r => r.stock > 0 && r.stock <= 5).length
  const sinCosto = filas.filter(r => r.sinCosto).length

  const catMap = new Map<string, { name: string; unidades: number; valor: number; costo: number }>()
  for (const r of filas) {
    const e = catMap.get(r.category) ?? { name: r.category, unidades: 0, valor: 0, costo: 0 }
    e.unidades += r.stock; e.valor += r.value; e.costo += r.costValue; catMap.set(r.category, e)
  }
  return {
    valorVenta, valorCosto, gananciaPotencial: valorVenta - valorCosto, sinCosto,
    unidades, totalProductos: products.length, agotados, bajoStock,
    filas: filas.sort((a, b) => b.costValue - a.costValue),
    porCategoria: Array.from(catMap.values()).sort((a, b) => b.valor - a.valor),
  }
}

/** Formatea un número como dinero USD. */
export function money(n: number): string {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
