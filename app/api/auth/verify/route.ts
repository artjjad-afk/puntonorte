import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Rate limiting simple en memoria — máx 20 requests por IP por minuto
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= 20) return false

  entry.count++
  return true
}

// Limpiar entradas expiradas cada 5 minutos para evitar memory leak
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip)
  }
}, 5 * 60_000)

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           ?? req.headers.get('x-real-ip')
           ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { valid: false, error: 'Demasiadas solicitudes' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const token = req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ valid: false }, { status: 401 })

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}
