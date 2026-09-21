import { NextResponse } from 'next/server'
import { createAdminSession } from '../../../lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail et mot de passe requis.' }, { status: 400 })
    }

    if (!adminEmail || !adminPassword || !process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json({ error: 'La connexion administrateur n’est pas configurée sur le serveur.' }, { status: 503 })
    }

    if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() || password !== adminPassword) {
      return NextResponse.json({ error: 'Adresse e-mail ou mot de passe incorrect.' }, { status: 401 })
    }

    await createAdminSession(adminEmail)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Erreur lors de la connexion.' }, { status: 500 })
  }
}
