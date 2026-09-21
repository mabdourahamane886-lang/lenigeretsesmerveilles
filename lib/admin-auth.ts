import { cookies } from 'next/headers'

const COOKIE_NAME = 'niger_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

// Administrateur unique de l'application.
// L'adresse est volontairement figée. Le mot de passe reste hors du dépôt GitHub.
const ADMIN_EMAIL = 'mabdourahamane8886@gmail.com'

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || ''
}

function toBase64Url(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  return atob(value.replace(/-/g, '+').replace(/_/g, '/'))
}

async function sign(value: string) {
  const secret = getAdminPassword()
  if (!secret) throw new Error('ADMIN_PASSWORD manquant sur le serveur.')

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return toBase64Url(String.fromCharCode(...new Uint8Array(signature)))
}

export function getAdminEmail() {
  return ADMIN_EMAIL
}

export async function isAdminCredentialsValid(email: string, password: string) {
  const configuredPassword = getAdminPassword()
  if (!configuredPassword) return false

  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === configuredPassword
  )
}

export async function createAdminSession() {
  if (!getAdminPassword()) throw new Error('ADMIN_PASSWORD manquant sur le serveur.')

  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  const payload = toBase64Url(JSON.stringify({ email: ADMIN_EMAIL, exp }))
  const signature = await sign(payload)
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw || !getAdminPassword()) return false

  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return false

  try {
    const expectedSignature = await sign(payload)
    if (signature.length !== expectedSignature.length || signature !== expectedSignature) return false

    const payloadJson = JSON.parse(fromBase64Url(payload)) as { email?: string; exp?: number }
    return (
      payloadJson.email === ADMIN_EMAIL &&
      typeof payloadJson.exp === 'number' &&
      payloadJson.exp > Math.floor(Date.now() / 1000)
    )
  } catch {
    return false
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
