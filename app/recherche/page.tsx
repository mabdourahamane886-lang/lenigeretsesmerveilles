import Link from 'next/link'
import { ArrowRight, BookOpenText, CalendarDays, ChefHat, Search, Sparkles, UsersRound } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function RecherchePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const query = q.trim().slice(0, 80)
  const supabase = await createClient()
  let wonders:any[]=[]; let events:any[]=[]; let articles:any[]=[]; let cultures:any[]=[]; let gastronomy:any[]=[]

  if (supabase && query) {
    const safe=query.replace(/[%_]/g,''); const like='%' + safe + '%'
    const [w,e,a,c,g]=await Promise.all([
      supabase.from('niger_wonders').select('id,name,slug,short_description,description').eq('published',true).or('name.ilike.'+like+',short_description.ilike.'+like+',description.ilike.'+like).limit(8),
      supabase.from('niger_events').select('id,name,slug,city,description').eq('published',true).or('name.ilike.'+like+',city.ilike.'+like+',description.ilike.'+like).limit(8),
      supabase.from('niger_articles').select('id,title,slug,excerpt').eq('published',true).or('title.ilike.'+like+',excerpt.ilike.'+like+',content.ilike.'+like).limit(8),
      supabase.from('niger_cultures').select('id,title,slug,history,traditions').eq('published',true).or('title.ilike.'+like+',history.ilike.'+like+',traditions.ilike.'+like).limit(8),
      supabase.from('niger_gastronomy').select('id,name,slug,description').eq('published',true).or('name.ilike.'+like+',description.ilike.'+like+',ingredients.ilike.'+like).limit(8)
    ])
    wonders=w.data||[]; events=e.data||[]; articles=a.data||[]; cultures=c.data||[]; gastronomy=g.data||[]
  }

  const groups=[
    {key:'wonders',title:'Merveilles',icon:Sparkles,items:wonders,href:(x:any)=>'/merveilles',label:(x:any)=>x.name,text:(x:any)=>x.short_description||x.description},
    {key:'events',title:'Événements',icon:CalendarDays,items:events,href:(x:any)=>'/evenements/'+x.slug,label:(x:any)=>x.name,text:(x:any)=>[x.city||'Niger',x.description].filter(Boolean).join(' · ')},
    {key:'articles',title:'Articles',icon:BookOpenText,items:articles,href:(x:any)=>'/articles/'+x.slug,label:(x:any)=>x.title,text:(x:any)=>x.excerpt},
    {key:'cultures',title:'Culture',icon:UsersRound,items:cultures,href:()=>'/culture',label:(x:any)=>x.title,text:(x:any)=>x.history||x.traditions},
    {key:'gastronomy',title:'Gastronomie',icon:ChefHat,items:gastronomy,href:()=>'/gastronomie',label:(x:any)=>x.name,text:(x:any)=>x.description}
  ]
  const total=groups.reduce((sum,group)=>sum+group.items.length,0)

  return (
    <>
      <Header />
      <main className="page">
        <div className="container searchPage">
          <div className="searchIntro"><span className="kicker">Recherche</span><h1>Trouvez votre prochaine découverte.</h1><p>Recherchez une ville, une merveille, une tradition, un événement, un article ou une spécialité.</p></div>
          <form className="proSearchForm"><Search size={19}/><input name="q" defaultValue={query} placeholder="Ex. Agadez, désert, festival…" aria-label="Recherche"/><button className="proButton proButtonDark">Rechercher <ArrowRight size={15}/></button></form>

          {!query ? (
            <div className="searchSuggestions"><span>Essayez :</span>{['Agadez','Niamey','Ténéré','culture','festival'].map(item=><Link href={'/recherche?q='+encodeURIComponent(item)} key={item}>{item}</Link>)}</div>
          ) : total===0 ? (
            <div className="catalogEmpty large"><Search size={24}/><div><strong>Aucun résultat pour « {query} ».</strong><span>Essayez un autre terme ou une autre orthographe.</span></div><Link className="textlink" href="/regions">Explorer les régions <ArrowRight size={14}/></Link></div>
          ) : (
            <div className="searchGroupList">
              <div className="searchResultCount"><strong>{total}</strong> résultat{total>1?'s':''} pour « {query} »</div>
              {groups.filter(group=>group.items.length).map(({key,title,icon:Icon,items,href,label,text})=>(
                <section className="searchGroup" key={key}>
                  <div className="searchGroupTitle"><span><Icon size={17}/><b>{title}</b></span><small>{items.length}</small></div>
                  <div className="searchGroupRows">{items.map(item=><Link href={href(item)} className="searchResultRow" key={item.id}><div><strong>{label(item)}</strong><span>{text(item)||'Contenu consacré au Niger.'}</span></div><ArrowRight size={16}/></Link>)}</div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
