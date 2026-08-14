import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

const products = [
  { name: '2 en 1 Labial SHEGLAM', price: 12, category: 'maquillaje', badge: 'Nuevo', featured: false, description: '2-in-1 Lip Set (Liner & Gloss). El dúo dinámico que tus labios necesitan. Delineador y gloss en un solo producto para un look perfecto todo el día.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F7d881df9-9c31-5aa8-902c-e34b5f080d8b.jpeg'] },
  { name: '3 Piezas Blanco', price: 35, category: 'dama', badge: 'Nuevo', featured: true, description: 'Conjunto de 3 piezas en color blanco. Elegante y versátil, perfecto para cualquier ocasión. Tela de alta calidad y corte favorecedor.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F26ea7308-f84b-5d9c-bf8a-658f03d36c2d.jpeg'] },
  { name: '9 PM 3.4 Oz EDP Men', price: 50, category: 'perfumes', badge: 'Premium', featured: true, description: 'Fragancia masculina intensa y seductora para la noche. Notas amaderadas y especiadas de larga duración. 3.4 oz Eau de Parfum.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2Fa518207f-2d36-57f3-bb62-b9c920f37cf4.jpeg'] },
  { name: '9 PM Rebel 3.4 Oz EDP Unisex', price: 55, category: 'perfumes', badge: 'Premium', featured: true, description: 'Fragancia audaz y contemporánea para él y para ella. Rebelde, única y sofisticada. 3.4 oz Eau de Parfum.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2Fd5dc2ab0-3a23-5bd1-9d3e-01958889b8dd.jpeg'] },
  { name: 'Afnan 9 AM Dive Unisex 3.4 Oz EDP', price: 50, category: 'perfumes', badge: 'Premium', featured: false, description: 'Fragancia fresca y acuática para el día. Ideal para cualquier ocasión. 3.4 oz Eau de Parfum unisex.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2Fcae1a9c8-c70b-58e8-8790-2a37d6f1211a.jpeg'] },
  { name: 'Alfombrilla Limpia Brochas', price: 5, category: 'maquillaje', badge: null, featured: false, description: 'Alfombrilla texturizada para limpiar tus brochas de maquillaje de forma eficiente. Elimina residuos con facilidad.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2Fbbc5a1ac-948c-5902-85fa-61b99eee898d.jpeg'] },
  { name: 'Almohadilla Skincare', price: 5, category: 'maquillaje', badge: 'Nuevo', featured: false, description: 'Almohadillas reutilizables de skincare. Dile adiós a los discos desechables. Suaves, ecológicas y lavables.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F323815a1-cfe3-5241-844e-8a7d4d62160b.jpeg'] },
  { name: 'Amber Oud Gold Edition 4.0 Oz EDP Men', price: 70, category: 'perfumes', badge: 'Premium', featured: true, description: 'Fragancia lujosa con notas de oud, ámbar y especias orientales. El perfume de los que destacan. 4.0 oz Eau de Parfum.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F97f398e7-0a1e-5193-8077-8b1d25271cae.jpeg'] },
  { name: 'Argollas', price: 3, category: 'accesorios', badge: null, featured: false, description: 'Argollas elegantes para dama. Accesorio esencial que complementa cualquier look. Disponibles en varios diseños.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F50e11c7a-db5f-50f8-a969-3cbfd96ddc51.jpeg'] },
  { name: 'Blush SHEGLAM Jelly', price: 15, category: 'maquillaje', badge: 'Nuevo', featured: false, description: 'SHEGLAM Jelly Blush. Rubor de textura gelatinosa que aporta color natural y duradero. Fácil de difuminar.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F78a37500-f578-511c-9997-369f7da2fb19.jpeg'] },
  { name: 'Body Dama Talla M', price: 15, category: 'dama', badge: null, featured: false, sizes: ['M'], description: 'Body para dama en talla M. Diseño moderno y cómodo, ideal para usar solo o combinado.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F296ae807-3494-5c2d-8d56-571a12eba9b2.jpeg'] },
  { name: 'Body Dama Talla S', price: 15, category: 'dama', badge: null, featured: false, sizes: ['S'], description: 'Body para dama en talla S. Diseño moderno y cómodo, ideal para usar solo o combinado.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F7a40e103-a704-56b6-bdf4-db868ef5ad93.jpeg'] },
  { name: 'Cadena con Inicial', price: 7, category: 'accesorios', badge: 'Nuevo', featured: true, description: 'Cadena fina con inicial personalizada. El regalo perfecto o el accesorio que añade un toque único a tu look.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F6aed9951-bf78-5f40-af43-37d85765d956.jpeg'] },
  { name: 'Caja Portátil Joyería', price: 6, category: 'accesorios', badge: null, featured: false, description: 'Caja portátil para organizar y transportar tu joyería con seguridad. Compacta, elegante y práctica.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F77d89df9-23f8-5956-9314-2ef15115b2f9.jpeg'] },
  { name: 'Camisa Dama Medio Lado', price: 15, category: 'dama', badge: null, featured: true, description: 'Camisa de dama con diseño asimétrico. Estilo moderno y actual, perfecta para looks casuales o semi-formales.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F7921f3e6-6d2f-55e6-a083-684741e528a7.jpeg'] },
  { name: 'Camisa Polo Negra', price: 22, category: 'caballero', badge: null, featured: true, sizes: ['L', 'XL'], description: 'Camisa polo negra para caballero. Telas disponibles: L y XL. Piqué de alta calidad, fresca y elegante.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2Fd3e246ed-93f3-5ea6-a00a-f5b2a471cfef.jpeg'] },
  { name: 'Camisa Tirantes', price: 15, category: 'dama', badge: null, featured: false, description: 'Camisa de tirantes para dama. Ligera, fresca y versátil. Ideal para el calor venezolano.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F78bacd09-1105-5b67-a188-74c1306d0d34.jpeg'] },
  { name: 'Camiseta Gym', price: 15, category: 'gym', badge: null, featured: false, description: 'Camiseta deportiva para gym. Tela de secado rápido, ligera y cómoda. Perfecta para tus entrenamientos.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F07a87145-c1bc-507c-9c4a-e616403876f7.jpeg'] },
  { name: 'Camiseta Manga Larga', price: 15, category: 'dama', badge: null, featured: false, description: 'Camiseta de manga larga para dama. Tela suave y cómoda, perfecta para los días frescos.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F5c415e8b-d983-57f2-aaf4-a59a77b49d5c.jpeg'] },
  { name: 'Camiseta Roja Negra y Blanca', price: 12, category: 'dama', badge: 'Oferta', featured: false, description: 'Camiseta en colores rojo, negro y blanco. Diseño llamativo y moderno. Tela cómoda de uso diario.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F33eaffaa-8e51-5082-875f-df65fca8f0b8.jpeg'] },
  { name: 'Camisetas Blanca Marrón y Negra', price: 12, category: 'dama', badge: 'Oferta', featured: false, description: 'Pack de camisetas en colores blanco, marrón y negro. Básicos esenciales para cualquier guardarropa.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F75809e84-040c-5f41-82bf-a5b347431736.jpeg'] },
  { name: 'Cartera Coach Top Quality', price: 35, category: 'accesorios', badge: 'Premium', featured: true, colors: ['Negro', 'Beige'], description: 'Cartera Coach de top quality. Diseño funcional y espacioso para tu día a día. Acabados de primera.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F518a07ba-a36b-56cc-93eb-a60861cd80b7.jpeg'] },
  { name: 'Cartera Parchita Negra', price: 35, category: 'accesorios', badge: 'Premium', featured: false, colors: ['Negro'], description: 'Cartera Parchita en negro. Top quality, diseño moderno con estampado exclusivo. Espaciosa y versátil.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F9ce7d63d-4c7b-5b05-a3b5-6df9d84b8d1e.jpeg'] },
  { name: 'Cartera Parchita Roja', price: 35, category: 'accesorios', badge: 'Premium', featured: true, colors: ['Rojo'], description: 'Cartera Parchita en rojo. Top quality, diseño moderno con estampado exclusivo. Llamativa y espaciosa.', images: ['https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F91139245-4cd9-5bb9-bd9c-5f70cd40e5a1.jpeg'] },
]

