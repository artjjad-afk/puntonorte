'use client'
import Link from 'next/link'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, total } = useCartStore()

  return (
    <>
      <style>{`
        .cart-drawer { position:fixed; top:0; right:0; height:100vh; width:100%; max-width:420px; background:#fff; z-index:50; display:flex; flex-direction:column; box-shadow:-4px 0 40px rgba(0,0,0,0.15); transition:transform .3s cubic-bezier(0.4,0,0.2,1); }
        @media(max-width:480px){ .cart-drawer{ max-width:100% !important; border-radius:20px 20px 0 0; top:auto !important; height:92vh; bottom:0; } }
      `}</style>

      {/* Overlay */}
      {isOpen && (
        <div onClick={closeCart} style={{ position:'fixed', inset:0, background:'rgba(33,31,30,0.5)', backdropFilter:'blur(2px)', zIndex:40 }} />
      )}

      {/* Drawer */}
      <div className="cart-drawer" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #e8e5e2', flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:'18px', fontWeight:'800', color:'#211f1e', margin:0 }}>Mi Carrito</h2>
            <p style={{ fontSize:'13px', color:'#7a7675', margin:0 }}>{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button onClick={closeCart} style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#f9f7f5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#393738' }}>
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
          {items.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:'16px', color:'#7a7675', textAlign:'center' }}>
              <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#f9f7f5', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ShoppingBag size={32} strokeWidth={1.5} color="#7a7675" />
              </div>
              <div>
                <p style={{ fontSize:'16px', fontWeight:'700', color:'#211f1e', margin:'0 0 6px' }}>Tu carrito está vacío</p>
                <p style={{ fontSize:'14px', margin:0 }}>Agrega productos para continuar</p>
              </div>
              <button onClick={closeCart} className="btn-primary" style={{ padding:'12px 28px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'14px' }}>
                Ver productos
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize ?? ''}-${item.selectedColor ?? ''}`} style={{ display:'flex', gap:'12px', padding:'14px', background:'#f9f7f5', borderRadius:'14px', border:'1px solid #e8e5e2' }}>
                  {/* Imagen */}
                  <div style={{ width:'72px', height:'72px', flexShrink:0, borderRadius:'10px', overflow:'hidden', background:'#e8e5e2' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.images[0]} alt={item.product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className="line-clamp-2" style={{ margin:'0 0 3px', fontWeight:'700', fontSize:'13px', color:'#211f1e', lineHeight:'1.4' }}>{item.product.name}</p>
                    {item.selectedSize && <p style={{ margin:'0 0 1px', fontSize:'11px', color:'#7a7675' }}>Talla: {item.selectedSize}</p>}
                    {item.selectedColor && <p style={{ margin:'0 0 8px', fontSize:'11px', color:'#7a7675' }}>Color: {item.selectedColor}</p>}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
                      <div style={{ display:'flex', alignItems:'center', border:'1px solid #e8e5e2', borderRadius:'8px', overflow:'hidden', background:'#fff' }}>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                          style={{ width:'32px', height:'32px', border:'none', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#393738' }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ width:'28px', textAlign:'center', fontSize:'13px', fontWeight:'800', color:'#211f1e' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                          style={{ width:'32px', height:'32px', border:'none', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#393738' }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={{ fontWeight:'800', color:'#c1692b', fontSize:'15px' }}>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  {/* Eliminar */}
                  <button onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#7a7675', alignSelf:'flex-start', padding:'4px', flexShrink:0 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding:'16px 20px 24px', borderTop:'1px solid #e8e5e2', flexShrink:0, background:'#fff' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <span style={{ fontSize:'15px', color:'#393738', fontWeight:'500' }}>Subtotal</span>
              <span style={{ fontSize:'22px', fontWeight:'800', color:'#211f1e', letterSpacing:'-0.5px' }}>${total().toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="btn-primary" style={{
              display:'flex', alignItems:'center', justifyContent:'center', width:'100%',
              padding:'15px', borderRadius:'12px', fontSize:'15px', marginBottom:'10px', textDecoration:'none',
            }}>
              FINALIZAR COMPRA →
            </Link>
            <button onClick={closeCart} style={{ width:'100%', background:'none', border:'1.5px solid #e8e5e2', padding:'12px', borderRadius:'12px', cursor:'pointer', color:'#393738', fontSize:'14px', fontWeight:'600' }}>
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  )
}
