/**
 * Migración: imágenes en base64 (dentro de la BD) → archivos en /uploads/images.
 *
 * Convierte las imágenes existentes de productos, categorías y banners que
 * están guardadas como base64 y las pasa a archivos, dejando en la BD solo la
 * URL. Así el catálogo baja de decenas de MB a unos KB.
 *
 * SEGURO:
 *  - Hace un RESPALDO completo antes de tocar nada (backups/).
 *  - IDEMPOTENTE: salta lo que ya es URL, se puede correr varias veces.
 *  - Si una imagen no se puede decodificar, la CONSERVA (no se pierde nada).
 *
 * Uso (en el servidor, dentro de /var/www/puntonorte):
 *   node scripts/migrate-images-to-files.js --dry   # muestra qué haría, sin escribir
 *   node scripts/migrate-images-to-files.js         # ejecuta la migración real
 */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const prisma = new PrismaClient()
const DRY = process.argv.includes('--dry')
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'images')
const BACKUP_DIR = path.join(process.cwd(), 'backups')

const EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/svg+xml': 'svg' }

const isB64 = (s) => typeof s === 'string' && s.startsWith('data:image/') && s.includes(';base64,')

function saveB64(dataUrl) {
  const m = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i)
  if (!m) return null
  const ext = EXT[m[1].toLowerCase()] || 'jpg'
  const buf = Buffer.from(m[2], 'base64')
  if (!buf.length) return null
  const name = crypto.randomUUID() + '.' + ext
  if (!DRY) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf)
  }
  return { url: '/uploads/images/' + name, bytes: buf.length }
}

async function main() {
  console.log(DRY ? '=== MODO PRUEBA (dry run) — no escribe nada ===' : '=== MIGRACIÓN REAL ===')

  const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } })
  const categories = await prisma.category.findMany({ select: { id: true, name: true, image: true, imageData: true } })
  const banners = await prisma.banner.findMany({ select: { id: true, titulo: true, imagen: true, imageData: true } })

  // ── Respaldo ──
  if (!DRY) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
    const bk = path.join(BACKUP_DIR, 'images-backup-' + Date.now() + '.json')
    fs.writeFileSync(bk, JSON.stringify({ products, categories, banners }))
    console.log('Respaldo:', bk, '(' + (fs.statSync(bk).size / 1048576).toFixed(1) + ' MB)')
  }

  let prod = 0, cat = 0, ban = 0, files = 0, freed = 0, kept = 0

  // ── Productos ──
  for (const p of products) {
    let imgs
    try { imgs = JSON.parse(p.images || '[]') } catch { imgs = [] }
    let changed = false
    const out = []
    for (const img of imgs) {
      if (isB64(img)) {
        const r = saveB64(img)
        if (r) { out.push(r.url); changed = true; files++; freed += img.length }
        else { out.push(img); kept++; console.warn('  ! no se pudo convertir una imagen de producto #' + p.id) }
      } else out.push(img)
    }
    if (changed) {
      if (!DRY) await prisma.product.update({ where: { id: p.id }, data: { images: JSON.stringify(out) } })
      prod++
    }
  }

  // ── Categorías (imageData -> image, imageData null) ──
  for (const c of categories) {
    if (isB64(c.imageData)) {
      const r = saveB64(c.imageData)
      if (r) {
        if (!DRY) await prisma.category.update({ where: { id: c.id }, data: { image: r.url, imageData: null } })
        cat++; files++; freed += c.imageData.length
      } else kept++
    }
  }

  // ── Banners (imageData -> imagen, imageData null) ──
  for (const b of banners) {
    if (isB64(b.imageData)) {
      const r = saveB64(b.imageData)
      if (r) {
        if (!DRY) await prisma.banner.update({ where: { id: b.id }, data: { imagen: r.url, imageData: null } })
        ban++; files++; freed += b.imageData.length
      } else kept++
    }
  }

  console.log('---')
  console.log('Productos migrados: ', prod, '/', products.length)
  console.log('Categorías migradas:', cat, '/', categories.length)
  console.log('Banners migrados:   ', ban, '/', banners.length)
  console.log('Archivos creados:   ', files)
  console.log('Base64 liberado:    ', (freed / 1048576).toFixed(1), 'MB')
  if (kept) console.log('Conservadas sin convertir (revisar):', kept)
  console.log(DRY ? '(prueba: nada se guardó — corre sin --dry para ejecutar)' : '✓ Migración completa')
}

main()
  .catch(e => { console.error('ERROR:', e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
