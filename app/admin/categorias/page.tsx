'use client'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Trash2, Tag, Eye, EyeOff, Pencil, X, Check } from 'lucide-react'

interface Category {
  id: number; name: string; slug: string
  image: string | null; active: boolean; order: number
}

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
}

export default function AdminCategorias() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', image: '', order: '0' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', image: '', order: '0' })

  const fetchCats = async () => {
    setLoading(true)
    try {
      // ?all=true para ver también las categorías inactivas en el admin
      const res = await fetch('/api/categories?all=true')
      if (res.ok) setCats(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCats() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: slugify(form.name),
          image: form.image.trim() || null,
          order: parseInt(form.order) || 0,
        }),
      })
      if (res.ok) { setForm({ name: '', image: '', order: '0' }); fetchCats() }
      else { const d = await res.json(); setError(d.error || 'Error al crear') }
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  const handleToggle = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !cat.active }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      fetchCats()
    } catch {
      alert('No se pudo actualizar la categoría. Intenta de nuevo.')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Los productos de esta categoría quedarán sin categoría visible.`)) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      fetchCats()
    } catch {
      alert('No se pudo eliminar la categoría. Intenta de nuevo.')
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditForm({ name: cat.name, image: cat.image || '', order: String(cat.order) })
  }

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug: slugify(editForm.name),
          image: editForm.image.trim() || null,
          order: parseInt(editForm.order) || 0,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setEditingId(null)
      fetchCats()
    } catch {
      alert('No se pudo guardar los cambios. Intenta de nuevo.')
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e8e5e2', fontSize: '14px', outline: 'none', fontFamily: 'Arial, sans-serif', transition: 'border-color .2s', background: '#fff' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#393738', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f2f0', fontFamily: 'Arial, sans-serif' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#211f1e', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Categorías</h1>
            <p style={{ color: '#7a7675', margin: 0, fontSize: '14px' }}>Gestiona las categorías de la tienda</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>

            {/* Form nueva categoría */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e8e5e2', position: 'sticky', top: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#211f1e', margin: '0 0 20px' }}>Nueva categoría</h2>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ej: Ropa de Playa" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c1692b')}
                    onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                </div>
                <div>
                  <label style={labelStyle}>URL de imagen (opcional)</label>
                  <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://..." style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c1692b')}
                    onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                </div>
                <div>
                  <label style={labelStyle}>Orden de aparición</label>
                  <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c1692b')}
                    onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                </div>
                {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>}
                <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: saving ? '#7a7675' : '#c1692b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif' }}>
                  <Plus size={16} /> {saving ? 'Guardando...' : 'Agregar categoría'}
                </button>
              </form>
              <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(193,105,43,0.06)', border: '1px solid rgba(193,105,43,0.15)', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#393738', lineHeight: '1.6' }}>
                  💡 El slug se genera automáticamente. Las categorías aquí creadas aparecerán en el menú de la tienda y en el formulario de productos.
                </p>
              </div>
            </div>

            {/* Lista */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e5e2', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #e8e5e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#211f1e', margin: 0 }}>Categorías ({cats.length})</h2>
              </div>

              {loading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#7a7675' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid #e8e5e2', borderTopColor: '#c1692b', borderRadius: '50%', margin: '0 auto', animation: 'spin .8s linear infinite' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : cats.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#7a7675' }}>
                  <Tag size={36} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ margin: 0 }}>No hay categorías todavía</p>
                </div>
              ) : (
                <div>
                  {cats.map((cat, i) => (
                    <div key={cat.id} style={{ borderBottom: i < cats.length - 1 ? '1px solid #f4f2f0' : 'none' }}>
                      {editingId === cat.id ? (
                        // Modo edición inline
                        <div style={{ padding: '16px 20px', background: '#faf9f8', display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '140px' }}>
                            <label style={{ ...labelStyle, fontSize: '11px' }}>Nombre</label>
                            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              style={{ ...inputStyle, padding: '8px 12px' }}
                              onFocus={e => (e.target.style.borderColor = '#c1692b')}
                              onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                          </div>
                          <div style={{ flex: 2, minWidth: '180px' }}>
                            <label style={{ ...labelStyle, fontSize: '11px' }}>URL imagen</label>
                            <input value={editForm.image} onChange={e => setEditForm(f => ({ ...f, image: e.target.value }))}
                              placeholder="https://..." style={{ ...inputStyle, padding: '8px 12px' }}
                              onFocus={e => (e.target.style.borderColor = '#c1692b')}
                              onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                          </div>
                          <div style={{ width: '72px' }}>
                            <label style={{ ...labelStyle, fontSize: '11px' }}>Orden</label>
                            <input type="number" value={editForm.order} onChange={e => setEditForm(f => ({ ...f, order: e.target.value }))}
                              style={{ ...inputStyle, padding: '8px 12px' }}
                              onFocus={e => (e.target.style.borderColor = '#c1692b')}
                              onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                          </div>
                          <div style={{ display: 'flex', gap: '6px', paddingBottom: '1px' }}>
                            <button onClick={() => handleEdit(cat.id)} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(5,150,105,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                              <Check size={16} />
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(107,114,128,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Vista normal
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', transition: 'background .15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#faf9f8')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f4f2f0' }}>
                            {cat.image && <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: '700', color: '#211f1e', fontSize: '14px' }}>{cat.name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7a7675' }}>/{cat.slug} · Orden: {cat.order}</p>
                          </div>
                          <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', flexShrink: 0, background: cat.active ? 'rgba(5,150,105,0.1)' : 'rgba(107,114,128,0.1)', color: cat.active ? '#059669' : '#6b7280' }}>
                            {cat.active ? 'Activa' : 'Oculta'}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button onClick={() => startEdit(cat)} title="Editar" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(37,99,235,0.08)', color: '#2563eb', border: 'none', cursor: 'pointer' }}>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleToggle(cat)} title={cat.active ? 'Ocultar' : 'Mostrar'} style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(107,114,128,0.08)', color: '#6b7280', border: 'none', cursor: 'pointer' }}>
                              {cat.active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => handleDelete(cat.id, cat.name)} title="Eliminar" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
