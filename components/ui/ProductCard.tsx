'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'
import { useToast } from '@/components/ui/Toast'
import { useWishlistStore } from '@/store/wishlist'

export function ProductCard({ product }: { product: Product }) {
  const [imgIdx, setImgIdx]         = useState(0)
  const [isAdding, setIsAdding]     = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCartStore()
  const { show }    = useToast()
  const { toggle: toggleWishlist, has: isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAdding) return
    setIsAdding(true)
    addItem(product)
    show(product.name, 'Agregado al carrito ✓', 'cart')
    setTimeout(() => setIsAdding(false), 800)
  }

  /* Spotlight: actualiza CSS vars con la posición del mouse */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width)  * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100
    card.style.setProperty('--mouse-x', `${x}%`)
    card.style.setProperty('--mouse-y', `${y}%`)
  }, [])

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <Link href={`/tienda/${product.slug}`} style={{ textDecoration:'none', color:'inherit', display:'block', height:'100%' }}>
      <article
        ref={cardRef}
        className="product-card"
        style={{ height:'100%', display:'flex', flexDirection:'column' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => product.images.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
      >
        {/* ── Imagen ── */}
        <div className="card-img" style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden', backgroundColor:'#f4f2f0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[imgIdx]}
            alt={product.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          />

          {/* Gradient overlay */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'55%', background:'linear-gradient(to top, rgba(33,31,30,.65) 0%, transparent 100%)', pointerEvents:'none' }} />

          {/* ── Badges ── */}
          <div style={{ position:'absolute', top:'12px', left:'12px', display:'flex', flexDirection:'column', gap:'6px', zIndex:3 }}>
            {product.badge && (
              <span
                className="animate-badge-pulse"
                style={{
                  background:
                    product.badge === 'Premium' ? '#211f1e' :
                    product.badge === 'Nuevo'   ? '#1a6b3a' : '#c1692b',
                  color:'#fff', padding:'4px 10px', borderRadius:'6px',
                  fontSize:'10px', fontWeight:'800', letterSpacing:'1px',
                  textTransform:'uppercase',
                  boxShadow: product.badge === 'Nuevo'
                    ? '0 0 12px rgba(26,107,58,.6)'
                    : '0 0 12px rgba(193,105,43,.6)',
                }}
              >
                {product.badge}
              </span>
            )}
            {discount && (
              <span style={{
                background:'rgba(33,31,30,.88)', backdropFilter:'blur(8px)',
                color:'#fff', padding:'4px 10px', borderRadius:'6px',
                fontSize:'11px', fontWeight:'700',
                boxShadow:'0 2px 8px rgba(0,0,0,.3)',
              }}>
                -{discount}%
              </span>
            )}
          </div>

          {/* ── Wishlist ── */}
          <button
            onClick={e => { e.preventDefault(); toggleWishlist(product.id) }}
            style={{
              position:'absolute', top:'12px', right:'12px', zIndex:3,
              width:'36px', height:'36px', borderRadius:'50%',
              background: wishlisted ? 'rgba(193,105,43,.9)' : 'rgba(255,255,255,.92)',
              backdropFilter:'blur(8px)',
              border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
              boxShadow: wishlisted
                ? '0 0 16px rgba(193,105,43,.6), 0 2px 8px rgba(0,0,0,.2)'
                : '0 2px 8px rgba(0,0,0,.15)',
              transform: wishlisted ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <Heart
              size={15}
              fill={wishlisted ? '#fff' : 'none'}
              color={wishlisted ? '#fff' : '#393738'}
            />
          </button>

          {/* ── Botón agregar — sube con bounce ── */}
          <div className="add-btn" style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:'1px', zIndex:3 }}>
            <button
              onClick={handleAdd}
              style={{
                flex:1, padding:'14px 12px',
                background: isAdding
                  ? 'linear-gradient(135deg, #1a6b3a, #22874a)'
                  : 'linear-gradient(135deg, #c1692b, #e88c4a)',
                color:'#fff', border:'none', cursor:'pointer',
                fontWeight:'800', fontSize:'12px', letterSpacing:'1px',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
                transition:'all .3s ease',
                position:'relative', overflow:'hidden',
              }}
            >
              {/* Shine sweep en hover */}
              <span style={{
                position:'absolute', top:0, left:'-100%', width:'60%', height:'100%',
                background:'linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)',
                transform:'skewX(-20deg)', pointerEvents:'none',
              }} className="shine" />
              {isAdding ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  AGREGADO
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  AGREGAR
                </>
              )}
            </button>

            <Link
              href={`/tienda/${product.slug}`}
              onClick={e => e.stopPropagation()}
              style={{
                width:'48px',
                background:'rgba(33,31,30,.88)', backdropFilter:'blur(8px)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', transition:'background .2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#c1692b'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(33,31,30,.88)'}
            >
              <Eye size={15} />
            </Link>
          </div>
        </div>

        {/* ── Info ── */}
        <div style={{ padding:'16px 16px 20px', flex:1, display:'flex', flexDirection:'column' }}>
          <p style={{
            fontSize:'11px', color:'#7a7675', fontWeight:'600',
            letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'5px',
          }}>
            {product.category}
          </p>
          <p className="line-clamp-2" style={{ fontSize:'14px', fontWeight:'600', color:'#211f1e', lineHeight:'1.4', marginBottom:'12px', minHeight:'2.8em' }}>
            {product.name}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{
                fontSize:'19px', fontWeight:'800', color:'#c1692b',
                filter:'drop-shadow(0 0 4px rgba(193,105,43,.3))',
              }}>
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize:'13px', color:'#7a7675', textDecoration:'line-through' }}>
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Indicador stock */}
            {product.inStock ? (
              <span style={{
                display:'flex', alignItems:'center', gap:'4px',
                fontSize:'10px', color:'#1a6b3a', fontWeight:'700',
                letterSpacing:'0.5px',
              }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#1a6b3a', boxShadow:'0 0 6px rgba(26,107,58,.6)', flexShrink:0 }} />
                Stock
              </span>
            ) : (
              <span style={{ fontSize:'10px', color:'#7a7675', fontWeight:'600' }}>Agotado</span>
            )}
          </div>

          {/* Tallas rápidas si existen */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ display:'flex', gap:'4px', marginTop:'10px', flexWrap:'wrap' }}>
              {product.sizes.slice(0, 4).map(size => (
                <span key={size} style={{
                  padding:'2px 7px', borderRadius:'4px',
                  border:'1px solid #e8e5e2', fontSize:'10px',
                  fontWeight:'600', color:'#7a7675',
                  transition:'all .2s',
                }}>
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span style={{ padding:'2px 7px', borderRadius:'4px', border:'1px solid #e8e5e2', fontSize:'10px', color:'#c1692b', fontWeight:'700' }}>
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
