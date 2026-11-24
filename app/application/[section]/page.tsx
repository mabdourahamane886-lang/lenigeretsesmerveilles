import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getPublicationTitle } from '../../../lib/publications/format'
import PersonalPanel from './personal-panel'
import styles from '../application.module.css'

const sections = {
  histoire: {title:'Histoire et archives',intro:'Explorez les récits historiques, en distinguant les faits documentés et les traditions orales.',links:[['/articles','Articles et archives'],['/culture','Patrimoine culturel'],['/merveilles','Sites historiques']]},
  fossiles: {title:'Fossiles du Niger',intro:'Découvrez le patrimoine paléontologique à travers les publications et les ressources scientifiques.',links:[['/recherche?q=fossiles','Rechercher les fossiles'],['/recherche?q=dinosaures','Rechercher les dinosaures'],['/articles','Articles documentaires']]},
  bibliotheque: {title:'Bibliothèque et ressources',intro:'Retrouvez les documents et récits disponibles sur la plateforme.',links:[['/articles','Articles'],['/media','Archives photographiques'],['/recherche','Recherche documentaire']]},
  tourisme: {title:'Tourisme et découverte',intro:'Préparez vos découvertes en consultant les régions et les lieux répertoriés.',links:[['/regions','Les huit régions'],['/carte','Carte interactive'],['/merveilles','Sites à découvrir'],['/autour-de-moi','Autour de moi'],['/evenements','Agenda culturel']]},
  profil: {title:'Mon profil',intro:'Votre profil local sur cet appareil.',links:[['/favoris','Mes favoris'],['/application/parametres','Paramètres']]},
  parametres: {title:'Paramètres',intro:'Gérez vos préférences locales.',links:[['/application/profil','Mon profil'],['/a-propos','À propos du projet']]},
  notifications: {title:'Actualités et alertes',intro:'Consultez les dernières publications publiques. Les alertes push ne sont pas encore activées.',links:[['/publications','Toutes les publications'],['/evenements','Agenda culturel']]},
} as const

export const dynamic = 'force-dynamic'

export default async function SectionPage({params}:{params:Promise<{section:string}>}) {
  const {section}=await params
  if (!Object.prototype.hasOwnProperty.call(sections,section)) notFound()
  const item=sections[section as keyof typeof sections]
  let news: {id:string;content:string|null}[]=[]
  let unavailable=false
  if(section==='notifications'){
    const client=createAdminClient()
    if(client){
      const {data,error}=await client.from('niger_publications').select('id,content').eq('published',true).eq('visibility','public').order('published_at',{ascending:false,nullsFirst:false}).limit(10)
      unavailable=Boolean(error)
      news=data||[]
    }else unavailable=true
  }
  return <main className={styles.app}><div className={styles.canvas}>
    <Link href="/application" className={styles.featureAction}>← Retour à l’application</Link>
    <div className={styles.titleRow} style={{marginTop:24}}><h1>{item.title}</h1></div>
    <p>{item.intro}</p>
    {(section==='profil'||section==='parametres')&&<PersonalPanel mode={section}/>}
    {section==='notifications'&&<section className={styles.directory} style={{marginTop:24}}><h2>Dernières publications</h2>{unavailable?<p>Actualités temporairement indisponibles.</p>:news.length?news.map(n=><Link className={styles.entry} key={n.id} href={'/publications/'+encodeURIComponent(n.id)}>{getPublicationTitle(n.content)}</Link>):<p>Aucune publication récente.</p>}</section>}
    <section className={styles.directory} style={{marginTop:24}}><h2>Accès rapides</h2>{item.links.map(([href,label])=><Link key={href} href={href} className={styles.entry}>{label} →</Link>)}</section>
  </div></main>
}
