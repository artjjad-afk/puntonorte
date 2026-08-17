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

/**
 * Convierte cualquier número venezolano al formato internacional para wa.me
 * Ejemplos:
 *   0414-090-6768  → 58414090678
 *   (0412) 123 4567 → 584121234567
 *   584140906768   → 584140906768 (ya correcto)
 *   4140906768     → 584140906768
 */
export function formatWAPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('58')) return digits
  if (digits.startsWith('0'))  return '58' + digits.slice(1)
  return '58' + digits
}
