import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { reviewContribution } from '../actions'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export default async function AdminContributions() {
  const supabase = await createClient()
  const { data: contributions } = supabase
    ? await supabase.from('niger_contributions').select('id,contributor_name,contributor_email,category,title,description,history,location,status,created_at,reviewer_notes').order('created_at',{ascending:false})
    : { data: [] }

  return (
    <main className="section"><div className="container">
      <Link className="textlink" href="/admin">← Administration</Link>
      <div className="adminHero"><div><div className="kicker">Modération</div><h1>Contributions citoyennes</h1><p className="muted">Examinez les propositions avant leur publication sur la plateforme.</p></div></div>
      {!contributions?.length ? <div className="emptyState"><span className="emptyIcon">✓</span><div><h2>Aucune contribution</h2><p className="muted">Les nouvelles propositions apparaîtront ici.</p></div></div> :
        <div className="moderationList">{contributions.map((item) => <article className="moderationCard" key={item.id}>
          <div className="moderationHead"><div><span className="tag">{item.status}</span><h2>{item.title}</h2><p className="muted">{item.contributor_name}{item.location ? ' · ' + item.location : ''} · {formatDate(item.created_at)}</p></div></div>
          <p>{item.description}</p>
          {item.history && <div className="notice"><strong>Contexte</strong><p>{item.history}</p></div>}
          {item.contributor_email && <div className="moderationContact">Contact : {item.contributor_email}</div>}
          <form className="moderationForm" action={reviewContribution}>
            <input type="hidden" name="id" value={item.id} />
            <textarea name="reviewer_notes" rows={2} placeholder="Note interne (facultatif)">{item.reviewer_notes || ''}</textarea>
            <div className="actions moderationActions">
              <button className="btn darkbtn" name="status" value="approved">Valider</button>
              <button className="btn secondaryBtn" name="status" value="pending">Maintenir en attente</button>
              <button className="btn dangerBtn" name="status" value="rejected">Refuser</button>
            </div>
          </form>
        </article>)}</div>}
    </div></main>
  )
}
