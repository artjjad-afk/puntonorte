'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Package } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: number; name: string; price: number; category: string
  badge: string | null; inStock: boolean; featured: boolean; active: boolean; images: string[]
}

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

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
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      fetchProducts()
    } catch (e) {
      console.error(e)
      alert('No se pudo actualizar el producto. Intenta de nuevo.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      fetchProducts()
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar el producto. Intenta de nuevo.')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-root" style={{ display: 'flex' }}>
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="adm-section-label">Catálogo</div>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Productos</h1>
              <p style={{ color: 'rgba(232,229,226,0.35)', margin: '4px 0 0', fontSize: '13px' }}>{products.length} productos en total</p>
            </div>
            <Link href="/admin/productos/nuevo" className="adm-btn-primary" style={{ padding: '11px 20px', borderRadius: '12px', textDecoration: 'none' }}>
              <Plus size={15} /> Nuevo producto
            </Link>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={15} color="rgba(232,229,226,0.25)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar por nombre o categoría..." value={search} onChange={e => setSearch(e.target.value)}
              className="adm-input" style={{ paddingLeft: '42px' }} />
          </div>

          {/* Table card */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'rgba(232,229,226,0.3)' }}>
                <div className="adm-spinner" />
                <p style={{ margin: 0, fontSize: '14px' }}>Cargando productos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center', color: 'rgba(232,229,226,0.3)' }}>
                <Package size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(232,229,226,0.5)', margin: '0 0 6px' }}>Sin productos</p>
                <p style={{ margin: '0 0 20px', fontSize: '13px' }}>Agrega tu primer producto para empezar</p>
                <Link href="/admin/productos/nuevo" className="adm-btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', display: 'inline-flex' }}>
                  <Plus size={14} /> Crear producto
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="adm-table">
                  <thead>
                    <tr>
                      {['Producto', 'Categoría', 'Precio', 'Stock', 'Destacado', 'Estado', 'Acciones'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#fff' }}>{p.name}</p>
                              {p.badge && <span className="adm-badge adm-badge-copper" style={{ fontSize: '10px', padding: '2px 8px' }}>{p.badge}</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'rgba(232,229,226,0.55)', textTransform: 'capitalize', fontSize: '13px' }}>{p.category}</td>
                        <td style={{ color: '#c1692b', fontWeight: '800', fontSize: '15px' }}>${p.price.toFixed(2)}</td>
                        <td><span className={`adm-badge ${p.inStock ? 'adm-badge-green' : 'adm-badge-red'}`}>{p.inStock ? 'Disponible' : 'Agotado'}</span></td>
                        <td style={{ color: p.featured ? '#c1692b' : 'rgba(232,229,226,0.3)', fontSize: '13px', fontWeight: p.featured ? '700' : '400' }}>{p.featured ? '⭐ Sí' : '—'}</td>
                        <td><span className={`adm-badge ${p.active ? 'adm-badge-green' : 'adm-badge-gray'}`}>{p.active ? 'Activo' : 'Oculto'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Link href={`/admin/productos/${p.id}/editar`} className="adm-icon-btn adm-icon-btn-blue" title="Editar" style={{ textDecoration: 'none', display: 'flex' }}>
                              <Pencil size={14} />
                            </Link>
                            <button onClick={() => toggleActive(p.id, p.active)} className="adm-icon-btn adm-icon-btn-gray" title={p.active ? 'Ocultar' : 'Mostrar'}>
                              {p.active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="adm-icon-btn adm-icon-btn-red" title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
