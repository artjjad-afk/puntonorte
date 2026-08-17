'use client'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ProductCard } from '@/components/ui/ProductCard'
import { SlidersHorizontal, X, Search, Package } from 'lucide-react'

interface Product {
  id: number; name: string; slug: string; price: number
  originalPrice: number | null; category: string; images: string[]
  badge: string | null; inStock: boolean; featured: boolean; active: boolean
  description: string; sizes: string[]; colors: string[]
}




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

  return (
    <>
      <style>{`
        .filter-chip { padding:9px 20px; border-radius:100px; border:1.5px solid #e8e5e2; background:#fff; cursor:pointer; font-size:13px; font-weight:600; color:#393738; transition:all .2s; white-space:nowrap; flex-shrink:0; min-height:40px; }
        .filter-chip:hover { border-color:#c1692b; color:#c1692b; }
        .filter-chip.active { background:#211f1e; border-color:#211f1e; color:#fff; }
        .sort-select { padding:9px 16px; border-radius:10px; border:1.5px solid #e8e5e2; font-size:13px; font-weight:600; color:#393738; outline:none; cursor:pointer; background:#fff; min-height:40px; }
        .sort-select:focus { border-color:#c1692b; }
        .search-input { padding:10px 16px 10px 44px; border-radius:10px; border:1.5px solid #e8e5e2; font-size:14px; width:200px; outline:none; transition:border-color .2s; min-height:40px; }
        .search-input:focus { border-color:#c1692b; }
        .filters-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between; }
        .filters-chips { display:flex; gap:8px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding-bottom:2px; flex-shrink:1; min-width:0; }
        .filters-chips::-webkit-scrollbar { display:none; }
        .filters-right { display:flex; gap:10px; align-items:center; flex-shrink:0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:640px){ .search-input { width:140px; } .filters-bar { flex-direction:column; align-items:stretch; } .filters-right { justify-content:flex-end; } }
      `}</style>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #211f1e 0%, #393738 100%)', padding: '60px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid rgba(193,105,43,0.12)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: '10px' }}>Catálogo</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 6px' }}>
            {selectedCat === 'all' ? 'Toda la Tienda' : currentLabel}
          </h1>
          <p style={{ color: 'rgba(232,229,226,0.5)', fontSize: '15px', margin: 0 }}>
            {loading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 32px' }}>
        {/* Filtros */}
        <div className="filters-bar" style={{ marginBottom: '40px' }}>
          <div className="filters-chips">
            {allCategories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`filter-chip ${selectedCat === cat.id ? 'active' : ''}`}>
                {cat.label}
              </button>
            ))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
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