const categories = [
  { name: 'Dama', slug: 'dama', image: 'https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F7921f3e6-6d2f-55e6-a083-684741e528a7.jpeg', order: 1 },
  { name: 'Caballero', slug: 'caballero', image: 'https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2Fd3e246ed-93f3-5ea6-a00a-f5b2a471cfef.jpeg', order: 2 },
  { name: 'Accesorios', slug: 'accesorios', image: 'https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F518a07ba-a36b-56cc-93eb-a60861cd80b7.jpeg', order: 3 },
  { name: 'Perfumes', slug: 'perfumes', image: 'https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2Fa518207f-2d36-57f3-bb62-b9c920f37cf4.jpeg', order: 4 },
  { name: 'Maquillaje', slug: 'maquillaje', image: 'https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F78a37500-f578-511c-9997-369f7da2fb19.jpeg', order: 5 },
  { name: 'Gym', slug: 'gym', image: 'https://imgproxy.treinta.co/sig/size:3840:::/quality:75/plain/https%3A%2F%2Fus-east-1-prod-treinta-assets-bucket.s3.amazonaws.com%2F07a87145-c1bc-507c-9c4a-e616403876f7.jpeg', order: 6 },
]

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpiar tablas
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  console.log('🗑️  Tablas limpiadas')

  // Insertar categorías
  for (const cat of categories) {
    await prisma.category.create({ data: cat })
  }
  console.log(`✅ ${categories.length} categorías insertadas`)

  // Insertar productos
  for (const p of products) {
    const slug = slugify(p.name)
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        price: p.price,
        originalPrice: null,
        category: p.category,
        description: p.description,
        images: JSON.stringify(p.images),
        sizes: p.sizes ? JSON.stringify(p.sizes) : null,
        colors: p.colors ? JSON.stringify(p.colors) : null,
        badge: p.badge || null,
        inStock: true,
        featured: p.featured,
        active: true,
      }
    })
    console.log(`  ✓ ${p.name}`)
  }

  console.log(`\n✅ ${products.length} productos insertados correctamente`)
  console.log('🎉 Seed completado!')
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
