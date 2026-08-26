'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type CatProduct = {
  id: number
  name: string
  slug: string
  price: number
  originalPrice: number | null
  category: string
  images: string[]
  badge: string | null
  inStock: boolean
}

const CONTACT = {
  whatsapp: '584140906768',
  instagram: 'puntonorte.shop',
  ciudad: 'Barcelona, Anzoátegui — Venezuela',
}

// Título bonito por categoría (fallback: la categoría capitalizada)
function catLabel(cat: string) {
  return cat
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<CatProduct[] | null>(null)
  const [preparando, setPreparando] = useState(false)
  const printedRef = useRef(false)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((d: unknown) => setProducts(Array.isArray(d) ? (d as CatProduct[]) : []))
      .catch(() => setProducts([]))
  }, [])

  // Descarga automática: si se llega con ?auto=1, esperamos a que carguen
  // las imágenes y abrimos el diálogo de guardar PDF (una sola vez).
  useEffect(() => {
    if (!products || products.length === 0 || printedRef.current) return
    if (new URLSearchParams(window.location.search).get('auto') !== '1') return

    setPreparando(true)
    const doPrint = () => {
      if (printedRef.current) return
      printedRef.current = true
      setPreparando(false)
      window.print()
    }

    // Esperar a que todas las imágenes del catálogo terminen de cargar
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('.catalogo-root img'))
    const pendientes = imgs.filter(i => !i.complete)
    let restantes = pendientes.length
    const marcar = () => { if (--restantes <= 0) doPrint() }
    pendientes.forEach(i => { i.addEventListener('load', marcar); i.addEventListener('error', marcar) })

    const tImmediate = pendientes.length === 0 ? window.setTimeout(doPrint, 400) : undefined
    const tCap = window.setTimeout(doPrint, 5000) // tope de seguridad

    return () => { if (tImmediate) clearTimeout(tImmediate); clearTimeout(tCap) }
  }, [products])

  // Agrupar por categoría
  const groups: Record<string, CatProduct[]> = {}
  for (const p of products ?? []) {
    (groups[p.category] ||= []).push(p)
  }
  const categorias = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'es'))

  const fecha = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="catalogo-root" style={{ minHeight: '100vh', background: '#f4f2f0', color: '#211f1e' }}>
      {/* Aviso mientras se prepara la descarga automática (no se imprime) */}
      {preparando && (
        <div
          className="no-print"
          style={{
            position: 'fixed', inset: 0, zIndex: 50, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
            background: 'rgba(33,31,30,.88)', color: '#fff',
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '3px solid rgba(232,140,74,.25)', borderTopColor: '#e88c4a', animation: 'pn-loader-spin .8s linear infinite' }} />
          <p style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}>Preparando tu catálogo…</p>
        </div>
      )}

      {/* ── Barra de acciones (no se imprime) ── */}
      <div
        className="no-print"
        style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', flexWrap: 'wrap',
          padding: '14px 20px', background: '#211f1e',
        }}
      >
        <Link href="/" style={{ color: '#f9f7f5', textDecoration: 'none', fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          ← Volver a la tienda
        </Link>
        <button
          onClick={() => window.print()}
          style={{
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#c1692b,#e88c4a)',
            color: '#fff', fontWeight: 900, fontSize: '14px',
            padding: '12px 26px', borderRadius: '12px',
            boxShadow: '0 6px 18px rgba(193,105,43,.4)',
          }}
        >
          ⬇  Descargar catálogo (PDF)
        </button>
      </div>

      {/* ── Contenido imprimible ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 28px 80px' }}>

        {/* Portada / encabezado */}
        <header style={{ textAlign: 'center', marginBottom: '10px' }}>
          <img src="/logo.png" alt="Punto Norte" style={{ height: '78px', width: 'auto', objectFit: 'contain', margin: '0 auto 14px' }} />
          <h1 style={{ fontSize: '34px', fontWeight: 900, letterSpacing: '-.5px', margin: '0 0 6px' }}>
            Catálogo <span style={{ color: '#c1692b' }}>Punto Norte</span>
          </h1>
          <p style={{ color: '#7a7675', fontSize: '14px', margin: 0 }}>
            Moda, accesorios y perfumes premium · {CONTACT.ciudad}
          </p>
          <p style={{ color: '#7a7675', fontSize: '13px', margin: '4px 0 0' }}>
            WhatsApp: +{CONTACT.whatsapp} · Instagram: @{CONTACT.instagram}
          </p>
          <p style={{ color: '#a8a4a2', fontSize: '12px', margin: '8px 0 0' }}>Actualizado el {fecha}</p>
          <div style={{ height: '3px', width: '90px', margin: '20px auto 0', borderRadius: '2px', background: 'linear-gradient(90deg,#c1692b,#e88c4a)' }} />
        </header>

        {/* Estados */}
        {products === null && (
          <p style={{ textAlign: 'center', color: '#7a7675', padding: '60px 0' }}>Cargando catálogo…</p>
        )}
        {products !== null && products.length === 0 && (
          <p style={{ textAlign: 'center', color: '#7a7675', padding: '60px 0' }}>No hay productos disponibles por ahora.</p>
        )}

        {/* Secciones por categoría */}
        {categorias.map(cat => (
          <section key={cat} className="cat-section" style={{ marginTop: '40px' }}>
            <h2
              className="cat-section-title"
              style={{
                fontSize: '13px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase',
                color: '#c1692b', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <span style={{ width: '22px', height: '2px', background: '#c1692b', borderRadius: '1px' }} />
              {catLabel(cat)}
              <span style={{ color: '#a8a4a2', fontWeight: 700 }}>({groups[cat].length})</span>
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '18px',
              }}
            >
              {groups[cat].map(p => {
                const img = p.images?.[0] ?? null
                const disc = p.originalPrice && p.originalPrice > p.price
                  ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                  : 0
                return (
                  <div
                    key={p.id}
                    className="cat-card"
                    style={{
                      background: '#fff', borderRadius: '12px', overflow: 'hidden',
                      border: '1px solid #e8e5e2', boxShadow: '0 1px 8px rgba(33,31,30,.05)',
                    }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '3/4', background: '#f4f2f0' }}>
                      {img
                        ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#c9c5c2', fontSize: '12px' }}>Sin imagen</div>}
                      {disc > 0 && (
                        <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#c1692b', color: '#fff', fontSize: '11px', fontWeight: 900, padding: '4px 8px', borderRadius: '20px' }}>
                          -{disc}%
                        </span>
                      )}
                      {!p.inStock && (
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#211f1e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '20px' }}>
                          Agotado
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px 14px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', lineHeight: 1.25 }}>{p.name}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#c1692b' }}>${p.price.toFixed(2)}</span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span style={{ fontSize: '13px', color: '#a8a4a2', textDecoration: 'line-through' }}>${p.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* Pie */}
        {products !== null && products.length > 0 && (
          <footer style={{ marginTop: '50px', paddingTop: '24px', borderTop: '1px solid #e8e5e2', textAlign: 'center', color: '#7a7675', fontSize: '13px' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#211f1e' }}>¿Listo para pedir?</p>
            <p style={{ margin: 0 }}>Escríbenos por WhatsApp al +{CONTACT.whatsapp} · @{CONTACT.instagram}</p>
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#a8a4a2' }}>puntonorteshop.com</p>
          </footer>
        )}
      </div>
    </div>
  )
}
