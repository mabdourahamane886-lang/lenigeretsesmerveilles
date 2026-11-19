import Link from 'next/link'
import {
  ArrowRight, BookOpenText, Camera, CalendarDays, Compass, Globe2,
  Languages, Landmark, MapPinned, MessageCircle, Route, Sparkles, Utensils,
} from 'lucide-react'

export const metadata = {
  title: 'Explorer les 12 fonctionnalités',
  description: 'Explorez les territoires, l’histoire, les cultures, les images, les événements et les ressources du Niger.',
  alternates: { canonical: '/decouvrir' },
}

const features = [
  { number: '01', title: 'Les 8 régions du Niger', category: 'Territoires', text: 'Consultez les fiches régionales, leurs patrimoines, leurs paysages et leurs particularités.', href: '/regions', label: 'Explorer les régions', icon: Compass },
  { number: '02', title: 'Encyclopédie historique', category: 'Histoire & mémoire', text: 'Retrouvez les récits, repères historiques et dossiers documentaires consacrés au Niger.', href: '/articles', label: 'Lire les dossiers', icon: BookOpenText },
  { number: '03', title: 'Cultures et traditions', category: 'Patrimoine vivant', text: 'Découvrez les communautés, les langues, les savoir-faire, les arts et les traditions.', href: '/culture', label: 'Découvrir les cultures', icon: Globe2 },
  { number: '04', title: 'Photothèque nationale', category: 'Images & vidéos', text: 'Parcourez les médias documentés, leurs descriptions, leurs catégories et leurs crédits.', href: '/media', label: 'Voir la photothèque', icon: Camera },
  { number: '05', title: 'Carte interactive', category: 'Géographie', text: 'Situez le Niger et repérez les régions pour préparer vos explorations.', href: '/carte', label: 'Ouvrir la carte', icon: MapPinned },
  { number: '06', title: 'Journal et actualités', category: 'Information', text: 'Lisez les articles, les dossiers et les publications éditoriales de la plateforme.', href: '/articles', label: 'Lire le journal', icon: BookOpenText },
  { number: '07', title: 'Agenda culturel', category: 'Événements', text: 'Suivez les festivals, rencontres, cérémonies et rendez-vous annoncés.', href: '/evenements', label: 'Consulter l’agenda', icon: CalendarDays },
  { number: '08', title: 'Gastronomie nigérienne', category: 'Saveurs', text: 'Explorez les spécialités, les ingrédients, les recettes et la mémoire culinaire.', href: '/gastronomie', label: 'Découvrir les saveurs', icon: Utensils },
  { number: '09', title: 'Personnalités historiques', category: 'Figures & parcours', text: 'Accédez aux récits et articles consacrés aux figures qui ont marqué l’histoire du Niger.', href: '/recherche?q=personnalités', label: 'Rechercher une personnalité', icon: Landmark },
  { number: '10', title: 'Espace communautaire', category: 'Participation', text: 'Proposez un lieu, une photographie, un témoignage, une tradition ou une information à vérifier.', href: '/contribution', label: 'Partager une contribution', icon: MessageCircle },
  { number: '11', title: 'Merveilles IA', category: 'Assistant documentaire', text: 'Posez vos questions sur le Niger et utilisez l’assistant pour orienter vos recherches.', href: '/assistant', label: 'Interroger l’assistant', icon: Sparkles },
  { number: '12', title: 'Langues & ouverture', category: 'Ressources linguistiques', text: 'Explorez le dictionnaire et les ressources linguistiques disponibles sur la plateforme.', href: '/dictionnaire', label: 'Explorer les langues', icon: Languages },
]

export default function DecouvrirPage() {
  return (
    <main className="page">
      <div className="container">
        <header style={{ padding: '34px 0 30px', maxWidth: 850 }}>
          <span className="kicker">Le Niger et ses Merveilles · plateforme</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 1.04, margin: '12px 0' }}>12 façons de découvrir le Niger.</h1>
          <p className="lead">Un espace central pour accéder aux grandes fonctionnalités de la plateforme : territoires, mémoire, cultures, tourisme, médias et participation citoyenne.</p>
        </header>

        <section aria-label="Les douze fonctionnalités" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 18, paddingBottom: 48 }}>
          {features.map(({ number, title, category, text, href, label, icon: Icon }) => (
            <article key={number} style={{ background: '#fff', border: '1px solid #e6e2d9', borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', minHeight: 250, boxShadow: '0 12px 32px rgba(17,45,38,.055)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <span style={{ color: '#b17b2d', fontSize: 12, fontWeight: 900, letterSpacing: '.12em' }}>{number} / 12</span>
                <span style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', color: '#145c43', background: '#edf4ee' }}><Icon size={20} /></span>
              </div>
              <span className="kicker">{category}</span>
              <h2 style={{ fontSize: 22, lineHeight: 1.2, margin: '8px 0' }}>{title}</h2>
              <p style={{ color: '#68766e', lineHeight: 1.65, fontSize: 14, margin: '0 0 20px' }}>{text}</p>
              <Link href={href} className="textlink" style={{ marginTop: 'auto', paddingTop: 10 }}>{label} <ArrowRight size={15} /></Link>
            </article>
          ))}
        </section>

        <section style={{ background: '#073b2b', color: '#fff', borderRadius: 24, padding: 'clamp(24px, 4vw, 42px)', marginBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 650 }}>
            <span style={{ color: '#e6c47b', fontSize: 11, fontWeight: 900, letterSpacing: '.15em', textTransform: 'uppercase' }}>La mémoire se construit ensemble</span>
            <h2 style={{ fontSize: 'clamp(25px, 3vw, 36px)', margin: '9px 0' }}>Vous connaissez une histoire que nous devons préserver ?</h2>
            <p style={{ color: '#d9e7df', lineHeight: 1.65, margin: 0 }}>Envoyez vos informations et vos sources. Chaque proposition est examinée avant toute publication.</p>
          </div>
          <Link href="/contribution" className="proButton proButtonPrimary">Contribuer au projet <ArrowRight size={16} /></Link>
        </section>
      </div>
    </main>
  )
}
