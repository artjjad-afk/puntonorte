import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const validUser = process.env.ADMIN_USERNAME
    const validPass = process.env.ADMIN_PASSWORD
    const secret = process.env.JWT_SECRET

    if (!validUser || !validPass || !secret) {
      console.error('Variables de entorno ADMIN_USERNAME, ADMIN_PASSWORD o JWT_SECRET no configuradas')
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 })
    }

    if (username !== validUser || password !== validPass) {
      // Delay artificial para prevenir timing attacks
      await new Promise(r => setTimeout(r, 500))
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      secret,
      { expiresIn: '24h' }
    )

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
