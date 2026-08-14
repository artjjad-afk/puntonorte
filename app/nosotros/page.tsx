'use client'
import Link from 'next/link'
import { MapPin, Phone, Clock, Star, ShieldCheck, Truck, HeartHandshake } from 'lucide-react'

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const valores = [
  { icon: <ShieldCheck size={28} color="#c1692b" />, titulo: 'Calidad Garantizada', desc: 'Cada producto pasa por una selección rigurosa antes de llegar a tus manos. Solo ofrecemos lo que usaríamos nosotros mismos.' },
  { icon: <HeartHandshake size={28} color="#c1692b" />, titulo: 'Atención Personalizada', desc: 'Somos personas reales atendiendo personas reales. Cada consulta por WhatsApp es respondida con dedicación y rapidez.' },
  { icon: <Truck size={28} color="#c1692b" />, titulo: 'Envíos a Todo el País', desc: 'Desde Barcelona, Anzoátegui, llegamos a cada rincón de Venezuela. Tu pedido llega donde tú estés.' },
  { icon: <Star size={28} color="#c1692b" />, titulo: 'Estilo para Todos', desc: 'Moda para dama y caballero, accesorios, perfumes y tecnología. Un solo lugar para todo lo que necesitas.' },
]

export default function NosotrosPage() {
  return (
    <>
      <style>{`
        .valor-card { background:#fff; border-radius:16px; padding:28px; border:1px solid #e8e5e2; transition:all .3s; }
        .valor-card:hover { border-color:#c1692b; box-shadow:0 8px 32px rgba(193,105,43,0.1); transform:translateY(-4px); }
      `}</style>

      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg, #211f1e 0%, #393738 100%)', padding:'80px 32px', position:'relative', overflow:'hidden', textAlign:'center' }}>
        <div style={{ position:'absolute', top:'-100px', left:'50%', transform:'translateX(-50%)', width:'500px', height:'500px', borderRadius:'50%', border:'1px solid rgba(193,105,43,0.1)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'700px', margin:'0 auto' }}>
          <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Quiénes somos</p>
          <h1 style={{ color:'#fff', fontSize:'clamp(32px, 5vw, 52px)', fontWeight:'800', letterSpacing:'-1.5px', margin:'0 0 20px', lineHeight:'1.1' }}>
            Una tienda con <span className="text-gradient">propósito</span>
          </h1>
          <p style={{ color:'rgba(232,229,226,0.65)', fontSize:'17px', lineHeight:'1.8', margin:0 }}>
            Nacimos con una idea simple: que cada venezolano pueda acceder a moda de calidad, con precios justos y desde la comodidad de su casa.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section style={{ padding:'80px 32px', background:'#fff' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'center' }}>
          <div>
            <p className="section-label" style={{ marginBottom:'14px' }}>Nuestra historia</p>
            <h2 style={{ fontSize:'clamp(26px, 4vw, 38px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px', lineHeight:'1.2', marginBottom:'24px' }}>
              Comenzamos pequeños,<br />pensando en grande
            </h2>
            <p style={{ color:'#393738', fontSize:'16px', lineHeight:'1.85', marginBottom:'20px' }}>
              Punto Norte nació en Barcelona, Anzoátegui, con la visión de crear una tienda online donde la calidad no fuera un lujo sino un estándar. Empezamos seleccionando piezas cuidadosamente — ropa, accesorios, perfumes y tecnología — pensando siempre en lo que nuestros clientes realmente necesitan.
            </p>
            <p style={{ color:'#393738', fontSize:'16px', lineHeight:'1.85', marginBottom:'32px' }}>
              Hoy hacemos envíos a todo el territorio nacional y atendemos a cientos de clientes satisfechos que confían en nosotros para vestir, regalar y lucir siempre bien.
            </p>
            <div style={{ display:'flex', gap:'32px' }}>
              {[['500+','Clientes'], ['200+','Productos'], ['5★','Rating']].map(([v, l]) => (
                <div key={l}>
                  <p style={{ fontSize:'28px', fontWeight:'800', color:'#c1692b', margin:'0 0 2px', letterSpacing:'-0.5px' }}>{v}</p>
                  <p style={{ fontSize:'13px', color:'#7a7675', margin:0 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position:'relative' }}>
            <div style={{ borderRadius:'20px', overflow:'hidden', aspectRatio:'4/5' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&q=85" alt="Punto Norte tienda" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            <div style={{ position:'absolute', bottom:'-20px', left:'-20px', background:'#211f1e', borderRadius:'16px', padding:'20px 24px', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
              <p style={{ color:'#c1692b', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', margin:'0 0 4px' }}>UBICACIÓN</p>
              <p style={{ color:'#fff', fontWeight:'700', fontSize:'14px', margin:0 }}>Barcelona, Anzoátegui</p>
              <p style={{ color:'rgba(232,229,226,0.5)', fontSize:'12px', margin:'2px 0 0' }}>Envíos a toda Venezuela</p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section style={{ padding:'80px 32px', background:'#f9f7f5' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'52px' }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Nuestros valores</p>
            <h2 style={{ fontSize:'clamp(26px, 4vw, 38px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px' }}>
              Lo que nos define
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px' }}>
            {valores.map((v, i) => (
              <div key={i} className="valor-card">
                <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'rgba(193,105,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'18px' }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#211f1e', marginBottom:'10px' }}>{v.titulo}</h3>
                <p style={{ fontSize:'14px', color:'#7a7675', lineHeight:'1.75', margin:0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section style={{ padding:'80px 32px', background:'#211f1e' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto', textAlign:'center' }}>
          <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Contáctanos</p>
          <h2 style={{ color:'#fff', fontSize:'clamp(26px, 4vw, 38px)', fontWeight:'800', letterSpacing:'-1px', marginBottom:'16px' }}>
            Estamos aquí para ti
          </h2>
          <p style={{ color:'rgba(232,229,226,0.6)', fontSize:'16px', lineHeight:'1.8', marginBottom:'40px' }}>
            ¿Tienes alguna pregunta? Escríbenos por WhatsApp y te respondemos al instante.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px', alignItems:'center' }}>
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center' }}>
              <a href="https://wa.me/584140906768" target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'#25d366', color:'#fff', padding:'14px 28px', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'14px' }}>
                <Phone size={16} /> +58 414-0906768
              </a>
              <a href="https://www.instagram.com/puntonorte.shop?igsh=a2pxaDRteGd2NmJx" target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', padding:'14px 28px', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'14px' }}>
                <InstagramIcon /> @puntonorte.shop
              </a>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'rgba(232,229,226,0.5)', fontSize:'14px', marginTop:'8px' }}>
              <MapPin size={14} color="#c1692b" />
              <span>Barcelona, Anzoátegui, Venezuela</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'rgba(232,229,226,0.5)', fontSize:'14px' }}>
              <Clock size={14} color="#c1692b" />
              <span>Lunes a Sábado · 9:00 AM – 7:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'60px 32px', background:'#f9f7f5', textAlign:'center' }}>
        <h2 style={{ fontSize:'clamp(22px, 3vw, 32px)', fontWeight:'800', color:'#211f1e', marginBottom:'20px', letterSpacing:'-0.5px' }}>
          ¿Listo para encontrar tu estilo?
        </h2>
        <Link href="/tienda" className="btn-primary" style={{ padding:'15px 40px', borderRadius:'12px', fontSize:'14px' }}>
          Explorar la tienda →
        </Link>
      </section>
    </>
  )
}
