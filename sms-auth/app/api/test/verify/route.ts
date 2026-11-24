import { NextRequest, NextResponse } from 'next/server'
import { ownsProject, requireOwner } from '@/lib/auth'
import { ApiProblem, checkOtp } from '@/lib/otp'
import { goodUuid } from '@/lib/security'

export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  const user = await requireOwner()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  if (!goodUuid(body.project_id) || !await ownsProject(body.project_id, user.id)) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }
  try {
    return NextResponse.json(await checkOtp(body.project_id, body.challenge_id, body.code))
  } catch (error) {
    if (error instanceof ApiProblem) return NextResponse.json({ error: error.code }, { status: error.status })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
