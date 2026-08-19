import type { Metadata } from 'next'
import './globals.css'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'
import { ToastProvider } from '@/components/ui/Toast'
import { StoreJsonLd } from '@/components/ui/JsonLd'

const BASE = 'https://puntonorteshop.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Punto Norte — Moda y Accesorios | Barcelona, Venezuela',
    template: '%s | Punto Norte',
  },
  description: 'Tienda online de ropa, accesorios, perfumes y cargadores en Venezuela. Moda dama y caballero con calidad premium. Envíos a todo el país desde Barcelona, Anzoátegui. Pago por Zelle y Pago Móvil.',
  keywords: [
    'ropa venezuela', 'tienda ropa online venezuela', 'moda barcelona anzoategui',
    'accesorios moda venezuela', 'perfumes venezuela', 'ropa dama venezuela',
    'ropa caballero venezuela', 'tienda online venezuela', 'punto norte shop',
    'ropa online barcelona venezuela', 'perfumes baratos venezuela',
    'accesorios mujer venezuela', 'moda online venezuela', 'ropa con envio venezuela',
    'zelle ropa venezuela', 'pago movil ropa', 'cargadores venezuela',
  ],
  authors: [{ name: 'Punto Norte', url: BASE }],
  creator: 'Punto Norte',
  publisher: 'Punto Norte',
  alternates: {
    canonical: BASE,
  },
  openGraph: {
    title: 'Punto Norte — Moda y Accesorios | Venezuela',
    description: 'Ropa dama y caballero, accesorios, perfumes y más. Calidad premium con envíos a toda Venezuela. Pago por Zelle y Pago Móvil.',
    url: BASE,
    siteName: 'Punto Norte',
    locale: 'es_VE',
    type: 'website',
    images: [
      {
        url: `${BASE}/logo.png`,
        width: 512,
        height: 512,
        alt: 'Punto Norte — Moda y Accesorios Venezuela',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Punto Norte — Moda y Accesorios Venezuela',
    description: 'Ropa, accesorios y perfumes premium. Envíos a toda Venezuela.',
    images: [`${BASE}/logo.png`],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'f9b3081073f81ab5',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <StoreJsonLd />
        <ToastProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ToastProvider>
      </body>
    </html>
  )
}
