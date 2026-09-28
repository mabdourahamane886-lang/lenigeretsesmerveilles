import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { ok: false, app: true, supabase: false, reason: 'Supabase server credentials are not configured.' },
      { status: 503 },
    )
  }

  const { error } = await supabase.from('niger_regions').select('id', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json(
      { ok: false, app: true, supabase: false, reason: error.message },
      { status: 503 },
    )
  }

  return NextResponse.json({
    ok: true,
    app: true,
    supabase: true,
    checked: 'niger_regions',
  })
}
