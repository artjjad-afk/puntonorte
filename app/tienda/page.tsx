'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'motion/react'
import { ProductCard } from '@/components/ui/ProductCard'
import { FloatingShopIcons } from '@/components/ui/FloatingShopIcons'
import { SlidersHorizontal, X, Search, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/types'

function TiendaContent() {
  const searchParams = useSearchParams()
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || 'all')
  const [sortBy, setSortBy] = useState('featured')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [allCategories, setAllCategories] = useState([{ id: 'all', label: 'Todos' }])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllCategories([
            { id: 'all', label: 'Todos' },
            ...data.map((c: { slug: string; name: string }) => ({ id: c.slug, label: c.name }))
          ])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = selectedCat !== 'all' ? `/api/products?category=${selectedCat}` : '/api/products'
    fetch(url)
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [selectedCat])

  const filtered = useMemo(() => {
    let list = [...products]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price)
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    return list
  }, [products, sortBy, search])

  const currentLabel = allCategories.find(c => c.id === selectedCat)?.label || 'Tienda'

  const chipsRef = useRef<HTMLDivElement>(null)
  const scrollChips = (dir: number) => chipsRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })

  return (
    <>
      <style>{`
        /* ── Hero animado ── */
        .tienda-hero { position:relative; overflow:hidden; padding:72px 32px; background:linear-gradient(135deg,#1a1817 0%,#231f1d 45%,#2a2320 100%); }
        .tienda-hero::before { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(120deg, transparent 30%, rgba(232,140,74,.12), transparent 70%); background-size:220% 100%; animation:tienda-sheen 6s linear infinite; }
        @keyframes tienda-sheen { to { background-position:-220% 0; } }
        .tienda-hero__blob { position:absolute; border-radius:50%; filter:blur(12px); pointer-events:none; }
        .tienda-hero__blob--1 { width:420px; height:420px; top:-140px; left:-90px; background:radial-gradient(circle,rgba(232,140,74,.20),transparent 70%); animation:pn-halo 6s ease-in-out infinite; }
        .tienda-hero__blob--2 { width:380px; height:380px; bottom:-160px; right:8%; background:radial-gradient(circle,rgba(193,105,43,.15),transparent 70%); animation:pn-halo 5s ease-in-out infinite reverse; }

        /* ── Entrada escalonada de las cards ── */
        @keyframes tienda-card-in { from { opacity:0; transform:translateY(28px) scale(.97); } to { opacity:1; transform:none; } }
        .tienda-grid > * { animation:tienda-card-in .55s cubic-bezier(.22,1,.36,1) both; }
        .tienda-grid > *:nth-child(1){animation-delay:.04s}.tienda-grid > *:nth-child(2){animation-delay:.10s}
        .tienda-grid > *:nth-child(3){animation-delay:.16s}.tienda-grid > *:nth-child(4){animation-delay:.22s}
        .tienda-grid > *:nth-child(5){animation-delay:.28s}.tienda-grid > *:nth-child(6){animation-delay:.34s}
        .tienda-grid > *:nth-child(7){animation-delay:.40s}.tienda-grid > *:nth-child(8){animation-delay:.46s}
        .tienda-grid > *:nth-child(9){animation-delay:.52s}.tienda-grid > *:nth-child(10){animation-delay:.58s}
        .tienda-grid > *:nth-child(11){animation-delay:.64s}.tienda-grid > *:nth-child(12){animation-delay:.70s}
        @media (prefers-reduced-motion: reduce) { .tienda-grid > * { animation:none; } .tienda-hero::before { animation:none; } }

        .filter-chip { padding:9px 20px; border-radius:100px; border:1.5px solid #e8e5e2; background:#fff; cursor:pointer; font-size:13px; font-weight:600; color:#393738; transition:all .25s cubic-bezier(.34,1.56,.64,1); white-space:nowrap; flex-shrink:0; min-height:40px; }
        .filter-chip:hover { border-color:#c1692b; color:#c1692b; transform:translateY(-2px); }
        .filter-chip.active { background:linear-gradient(135deg,#c1692b,#e88c4a); border-color:transparent; color:#fff; box-shadow:0 8px 20px rgba(193,105,43,.38); transform:translateY(-1px); }
        .sort-select { padding:9px 16px; border-radius:10px; border:1.5px solid #e8e5e2; font-size:13px; font-weight:600; color:#393738; outline:none; cursor:pointer; background:#fff; min-height:40px; }
        .sort-select:focus { border-color:#c1692b; }
        .search-input { padding:10px 16px 10px 44px; border-radius:10px; border:1.5px solid #e8e5e2; font-size:14px; width:200px; outline:none; transition:border-color .2s; min-height:40px; }
        .search-input:focus { border-color:#c1692b; }
        .filters-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between; }
        .filters-chips-wrap { display:flex; align-items:center; gap:6px; flex-shrink:1; min-width:0; }
        .filters-chips { display:flex; gap:8px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding-bottom:2px; flex:1; min-width:0; scroll-behavior:smooth; }
        .filters-chips::-webkit-scrollbar { display:none; }
        .chips-arrow { flex-shrink:0; width:34px; height:40px; border-radius:10px; border:1.5px solid #e8e5e2; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#393738; transition:all .2s; padding:0; }
        .chips-arrow:hover { border-color:#c1692b; color:#c1692b; background:#fff7f3; }
        .chips-arrow:active { transform:scale(.92); }
        @media(min-width:769px){ .chips-arrow { display:none; } }
        .filters-right { display:flex; gap:10px; align-items:center; flex-shrink:0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:640px){
          .filters-bar { flex-direction:column; align-items:stretch; gap:14px; }
          .filters-right { order:-1; flex-direction:column; align-items:stretch; gap:10px; width:100%; }
          .filters-right > div { width:100%; }
          .search-input { width:100% !important; }
          .sort-select { flex:1; }
          .filters-chips-wrap { width:100%; }
        }
      `}</style>

      {/* Banner animado */}
      <div className="tienda-hero">
        <FloatingShopIcons opacity={0.4} />
        <div className="tienda-hero__blob tienda-hero__blob--1" />
        <div className="tienda-hero__blob tienda-hero__blob--2" />
        <div className="ring-spin" style={{ position: 'absolute', top: '-80px', right: '-80px', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(193,105,43,0.18)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1320px', margin: '0 auto', position: 'relative', zIndex: 3 }}>
          <motion.p className="section-label" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .5 }} style={{ marginBottom: '14px', color: '#e88c4a' }}>
            Catálogo
          </motion.p>
          <motion.h1
            key={currentLabel}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [.22, 1, .36, 1] }}
            style={{ color: '#fff', fontSize: 'clamp(38px, 6.5vw, 66px)', fontWeight: '900', letterSpacing: '-2px', margin: '0 0 12px', lineHeight: 1 }}
          >
            {selectedCat === 'all'
              ? <>Toda la <span className="text-shimmer">Tienda</span></>
              : <span className="text-shimmer">{currentLabel}</span>}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3, duration: .6 }}
            style={{ color: 'rgba(232,229,226,0.65)', fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '9px' }}
          >
            <span style={{ display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', background: '#25a244', boxShadow: '0 0 8px #25a244', flexShrink: 0 }} />
            {loading ? 'Cargando…' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
          </motion.p>
        </div>
      </div>

      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 32px' }}>
        {/* Filtros */}
        <div className="filters-bar" style={{ marginBottom: '40px' }}>
          <div className="filters-chips-wrap">
            <button type="button" aria-label="Anterior" className="chips-arrow" onClick={() => scrollChips(-1)}>
              <ChevronLeft size={18} />
            </button>
            <div className="filters-chips" ref={chipsRef}>
              {allCategories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`filter-chip ${selectedCat === cat.id ? 'active' : ''}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <button type="button" aria-label="Siguiente" className="chips-arrow" onClick={() => scrollChips(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="filters-right">
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#7a7675" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={14} color="#7a7675" /></button>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={15} color="#7a7675" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                <option value="featured">Destacados</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="tienda-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '14px', overflow: 'hidden', background: '#fff' }}>
                <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 0 }} />
                <div style={{ padding: '16px' }}>
                  <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', color: '#7a7675' }}>
            <Package size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#211f1e' }}>Sin resultados</p>
            <p style={{ marginBottom: '24px' }}>Intenta con otro término o categoría</p>
            <button onClick={() => { setSearch(''); setSelectedCat('all') }} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="tienda-grid">
            {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </>
  )
}

export default function TiendaPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '120px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e8e5e2', borderTopColor: '#c1692b', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <TiendaContent />
    </Suspense>
  )
}
