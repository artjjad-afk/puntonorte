'use client'
import { useEffect, useState } from 'react'

/**
 * Loader de carga inicial a pantalla completa.
 * Se renderiza en el layout raíz (fuera de PageTransition), por lo que
 * cubre TODO — navbar incluido — y aparece al instante porque va en el
 * HTML del servidor.
 *
 * Se oculta cuando ocurre lo primero de:
 *   1. La home dispara el evento `pn:ready` (sus datos ya cargaron).
 *   2. El navegador termina de cargar (`window load`).
 *   3. Tope de seguridad a los 6s (evita cuelgues en móvil).
 * Respeta un tiempo mínimo en pantalla para que no "parpadee".
 */
export function InitialLoader() {
  const [out, setOut] = useState(false)   // dispara el fade-out
  const [gone, setGone] = useState(false) // desmonta tras el fade

  useEffect(() => {
    const MIN_MS = 900          // tiempo mínimo visible
    const CAP_MS = 6000         // tope de seguridad
    const start = performance.now()
    let done = false

    const finish = () => {
      if (done) return
      done = true
      setOut(true)
      window.setTimeout(() => setGone(true), 650) // coincide con la transición CSS
    }

    const hideRespectingMin = () => {
      const wait = Math.max(0, MIN_MS - (performance.now() - start))
      window.setTimeout(finish, wait)
    }

    window.addEventListener('pn:ready', hideRespectingMin)
    window.addEventListener('load', hideRespectingMin)
    const cap = window.setTimeout(finish, CAP_MS)

    // Si la página ya está totalmente cargada al montar, arranca el cierre.
    if (document.readyState === 'complete') hideRespectingMin()

    return () => {
      window.removeEventListener('pn:ready', hideRespectingMin)
      window.removeEventListener('load', hideRespectingMin)
      window.clearTimeout(cap)
    }
  }, [])

  if (gone) return null

  return (
    <div className={`pn-loader${out ? ' pn-loader--out' : ''}`} role="status" aria-label="Cargando">
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
