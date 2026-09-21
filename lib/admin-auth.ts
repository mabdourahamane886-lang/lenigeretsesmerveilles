import { cookies } from 'next/headers'

const COOKIE_NAME = 'niger_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function toBase64Url(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  return atob(value.replace(/-/g, '+').replace(/_/g, '/'))
}

async function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET manquant.')
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return toBase64Url(String.fromCharCode(...new Uint8Array(signature)))
}

export async function createAdminSession(email: string) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  const payload = toBase64Url(JSON.stringify({ email, exp }))
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
  const expectedEmail = process.env.ADMIN_EMAIL
  const sessionSecret = process.env.ADMIN_SESSION_SECRET
  if (!expectedEmail || !sessionSecret) return false

  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return false

  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return false

  try {
    const expectedSignature = await sign(payload)
    if (signature.length !== expectedSignature.length) return false

    const payloadJson = JSON.parse(fromBase64Url(payload)) as { email?: string; exp?: number }
    return (
      payloadJson.email === expectedEmail &&
      typeof payloadJson.exp === 'number' &&
      payloadJson.exp > Math.floor(Date.now() / 1000) &&
      signature === expectedSignature
    )
  } catch {
    return false
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
}
