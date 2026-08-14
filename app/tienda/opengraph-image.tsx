import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Punto Norte — Moda y Accesorios'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#211f1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ fontSize: '72px', fontWeight: '900', color: '#fff', letterSpacing: '-2px', marginBottom: '16px' }}>PUNTO NORTE</div>
        <div style={{ fontSize: '24px', color: '#c1692b', letterSpacing: '4px', fontWeight: '600' }}>MODA & ACCESORIOS</div>
        <div style={{ marginTop: '24px', fontSize: '18px', color: 'rgba(232,229,226,0.5)' }}>Barcelona, Anzoátegui · Venezuela</div>
      </div>
    ),
    { ...size }
  )
}
