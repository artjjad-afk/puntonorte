'use client'

/* ============================================================================
   CONSOLE SHELL · Punto Norte Admin Console
   ----------------------------------------------------------------------------
   Encapsula el lenguaje visual de /admin: el vacío L0 (light-map + grano +
   retícula técnica), monta el NavDock flotante y expone el escenario de
   contenido. La ruta de login queda EXENTA: tiene su propio diseño a pantalla
   completa, así que el shell la deja pasar sin cromo.
   ========================================================================== */

import { usePathname } from 'next/navigation'
import { NavDock } from './NavDock'

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // El login se renderiza tal cual (sin fondo de consola ni dock).
  if (pathname?.startsWith('/admin/login')) {
    return <>{children}</>
  }

  return (
    <div className="console">
      <main className="console-stage">{children}</main>
      <NavDock />
    </div>
  )
}
