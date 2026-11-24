import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export async function GET() {
  return NextResponse.json({
    service: 'SMS AUTH',
    status: 'ok',
    database_ready: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    whatsapp_ready: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_AUTH_TEMPLATE),
    channels: ['whatsapp'],
  }, { headers: { 'Cache-Control': 'no-store' } })
}
