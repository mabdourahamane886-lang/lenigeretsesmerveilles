import Link from 'next/link'
import { adminDatabase } from '../../lib/admin/database'
import { getPublicationTitle } from '../../lib/publications/format'

const modules = [
  ['Publications','publications','publications'], ['Articles','articles','articles'],
  ['Photothèque','medias','media'], ['Événements','evenements','events'],
  ['Régions','regions','regions'], ['Merveilles','merveilles','wonders'],
  ['Cultures','cultures','cultures'], ['Gastronomie','gastronomie','gastronomy'],
  ['Contributions','contributions','contributions'], ['Campagnes','publicites','advertisements'],
]

export default async function AdminPage() {
  const db = await adminDatabase()
  const [counts, posts, moderation] = await Promise.all([
    Promise.all(modules.map(([, , table]) => db.from('niger_' + table).select('id',{head:true,count:'exact'}))),
    db.from('niger_publications').select('id,content,published,visibility,scheduled_at').order('created_at',{ascending:false}).limit(6),
    db.from('niger_contributions').select('id',{head:true,count:'exact'}).eq('status','pending'),
  ])
  const unavailable = counts.filter(result => result.error).length
  return <main><span className="kicker">Administration</span><h1>Tableau de bord</h1>
    <div className="editorActions"><Link className="proButton proButtonDark" href="/admin/publications">Créer une publication</Link><Link className="btn" href="/publications">Voir le fil public</Link></div>
    <section className="editorStats" aria-label="Contenus enregistrés">{modules.map(([label,route],i) =>
      <Link href={'/admin/'+route} key={route}><span>{label}</span><strong>{counts[i].error ? 'Indisponible' : counts[i].count}</strong></Link>)}</section>
    <section className="editorPanel"><h2>Derniers enregistrements</h2>
      {posts.error ? <p role="alert">Historique indisponible.</p> : posts.data?.length ? posts.data.map(post =>
        <div key={post.id} className="editorItem"><strong>{getPublicationTitle(post.content)}</strong>
          <span>{post.published ? post.visibility === 'public' ? 'En ligne' : 'Privé' : post.scheduled_at ? 'Programmé' : 'Brouillon'}</span>
          {post.published && post.visibility === 'public' && <Link href={'/publications/'+post.id}>Ouvrir la publication</Link>}</div>) : <p>Aucune publication enregistrée.</p>}
    </section>
    <section className="editorPanel"><h2>Suivi éditorial</h2>
      <p>{unavailable ? 'Lecture indisponible pour '+unavailable+' rubrique(s).' : 'Les dix rubriques répondent dans Supabase.'}</p>
      <Link href="/admin/contributions">{moderation.error ? 'Ouvrir la modération' : 'Contributions en attente · '+moderation.count}</Link>
    </section>
  </main>
}
