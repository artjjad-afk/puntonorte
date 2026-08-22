'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Package, Star, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

interface Product {
  id: number; name: string; price: number; category: string
  badge: string | null; inStock: boolean; featured: boolean; active: boolean; images: string[]
}

const inp: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '10px 14px 10px 40px',
  fontSize: 13, color: '#e2e8f0', outline: 'none',
  fontFamily: 'var(--font-display)', width: '100%',
  transition: 'border-color .2s', boxSizing: 'border-box' as const,
}

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [filter, setFilter]     = useState<'all' | 'active' | 'inactive'>('all')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?all=true')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [])

  const toggleActive = async (id: number, active: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) })
      if (!res.ok) throw new Error()
      fetchProducts()
    } catch { alert('No se pudo actualizar el producto.') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      fetchProducts()
    } catch { alert('No se pudo eliminar el producto.') }
    finally { setDeleting(null) }
  }

  const filtered = products
    .filter(p => filter === 'all' ? true : filter === 'active' ? p.active : !p.active)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: '24px 28px 80px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        .prod-row { transition: background .18s; }
        .prod-row:hover { background: rgba(255,255,255,0.03); }
        .prod-input:focus { border-color: rgba(249,115,22,0.5) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={19} color="#f97316" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Productos</h1>
            <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>
              {products.length} en total · {products.filter(p => p.active).length} activos
            </p>
          </div>
        </div>
        <Link href="/admin/productos/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 11, background: 'linear-gradient(135deg,#f97316,#c1692b)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 18px rgba(249,115,22,0.35)' }}>
          <Zap size={14} /> Nuevo producto
        </Link>
      </div>

      {/* ── Filtros + búsqueda ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Chips de filtro */}
        <div style={{ display: 'flex', gap: 6 }}>
          {([['all', 'Todos'], ['active', 'Activos'], ['inactive', 'Ocultos']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'var(--font-display)', background: filter === val ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)', color: filter === val ? '#f97316' : 'rgba(148,163,184,0.6)', outline: filter === val ? '1px solid rgba(249,115,22,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} color="rgba(148,163,184,0.4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="prod-input" type="text" placeholder="Buscar producto o categoría..." value={search} onChange={e => setSearch(e.target.value)} style={inp} />
        </div>
      </div>

      {/* ── Tabla ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}
      >
        {/* Top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,115,22,0.25),transparent)', pointerEvents: 'none' }} />

        {loading ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'rgba(148,163,184,0.4)' }}>
            <div style={{ width: 32, height: 32, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin .8s linear infinite' }} />
            <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-mono)' }}>Cargando productos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'rgba(148,163,184,0.3)' }}>
            <Package size={40} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'rgba(148,163,184,0.4)' }}>
              {search ? `Sin resultados para "${search}"` : 'Sin productos'}
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {search ? 'Intenta con otro término' : 'Agrega tu primer producto'}
            </p>
            {!search && (
              <Link href="/admin/productos/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                <Plus size={14} /> Crear producto
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Cabecera */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 90px 80px 100px', gap: 12, padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(100,116,139,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{h}</span>
              ))}
            </div>

            {/* Filas */}
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="prod-row"
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 90px 80px 100px', gap: 12, padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}
                >
                  {/* Producto */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> // eslint-disable-line @next/next/no-img-element
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color="rgba(148,163,184,0.3)" /></div>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {p.badge && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 100, background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }}>
                            {p.badge}
                          </span>
                        )}
                        {p.featured && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#fbbf24' }}>
                            <Star size={10} fill="#fbbf24" /> Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Categoría */}
                  <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', textTransform: 'capitalize', fontFamily: 'var(--font-mono)' }}>
                    {p.category}
                  </span>

                  {/* Precio */}
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#f97316', fontFamily: 'var(--font-mono)', filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.35))' }}>
                    ${p.price.toFixed(2)}
                  </span>

                  {/* Stock */}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, width: 'fit-content', background: p.inStock ? 'rgba(34,197,94,0.12)' : 'rgba(248,113,113,0.12)', color: p.inStock ? '#22c55e' : '#f87171', border: `1px solid ${p.inStock ? 'rgba(34,197,94,0.25)' : 'rgba(248,113,113,0.25)'}` }}>
                    {p.inStock ? 'Disponible' : 'Agotado'}
                  </span>

                  {/* Estado */}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, width: 'fit-content', background: p.active ? 'rgba(96,165,250,0.12)' : 'rgba(148,163,184,0.08)', color: p.active ? '#60a5fa' : 'rgba(148,163,184,0.5)', border: `1px solid ${p.active ? 'rgba(96,165,250,0.25)' : 'rgba(148,163,184,0.15)'}` }}>
                    {p.active ? 'Activo' : 'Oculto'}
                  </span>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: 5 }}>
                    <Link href={`/admin/productos/${p.id}/editar`} title="Editar"
                      style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', textDecoration: 'none' }}>
                      <Pencil size={13} />
                    </Link>
                    <button onClick={() => toggleActive(p.id, p.active)} title={p.active ? 'Ocultar' : 'Mostrar'}
                      style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', color: 'rgba(148,163,184,0.6)', cursor: 'pointer' }}>
                      {p.active ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} title="Eliminar"
                      style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: deleting === p.id ? 'not-allowed' : 'pointer', opacity: deleting === p.id ? 0.5 : 1 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  )
}
