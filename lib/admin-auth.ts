import { cookies } from 'next/headers'

const COOKIE_NAME = 'niger_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

// Administrateur unique de l'application.
const ADMIN_EMAIL = 'mabdourahamane8886@gmail.com'

// Le mot de passe n'est jamais stocké en clair.
// PBKDF2-SHA256, 310 000 itérations.
const PASSWORD_SALT_B64 = '2JV5SCSJMH9OTDbz2hKDaw=='
const PASSWORD_HASH_B64 = 'waBcD01EG4sImuMb1togh5mqxrwGjiEVQaSI1snq3kw='

// Secret uniquement utilisé côté serveur pour signer les sessions.
const SESSION_SECRET = '7f5e0a2d8c4b6e1f9a3c7d5b8e2f4a6c1d9b3e7f5a8c2d6e4b1f9a7c3e5d8b2'

function fromBase64(value: string) {
  const binary = atob(value)
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)))
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return atob(normalized)
}

async function derivePasswordHash(password: string) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromBase64(PASSWORD_SALT_B64),
      iterations: 310000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  return new Uint8Array(bits)
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i]
  return difference === 0
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  )
  return toBase64Url(new Uint8Array(signature))
}

export function getAdminEmail() {
  return ADMIN_EMAIL
}

export async function isAdminCredentialsValid(email: string, password: string) {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || !password) return false

  const candidateHash = await derivePasswordHash(password)
  const storedHash = fromBase64(PASSWORD_HASH_B64)
  return constantTimeEqual(candidateHash, storedHash)
}

export async function createAdminSession() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  const payload = toBase64Url(
    new TextEncoder().encode(JSON.stringify({ email: ADMIN_EMAIL, exp })),
  )
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
  if (!raw) return false

  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return false

  try {
    const expectedSignature = await sign(payload)
    const providedBytes = fromBase64Url(signature)
    const expectedBytes = fromBase64Url(expectedSignature)

    if (!constantTimeEqual(new Uint8Array(providedBytes.split('').map((c) => c.charCodeAt(0))), new Uint8Array(expectedBytes.split('').map((c) => c.charCodeAt(0))))) {
      return false
    }

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
