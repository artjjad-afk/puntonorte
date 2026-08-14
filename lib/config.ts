// ═══════════════════════════════════════════════
// CONFIGURACIÓN CENTRAL DE PUNTO NORTE
// Actualiza aquí y se refleja en toda la tienda
// ═══════════════════════════════════════════════

export const STORE_CONFIG = {
  name: 'Punto Norte',
  tagline: 'Moda & Estilo',
  description: 'Tienda online de ropa, accesorios, perfumes y más. Calidad premium al mejor precio.',

  // Contacto
  whatsapp: '584140906768',         // Número con código de país sin +
  whatsappDisplay: '0414-0906768',  // Número para mostrar en pantalla

  // Redes sociales
  instagram: 'https://www.instagram.com/puntonorte.shop?igsh=a2pxaDRteGd2NmJx',
  instagramHandle: '@puntonorte.shop',
  tiktok: 'https://tiktok.com/@puntonorte.shop',

  // Ubicación
  city: 'Barcelona',
  state: 'Anzoátegui',
  country: 'Venezuela',

  // Horario
  schedule: 'Lunes a Sábado · 9:00 AM – 7:00 PM',
}

// Helper para generar links de WhatsApp
export const waLink = (msg?: string) => {
  const base = `https://wa.me/${STORE_CONFIG.whatsapp}`
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base
}
