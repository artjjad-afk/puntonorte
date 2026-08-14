'use client'
import Link from 'next/link'
import { Home, ShoppingBag, MessageCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes float404 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .float404 { animation: float404 3s ease-in-out infinite; }
      `}</style>

      <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 32px', textAlign:'center', background:'#f9f7f5', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-100px', right:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(193,105,43,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-80px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(33,31,30,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div className="float404" style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'clamp(80px, 15vw, 140px)', fontWeight:'800', color:'#211f1e', lineHeight:'1', letterSpacing:'-4px', position:'relative' }}>
            4<span className="text-gradient">0</span>4
          </div>
        </div>

        <h1 style={{ fontSize:'clamp(22px, 4vw, 32px)', fontWeight:'800', color:'#211f1e', margin:'0 0 14px', letterSpacing:'-0.5px' }}>
          Página no encontrada
        </h1>
        <p style={{ color:'#7a7675', fontSize:'16px', maxWidth:'400px', lineHeight:'1.7', marginBottom:'40px' }}>
          La página que buscas no existe o fue movida. Pero no te preocupes, tenemos mucho más para mostrarte.
        </p>

        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center' }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#211f1e', color:'#fff', padding:'14px 24px', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'14px', transition:'all .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#393738')}
            onMouseLeave={e => (e.currentTarget.style.background = '#211f1e')}>
            <Home size={16} /> Ir al inicio
          </Link>
          <Link href="/tienda" className="btn-primary" style={{ padding:'14px 24px', borderRadius:'12px', fontSize:'14px', display:'inline-flex', alignItems:'center', gap:'8px' }}>
            <ShoppingBag size={16} /> Ver tienda
          </Link>
          <a href="https://wa.me/584140906768" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#25d366', color:'#fff', padding:'14px 24px', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'14px' }}>
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </div>
    </>
  )
}
