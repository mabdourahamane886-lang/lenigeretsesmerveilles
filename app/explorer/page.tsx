import Link from 'next/link'
import { ArrowRight, BookOpenText, CalendarDays, ChefHat, MapPin, Search, Sparkles, UsersRound } from 'lucide-react'
import { createClient } from '../../lib/supabase/server'
import { regions as fallbackRegions } from '../../data/regions'
import Header from '../../components/site/header'
export const dynamic = 'force-dynamic'

type Result = { id: string; title: string; text: string; href: string; category: string; image?: string; video?: string }

const clean = (value: string) => value.trim().slice(0, 80)
const like = (value: string) => '%' + value.replace(/[%_]/g, '') + '%'

export default async function ExplorerPage({ searchParams }: { searchParams: Promise<{ q?: string; region?: string; type?: string }> }) {
  const params = await searchParams
  const q = clean(params.q || '')
  const region = clean(params.region || '')
  const type = clean(params.type || 'all')
  const supabase = await createClient()
  const results: Result[] = []

  if (supabase) {
    const pattern = like(q.replace(/[(),"\\]/g, ''))
    const [w, a, e, c, g, p] = await Promise.all([
      (['all','photos','videos'].includes(type) || type === 'merveilles') ? supabase.from('niger_wonders').select('id,name,slug,short_description,description,cover_url').eq('published', true).or('name.ilike.' + pattern + ',short_description.ilike.' + pattern + ',description.ilike.' + pattern).limit(100) : Promise.resolve({ data: [] }),
      (['all','photos','videos'].includes(type) || type === 'articles') ? supabase.from('niger_articles').select('id,title,slug,excerpt,cover_url').eq('published', true).or('title.ilike.' + pattern + ',excerpt.ilike.' + pattern + ',content.ilike.' + pattern).limit(100) : Promise.resolve({ data: [] }),
      (['all','photos','videos'].includes(type) || type === 'evenements') ? supabase.from('niger_events').select('id,name,slug,city,description,image_url').eq('published', true).or('name.ilike.' + pattern + ',city.ilike.' + pattern + ',description.ilike.' + pattern).limit(100) : Promise.resolve({ data: [] }),
      (['all','photos','videos'].includes(type) || type === 'culture') ? supabase.from('niger_cultures').select('id,title,slug,history,traditions,cover_url').eq('published', true).or('title.ilike.' + pattern + ',history.ilike.' + pattern + ',traditions.ilike.' + pattern).limit(100) : Promise.resolve({ data: [] }),
      (['all','photos','videos'].includes(type) || type === 'gastronomie') ? supabase.from('niger_gastronomy').select('id,name,slug,description,image_url').eq('published', true).or('name.ilike.' + pattern + ',description.ilike.' + pattern + ',ingredients.ilike.' + pattern).limit(100) : Promise.resolve({ data: [] }),
      (['all','photos','videos','publications'].includes(type)) ? supabase.from('niger_publications').select('id,content,media_url,media_type,location,published_at').eq('published',true).eq('visibility','public').ilike('content',pattern).order('published_at',{ascending:false}).limit(100) : Promise.resolve({data:[]}),
    ])

    for (const item of w.data || []) results.push({ id: String(item.id), title: item.name, text: item.short_description || item.description || 'Merveille du Niger.', href: item.slug ? '/merveilles/' + item.slug : '/merveilles', category: 'Merveilles', image:item.cover_url || undefined })
    for (const item of a.data || []) results.push({ id: String(item.id), title: item.title, text: item.excerpt || 'Publication culturelle.', href: item.slug ? '/articles/' + item.slug : '/articles', category: 'Articles', image:item.cover_url || undefined })
    for (const item of e.data || []) results.push({ id: String(item.id), title: item.name, text: [item.city, item.description].filter(Boolean).join(' · ') || 'Événement au Niger.', href: item.slug ? '/evenements/' + item.slug : '/evenements', category: 'Agenda', image:item.image_url || undefined })
    for (const item of c.data || []) results.push({ id: String(item.id), title: item.title, text: item.history || item.traditions || 'Culture du Niger.', href: item.slug ? '/culture/' + item.slug : '/culture', category: 'Culture', image:item.cover_url || undefined })
    for (const item of g.data || []) results.push({ id: String(item.id), title: item.name, text: item.description || 'Gastronomie nigérienne.', href: item.slug ? '/gastronomie/' + item.slug : '/gastronomie', category: 'Gastronomie', image:item.image_url || undefined })
    for(const item of p.data || []) results.unshift({id:String(item.id),title:(item.content || 'Publication').slice(0,100),text:item.location || '',href:'/publications/'+encodeURIComponent(String(item.id)),category:'Publications',image:item.media_type==='photo'?item.media_url || undefined:undefined,video:item.media_type==='video'?item.media_url || undefined:undefined})
  }

  const filteredRegions = fallbackRegions

  const visible = results.filter(item => (type !== 'photos' || item.image) && (type !== 'videos' || item.video))
  const page = Math.max(1, Math.min(20, Number((params as {page?:string}).page) || 1))
  return (
    <>
      <Header />
      <main style={{background:'#fff',minHeight:'80svh',padding:'18px 0 72px'}}>
        <div className="container" style={{maxWidth:960}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
            <Link href="/application" aria-label="Retour à l’application" style={{display:'grid',placeItems:'center',width:44,height:44}}><ArrowRight size={21} style={{transform:'rotate(180deg)'}}/></Link>
            <h1 style={{fontFamily:'inherit',fontSize:'1.65rem',margin:0,color:'#103b2d'}}>Explorer</h1>
          </div>
          <form action="/explorer" style={{display:'flex',alignItems:'center',gap:10,border:'1px solid #d9ddd8',borderRadius:14,padding:'6px 10px',background:'#f6f8f7'}}>
            <Search size={19}/>
            <input name="q" defaultValue={q} placeholder="Rechercher au Niger…" aria-label="Rechercher" style={{flex:1,minWidth:0,width:0,border:0,background:"transparent",padding:"12px 0",fontSize:16}}/>
            <input type="hidden" name="region" value={region}/>
            <input type="hidden" name="type" value={type}/>
            <button type="submit" aria-label="Lancer la recherche" style={{display:"grid",placeItems:"center",flexShrink:0,width:44,height:44,border:0,borderRadius:10,background:"#0b4935",color:"#fff"}}><ArrowRight size={20}/></button>
          </form>

          <div className="mt-4 flex gap-2 overflow-x-auto" style={{paddingBottom:8}}>
            {[
              ['all','Tout',''],
              ['photos','Photos',''],['videos','Vidéos',''],['publications','Publications',''],
              ['merveilles','Merveilles','sparkles'],
              ['articles','Articles','book'],
              ['evenements','Agenda','calendar'],
              ['culture','Culture','users'],
              ['gastronomie','Gastronomie','food'],
            ].map(([value,label]) => (
              <Link key={value} href={'/explorer?q=' + encodeURIComponent(q) + '&region=' + encodeURIComponent(region) + '&type=' + value} className={'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ' + (type === value ? 'border-[#0b6a43] bg-[#0b6a43] text-white' : 'border-[#d9ddd8] bg-white text-[#10241d]')}>
                {label}
              </Link>
            ))}
          </div>

          <form action="/explorer" style={{display:'flex',alignItems:'center',gap:10,marginTop:12}}>
            <MapPin size={19}/><label htmlFor="explorer-region" style={{fontSize:14,fontWeight:600}}>Région</label>
            <input type="hidden" name="q" value={q}/><input type="hidden" name="type" value={type}/>
            <select id="explorer-region" name="region" defaultValue={region} style={{flex:1,minWidth:0,border:'1px solid #d9ddd8',borderRadius:10,padding:10,background:'#fff'}}><option value="">Toutes les régions</option>{filteredRegions.map(item=><option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
            <button type="submit" style={{padding:'10px 12px',borderRadius:10,border:'1px solid #d9ddd8',background:'#fff'}}>Appliquer</button>
          </form>

          <section className="mt-6">
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:12}}>{q ? 'Résultats de recherche' : 'Découvrir le Niger'}</h2>
            {!visible.length && <p role="status">Aucun contenu disponible.</p>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
              {visible.slice(0,page*24).map(item=><Link key={item.category+item.id} href={item.href} style={{display:'block',overflow:'hidden',border:'1px solid #e4e8e5',borderRadius:10,color:'#10241d',textDecoration:'none'}}>
                {item.image ? <img src={item.image} alt={item.title} loading="lazy" style={{width:'100%',aspectRatio:'1 / 1',objectFit:'cover',display:'block'}}/> : item.video ? <video src={item.video} muted playsInline preload="metadata" aria-label={item.title} style={{width:'100%',aspectRatio:'1 / 1',objectFit:'cover',display:'block'}}/> : null}
                <div style={{padding:10}}><small style={{color:'#0b6a43'}}>{item.category}</small><h3 style={{fontSize:14,lineHeight:1.4,margin:'4px 0',overflowWrap:'anywhere'}}>{item.title}</h3></div>
              </Link>)}
            </div>
            {visible.length>page*24 && <Link href={'/explorer?'+new URLSearchParams({q,region,type,page:String(page+1)}).toString()} style={{display:'block',textAlign:'center',padding:16,color:'#0b4935'}}>Voir plus</Link>}
          </section>
        </div>
      </main>
      
    </>
  )
}
