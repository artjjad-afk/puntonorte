import { compressToBlob } from './imageCompress'

/**
 * Comprime la imagen en el navegador y la SUBE al servidor como archivo.
 * Devuelve la URL pública (/uploads/images/...) que se guarda en el producto,
 * en vez del base64 que se guardaba antes. Mantiene la BD liviana y hace que
 * el catálogo cargue rápido (el navegador baja solo las imágenes visibles).
 */
export async function uploadProductImage(file: File): Promise<string> {
  const { blob, ext } = await compressToBlob(file, { maxSize: 2000, quality: 0.85 })
  const fd = new FormData()
  fd.append('file', blob, `imagen.${ext}`)
  const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'No se pudo subir la imagen')
  return data.url as string
}
