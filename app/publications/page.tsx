import Link from 'next/link'
import { ArrowRight, BookOpenText, CalendarDays, Camera, ChefHat, Compass, Newspaper, Sparkles, Utensils } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createAdminClient } from '../../lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const categories = [
  { title: 'Actualités', description: 'Les nouvelles, annonces et informations importantes du Niger.', href: '/articles', icon: Newspaper, label: 'Lire les actualités' },
  { title: 'Événements à venir', description: 'Festivals, rencontres, cérémonies et rendez-vous à noter.', href: '/evenements', icon: CalendarDays, label: 'Voir l’agenda' },
  { title: 'Gastronomie', description: 'Plats, recettes, produits locaux et mémoire culinaire.', href: '/gastronomie', icon: ChefHat, label: 'Découvrir les saveurs' },
  { title: 'Merveilles du Niger', description: 'Sites, paysages, monuments et lieux remarquables.', href: '/merveilles', icon: Compass, label: 'Explorer les merveilles' },
  { title: 'Culture & traditions', description: 'Langues, arts, savoir-faire et traditions des communautés.', href: '/culture', icon: BookOpenText, label: 'Explorer la culture' },
  { title: 'Les régions', description: 'Découvrez les huit régions et leurs richesses.', href: '/regions', icon: Sparkles, label: 'Explorer les régions' },
  { title: 'Toutes les publications', description: 'Retrouvez les textes, photos et vidéos publiés par la plateforme.', href: '#publications-recentes', icon: Camera, label: 'Voir les publications' },
]

export default async function PublicationsPage() {
  const supabase = createAdminClient()
  let publications: any[] = []
  let loadError = false

  if (supabase) {
    const { data, error } = await supabase
      .from('niger_publications')
      .select('id,author_name,content,media_url,media_type,music_url,tagged_people,location,mood,activity,allow_messages,published_at')
      .eq('published', true)
      .eq('visibility', 'public')
      .order('published_at', { ascending: false })
    if (error) {
      console.error('[publications] Impossible de charger les publications:', error.message)
      loadError = true
    } else {
      publications = data || []
    }
  } else {
    loadError = true
  }

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <section style={{padding:'36px 0 24px'}}>
            <span className="kicker">Le Niger et ses Merveilles · Centre de contenu</span>
            <h1 style={{fontSize:'clamp(2rem,5vw,3.5rem)',maxWidth:850,marginTop:10}}>Toutes les découvertes du Niger, au même endroit.</h1>
            <p className="lead" style={{maxWidth:780}}>Cette page rassemble les rubriques de la plateforme : actualités, événements à venir, gastronomie, merveilles, culture et nouvelles catégories à venir. Choisissez une rubrique pour consulter son contenu.</p>
          </section>

          <section aria-label="Catégories de publication" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:18,margin:'18px 0 48px'}}>
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <article key={category.title} className="card" style={{display:'flex',flexDirection:'column',padding:24,minHeight:230,borderRadius:20}}>
                  <div style={{width:48,height:48,borderRadius:15,display:'grid',placeItems:'center',background:'#e8f3ed',color:'#145c43',marginBottom:16}}><Icon size={24}/></div>
                  <h2 style={{fontSize:21,margin:'0 0 8px'}}>{category.title}</h2>
                  <p className="muted" style={{lineHeight:1.7,margin:'0 0 20px',flex:1}}>{category.description}</p>
                  <Link className="proButton proButtonDark" href={category.href} style={{alignSelf:'flex-start',display:'inline-flex',alignItems:'center',gap:8,textDecoration:'none'}}>{category.label}<ArrowRight size={16}/></Link>
                </article>
              )
            })}
          </section>

          <section id="publications-recentes" className="catalogSection" style={{scrollMarginTop:90}}>
            <div className="contentHeader">
              <div><span className="kicker">Fil de publication</span><h2>Les publications récentes</h2><p>Les contenus publiés apparaissent ici avec leur lien direct de consultation et de partage.</p></div>
            </div>

            {loadError ? (
              <div className="catalogEmpty large" role="status">
                <Camera size={25}/>
                <div><strong>Le fil des publications est temporairement indisponible.</strong><span>Les rubriques ci-dessus restent accessibles. Réessayez plus tard pour le fil des publications récentes.</span></div>
              </div>
            ) : !publications.length ? (
              <div className="catalogEmpty large">
                <Camera size={25}/>
                <div><strong>Aucune publication publique pour le moment.</strong><span>Les nouvelles publications apparaîtront ici après leur mise en ligne.</span></div>
              </div>
            ) : (
              <div style={{display:'grid',gap:22,maxWidth:900,margin:'0 auto'}}>
                {publications.map((publication) => (
                  <article className="card" key={publication.id}>
                    <div className="cardbody">
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div className="publicationAvatar" aria-hidden="true">🇳🇪</div>
                        <div><strong>{publication.author_name || 'Le Niger et ses Merveilles'}</strong><div className="muted">{formatDate(publication.published_at)}</div></div>
                      </div>
                      {publication.content && <p style={{whiteSpace:'pre-wrap',fontSize:17,lineHeight:1.65,marginTop:16}}>{publication.content}</p>}
                      {publication.media_url && publication.media_type === 'photo' && <img src={publication.media_url} alt="Illustration de la publication" loading="lazy" style={{width:'100%',borderRadius:14,marginTop:12,objectFit:'cover'}}/>}
                      {publication.media_url && publication.media_type === 'video' && <video src={publication.media_url} controls preload="metadata" style={{width:'100%',borderRadius:14,marginTop:12}}/>}
                      {publication.music_url && <audio src={publication.music_url} controls preload="metadata" style={{width:'100%',marginTop:12}}/>}
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
                        {publication.location && <span className="tag">{publication.location}</span>}
                        {publication.mood && <span className="tag">{publication.mood}</span>}
                        {publication.activity && <span className="tag">{publication.activity}</span>}
                        {publication.tagged_people?.length ? <span className="tag">👤 {publication.tagged_people.join(', ')}</span> : null}
                      </div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginTop:20}}>
                        <Link className="proButton proButtonDark" href={`/publications/${publication.id}`}>Ouvrir la publication <ArrowRight size={15}/></Link>
                        <Link className="textlink" href={`/publications/${publication.id}`}>Obtenir le lien direct</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
