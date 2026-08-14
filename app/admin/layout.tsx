import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './_theme/tokens.css'
import './_theme/console.css'
import './admin.css'
import { ConsoleShell } from '@/components/admin/ConsoleShell'

/* Tipografía de la consola:
   - Space Grotesk → mando / titulares   (--font-display)
   - IBM Plex Mono → datos / telemetría   (--font-mono)
   next/font inyecta las variables CSS que tokens.css declara como fallback. */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Consola — Punto Norte', template: '%s · Consola' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${mono.variable}`}>
      {/* La consola pinta su propio vacío; forzamos el body a negro absoluto
          para que ningún borde claro del storefront se filtre. */}
      <style>{`body { background: var(--void) !important; margin: 0; }`}</style>
      <ConsoleShell>{children}</ConsoleShell>
    </div>
  )
}
