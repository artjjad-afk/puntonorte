/**
 * Comprime y redimensiona una imagen EN EL NAVEGADOR antes de subirla.
 *
 * Redimensiona al lado más largo indicado (por defecto 2000px, el tamaño que
 * recomienda Shopify para producto) y exporta en WebP con calidad ~85%
 * (JPEG de respaldo si el navegador no soporta WebP). Devuelve un data URL
 * base64 listo para guardar.
 *
 * Objetivo: el usuario sube la foto que sea (5-10MB del teléfono) y queda
 * típicamente en 200-400KB SIN pérdida visible, porque la pantalla nunca
 * muestra más resolución que esa. Así no se rechaza ninguna foto grande y la
 * base de datos se mantiene liviana.
 */
export interface CompressOptions {
  /** Lado más largo permitido, en píxeles. Nunca agranda la imagen. */
  maxSize?: number
  /** Calidad de compresión, 0..1. */
  quality?: number
  /** Formato de salida preferido. */
  mimeType?: 'image/webp' | 'image/jpeg'
}

export async function compressImage(
  file: File,
  { maxSize = 2000, quality = 0.85, mimeType = 'image/webp' }: CompressOptions = {},
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen')
  }

  // Los GIF (posiblemente animados) y los SVG (vectoriales) no pueden pasar por
  // canvas sin romperse o perder la animación: se devuelven tal cual.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return readAsDataURL(file)
  }

  const original = await readAsDataURL(file)
  const img = await loadImage(original)

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height)) // nunca agranda
  const targetW = Math.max(1, Math.round(img.width * scale))
  const targetH = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) return original // sin canvas disponible: devuelve el original

  // Fondo blanco por si la imagen tiene transparencia y termina exportada a JPEG.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetW, targetH)
  ctx.drawImage(img, 0, 0, targetW, targetH)

  // Exporta a WebP; si el navegador no lo soporta, cae automáticamente a JPEG.
  let out = canvas.toDataURL(mimeType, quality)
  if (mimeType === 'image/webp' && !out.startsWith('data:image/webp')) {
    out = canvas.toDataURL('image/jpeg', quality)
  }

  // Si el resultado quedó más pesado que el original (imágenes ya pequeñas y
  // optimizadas que no se redimensionaron), conserva el original.
  if (scale === 1 && out.length >= original.length) {
    return original
  }
  return out
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo procesar la imagen'))
    img.src = src
  })
}
