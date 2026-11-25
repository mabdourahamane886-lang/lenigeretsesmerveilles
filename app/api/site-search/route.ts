import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 80)
  if (q.length < 2) return NextResponse.json({ results: [] })
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ results: [] }, { status: 503 })
  const escaped = q.replace(/[%_,()]/g, ' ').trim()
  if (!escaped) return NextResponse.json({ results: [] })
  const pattern = '%' + escaped + '%'
  const [articles, wonders, events, publications] = await Promise.all([
    supabase.from('niger_articles').select('id,title,slug').eq('published',true).ilike('title',pattern).limit(6),
    supabase.from('niger_wonders').select('id,name,slug').eq('published',true).ilike('name',pattern).limit(6),
    supabase.from('niger_events').select('id,name,slug').eq('published',true).ilike('name',pattern).limit(6),
    supabase.from('niger_publications').select('id,content').eq('published',true).eq('visibility','public').ilike('content',pattern).limit(6),
  ])
  const results = [
    ...(articles.data || []).map(item=>({title:item.title,href:'/articles/'+encodeURIComponent(item.slug || item.id),category:'Article'})),
    ...(wonders.data || []).map(item=>({title:item.name,href:'/merveilles',category:'Merveille'})),
    ...(events.data || []).map(item=>({title:item.name,href:item.slug ? '/evenements/'+encodeURIComponent(item.slug) : '/evenements',category:'Événement'})),
    ...(publications.data || []).map(item=>({title:(item.content || 'Publication').slice(0,90),href:'/publications/'+encodeURIComponent(item.id),category:'Publication'})),
  ]
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } })
}
