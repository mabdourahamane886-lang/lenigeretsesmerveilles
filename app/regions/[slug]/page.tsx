import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Camera, MapPin, Sparkles, UsersRound } from 'lucide-react'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import { createClient } from '../../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  if (!supabase) notFound()

  const { data: region } = await supabase.from('niger_regions').select('id,name,slug,description,cover_url').eq('slug', slug).maybeSingle()
  if (!region) notFound()

  const [{ data: wonders }, { data: cultures }, { data: gastronomy }, { data: events }] = await Promise.all([
    supabase.from('niger_wonders').select('id,name,short_description,cover_url').eq('region_id', region.id).eq('published', true).order('name'),
    supabase.from('niger_cultures').select('id,title,cover_url,history').eq('region_id', region.id).eq('published', true).order('title'),
    supabase.from('niger_gastronomy').select('id,name,image_url,description').eq('region_id', region.id).eq('published', true).order('name'),
    supabase.from('niger_events').select('id,name,city,starts_at,image_url,description').eq('region_id', region.id).eq('published', true).order('starts_at'),
  ])

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <Link className="proBack" href="/regions">← Toutes les régions</Link>

          <section className="detailHero">
            <div className="detailHeroImage" style={region.cover_url ? { backgroundImage: 'url(' + region.cover_url + ')' } : undefined}>
              <div className="detailHeroOverlay" />
              <div className="detailHeroContent">
                <span className="detailEyebrow">Région du Niger · {region.name}</span>
                <h1>{region.name}</h1>
                <p>{region.description || 'Explorez le patrimoine, les paysages et les cultures de cette région du Niger.'}</p>
              </div>
            </div>
          </section>

          <section className="detailStats">
            <div><Sparkles size={17}/><strong>{wonders?.length || 0}</strong><span>merveilles</span></div>
            <div><UsersRound size={17}/><strong>{cultures?.length || 0}</strong><span>cultures</span></div>
            <div><CalendarDays size={17}/><strong>{events?.length || 0}</strong><span>événements</span></div>
            <div><Camera size={17}/><strong>{gastronomy?.length || 0}</strong><span>saveurs</span></div>
          </section>

          <section className="catalogSection">
            <div className="contentHeader">
              <div><span className="kicker">Patrimoine</span><h2>À découvrir</h2><p>Les lieux et patrimoines publiés pour cette région.</p></div>
              <Link className="proInlineLink" href="/merveilles">Toutes les merveilles <ArrowRight size={15}/></Link>
            </div>
            {wonders?.length ? (
              <div className="catalogGrid">
                {wonders.map(item => (
                  <article className="catalogCard" key={item.id}>
                    <div className="catalogImage" style={item.cover_url ? { backgroundImage: 'url(' + item.cover_url + ')' } : undefined}>
                      <span className="catalogPill">Merveille</span>
                    </div>
                    <div className="catalogBody"><h3>{item.name}</h3><p>{item.short_description || 'Découvrez ce lieu et son histoire.'}</p></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="catalogEmpty"><Sparkles size={20}/><div><strong>Cette sélection arrive bientôt.</strong><span>Les contenus validés pour {region.name} apparaîtront ici.</span></div></div>
            )}
          </section>

          <section className="catalogSection">
            <div className="contentHeader">
              <div><span className="kicker">Culture</span><h2>Histoires & savoir-faire</h2><p>Traditions, langues, pratiques et mémoires locales.</p></div>
              <Link className="proInlineLink" href="/culture">Explorer la culture <ArrowRight size={15}/></Link>
            </div>
            {cultures?.length ? (
              <div className="catalogGrid">
                {cultures.map(item => (
                  <article className="catalogCard" key={item.id}>
                    <div className="catalogImage" style={item.cover_url ? { backgroundImage: 'url(' + item.cover_url + ')' } : undefined}>
                      <span className="catalogPill">Culture</span>
                    </div>
                    <div className="catalogBody"><h3>{item.title}</h3><p>{item.history || 'Une fiche culturelle consacrée à cette région.'}</p></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="catalogEmpty"><UsersRound size={20}/><div><strong>La mémoire culturelle est en construction.</strong><span>Les contenus vérifiés seront ajoutés progressivement.</span></div></div>
            )}
          </section>

          <section className="catalogSection">
            <div className="contentHeader">
              <div><span className="kicker">Agenda local</span><h2>Les prochains rendez-vous</h2><p>Événements publiés et informations pratiques.</p></div>
              <Link className="proInlineLink" href="/evenements">Tout l’agenda <ArrowRight size={15}/></Link>
            </div>
            {events?.length ? (
              <div className="eventCompactGrid">
                {events.map(event => (
                  <article className="eventCompact" key={event.id}>
                    <div className="eventCompactDate"><strong>{event.starts_at ? new Intl.DateTimeFormat('fr-FR',{day:'2-digit'}).format(new Date(event.starts_at)) : '—'}</strong><span>{event.starts_at ? new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(new Date(event.starts_at)) : ''}</span></div>
                    <div><span className="kicker">{event.city || region.name}</span><h3>{event.name}</h3><p>{event.description || 'Informations sur cet événement.'}</p></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="catalogEmpty"><CalendarDays size={20}/><div><strong>Aucun rendez-vous publié.</strong><span>Vous pouvez proposer un événement pour cette région.</span></div><Link className="textlink" href="/contribution">Proposer <ArrowRight size={14}/></Link></div>
            )}
          </section>

          <section className="regionContribution">
            <div className="regionContributionIcon"><MapPin size={21}/></div>
            <div><span className="proMiniLabel">Contribuer</span><h2>Vous connaissez un lieu, une tradition ou un événement de {region.name} ?</h2><p>Partagez l’information avec la plateforme. Les propositions sont vérifiées avant publication.</p></div>
            <Link className="proButton proButtonDark" href="/contribution">Proposer une découverte <ArrowRight size={15}/></Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
