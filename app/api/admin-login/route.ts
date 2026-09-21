import { NextResponse } from 'next/server'
import { createAdminSession, isAdminCredentialsValid } from '../../../lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail et mot de passe requis.' }, { status: 400 })
    }

    if (!(await isAdminCredentialsValid(email, password))) {
      return NextResponse.json({ error: 'Adresse e-mail ou mot de passe incorrect.' }, { status: 401 })
    }

    await createAdminSession()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Erreur lors de la connexion.' }, { status: 500 })
  }
}
