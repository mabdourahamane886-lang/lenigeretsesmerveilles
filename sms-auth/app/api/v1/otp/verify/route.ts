import { NextRequest, NextResponse } from 'next/server'
import { projectForApiKey } from '@/lib/auth'
import { ApiProblem, checkOtp } from '@/lib/otp'

export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  const projectId = await projectForApiKey(request)
  if (!projectId) return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 })
  try {
    const input = await request.json()
    return NextResponse.json(await checkOtp(projectId, input.challenge_id, input.code), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    if (error instanceof ApiProblem) {
      return NextResponse.json({ error: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
