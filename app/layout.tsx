import type { Metadata } from 'next'
import './globals.css'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'
import { ToastProvider } from '@/components/ui/Toast'
import { StoreJsonLd } from '@/components/ui/JsonLd'

const BASE = 'https://puntonorte.shop'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Punto Norte — Moda y Accesorios',
    template: '%s | Punto Norte',
  },
  description: 'Tienda online de ropa, accesorios, perfumes y cargadores. Calidad premium con envíos a toda Venezuela desde Barcelona, Anzoátegui.',
  keywords: ['ropa', 'accesorios', 'perfumes', 'moda', 'dama', 'caballero', 'Venezuela', 'Barcelona', 'Anzoátegui'],
  openGraph: {
    title: 'Punto Norte — Moda y Accesorios',
    description: 'Ropa, accesorios, perfumes y más. Envíos a toda Venezuela.',
    url: BASE,
    siteName: 'Punto Norte',
    locale: 'es_VE',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <StoreJsonLd />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <ToastProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ToastProvider>
      </body>
    </html>
  )
}
