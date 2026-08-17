'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, ZoomIn } from 'lucide-react'

interface Props {
  src: string
  alt: string
}

export function ImageZoom({ src, alt }: Props) {
  const [open, setOpen]     = useState(false)
  const [pos, setPos]       = useState({ x: 50, y: 50 })
  const [zoomed, setZoomed] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    setZoomed(false)
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, close])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ver detalle de imagen"
        style={{
          position: 'absolute', bottom: '12px', right: '12px',
          background: 'rgba(33,31,30,0.7)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
          color: '#fff', padding: '6px 10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '11px', fontWeight: '600', zIndex: 2,
        }}
      >
        <ZoomIn size={13} /> Ver detalle
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={close}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.92)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={close}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '10px', color: '#fff',
              width: '44px', height: '44px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>

          {/* Imagen con zoom */}
          <div
            onClick={e => { e.stopPropagation(); setZoomed(z => !z) }}
            onMouseMove={zoomed ? handleMouseMove : undefined}
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              overflow: 'hidden', borderRadius: '16px',
              cursor: zoomed ? 'zoom-out' : 'zoom-in',
              position: 'relative',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: '90vw', maxHeight: '90vh',
                objectFit: 'contain', display: 'block',
                transform: zoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: zoomed ? `${pos.x}% ${pos.y}%` : 'center',
                transition: zoomed ? 'none' : 'transform .3s ease',
              }}
            />
          </div>

          <p style={{
            position: 'absolute', bottom: '20px',
            color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '1px',
          }}>
            {zoomed ? 'MUEVE EL CURSOR · CLICK PARA ALEJAR' : 'CLICK PARA AMPLIAR · ESC PARA CERRAR'}
          </p>
        </div>
      )}
    </>
  )
}
