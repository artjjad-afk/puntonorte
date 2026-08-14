import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'

const URL = 'https://catalogo.treinta.co/puntonorte-catalogoonline'

console.log('🚀 Abriendo navegador...')
const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
})

const page = await browser.newPage()
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36')
await page.setViewport({ width: 1400, height: 900 })

console.log('📡 Cargando catálogo...')
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise(r => setTimeout(r, 4000))

// Extraer todas las categorías disponibles
console.log('📂 Extrayendo categorías...')
const categories = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button, [role="tab"], [class*="category"], [class*="Category"], [class*="filter"], [class*="tab"]'))
  return btns
    .map(b => ({ text: b.textContent?.trim(), tag: b.tagName }))
    .filter(b => b.text && b.text.length > 2 && b.text.length < 50)
})
console.log('\n📂 CATEGORÍAS ENCONTRADAS:')
categories.forEach((c, i) => console.log(`  ${i}: [${c.tag}] ${c.text}`))

// Función para extraer productos de la página actual
const extractProducts = async () => {
  // Scroll para cargar lazy images
  await page.evaluate(async () => {
    for (let i = 0; i < 10; i++) {
      window.scrollBy(0, 600)
      await new Promise(r => setTimeout(r, 300))
    }
    window.scrollTo(0, 0)
  })
  await new Promise(r => setTimeout(r, 2000))

  return page.evaluate(() => {
    const items = []
    const seen = new Set()
    const allImgs = Array.from(document.querySelectorAll('img'))

    allImgs.forEach(img => {
      const src = img.src || img.dataset?.src || ''
      if (!src.includes('treinta') && !src.includes('amazonaws')) return

      let container = img.parentElement
      for (let i = 0; i < 8; i++) {
        if (!container) break
        const text = (container.innerText || '').trim()
        const priceMatch = text.match(/\$\s*([\d,.]+)/)
        if (priceMatch && text.length > 3 && text.length < 800) {
          const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 2 && !l.startsWith('$') && !l.match(/^\d+$/))
          const name = lines[0] || ''
          const price = priceMatch[1].replace(',', '')
          const key = name + price
          if (name && price && !seen.has(key) && name.length < 80) {
            seen.add(key)
            // Extraer descripción (líneas después del nombre)
            const desc = lines.slice(1).filter(l => !l.match(/^\$[\d.]+$/)).join(' ').slice(0, 200)
            items.push({ name, price: parseFloat(price), image: src, description: desc })
          }
          break
        }
        container = container.parentElement
      }
    })
    return items
  })
}

// Extraer todos los productos haciendo click en cada categoría
const allProducts = {}

// Primero extraer "Ver todos"
console.log('\n🔍 Extrayendo: Ver todos...')
const allItems = await extractProducts()
console.log(`   → ${allItems.length} productos`)

// Click en cada categoría
const catButtons = await page.$$('button')
const catTexts = []
for (const btn of catButtons) {
  const text = await btn.evaluate(el => el.textContent?.trim())
  if (text && text.length > 2 && text.length < 60 && text !== 'Ver todos' && !text.includes('Ordenar')) {
    catTexts.push({ btn, text })
  }
}

console.log(`\n📂 ${catTexts.length} categorías a procesar`)

for (const { btn, text } of catTexts) {
  try {
    console.log(`\n🔍 Extrayendo: ${text}...`)
    await btn.click()
    await new Promise(r => setTimeout(r, 3000))
    const items = await extractProducts()
    console.log(`   → ${items.length} productos`)
    if (items.length > 0) allProducts[text] = items
  } catch (e) {
    console.log(`   ⚠️ Error: ${e.message}`)
  }
}

// Merge todos los productos sin duplicados
const merged = {}
const addProducts = (items, cat) => {
  items.forEach(p => {
    const key = p.name.toLowerCase().trim()
    if (!merged[key]) merged[key] = { ...p, categories: [cat] }
    else if (!merged[key].categories.includes(cat)) merged[key].categories.push(cat)
  })
}

addProducts(allItems, 'Ver todos')
Object.entries(allProducts).forEach(([cat, items]) => addProducts(items, cat))

const final = Object.values(merged)
console.log(`\n✅ TOTAL: ${final.length} productos únicos\n`)

final.forEach((p, i) => {
  console.log(`--- ${i + 1}. ${p.name} — $${p.price} — [${p.categories.join(', ')}]`)
})

writeFileSync('./scripts/productos-scraped.json', JSON.stringify(final, null, 2))
console.log('\n💾 Guardado en scripts/productos-scraped.json')

await browser.close()
console.log('✅ Listo')
