/**
 * Utilidades para las subopciones (dropdown) de una categoría.
 *
 * Se guardan en la columna `Category.subcategories` como JSON:
 *   [{ "name": "Nike", "slug": "nike" }, ...]
 *
 * El slug es lo que viaja en la URL del catálogo (?sub=<slug>) y lo que se
 * guarda en `Product.subcategory` para poder filtrar.
 */
export interface Subcategory {
  name: string
  slug: string
}

/** Convierte un texto a slug URL-safe: "Nike Air" -> "nike-air". */
export function slugify(str: string): string {
  return String(str)
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-') // no alfanumérico -> guion
    .replace(/^-+|-+$/g, '')     // recorta guiones de los extremos
}

/**
 * Normaliza una lista de subopciones venida del cliente (o de la BD):
 * descarta vacías, genera slug si falta, elimina duplicados por slug y
 * limita la cantidad. Devuelve siempre un array válido.
 */
export function normalizeSubcategories(input: unknown, max = 20): Subcategory[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const out: Subcategory[] = []
  for (const raw of input) {
    const name = typeof raw === 'string'
      ? raw
      : (raw && typeof raw === 'object' && 'name' in raw ? String((raw as { name: unknown }).name) : '')
    const cleanName = name.trim().slice(0, 60)
    if (!cleanName) continue
    const slug = slugify(
      (raw && typeof raw === 'object' && 'slug' in raw && (raw as { slug?: unknown }).slug)
        ? String((raw as { slug: unknown }).slug)
        : cleanName,
    )
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    out.push({ name: cleanName, slug })
    if (out.length >= max) break
  }
  return out
}

/** Parsea el JSON guardado en la BD a un array de subopciones (tolerante a null/errores). */
export function parseSubcategories(json: string | null | undefined): Subcategory[] {
  if (!json) return []
  try {
    return normalizeSubcategories(JSON.parse(json))
  } catch {
    return []
  }
}
