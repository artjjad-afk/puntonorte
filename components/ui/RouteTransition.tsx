'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/**
 * Transición de marca entre páginas.
 * Aparece SIEMPRE al navegar (efecto "wow"), se mantiene un mínimo fijo
 * y sale con fade-out suave. No se muestra en la carga inicial (de eso
 * se encarga InitialLoader).
 */
const HOLD_MS = 850   // tiempo mínimo visible
const FADE_MS = 550   // duración del fade-out

export function RouteTransition() {
  const pathname = usePathname()
  const firstRef = useRef(true)
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Saltar la primera carga (la cubre InitialLoader)
    if (firstRef.current) { firstRef.current = false; return }

    setVisible(true)
    setLeaving(false)
    const hold = window.setTimeout(() => setLeaving(true), HOLD_MS)
    const remove = window.setTimeout(() => setVisible(false), HOLD_MS + FADE_MS)
    return () => { window.clearTimeout(hold); window.clearTimeout(remove) }
  }, [pathname])

  if (!visible) return null

  return (
    <div className={`pn-loader${leaving ? ' pn-loader--out' : ''}`} role="status" aria-label="Cargando">
      <div className="pn-loader__halo" />
      <div className="pn-loader__badge">
        <div className="pn-loader__ring" />
        <div className="pn-loader__ring2" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-removebg-preview.png" alt="Punto Norte" className="pn-loader__logo" width={84} height={84} />
      </div>
      <div className="pn-loader__word">Punto Norte</div>
      <div className="pn-loader__bar" />
      <div className="pn-loader__text">Cargando</div>
    </div>
  )
}
