'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ChevronLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

const BADGES = ['', 'Nuevo', 'Oferta', 'Premium', 'Agotado']

export default function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [categories, setCategories] = useState<{slug: string; name: string}[]>([])
  const [form, setForm] = useState({
    name: '', price: '', originalPrice: '', category: '',
    subcategory: '', description: '', badge: '',
    inStock: true, featured: false, images: [] as string[],
    sizes: [] as string[], colors: [] as string[],
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data) })
  }, [])

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(p => {
        setForm({
          name: p.name || '', price: String(p.price || ''),
          originalPrice: p.originalPrice ? String(p.originalPrice) : '',
          category: p.category || 'dama', subcategory: p.subcategory || '',
          description: p.description || '', badge: p.badge || '',
          inStock: p.inStock ?? true, featured: p.featured ?? false,
          images: Array.isArray(p.images) ? p.images : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          colors: Array.isArray(p.colors) ? p.colors : [],
        })
      })
      .finally(() => setFetching(false))
  }, [id])

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  const addImage = () => { if (imageInput.trim()) { set('images', [...form.images, imageInput.trim()]); setImageInput('') } }
  const addSize = () => { if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) { set('sizes', [...form.sizes, sizeInput.trim()]); setSizeInput('') } }
  const addColor = () => { if (colorInput.trim() && !form.colors.includes(colorInput.trim())) { set('colors', [...form.colors, colorInput.trim()]); setColorInput('') } }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push('/admin/productos')
      else { const d = await res.json(); setError(d.error || 'Error') }
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8e5e2', fontSize: '14px', outline: 'none', fontFamily: 'Arial, sans-serif', transition: 'border-color .2s', background: '#fff' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#393738', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' }

  if (fetching) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f2f0' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#7a7675' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e8e5e2', borderTopColor: '#c1692b', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin .8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Cargando producto...
        </div>
      </main>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f2f0', fontFamily: 'Arial, sans-serif' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <Link href="/admin/productos" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c1692b', textDecoration: 'none', fontSize: '13px', fontWeight: '700', marginBottom: '24px' }}>
            <ChevronLeft size={16} /> Volver
          </Link>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#211f1e', margin: '0 0 28px', letterSpacing: '-0.5px' }}>Editar Producto</h1>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '20px' }}>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e8e5e2' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#211f1e', margin: '0 0 20px' }}>Información básica</h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#c1692b')} onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Descripción *</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => (e.target.style.borderColor = '#c1692b')} onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Precio USD *</label>
                      <input type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#c1692b')} onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                    </div>
                    <div>
                      <label style={labelStyle}>Precio original</label>
                      <input type="number" step="0.01" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#c1692b')} onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Categoría</label>
                      <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Badge</label>
                      <select value={form.badge} onChange={e => set('badge', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {BADGES.map(b => <option key={b} value={b}>{b || 'Sin badge'}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e8e5e2' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#211f1e', margin: '0 0 20px' }}>Imágenes</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <input value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="URL de imagen..." style={{ ...inputStyle, flex: 1 }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())} onFocus={e => (e.target.style.borderColor = '#c1692b')} onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                  <button type="button" onClick={addImage} style={{ padding: '11px 18px', background: '#c1692b', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Agregar
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e8e5e2' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => set('images', form.images.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e8e5e2' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#211f1e', margin: '0 0 20px' }}>Variantes</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={labelStyle}>Tallas</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input value={sizeInput} onChange={e => setSizeInput(e.target.value)} placeholder="Ej: S, M, L" style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} onFocus={e => (e.target.style.borderColor = '#c1692b')} onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                      <button type="button" onClick={addSize} style={{ padding: '11px 14px', background: '#211f1e', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {form.sizes.map(s => <span key={s} onClick={() => set('sizes', form.sizes.filter(x => x !== s))} style={{ padding: '4px 12px', background: '#211f1e', color: '#fff', borderRadius: '100px', fontSize: '13px', cursor: 'pointer' }}>{s} ×</span>)}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Colores</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input value={colorInput} onChange={e => setColorInput(e.target.value)} placeholder="Ej: Negro" style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} onFocus={e => (e.target.style.borderColor = '#c1692b')} onBlur={e => (e.target.style.borderColor = '#e8e5e2')} />
                      <button type="button" onClick={addColor} style={{ padding: '11px 14px', background: '#211f1e', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {form.colors.map(c => <span key={c} onClick={() => set('colors', form.colors.filter(x => x !== c))} style={{ padding: '4px 12px', background: '#c1692b', color: '#fff', borderRadius: '100px', fontSize: '13px', cursor: 'pointer' }}>{c} ×</span>)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e8e5e2' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#211f1e', margin: '0 0 20px' }}>Opciones</h2>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {[{ key: 'inStock', label: 'Disponible en stock' }, { key: 'featured', label: 'Producto destacado' }].map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <div onClick={() => set(key, !form[key as keyof typeof form])} style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${form[key as keyof typeof form] ? '#c1692b' : '#e8e5e2'}`, background: form[key as keyof typeof form] ? '#c1692b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s', flexShrink: 0 }}>
                        {form[key as keyof typeof form] && <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}
                      </div>
                      <span style={{ fontSize: '14px', color: '#393738' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#dc2626', fontSize: '14px' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Link href="/admin/productos" style={{ padding: '13px 24px', border: '1.5px solid #e8e5e2', borderRadius: '10px', color: '#393738', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>Cancelar</Link>
                <button type="submit" disabled={loading} style={{ padding: '13px 32px', background: loading ? '#7a7675' : '#c1692b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif' }}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
