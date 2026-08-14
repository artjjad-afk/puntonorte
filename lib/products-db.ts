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
  sizes: string[]
  colors: string[]
  badge: string | null
  inStock: boolean
  featured: boolean
  active: boolean
}

function parse(p: {
  id: number; name: string; slug: string; price: number;
  originalPrice: number | null; category: string; subcategory: string | null;
  description: string; images: string; sizes: string | null;
  colors: string | null; badge: string | null; inStock: boolean;
  featured: boolean; active: boolean;
}): ProductFromDB {
  return {
    ...p,
    images: JSON.parse(p.images || '[]'),
    sizes: p.sizes ? JSON.parse(p.sizes) : [],
    colors: p.colors ? JSON.parse(p.colors) : [],
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
