import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'

export function normalizePhone(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const clean = input.replace(/[ \t().-]/g, '')
  const number = clean.startsWith('00') ? '+' + clean.slice(2) : clean
  const e164 = number.startsWith('+') ? number
    : /^[0-9]{8}$/.test(number) ? '+227' + number
    : /^227[0-9]{8}$/.test(number) ? '+' + number : ''
  return /^\+[1-9][0-9]{7,14}$/.test(e164) ? e164 : null
}

export function newCode() { return randomInt(0, 1000000).toString().padStart(6, '0') }

export function newApiKey() {
  return 'sa_live_' + randomBytes(32).toString('hex')
}

export function sha256(text: string) {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

export function hmacCode(id: string, phone: string, code: string): string {
  const secret = process.env.OTP_PEPPER
  if (!secret || secret.length < 32) throw new Error('otp_secret_missing')
  return createHmac('sha256', secret).update(id + ':' + phone + ':' + code, 'utf8').digest('hex')
}

export function equalsHash(a: string, b: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
}

export function maskPhone(phone: string) {
  return phone.slice(0, 5) + '••••' + phone.slice(-2)
}

export function goodUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
