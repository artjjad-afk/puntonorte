'use client'
import { useEffect, useState, useCallback } from 'react'
import { Tag, Eye, EyeOff, Search, Percent, Star, X, Flame, Package, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Product {
  id: number
  name: string
  slug: string
  price: number
  originalPrice: number | null
  category: string
  images: string[]
  badge: string | null
  featured: boolean
  active: boolean
  inStock: boolean
  showInOffers: boolean
}

interface Toast { id: number; type: 'success' | 'error'; message: string }

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)', fontSize: 13,
  outline: 'none', fontFamily: 'inherit',
  background: 'rgba(255,255,255,0.06)', color: '#e2e8f0',
  transition: 'border-color .2s', boxSizing: 'border-box',
}

function discount(price: number, original: number | null) {
  if (!original || original <= price) return null
  return Math.round(((original - price) / original) * 100)
}

export default function AdminOfertas() {
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState<'all' | 'offers'>('all')
  const [toasts, setToasts]       = useState<Toast[]>([])
  const toastId                   = useState(0)

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId[0]
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [toastId])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?all=true')
      if (res.ok) {
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [])

  const toggleOffer = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showInOffers: !product.showInOffers }),
      })
      if (!res.ok) throw new Error()
      showToast('success', product.showInOffers
        ? `"${product.name}" quitado de ofertas`
        : `"${product.name}" destacado en ofertas ✦`)
      fetchProducts()
    } catch { showToast('error', 'No se pudo actualizar el producto') }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.category.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.showInOffers
    return matchSearch && matchFilter
  })

  const offersCount = products.filter(p => p.showInOffers).length

  return (
    <div style={{ padding: '24px 28px 80px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        .offer-row { transition: background .18s; border-radius: 12px; }
        .offer-row:hover { background: rgba(255,255,255,0.03); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toast-in { from { opacity:0; transform:translateX(40px) scale(.95); } to { opacity:1; transform:translateX(0) scale(1); } }
      `}</style>

      {/* Toasts */}
      <div style={{ position:'fixed', bottom:28, right:28, zIndex:9999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ opacity:0, x:40, scale:.95 }}
              animate={{ opacity:1, x:0, scale:1 }}
              exit={{ opacity:0, x:40, scale:.95 }}
              transition={{ type:'spring', stiffness:400, damping:30 }}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', borderRadius:14, pointerEvents:'auto', backdropFilter:'blur(20px)',
                background: t.type === 'success' ? 'rgba(34,197,94,.15)' : 'rgba(248,113,113,.15)',
                border: `1px solid ${t.type === 'success' ? 'rgba(34,197,94,.3)' : 'rgba(248,113,113,.3)'}`,
                boxShadow:'0 8px 32px rgba(0,0,0,.4)', maxWidth:320, fontSize:13, fontWeight:600,
                color: t.type === 'success' ? '#86efac' : '#fca5a5' }}>
              {t.type === 'success' ? '✦' : '!'} {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(249,115,22,.15)', border:'1px solid rgba(249,115,22,.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Percent size={18} color="#f97316" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'#f1f5f9', margin:0, letterSpacing:'-0.5px' }}>Ofertas</h1>
            <p style={{ color:'rgba(148,163,184,.5)', fontSize:12, margin:0, fontFamily:'var(--font-mono)' }}>
              {offersCount} producto{offersCount !== 1 ? 's' : ''} en oferta · Gestiona qué se destaca en el inicio
            </p>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'En oferta', value: offersCount, icon: <Flame size={24} color="#f97316" strokeWidth={1.75} />, color:'rgba(249,115,22,.15)', border:'rgba(249,115,22,.25)' },
          { label:'Con descuento', value: products.filter(p => discount(p.price, p.originalPrice) !== null).length, icon: <Tag size={24} color="#60a5fa" strokeWidth={1.75} />, color:'rgba(96,165,250,.12)', border:'rgba(96,165,250,.25)' },
          { label:'Total productos', value: products.length, icon: <Package size={24} color="#94a3b8" strokeWidth={1.75} />, color:'rgba(148,163,184,.08)', border:'rgba(148,163,184,.15)' },
        ].map(s => (
          <div key={s.label} style={{ background:s.color, border:`1px solid ${s.border}`, borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ display:'flex', alignItems:'center' }}>{s.icon}</span>
            <div>
              <p style={{ margin:0, fontSize:24, fontWeight:900, color:'#f1f5f9', letterSpacing:'-1px' }}>{s.value}</p>
              <p style={{ margin:0, fontSize:11, color:'rgba(148,163,184,.6)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'.08em' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(148,163,184,.4)', pointerEvents:'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto o categoría..."
            style={{ ...inp, paddingLeft:36 }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {(['all','offers'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'9px 16px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', fontFamily:'inherit',
                background: filter === f ? 'rgba(249,115,22,.2)' : 'rgba(255,255,255,.05)',
                color: filter === f ? '#f97316' : 'rgba(148,163,184,.6)',
                outline: filter === f ? '1px solid rgba(249,115,22,.4)' : '1px solid rgba(255,255,255,.08)' }}>
              {f === 'all' ? 'Todos' : (
                <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                  <Flame size={14} strokeWidth={2} style={{ verticalAlign:'-2px' }} /> En oferta
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <motion.div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:18, overflow:'hidden' }}>
        {/* Header tabla */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 120px 100px 120px', gap:16, padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,.06)', fontSize:10, fontWeight:700, color:'rgba(148,163,184,.4)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:'var(--font-mono)' }}>
          <span>Producto</span>
          <span>Precio</span>
          <span>Descuento</span>
          <span>Estado</span>
          <span style={{ textAlign:'right' }}>En oferta</span>
        </div>

        {loading ? (
          <div style={{ padding:56, textAlign:'center', color:'rgba(148,163,184,.4)' }}>
            <div style={{ width:32, height:32, border:'2px solid rgba(249,115,22,.3)', borderTopColor:'#f97316', borderRadius:'50%', margin:'0 auto 12px', animation:'spin .8s linear infinite' }} />
            <p style={{ margin:0, fontSize:13, fontFamily:'var(--font-mono)' }}>Cargando productos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:56, textAlign:'center', color:'rgba(148,163,184,.3)' }}>
            <Tag size={36} strokeWidth={1} style={{ margin:'0 auto 12px', display:'block', opacity:.4 }} />
            <p style={{ margin:'0 0 4px', fontSize:15, fontWeight:600, color:'rgba(148,163,184,.4)' }}>
              {search ? 'Sin resultados' : 'Sin productos'}
            </p>
            <p style={{ margin:0, fontSize:12, fontFamily:'var(--font-mono)' }}>
              {search ? `No hay productos que coincidan con "${search}"` : 'Crea productos desde la sección Productos'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((product, idx) => {
              const disc = discount(product.price, product.originalPrice)
              const img  = product.images?.[0] ?? null
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity:0, x:-8 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="offer-row"
                  style={{ display:'grid', gridTemplateColumns:'1fr 120px 120px 100px 120px', gap:16, padding:'14px 20px', borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none', alignItems:'center' }}
                >
                  {/* Producto */}
                  <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                    <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)' }}>
                      {img
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={img} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Tag size={16} color="rgba(148,163,184,.3)" /></div>
                      }
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ margin:0, fontWeight:700, color:'#f1f5f9', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.name}</p>
                      <p style={{ margin:0, fontSize:11, color:'rgba(148,163,184,.45)', fontFamily:'var(--font-mono)' }}>{product.category}</p>
                    </div>
                    {product.featured && (
                      <span title="Destacado" style={{ flexShrink:0 }}><Star size={13} color="#f97316" fill="#f97316" /></span>
                    )}
                  </div>

                  {/* Precio */}
                  <div>
                    <p style={{ margin:0, fontWeight:800, color:'#f1f5f9', fontSize:14 }}>${product.price.toFixed(2)}</p>
                    {product.originalPrice && (
                      <p style={{ margin:0, fontSize:11, color:'rgba(148,163,184,.4)', textDecoration:'line-through', fontFamily:'var(--font-mono)' }}>${product.originalPrice.toFixed(2)}</p>
                    )}
                  </div>

                  {/* Descuento */}
                  <div>
                    {disc !== null ? (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:100, background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.25)', color:'#86efac', fontSize:12, fontWeight:800, fontFamily:'var(--font-mono)' }}>
                        -{disc}%
                      </span>
                    ) : (
                      <span style={{ color:'rgba(148,163,184,.3)', fontSize:12, fontFamily:'var(--font-mono)' }}>—</span>
                    )}
                  </div>

                  {/* Estado */}
                  <div>
                    <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:700,
                      background: product.active ? 'rgba(34,197,94,.1)' : 'rgba(148,163,184,.08)',
                      color: product.active ? '#22c55e' : 'rgba(148,163,184,.5)',
                      border: `1px solid ${product.active ? 'rgba(34,197,94,.25)' : 'rgba(148,163,184,.15)'}` }}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Toggle oferta */}
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <button
                      onClick={() => toggleOffer(product)}
                      title={product.showInOffers ? 'Quitar de ofertas' : 'Destacar en ofertas'}
                      style={{ height:34, padding:'0 14px', borderRadius:10, display:'flex', alignItems:'center', gap:6, cursor:'pointer', border:'none', fontFamily:'var(--font-mono)', fontSize:10, fontWeight:800, letterSpacing:'.06em', transition:'all .2s',
                        background: product.showInOffers ? 'linear-gradient(135deg,rgba(249,115,22,.25),rgba(251,146,60,.2))' : 'rgba(148,163,184,.08)',
                        color: product.showInOffers ? '#f97316' : 'rgba(148,163,184,.5)',
                        outline: product.showInOffers ? '1px solid rgba(249,115,22,.4)' : '1px solid rgba(148,163,184,.15)',
                        boxShadow: product.showInOffers ? '0 0 16px rgba(249,115,22,.2)' : 'none' }}>
                      {product.showInOffers ? (
                        <><Percent size={11} /> EN OFERTA</>
                      ) : (
                        <><X size={11} /> AGREGAR</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Tip */}
      {offersCount > 0 && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}
          style={{ marginTop:16, padding:'12px 16px', background:'rgba(249,115,22,.06)', border:'1px solid rgba(249,115,22,.14)', borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ display:'flex', alignItems:'center' }}><Lightbulb size={18} color="#f97316" strokeWidth={1.75} /></span>
          <p style={{ margin:0, fontSize:12, color:'rgba(148,163,184,.6)', fontFamily:'var(--font-mono)', lineHeight:1.6 }}>
            Tienes <strong style={{ color:'#f97316' }}>{offersCount} producto{offersCount !== 1 ? 's' : ''}</strong> en oferta. Aparecerán en la sección de ofertas de la página principal.
          </p>
        </motion.div>
      )}
    </div>
  )
}
