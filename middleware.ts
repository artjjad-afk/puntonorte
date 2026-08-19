import { NextRequest, NextResponse } from 'next/server'

// Verifica JWT usando Web Crypto API (compatible con Edge Runtime)
async function verifyJWT(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
      'raw', keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify']
    )

    const data = encoder.encode(`${parts[0]}.${parts[1]}`)
    const signature = Uint8Array.from(
      atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    )

    const valid = await crypto.subtle.verify('HMAC', key, signature, data)
    if (!valid) return false

    // Verificar expiración
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // Padding necesario para atob
    const padded = payloadBase64 + '='.repeat((4 - payloadBase64.length % 4) % 4)
    let payload: { exp?: number }
    try {
      payload = JSON.parse(atob(padded))
    } catch {
      return false
    }
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return false

    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value
    const secret = process.env.JWT_SECRET

    if (!token || !secret) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const valid = await verifyJWT(token, secret)
    if (!valid) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url))
      response.cookies.delete('admin_token')
      return response
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
