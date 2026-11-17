import "server-only"

const API = "https://open.tiktokapis.com"

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Variable serveur manquante : ${name}`)
  return value
}

function keyBytes() {
  const raw = required("TIKTOK_TOKEN_ENCRYPTION_KEY")
  const binary = atob(raw)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  if (bytes.length !== 32) throw new Error("TIKTOK_TOKEN_ENCRYPTION_KEY doit contenir 32 octets encodés en base64.")
  return bytes
}

async function cryptoKey() {
  return crypto.subtle.importKey("raw", keyBytes(), "AES-GCM", false, ["encrypt", "decrypt"])
}

export async function encryptTikTokTokens(tokens: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await cryptoKey()
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(tokens)))
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  }
}

export async function decryptTikTokTokens(ciphertext: string, ivValue: string) {
  const key = await cryptoKey()
  const cipher = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
  const iv = Uint8Array.from(atob(ivValue), (c) => c.charCodeAt(0))
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher)
  return JSON.parse(new TextDecoder().decode(clear)) as {
    access_token: string
    refresh_token: string
    open_id: string
    expires_at: number
    refresh_expires_at: number
    scope: string
  }
}

export function tiktokApiBase() {
  return (process.env.TIKTOK_API_BASE_URL || API).replace(/\/$/, "")
}

export function tiktokClientKey() { return required("TIKTOK_CLIENT_KEY") }
export function tiktokClientSecret() { return required("TIKTOK_CLIENT_SECRET") }
export function tiktokRedirectUri() { return required("TIKTOK_REDIRECT_URI") }
