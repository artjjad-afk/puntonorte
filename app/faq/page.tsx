'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { FaqJsonLd } from '@/components/ui/JsonLd'

const faqs = [
  {
    cat: 'Pedidos',
    preguntas: [
      { q: '¿Cómo hago un pedido?', a: 'Es muy sencillo: explora la tienda, agrega los productos al carrito, completa tus datos y confirma por WhatsApp. En minutos recibirás respuesta de un asesor.' },
      { q: '¿Puedo cambiar o cancelar mi pedido?', a: 'Sí, puedes cambiar o cancelar tu pedido antes de realizar el pago. Escríbenos por WhatsApp lo antes posible y lo gestionamos sin problema.' },
      { q: '¿Tienen stock de todos los productos que aparecen?', a: 'Mantenemos el catálogo actualizado, pero si por algún motivo un producto no está disponible, te lo informamos de inmediato y te ofrecemos alternativas.' },
      { q: '¿Puedo pedir varios productos en un solo pedido?', a: 'Por supuesto. Puedes agregar todos los productos que quieras al carrito y hacer un solo pedido. Eso puede ayudarte a optimizar el costo de envío.' },
    ]
  },
  {
    cat: 'Pagos',
    preguntas: [
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos Zelle (USD), Pago Móvil (bolívares) y Efectivo USD. Si tienes otro método, consúltanos por WhatsApp y buscamos una solución.' },
      { q: '¿Los precios están en dólares?', a: 'Sí, todos nuestros precios están en USD. Si pagas por Pago Móvil, el monto en bolívares se calcula según la tasa del BCV del día del pago.' },
      { q: '¿Es seguro pagar con Zelle?', a: 'Sí. El pago por Zelle es directo entre tu banco y el nuestro, sin intermediarios. Solo te pedimos el comprobante de la transferencia para confirmar tu pedido.' },
      { q: '¿Cuándo confirman mi pedido?', a: 'Confirmamos tu pedido en un máximo de 2 horas hábiles después de recibir el comprobante de pago. Te notificamos por el mismo WhatsApp.' },
    ]
  },
  {
    cat: 'Envíos',
    preguntas: [
      { q: '¿Hacen envíos a todo Venezuela?', a: 'Sí, hacemos envíos a nivel nacional desde Barcelona, Anzoátegui. Los tiempos varían entre 1 y 5 días hábiles según tu ubicación.' },
      { q: '¿Cuánto cuesta el envío?', a: 'El costo de envío se calcula según tu ubicación y el peso del paquete. Te lo informamos exactamente por WhatsApp antes de confirmar, sin sorpresas.' },
      { q: '¿Puedo rastrear mi pedido?', a: 'Sí. Una vez enviado tu paquete, te compartimos el número de guía por WhatsApp para que puedas rastrear tu envío en tiempo real.' },
      { q: '¿Qué pasa si mi paquete llega dañado?', a: 'Empacamos cada pedido con cuidado, pero si tu paquete llega dañado, escríbenos de inmediato con fotos y lo resolvemos. Tu satisfacción es nuestra prioridad.' },
    ]
  },
  {
    cat: 'Productos',
    preguntas: [
      { q: '¿Las tallas son exactas?', a: 'Seguimos el tallaje estándar latinoamericano. En cada producto indicamos las tallas disponibles. Si tienes dudas sobre tu talla, escríbenos y te asesoramos.' },
      { q: '¿Los perfumes son originales?', a: 'Sí, todos nuestros perfumes son originales. Trabajamos únicamente con proveedores verificados para garantizar la autenticidad de cada fragancia.' },
      { q: '¿Los cargadores son compatibles con mi teléfono?', a: 'En la descripción de cada cargador indicamos la compatibilidad. Si tienes dudas específicas sobre tu dispositivo, consúltanos por WhatsApp.' },
      { q: '¿Hacen devoluciones?', a: 'Aceptamos cambios dentro de los 7 días siguientes a la entrega, siempre que el producto esté en su estado original. Escríbenos por WhatsApp para gestionar el cambio.' },
    ]
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:'1px solid #e8e5e2', overflow:'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px',
        padding:'20px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left',
      }}>
        <span style={{ fontSize:'15px', fontWeight:'600', color:'#211f1e', lineHeight:'1.4' }}>{q}</span>
        <ChevronDown size={18} color="#c1692b" style={{ flexShrink:0, transition:'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ paddingBottom:'20px' }}>
          <p style={{ fontSize:'14px', color:'#393738', lineHeight:'1.8', margin:0 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg, #211f1e 0%, #393738 100%)', padding:'80px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:'-80px', left:'-80px', width:'300px', height:'300px', borderRadius:'50%', border:'1px solid rgba(193,105,43,0.1)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'600px', margin:'0 auto' }}>
          <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Soporte</p>
          <h1 style={{ color:'#fff', fontSize:'clamp(30px, 5vw, 48px)', fontWeight:'800', letterSpacing:'-1.5px', margin:'0 0 16px', lineHeight:'1.1' }}>
            Preguntas <span className="text-gradient">frecuentes</span>
          </h1>
          <p style={{ color:'rgba(232,229,226,0.65)', fontSize:'16px', lineHeight:'1.8', margin:0 }}>
            Resolvemos tus dudas más comunes. Si no encuentras lo que buscas, escríbenos por WhatsApp.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding:'80px 32px', background:'#fff' }}>
        <div style={{ maxWidth:'780px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'48px' }}>
          {faqs.map((cat, i) => (
            <div key={i}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#c1692b', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontSize:'12px', fontWeight:'800' }}>{String(i+1).padStart(2,'0')}</span>
                </div>
                <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#211f1e', margin:0, letterSpacing:'-0.3px' }}>{cat.cat}</h2>
              </div>
              <div style={{ background:'#f9f7f5', borderRadius:'16px', padding:'0 24px' }}>
                {cat.preguntas.map((item, j) => (
                  <FaqItem key={j} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'60px 32px', background:'#f9f7f5', textAlign:'center' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'20px', background:'#25d366', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <MessageCircle size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize:'clamp(20px, 3vw, 28px)', fontWeight:'800', color:'#211f1e', marginBottom:'12px', letterSpacing:'-0.5px' }}>
            ¿No encontraste tu respuesta?
          </h2>
          <p style={{ color:'#7a7675', fontSize:'15px', marginBottom:'28px', lineHeight:'1.7' }}>
            Escríbenos por WhatsApp y un asesor te responde en minutos.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="https://wa.me/584140906768?text=Hola%2C%20tengo%20una%20pregunta" target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#25d366', color:'#fff', padding:'14px 28px', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'14px' }}>
              <MessageCircle size={16} /> Escribir por WhatsApp
            </a>
            <Link href="/tienda" className="btn-primary" style={{ padding:'14px 28px', borderRadius:'12px', fontSize:'14px' }}>
              Ver tienda →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
