'use client'
import Link from 'next/link'
import { Search, ShoppingCart, ClipboardList, MessageCircle, Package, CheckCircle } from 'lucide-react'

const pasos = [
  {
    num: '01', icon: <Search size={24} color="#c1692b" />,
    titulo: 'Explora el catálogo',
    desc: 'Navega por nuestras categorías: Dama, Caballero, Accesorios, Perfumes y Cargadores. Usa los filtros para encontrar exactamente lo que buscas.',
    tip: 'Tip: Puedes ver dos imágenes de cada producto pasando el mouse por encima.',
  },
  {
    num: '02', icon: <ShoppingCart size={24} color="#c1692b" />,
    titulo: 'Agrega al carrito',
    desc: 'Selecciona tu talla, color y cantidad. Haz clic en "Agregar al carrito". Puedes seguir comprando y agregar más productos.',
    tip: 'Tip: El carrito se guarda aunque cierres el navegador.',
  },
  {
    num: '03', icon: <ClipboardList size={24} color="#c1692b" />,
    titulo: 'Completa tu pedido',
    desc: 'Haz clic en "Finalizar Compra". Llena tus datos de envío (nombre, teléfono, dirección) y elige tu método de pago preferido.',
    tip: 'Tip: Tenemos Zelle, Pago Móvil y Efectivo USD disponibles.',
  },
  {
    num: '04', icon: <MessageCircle size={24} color="#c1692b" />,
    titulo: 'Confirma por WhatsApp',
    desc: 'Al confirmar, se abre automáticamente WhatsApp con el resumen de tu pedido. Envía el mensaje y un asesor te responderá de inmediato.',
    tip: 'Tip: Atendemos de Lunes a Sábado de 9am a 7pm.',
  },
  {
    num: '05', icon: <CheckCircle size={24} color="#c1692b" />,
    titulo: 'Realiza el pago',
    desc: 'Te enviamos los datos de pago según el método que elegiste. Una vez que nos envíes el comprobante, confirmamos tu pedido.',
    tip: 'Tip: Guarda el comprobante de pago por si acaso.',
  },
  {
    num: '06', icon: <Package size={24} color="#c1692b" />,
    titulo: 'Recibe tu pedido',
    desc: 'Coordinamos el envío a tu dirección en toda Venezuela. Te notificamos cuando tu pedido esté en camino con el número de seguimiento.',
    tip: 'Tip: Los envíos nacionales tardan entre 2 y 5 días hábiles.',
  },
]

const metodos = [
  { icon: '🏦', nombre: 'Zelle', desc: 'Transferencia en USD desde cualquier banco americano. Sin comisiones adicionales.', disponible: true },
  { icon: '📱', nombre: 'Pago Móvil', desc: 'Transferencia instantánea entre bancos venezolanos. Desde tu app bancaria en segundos.', disponible: true },
  { icon: '💵', nombre: 'Efectivo USD', desc: 'Pago en efectivo al momento de la entrega o en punto acordado.', disponible: true },
  { icon: '💬', nombre: 'Otro método', desc: 'Si tienes otro método preferido, escríbenos y lo coordinamos juntos.', disponible: true },
]

export default function ComoComprarPage() {
  return (
    <>
      <style>{`
        .paso-card { display:flex; gap:24px; padding:28px; background:#fff; border-radius:16px; border:1px solid #e8e5e2; transition:all .3s; }
        .paso-card:hover { border-color:#c1692b; box-shadow:0 8px 32px rgba(193,105,43,0.08); }
        .metodo-card { padding:24px; background:#fff; border-radius:14px; border:1px solid #e8e5e2; transition:all .3s; }
        .metodo-card:hover { border-color:#c1692b; transform:translateY(-3px); }
        @media(max-width:600px){ .paso-card{ flex-direction:column; gap:16px; } }
      `}</style>

      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg, #211f1e 0%, #393738 100%)', padding:'80px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', border:'1px solid rgba(193,105,43,0.1)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'600px', margin:'0 auto' }}>
          <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Guía de compra</p>
          <h1 style={{ color:'#fff', fontSize:'clamp(30px, 5vw, 48px)', fontWeight:'800', letterSpacing:'-1.5px', margin:'0 0 16px', lineHeight:'1.1' }}>
            Comprar en Punto Norte<br />es <span className="text-gradient">muy sencillo</span>
          </h1>
          <p style={{ color:'rgba(232,229,226,0.65)', fontSize:'16px', lineHeight:'1.8', margin:0 }}>
            Sigue estos 6 pasos y recibe tu pedido en la puerta de tu casa, en cualquier parte de Venezuela.
          </p>
        </div>
      </section>

      {/* Pasos */}
      <section style={{ padding:'80px 32px', background:'#f9f7f5' }}>
        <div style={{ maxWidth:'800px', margin:'0 auto' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {pasos.map((p, i) => (
              <div key={i} className="paso-card">
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', flexShrink:0 }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'rgba(193,105,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {p.icon}
                  </div>
                  {i < pasos.length - 1 && <div style={{ width:'2px', flex:1, background:'#e8e5e2', minHeight:'20px', borderRadius:'1px' }} />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'11px', fontWeight:'800', color:'#c1692b', letterSpacing:'1.5px' }}>{p.num}</span>
                    <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#211f1e', margin:0 }}>{p.titulo}</h3>
                  </div>
                  <p style={{ fontSize:'14px', color:'#393738', lineHeight:'1.75', margin:'0 0 10px' }}>{p.desc}</p>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(193,105,43,0.08)', border:'1px solid rgba(193,105,43,0.2)', borderRadius:'8px', padding:'6px 12px' }}>
                    <span style={{ fontSize:'12px', color:'#c1692b', fontWeight:'600' }}>{p.tip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Métodos de pago */}
      <section style={{ padding:'80px 32px', background:'#fff' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Pagos</p>
            <h2 style={{ fontSize:'clamp(24px, 4vw, 36px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px', marginBottom:'12px' }}>
              Métodos de pago disponibles
            </h2>
            <p style={{ color:'#7a7675', fontSize:'15px', margin:0 }}>Acepta el método que más te convenga</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px' }}>
            {metodos.map((m, i) => (
              <div key={i} className="metodo-card">
                <span style={{ fontSize:'32px', display:'block', marginBottom:'12px' }}>{m.icon}</span>
                <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#211f1e', marginBottom:'8px' }}>{m.nombre}</h3>
                <p style={{ fontSize:'13px', color:'#7a7675', lineHeight:'1.7', margin:0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'60px 32px', background:'#211f1e', textAlign:'center' }}>
        <h2 style={{ color:'#fff', fontSize:'clamp(22px, 3vw, 32px)', fontWeight:'800', letterSpacing:'-0.5px', marginBottom:'12px' }}>
          ¿Tienes alguna duda?
        </h2>
        <p style={{ color:'rgba(232,229,226,0.6)', fontSize:'15px', marginBottom:'28px' }}>
          Escríbenos y te ayudamos en lo que necesites
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="https://wa.me/584140906768?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20cómo%20comprar" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#25d366', color:'#fff', padding:'14px 28px', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'14px' }}>
            <MessageCircle size={16} /> Escribir por WhatsApp
          </a>
          <Link href="/tienda" className="btn-primary" style={{ padding:'14px 28px', borderRadius:'12px', fontSize:'14px' }}>
            Ir a la tienda →
          </Link>
        </div>
      </section>
    </>
  )
}
