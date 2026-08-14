'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'
import { useToast } from '@/components/ui/Toast'

export function ProductCard({ product }: { product: Product }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const { addItem } = useCartStore()
  const { show } = useToast()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    show(product.name, 'Agregado al carrito ✓', 'cart')
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <Link href={`/tienda/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article className="product-card"
        onMouseEnter={() => product.images.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}>

        {/* Image */}
        <div className="card-img" style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#f4f2f0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images[imgIdx]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

          {/* Gradient overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(33,31,30,0.6) 0%, transparent 100%)', pointerEvents: 'none' }} />

          {/* Badges */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {product.badge && (
              <span style={{
                background: product.badge === 'Premium' ? '#211f1e' : product.badge === 'Nuevo' ? '#1a6b3a' : '#c1692b',
                color: '#fff', padding: '4px 10px', borderRadius: '6px',
                fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase',
              }}>{product.badge}</span>
            )}
            {discount && (
              <span style={{ background: 'rgba(33,31,30,0.85)', backdropFilter: 'blur(8px)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button onClick={e => { e.preventDefault(); setWishlisted(w => !w) }} style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            <Heart size={15} fill={wishlisted ? '#c1692b' : 'none'} color={wishlisted ? '#c1692b' : '#393738'} />
          </button>

          {/* Add to cart — slides up on hover */}
          <div className="add-btn" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: '1px' }}>
            <button onClick={handleAdd} style={{
              flex: 1, padding: '13px 12px', background: '#c1692b',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '12px', letterSpacing: '0.8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#a8541f')}
              onMouseLeave={e => (e.currentTarget.style.background = '#c1692b')}>
              <ShoppingCart size={14} /> AGREGAR
            </button>
            <Link href={`/tienda/${product.slug}`} onClick={e => e.stopPropagation()} style={{
              width: '46px', background: 'rgba(33,31,30,0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <Eye size={15} />
            </Link>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '16px 16px 18px' }}>
          <p style={{ fontSize: '11px', color: '#7a7675', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '5px' }}>
            {product.category}
          </p>
          <p className="line-clamp-2" style={{ fontSize: '14px', fontWeight: '600', color: '#211f1e', lineHeight: '1.4', marginBottom: '10px' }}>
            {product.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#c1692b' }}>${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span style={{ fontSize: '13px', color: '#7a7675', textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
