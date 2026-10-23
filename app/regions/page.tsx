import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'
import { regions as fallbackRegions } from '../../data/regions'

export const dynamic = 'force-dynamic'

const welcomeRegions = new Set(['agadez', 'dosso', 'maradi', 'niamey', 'tillaberi', 'zinder'])

export default async function RegionsPage() {
  const supabase = await createClient()
  const { data } = supabase
    ? await supabase.from('niger_regions').select('id,name,slug,description,cover_url').order('name')
    : { data: null }

  const items = data?.length
    ? data.map((region) => {
        const fallback = fallbackRegions.find((item) => item.slug === region.slug)
        return { id: String(region.id), name: region.name, slug: region.slug, description: region.description, image: region.cover_url || fallback?.image, imageCredit: fallback?.imageCredit }
      })
    : fallbackRegions.map((region, index) => ({ id: `static-${index}`, ...region }))

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="kicker">Explorer le Niger · 8 régions</div>
          <h1>Bienvenue au cœur du Niger 🇳🇪</h1>
          <p className="lead">Huit régions, des histoires uniques, des paysages saisissants et un patrimoine vivant. Choisissez votre prochaine découverte.</p>
          <div className="regionGrid">
            {items.map((region, index) => {
              const welcome = welcomeRegions.has(region.slug)
              return (
                <Link
                  className="region regionLight"
                  key={region.id}
                  href={`/regions/${region.slug}`}
                  style={{display:'flex',flexDirection:'column',overflow:'hidden',padding:0,borderRadius:22,textDecoration:'none',background:'#fff',border:'1px solid rgba(18,48,42,.1)',boxShadow:'0 12px 32px rgba(17,45,38,.08)',transition:'transform .2s ease, box-shadow .2s ease'}}
                >
                  <div style={{position:'relative',width:'100%',height:220,backgroundColor:'#e7e8df',backgroundImage:region.image ? `linear-gradient(180deg,rgba(8,24,20,.02) 30%,rgba(8,24,20,.72) 100%),url("${region.image}")` : 'linear-gradient(135deg,#e9efe5,#d6e0d2)',backgroundSize:'cover',backgroundPosition:'center'}}>
                    <span style={{position:'absolute',top:14,left:14,display:'inline-flex',alignItems:'center',gap:6,padding:'7px 11px',borderRadius:999,background:'rgba(255,255,255,.94)',color:'#23483b',fontSize:12,fontWeight:800,letterSpacing:'.04em'}}>
                      <MapPin size={13}/>{String(index + 1).padStart(2, '0')} / 08
                    </span>
                    <div style={{position:'absolute',left:20,right:20,bottom:18,color:'#fff'}}>
                      <span style={{display:'block',fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.14em',opacity:.88,marginBottom:5}}>{welcome ? 'Bienvenue à' : 'Partez à la découverte de'}</span>
                      <span style={{display:'block',fontSize:29,lineHeight:1.1,fontWeight:850}}>{region.name}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:12,padding:'20px 21px 22px',flex:1,width:'100%',boxSizing:'border-box'}}>
                    <p style={{margin:0,color:'#52645d',fontSize:14,lineHeight:1.7}}>{region.description || 'Découvrez le patrimoine, les paysages et les merveilles de cette région du Niger.'}</p>
                    {region.imageCredit && <small style={{color:'#7a8881',fontSize:11}}>Photo : {region.imageCredit}</small>}
                    <strong style={{marginTop:'auto',display:'inline-flex',alignItems:'center',gap:8,color:'#166344',fontSize:14}}>Explorer la région <ArrowUpRight size={17}/></strong>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
