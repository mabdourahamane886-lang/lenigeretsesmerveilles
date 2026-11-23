import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import Header from '../../components/site/header'
import { createClient } from '../../lib/supabase/server'
import styles from './culture.module.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Culture et ethnies du Niger',
  description: 'Découvrez les cultures, les communautés, les langues, les traditions et le patrimoine vivant du Niger.',
  alternates: { canonical: '/culture' },
  openGraph: {
    title: 'Culture et ethnies du Niger',
    description: 'Explorez la diversité culturelle et les communautés du Niger.',
    url: '/culture',
    type: 'website' as const,
  },
}

const communities = [
  {
    name: 'Haoussa',
    aliases: 'Hausa',
    description: 'Une communauté majeure du sud du Niger, avec une riche tradition de textile, de broderie, de musique et de commerce.',
    image: 'https://assets.irinnews.org/s3fs-public/images/201104050821220219.jpg',
    credit: 'The New Humanitarian / IRIN — droits de réutilisation à vérifier avant republication.',
  },
  {
    name: 'Zarma-Songhaï',
    aliases: 'Zarma / Songhaï',
    description: 'Des communautés notamment présentes dans l’ouest du Niger, dont les langues, les arts, les récits et les pratiques sociales sont diverses.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/La%20danse%20Zarma%2001.jpg?width=1000',
    credit: '« La danse Zarma 01 ».',
  },
  {
    name: 'Touareg',
    aliases: 'Kel Tamasheq',
    description: 'Des communautés sahariennes et sahéliennes connues entre autres pour leurs langues, leur poésie, leur artisanat et leurs vêtements traditionnels.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Agadez-Targi.jpg?width=1400',
    credit: 'Albert Backer · Agadez, Niger (1991) · CC BY-SA 3.0.',
  },
  {
    name: 'Peul / Fulbé',
    aliases: 'Fulani',
    description: 'Présentes dans plusieurs régions du Niger, les communautés peules possèdent des traditions variées, notamment autour de l’élevage, de la poésie et des célébrations.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger%2C%20Damari%20%2803%29%2C%20Peul%20girls%20in%20traditional%20clothes.jpg?width=1000',
    credit: 'Vincent van Zeijst · CC BY-SA 4.0.',
  },
  {
    name: 'Kanouri',
    aliases: 'Kanuri',
    description: 'Communautés historiquement liées à la région du lac Tchad, présentes notamment dans l’est du Niger. Les traditions vestimentaires varient selon les lieux et les familles.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/02/A_typical_kanuri_woman.jpg',
    credit: 'Photographie d’une femme kanouri ; vérifier le lieu et la licence du fichier.',
  },
  {
    name: 'Toubou',
    aliases: 'Tubu',
    description: 'Communautés du Sahara et du Sahel oriental, notamment dans la région de Diffa, avec des pratiques et des savoir-faire adaptés à des milieux arides.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger%2C%20Toubou%20people%20at%20Koul%C3%A9l%C3%A9%20%2801%29.jpg?width=1000',
    credit: 'NigerTZai / Vincent van Zeijst · CC BY-SA 4.0.',
  },
  {
    name: 'Gourmantché',
    aliases: 'Gourmanchéma',
    description: 'Communautés présentes dans l’ouest du Niger et au-delà des frontières, avec des langues et des pratiques culturelles qui varient selon les localités.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chant%20et%20danse%20gourmatch%C3%A9.jpg?width=1000',
    credit: '« Chant et danse gourmatché ».',
  },
  {
    name: 'Communautés arabes',
    aliases: 'Groupes arabophones du Niger',
    description: 'Plusieurs communautés arabophones vivent au Niger. Leurs histoires, leurs dialectes et leurs traditions ne se résument pas à une seule identité.',
    image: 'https://www.101lasttribes.com/logo_tribes/Diffa.jpg?community=diffa-arab',
    credit: 'Image référencée par 101 Last Tribes ; confirmer l’identification et obtenir l’autorisation de réutilisation.',
  },
]

export default async function CulturePage() {
  const supabase = await createClient()
  const { data: cultures } = supabase
    ? await supabase.from('niger_cultures').select('id,title,slug,language').eq('published', true).order('title')
    : { data: [] }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className="container">
          <section className={styles.hero} aria-labelledby="culture-title">
            <p className={styles.eyebrow}>Le Niger et ses merveilles</p>
            <h1 id="culture-title">Cultures du Niger</h1>
            <p>Des communautés, des langues et des récits pour découvrir la diversité culturelle du Niger.</p>
            <nav className={styles.heroLinks} aria-label="Sur cette page">
              <a href="#ethnies">Voir les communautés <ArrowDown size={17} aria-hidden="true" /></a>
              <a href="#fiches">Consulter les fiches <ArrowDown size={17} aria-hidden="true" /></a>
            </nav>
          </section>

          <section id="ethnies" className={styles.section} aria-labelledby="communities-title">
            <header className={styles.sectionHeader}>
              <h2 id="communities-title">Peuples et communautés</h2>
              <p>Huit portraits documentaires. Les langues et les traditions varient au sein des communautés, et certaines vivent de part et d’autre des frontières du Niger.</p>
            </header>
            <div className={styles.gallery}>
              {communities.map((community) => (
                <article className={styles.card} key={community.name}>
                  <figure className={styles.figure}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- Documentary images use credited external originals. */}
                    <img src={community.image} alt="" width={480} height={300} loading="lazy" decoding="async" />
                  </figure>
                  <div className={styles.cardBody}>
                    <h3>{community.name}</h3>
                    <p className={styles.alias}>{community.aliases}</p>
                    <p>{community.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="fiches" className={styles.section} aria-labelledby="fiches-title">
            <header className={styles.sectionHeader}>
              <h2 id="fiches-title">Fiches culturelles</h2>
            </header>
            {!cultures?.length ? (
              <p className={styles.empty}>Aucune fiche culturelle disponible pour le moment.</p>
            ) : (
              <ul className={styles.entries}>
                {cultures.map((culture) => (
                  <li key={culture.id}>
                    <Link href={`/culture/${encodeURIComponent(culture.slug)}`}>
                      <span><strong>{culture.title}</strong>{culture.language && <small>{culture.language}</small>}</span>
                      <ArrowRight size={19} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.contribution} aria-labelledby="culture-contribution-title">
            <div>
              <h2 id="culture-contribution-title">Partager un témoignage</h2>
              <p>Proposez un récit, une tradition ou une source documentaire.</p>
            </div>
            <Link href="/contribution">Proposer une contribution <ArrowRight size={17} aria-hidden="true" /></Link>
          </section>
          <details style={{ marginTop: '1.5rem' }}>
            <summary>Crédits photographiques</summary>
            <ul>
              {communities.map((community) => (
                <li key={community.name}><strong>{community.name}</strong> — {community.credit}</li>
              ))}
            </ul>
          </details>
        </div>
      </main>
    </>
  )
}
