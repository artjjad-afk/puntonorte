import { prisma } from '@/lib/db'

export type ProductFromDB = {
  id: number
  name: string
  slug: string
  price: number
  originalPrice: number | null
  category: string
  subcategory: string | null
  description: string
  images: string[]
  videos: string[]
  videoFirst: boolean
  sizes: string[]
  colors: string[]
  badge: string | null
  inStock: boolean
  featured: boolean
  active: boolean
}

function parse(p: {
  id: number; name: string; slug: string; price: number;
  originalPrice: number | null; cost: number | null; category: string; subcategory: string | null;
  description: string; images: string; videos: string | null; videoFirst: boolean; sizes: string | null;
  colors: string | null; badge: string | null; inStock: boolean;
  featured: boolean; active: boolean;
}): ProductFromDB {
  // El costo (precio de compra) es privado: se descarta y nunca llega a páginas públicas.
  const { cost: _cost, ...rest } = p
  void _cost
  return {
    ...rest,
    images: JSON.parse(rest.images || '[]'),
    videos: rest.videos ? JSON.parse(rest.videos) : [],
    sizes: rest.sizes ? JSON.parse(rest.sizes) : [],
    colors: rest.colors ? JSON.parse(rest.colors) : [],
  }
}

export async function getAllProducts(): Promise<ProductFromDB[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  })
  return products.map(parse)
}

export async function getFeaturedProducts(): Promise<ProductFromDB[]> {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: 'desc' },
  })
  return products.map(parse)
}

export async function getProductBySlug(slug: string): Promise<ProductFromDB | null> {
  const p = await prisma.product.findFirst({ where: { slug, active: true } })
  return p ? parse(p) : null
}

export async function getProductsByCategory(category: string): Promise<ProductFromDB[]> {
  const products = await prisma.product.findMany({
    where: { category, active: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  })
  return products.map(parse)
}

export async function getRelatedProducts(product: ProductFromDB): Promise<ProductFromDB[]> {
  const products = await prisma.product.findMany({
    where: { category: product.category, active: true, NOT: { id: product.id } },
    take: 4,
    orderBy: { featured: 'desc' },
  })
  return products.map(parse)
}

export async function getCategories() {
  const cats = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  })
  return cats
}
