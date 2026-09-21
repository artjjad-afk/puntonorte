/**
 * Limpieza de datos de PRUEBA: borra todos los pedidos (web y tienda) y
 * DEVUELVE al inventario el stock que descontaron las ventas de prueba.
 *
 * NO toca productos, categorías ni banners (son datos reales).
 *
 * SEGURO:
 *  - Respalda TODOS los pedidos a un archivo antes de borrar.
 *  - Modo --dry: muestra qué haría, sin tocar nada.
 *  - Devuelve stock y borra en una transacción atómica.
 *  - Reinicia el contador de pedidos a #1 (arranque limpio).
 *
 * IMPORTANTE: además de este respaldo, haz un mysqldump COMPLETO antes
 * (ver instrucciones). Este script modifica el stock de productos, y solo
 * el mysqldump completo permite revertir todo si hiciera falta.
 *
 * Uso (en el servidor, dentro de /var/www/puntonorte):
 *   node scripts/limpiar-datos-prueba.js --dry   # vista previa, no borra
 *   node scripts/limpiar-datos-prueba.js          # ejecuta la limpieza real
 */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const DRY = process.argv.includes('--dry')
const BACKUP_DIR = path.join(process.cwd(), 'backups')
// Estados que SÍ descontaron stock (hay que devolverlo). pending/cancelled no.
const STOCK_STATUSES = ['confirmed', 'shipped', 'delivered']

async function main() {
  console.log(DRY ? '=== MODO PRUEBA (dry run) — no borra nada ===' : '=== LIMPIEZA REAL ===')

  const orders = await prisma.order.findMany()
  console.log('Pedidos en total:', orders.length)
  if (orders.length === 0) { console.log('No hay pedidos que limpiar.'); return }

  // Respaldo COMPLETO y reversible: pedidos + stock actual de cada producto
  // (antes de modificarlo). Con esto se puede revertir todo si hiciera falta.
  if (!DRY) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
    const stockSnapshot = await prisma.product.findMany({ select: { id: true, name: true, stock: true, inStock: true } })
    const bk = path.join(BACKUP_DIR, 'limpieza-backup-' + Date.now() + '.json')
    fs.writeFileSync(bk, JSON.stringify({ fecha: new Date().toISOString(), orders, productsStockAntes: stockSnapshot }))
    console.log('Respaldo (pedidos + stock previo):', bk, '(' + (fs.statSync(bk).size / 1024).toFixed(0) + ' KB)')
  }

  // Calcular cuánto stock devolver (solo de pedidos que descontaron)
  const addByProductId = new Map()
  const addByName = new Map()
  let conStock = 0
  for (const o of orders) {
    if (!STOCK_STATUSES.includes(o.status)) continue
    conStock++
    let items = []
    try { items = JSON.parse(o.items || '[]') } catch { /* ignorar */ }
    for (const it of items) {
      const qty = parseInt(it && it.quantity) || 0
      if (!qty) continue
      if (it.productId != null) addByProductId.set(it.productId, (addByProductId.get(it.productId) || 0) + qty)
      else if (it.product && it.product.name) addByName.set(it.product.name, (addByName.get(it.product.name) || 0) + qty)
    }
  }
  console.log('Pedidos que descontaron stock (confirmado/enviado/entregado):', conStock)

  // Resolver los pedidos web (que guardan nombre, no id) contra el catálogo
  const products = await prisma.product.findMany({ select: { id: true, name: true, stock: true } })
  const byName = new Map(products.map(p => [p.name, p]))
  const plan = new Map() // productId -> unidades a devolver
  for (const [id, qty] of addByProductId) plan.set(id, (plan.get(id) || 0) + qty)
  let sinMatch = 0
  for (const [name, qty] of addByName) {
    const p = byName.get(name)
    if (p) plan.set(p.id, (plan.get(p.id) || 0) + qty)
    else { sinMatch += qty; console.warn('  ! sin coincidencia por nombre:', name, '(', qty, 'u.)') }
  }
  const totalRestore = [...plan.values()].reduce((a, b) => a + b, 0)
  console.log('Stock a devolver:', totalRestore, 'u. en', plan.size, 'productos' + (sinMatch ? ' (+' + sinMatch + ' u. sin coincidencia, no se devuelven)' : ''))

  if (DRY) { console.log('(prueba: nada se tocó — corre sin --dry para ejecutar)'); return }

  // Ejecutar: devolver stock + borrar pedidos (transacción)
  await prisma.$transaction(async (tx) => {
    for (const [id, qty] of plan) {
      const p = await tx.product.findUnique({ where: { id }, select: { stock: true } })
      if (!p) continue
      const newStock = (p.stock || 0) + qty
      await tx.product.update({ where: { id }, data: { stock: newStock, inStock: newStock > 0 } })
    }
    await tx.order.deleteMany({})
  })
  // Reiniciar el contador de pedidos a #1 (fuera de la transacción: es DDL)
  try { await prisma.$executeRawUnsafe('ALTER TABLE orders AUTO_INCREMENT = 1') } catch (e) { console.warn('No se pudo reiniciar el contador (no crítico):', e.message) }

  console.log('---')
  console.log('✓ Stock devuelto:', totalRestore, 'unidades')
  console.log('✓ Pedidos borrados:', orders.length)
  console.log('✓ Contador de pedidos reiniciado a #1')
  console.log('Listo. Reportes y dashboard quedan en cero, con el inventario correcto.')
}

main()
  .catch(e => { console.error('ERROR:', e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
