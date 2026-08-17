'use client'
import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, Shield, Truck, RefreshCw, ChevronLeft, Star, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useToast } from '@/components/ui/Toast'
import { ProductCard } from '@/components/ui/ProductCard'
import { ImageZoom } from '@/components/ui/ImageZoom'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/ui/JsonLd'

interface Product {
  id: number; name: string; slug: string; price: number
  originalPrice: number | null; category: string; description: string
  images: string[]; sizes: string[]; colors: string[]
  badge: string | null; inStock: boolean; featured: boolean
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { addItem } = useCartStore()
  const { show } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/products/${id}`)
      .then(r => {
        if (r.status === 404) { router.push('/tienda'); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        setProduct(data)
        setSelectedSize(data.sizes?.[0] || '')
        setSelectedColor(data.colors?.[0] || '')
        // Cargar relacionados
        return fetch(`/api/products?category=${data.category}`)
          .then(r => r.json())
          .then(all => setRelated(Array.isArray(all) ? all.filter((p: Product) => p.id !== data.id).slice(0, 4) : []))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e8e5e2', borderTopColor: '#c1692b', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!product) return null

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null
  const waMsg = encodeURIComponent(`Hola Punto Norte! Me interesa: *${product.name}* - $${product.price}. ¿Tienen disponibilidad?`)

  const handleAdd = () => {
    addItem(product as never, selectedSize || undefined, selectedColor || undefined)
    if (quantity > 1) {
      for (let i = 1; i < quantity; i++) addItem(product as never, selectedSize || undefined, selectedColor || undefined)
    }
    show(product.name, `${quantity > 1 ? `${quantity} unidades` : 'Agregado'} al carrito ✓`, 'cart')
  }

  return (
    <>
      <ProductJsonLd product={product as never} />
      <BreadcrumbJsonLd product={product as never} />
      <style>{`
        .size-btn { padding:10px 18px; border-radius:8px; border:1.5px solid #e8e5e2; background:#fff; cursor:pointer; font-size:13px; font-weight:700; color:#393738; transition:all .2s; min-height:44px; }
        .size-btn:hover { border-color:#c1692b; color:#c1692b; }
        .size-btn.active { background:#211f1e; border-color:#211f1e; color:#fff; }
        .color-btn { padding:7px 16px; border-radius:8px; border:1.5px solid #e8e5e2; background:#fff; cursor:pointer; font-size:13px; transition:all .2s; min-height:44px; }
        .color-btn.active { border-color:#c1692b; color:#c1692b; background:#fff7f3; font-weight:700; }
        .thumb-btn { border-radius:10px; overflow:hidden; border:2px solid transparent; cursor:pointer; transition:border-color .2s; padding:0; background:none; }
        .thumb-btn.active { border-color:#c1692b; }
        .guarantee-item { display:flex; align-items:center; gap:10px; padding:12px 16px; background:#f9f7f5; border-radius:10px; }
        .product-layout { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; }
        @media(max-width:768px){ .product-layout { grid-template-columns:1fr !important; gap:32px !important; } .guarantee-grid { grid-template-columns:1fr 1fr !important; } }
        @media(max-width:480px){ .guarantee-grid { grid-template-columns:1fr !important; } .product-cta-row { flex-direction:column !important; } }
      `}</style>

      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '32px 32px 80px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '13px', color: '#7a7675', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#7a7675', textDecoration: 'none' }}>Inicio</Link>
          <span style={{ opacity: .4 }}>/</span>
          <Link href="/tienda" style={{ color: '#7a7675', textDecoration: 'none' }}>Tienda</Link>
          <span style={{ opacity: .4 }}>/</span>
          <Link href={`/tienda?cat=${product.category}`} style={{ color: '#7a7675', textDecoration: 'none', textTransform: 'capitalize' }}>{product.category}</Link>
          <span style={{ opacity: .4 }}>/</span>
          <span style={{ color: '#211f1e', fontWeight: '600' }} className="line-clamp-1">{product.name}</span>
        </div>

        <Link href="/tienda" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c1692b', textDecoration: 'none', fontSize: '13px', fontWeight: '700', marginBottom: '32px' }}>
          <ChevronLeft size={16} /> Volver
        </Link>

        <div className="product-layout">
          {/* Galería */}
          <div>
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', aspectRatio: '4/5', background: '#f4f2f0', marginBottom: '14px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.images[selectedImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {product.badge && (
                <span style={{ position: 'absolute', top: '20px', left: '20px', background: product.badge === 'Premium' ? '#211f1e' : '#c1692b', color: '#fff', padding: '5px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  {product.badge}
                </span>
              )}
              {discount && (
                <span style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(33,31,30,0.85)', backdropFilter: 'blur(8px)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                  -{discount}%
                </span>
              )}
              {!product.inStock && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(33,31,30,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: '#211f1e', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: '800', fontSize: '16px' }}>Agotado</span>
                </div>
              )}
              <ImageZoom src={product.images[selectedImg]} alt={product.name} />
            </div>
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} className={`thumb-btn ${selectedImg === i ? 'active' : ''}`} style={{ width: '72px', height: '72px', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p style={{ color: '#c1692b', fontSize: '11px', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>{product.category}</p>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: '800', color: '#211f1e', letterSpacing: '-0.5px', lineHeight: '1.2', marginBottom: '16px' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="#c1692b" color="#c1692b" />)}
              </div>
              <span style={{ fontSize: '13px', color: '#7a7675' }}>4.9 · 38 reseñas</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', padding: '16px 20px', background: '#f9f7f5', borderRadius: '14px' }}>
              <span style={{ fontSize: '38px', fontWeight: '800', color: '#c1692b', letterSpacing: '-1px' }}>${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span style={{ fontSize: '20px', color: '#7a7675', textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</span>
                  <span style={{ background: '#c1692b', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>-{discount}%</span>
                </>
              )}
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#211f1e', marginBottom: '10px' }}>TALLA — <span style={{ color: '#c1692b' }}>{selectedSize}</span></p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.sizes.map(s => <button key={s} onClick={() => setSelectedSize(s)} className={`size-btn ${selectedSize === s ? 'active' : ''}`}>{s}</button>)}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#211f1e', marginBottom: '10px' }}>COLOR — <span style={{ color: '#c1692b' }}>{selectedColor}</span></p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.colors.map(c => <button key={c} onClick={() => setSelectedColor(c)} className={`color-btn ${selectedColor === c ? 'active' : ''}`}>{c}</button>)}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#211f1e', marginBottom: '10px' }}>CANTIDAD</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #e8e5e2', borderRadius: '10px', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '44px', height: '44px', border: 'none', background: '#f9f7f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={14} />
                </button>
                <span style={{ width: '52px', textAlign: 'center', fontWeight: '800', fontSize: '16px', color: '#211f1e' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: '44px', height: '44px', border: 'none', background: '#f9f7f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="product-cta-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button onClick={handleAdd} disabled={!product.inStock} className="btn-primary" style={{ flex: 1, padding: '16px', borderRadius: '12px', fontSize: '14px', border: 'none', opacity: product.inStock ? 1 : 0.5, cursor: product.inStock ? 'pointer' : 'not-allowed' }}>
                <ShoppingCart size={17} /> {product.inStock ? 'Agregar al carrito' : 'Agotado'}
              </button>
              <button onClick={() => setWishlisted(w => !w)} style={{ width: '52px', height: '52px', border: `1.5px solid ${wishlisted ? '#c1692b' : '#e8e5e2'}`, borderRadius: '12px', background: wishlisted ? '#fff7f3' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                <Heart size={18} fill={wishlisted ? '#c1692b' : 'none'} color={wishlisted ? '#c1692b' : '#393738'} />
              </button>
            </div>

            <a href={`https://wa.me/584140906768?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', background: '#25d366', color: '#fff', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', marginBottom: '28px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Consultar disponibilidad
            </a>

            <div className="guarantee-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
              {[
                { icon: <Truck size={16} color="#c1692b" />, text: 'Envío a todo Venezuela' },
                { icon: <Shield size={16} color="#c1692b" />, text: 'Garantía de calidad' },
                { icon: <RefreshCw size={16} color="#c1692b" />, text: 'Cambios en 7 días' },
                { icon: <span style={{ fontSize: '16px' }}>💳</span>, text: 'Zelle / Pago Móvil' },
              ].map((item, i) => (
                <div key={i} className="guarantee-item">{item.icon}<span style={{ fontSize: '12px', color: '#393738', fontWeight: '600' }}>{item.text}</span></div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e8e5e2', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#211f1e', marginBottom: '12px', textTransform: 'uppercase' }}>Descripción</h3>
              <p style={{ color: '#393738', lineHeight: '1.8', fontSize: '15px' }}>{product.description}</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: '800', color: '#211f1e', letterSpacing: '-0.5px' }}>También te puede interesar</h2>
              <Link href={`/tienda?cat=${product.category}`} style={{ color: '#c1692b', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>Ver más →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {related.map(p => <ProductCard key={p.id} product={p as never} />)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
