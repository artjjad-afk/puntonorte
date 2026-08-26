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
    <div className="catalogo-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600&display=swap');
        .catalogo-root{
          --serif:'Playfair Display', Georgia, 'Times New Roman', serif;
          --sans:'Manrope', system-ui, -apple-system, Arial, sans-serif;
          --ink:#211f1e; --muted:#8a8683; --line:#e8e5e2; --copper:#c1692b; --copper2:#e88c4a; --paper:#faf8f6;
          font-family:var(--sans); color:var(--ink); background:var(--paper);
        }
        /* ── Portada ── */
        .cov{position:relative;overflow:hidden;background:radial-gradient(circle at 50% 30%, #322d2a 0%, #1c1a18 55%, #141210 100%);color:#f6f1ea;text-align:center;padding:90px 28px 84px;}
        .cov__glow{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:640px;height:640px;border-radius:50%;background:radial-gradient(circle,rgba(232,140,74,.22),transparent 62%);pointer-events:none;}
        .cov__kicker{position:relative;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:var(--copper2);font-weight:700;margin:0 0 22px;}
        .cov__logo{position:relative;height:86px;width:auto;object-fit:contain;margin:0 auto 22px;display:block;filter:drop-shadow(0 6px 22px rgba(232,140,74,.35));}
        .cov__title{position:relative;font-family:var(--serif);font-weight:800;font-size:clamp(52px,9vw,88px);line-height:.95;letter-spacing:-1px;margin:0;}
        .cov__title em{font-style:italic;color:var(--copper2);}
        .cov__sub{position:relative;font-size:12px;letter-spacing:5px;text-transform:uppercase;color:rgba(246,241,234,.65);margin:20px 0 0;font-weight:600;}
        .cov__tag{position:relative;max-width:520px;margin:22px auto 0;font-size:15px;line-height:1.6;color:rgba(246,241,234,.78);}
        .cov__rule{position:relative;width:64px;height:2px;margin:30px auto 0;background:linear-gradient(90deg,transparent,var(--copper2),transparent);}
        .cov__chips{position:relative;display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:30px auto 0;}
        .cov__chip{font-size:12px;font-weight:600;color:rgba(246,241,234,.9);border:1px solid rgba(232,140,74,.35);border-radius:40px;padding:8px 16px;background:rgba(255,255,255,.04);}
        /* ── Contenido ── */
        .cat-wrap{max-width:1060px;margin:0 auto;padding:64px 28px 80px;}
        .cat-state{text-align:center;color:var(--muted);padding:80px 0;font-size:15px;}
        .cat-sec{margin-top:56px;}
        .cat-sec:first-of-type{margin-top:0;}
        .cat-head{display:flex;align-items:flex-end;gap:16px;margin:0 0 26px;}
        .cat-idx{font-family:var(--serif);font-weight:800;font-size:44px;line-height:.8;color:transparent;-webkit-text-stroke:1.4px rgba(193,105,43,.5);letter-spacing:-1px;}
        .cat-name{font-family:var(--serif);font-weight:700;font-size:30px;line-height:1;letter-spacing:-.5px;margin:0;}
        .cat-count{font-size:12px;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase;}
        .cat-hr{flex:1;height:1px;background:var(--line);margin-bottom:6px;}
        .cat-grid{display:flex;flex-wrap:wrap;gap:22px;}
        .cat-card{flex:1 1 230px;max-width:270px;min-width:0;background:#fff;border-radius:16px;overflow:hidden;border:1px solid var(--line);box-shadow:0 10px 30px rgba(33,31,30,.06);display:flex;flex-direction:column;}
        .cat-imgbox{position:relative;aspect-ratio:4/5;background:#f1eeeb;}
        .cat-imgbox img{width:100%;height:100%;object-fit:cover;display:block;}
        .cat-noimg{display:flex;align-items:center;justify-content:center;height:100%;color:#c9c5c2;font-size:12px;letter-spacing:1px;}
        .cat-disc{position:absolute;top:12px;left:12px;background:linear-gradient(135deg,var(--copper),var(--copper2));color:#fff;font-size:11px;font-weight:800;letter-spacing:.5px;padding:5px 11px;border-radius:40px;box-shadow:0 4px 12px rgba(193,105,43,.35);}
        .cat-out{position:absolute;top:12px;right:12px;background:rgba(33,31,30,.9);color:#fff;font-size:10px;font-weight:700;letter-spacing:.5px;padding:5px 10px;border-radius:40px;}
        .cat-body{padding:16px 16px 18px;display:flex;flex-direction:column;gap:8px;flex:1;}
        .cat-kick{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);}
        .cat-pname{font-family:var(--serif);font-weight:600;font-size:18px;line-height:1.25;margin:0;flex:1;}
        .cat-price{display:flex;align-items:baseline;gap:9px;}
        .cat-now{font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-.5px;}
        .cat-old{font-size:14px;color:var(--muted);text-decoration:line-through;}
        /* ── Pie ── */
        .cat-foot{margin-top:70px;text-align:center;padding:44px 28px;background:radial-gradient(circle at 50% 0%, #322d2a, #1c1a18);color:#f6f1ea;border-radius:22px;}
        .cat-foot h3{font-family:var(--serif);font-size:28px;font-weight:700;margin:0 0 8px;}
        .cat-foot p{margin:4px 0;font-size:14px;color:rgba(246,241,234,.8);}
        .cat-foot .cat-foot__cta{display:inline-block;margin-top:16px;background:linear-gradient(135deg,var(--copper),var(--copper2));color:#fff;font-weight:800;font-size:14px;padding:13px 28px;border-radius:12px;text-decoration:none;}
        @media(max-width:520px){ .cat-card{flex:1 1 150px;} .cat-name{font-size:24px;} .cat-idx{font-size:34px;} }
        @media print{ .cov{break-after:page;} .cat-card{flex:0 0 30%;} }
      `}</style>

      {/* Aviso mientras se prepara la descarga automática (no se imprime) */}
      {preparando && (
        <div
          className="no-print"
          style={{
            position: 'fixed', inset: 0, zIndex: 50, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
            background: 'rgba(28,26,24,.92)', color: '#fff',
          }}
        >
          <div style={{ width: '46px', height: '46px', borderRadius: '50%', border: '3px solid rgba(232,140,74,.25)', borderTopColor: '#e88c4a', animation: 'pn-loader-spin .8s linear infinite' }} />
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
          padding: '14px 20px', background: '#1c1a18', borderBottom: '1px solid rgba(232,140,74,.2)',
        }}
      >
        <Link href="/" style={{ color: '#f6f1ea', textDecoration: 'none', fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          ← Volver a la tienda
        </Link>
        <button
          onClick={() => window.print()}
          style={{
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#c1692b,#e88c4a)',
            color: '#fff', fontWeight: 800, fontSize: '14px',
            padding: '12px 26px', borderRadius: '12px',
            boxShadow: '0 6px 18px rgba(193,105,43,.4)',
          }}
        >
          ⬇  Descargar catálogo (PDF)
        </button>
      </div>

      {/* ── Portada ── */}
      <header className="cov">
        <div className="cov__glow" />
        <p className="cov__kicker">Est. Venezuela · Moda Premium</p>
        <img className="cov__logo" src="/logo-removebg-preview.png" alt="Punto Norte" />
        <h1 className="cov__title">Catá<em>logo</em></h1>
        <p className="cov__sub">Colección 2025 — 2026</p>
        <p className="cov__tag">Moda, accesorios y perfumes de calidad premium. Piezas únicas que cuentan tu historia, con envíos a toda Venezuela.</p>
        <div className="cov__rule" />
        <div className="cov__chips">
          <span className="cov__chip">📍 {CONTACT.ciudad}</span>
          <span className="cov__chip">💬 WhatsApp +{CONTACT.whatsapp}</span>
          <span className="cov__chip">📸 @{CONTACT.instagram}</span>
        </div>
      </header>

      {/* ── Contenido imprimible ── */}
      <div className="cat-wrap">
        {products === null && <p className="cat-state">Cargando catálogo…</p>}
        {products !== null && products.length === 0 && <p className="cat-state">No hay productos disponibles por ahora.</p>}

        {categorias.map((cat, ci) => (
          <section key={cat} className="cat-sec">
            <div className="cat-head">
              <span className="cat-idx">{String(ci + 1).padStart(2, '0')}</span>
              <h2 className="cat-name">{catLabel(cat)}</h2>
              <span className="cat-hr" />
              <span className="cat-count">{groups[cat].length} {groups[cat].length === 1 ? 'pieza' : 'piezas'}</span>
            </div>

            <div className="cat-grid">
              {groups[cat].map(p => {
                const img = p.images?.[0] ?? null
                const disc = p.originalPrice && p.originalPrice > p.price
                  ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                  : 0
                return (
                  <article key={p.id} className="cat-card">
                    <div className="cat-imgbox">
                      {img
                        ? <img src={img} alt={p.name} />
                        : <div className="cat-noimg">Sin imagen</div>}
                      {disc > 0 && <span className="cat-disc">−{disc}%</span>}
                      {!p.inStock && <span className="cat-out">Agotado</span>}
                    </div>
                    <div className="cat-body">
                      <span className="cat-kick">{catLabel(p.category)}</span>
                      <p className="cat-pname">{p.name}</p>
                      <div className="cat-price">
                        <span className="cat-now">${p.price.toFixed(2)}</span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="cat-old">${p.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}

        {products !== null && products.length > 0 && (
          <footer className="cat-foot">
            <h3>¿Listo para pedir?</h3>
            <p>Escríbenos y te atendemos al instante.</p>
            <p>WhatsApp +{CONTACT.whatsapp} · @{CONTACT.instagram}</p>
            <a className="cat-foot__cta no-print" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">Pedir por WhatsApp →</a>
            <p style={{ marginTop: '18px', fontSize: '12px', color: 'rgba(246,241,234,.5)' }}>puntonorteshop.com · Actualizado el {fecha}</p>
          </footer>
        )}
      </div>
    </div>
  )
}
