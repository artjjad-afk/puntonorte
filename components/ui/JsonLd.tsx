import { Product } from '@/types'

const BASE = 'https://puntonorteshop.com'

/* ── Producto individual ── */
export function ProductJsonLd({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: `PN-${product.id}`,
    brand: { '@type': 'Brand', name: 'Punto Norte' },
    offers: {
      '@type': 'Offer',
      url: `${BASE}/tienda/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Punto Norte' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', currency: 'USD' },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'VE',
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/* ── Breadcrumb para página de producto ── */
export function BreadcrumbJsonLd({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio',  item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Tienda',  item: `${BASE}/tienda` },
      { '@type': 'ListItem', position: 3, name: product.category, item: `${BASE}/tienda?cat=${product.category}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${BASE}/tienda/${product.slug}` },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/* ── Tienda principal ── */
export function StoreJsonLd() {
  const store = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Punto Norte',
    alternateName: 'Punto Norte Shop',
    description: 'Tienda online de ropa, accesorios, perfumes y cargadores. Moda dama y caballero con calidad premium. Envíos a toda Venezuela.',
    url: BASE,
    logo: `${BASE}/logo.png`,
    image: `${BASE}/og-image.jpg`,
    telephone: '+584140906768',
    email: 'puntonorte@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Barcelona',
      addressRegion: 'Anzoátegui',
      addressCountry: 'VE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '10.1167',
      longitude: '-64.6833',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    sameAs: [
      'https://www.instagram.com/puntonorte.shop',
      'https://wa.me/584140906768',
    ],
    priceRange: '$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash, Zelle, Pago Móvil',
    hasMap: 'https://maps.google.com/?q=Barcelona,+Anzoátegui,+Venezuela',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
    },
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Punto Norte',
    url: BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/tienda?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(store) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  )
}

/* ── FAQ Page ── */
export function FaqJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Hacen envíos a toda Venezuela?',
        acceptedAnswer: { '@type': 'Answer', text: 'Sí, enviamos a todo el país a través de empresas como MRW y Zoom desde Barcelona, Anzoátegui.' },
      },
      {
        '@type': 'Question',
        name: '¿Cómo puedo pagar?',
        acceptedAnswer: { '@type': 'Answer', text: 'Aceptamos pago en dólares (efectivo o Zelle), y Pago Móvil en bolívares.' },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto tarda en llegar mi pedido?',
        acceptedAnswer: { '@type': 'Answer', text: 'Los pedidos se procesan en 24-48 horas. El tiempo de entrega depende de la empresa de encomiendas y la ciudad destino, generalmente entre 2 y 5 días hábiles.' },
      },
      {
        '@type': 'Question',
        name: '¿Puedo hacer cambios o devoluciones?',
        acceptedAnswer: { '@type': 'Answer', text: 'Sí, aceptamos cambios dentro de los 7 días siguientes a la recepción del producto, siempre que esté en perfectas condiciones y sin uso.' },
      },
      {
        '@type': 'Question',
        name: '¿Cómo hago un pedido?',
        acceptedAnswer: { '@type': 'Answer', text: 'Puedes agregar productos al carrito y proceder al checkout, o contactarnos directamente por WhatsApp al +58 414-090-6768.' },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
