/**
 * Utilidades para los videos de un producto (guardados como enlaces).
 *
 * Se guardan en la columna `Product.videos` como JSON de URLs:
 *   ["https://youtu.be/abc123", "https://misitio.com/clip.mp4"]
 *
 * Soporta YouTube, Vimeo y enlaces directos a archivos de video.
 */
export type VideoKind = 'youtube' | 'vimeo' | 'file' | 'unknown'

export interface ParsedVideo {
  url: string          // enlace original
  kind: VideoKind
  embedUrl?: string    // para iframe (YouTube/Vimeo)
  fileUrl?: string     // para <video> (enlace directo)
  thumbnail?: string   // miniatura (solo YouTube)
}

const FILE_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i

/** Detecta el tipo de video y arma la info para reproducirlo. */
export function parseVideoUrl(raw: string): ParsedVideo {
  const url = String(raw || '').trim()
  if (!url) return { url, kind: 'unknown' }

  // YouTube: watch?v=, youtu.be/, /shorts/, /embed/
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (yt) {
    const id = yt[1]
    return {
      url, kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    }
  }

  // Vimeo: vimeo.com/123456789
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) {
    return { url, kind: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vm[1]}` }
  }

  // Enlace directo a archivo de video
  if (FILE_EXT.test(url)) {
    return { url, kind: 'file', fileUrl: url }
  }

  return { url, kind: 'unknown' }
}

/** true si el enlace se puede reproducir (YouTube/Vimeo/archivo reconocido). */
export function isPlayableVideo(url: string): boolean {
  return parseVideoUrl(url).kind !== 'unknown'
}

/**
 * Normaliza una lista de enlaces de video: solo http(s), recorta, deduplica y
 * limita la cantidad. Devuelve siempre un array de strings.
 */
export function normalizeVideos(input: unknown, max = 6): string[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of input) {
    const url = String(raw ?? '').trim()
    // Acepta enlaces http(s) o archivos subidos al servidor (/uploads/...)
    if (!/^(https?:\/\/|\/)/i.test(url)) continue
    if (seen.has(url)) continue
    seen.add(url)
    out.push(url)
    if (out.length >= max) break
  }
  return out
}

/** Parsea el JSON de la BD a un array de URLs (tolerante a null/errores). */
export function parseVideosJSON(json: string | null | undefined): string[] {
  if (!json) return []
  try {
    return normalizeVideos(JSON.parse(json))
  } catch {
    return []
  }
}
