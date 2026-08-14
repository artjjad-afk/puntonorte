import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ valid: false }, { status: 401 })

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}
