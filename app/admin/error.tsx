'use client'
export default function AdminError({reset}: {reset: () => void}) {
  return <section className="editorPanel" role="alert"><h1>Rubrique indisponible</h1><p>Impossible de charger les données de cette rubrique.</p><button className="btn primary" onClick={reset}>Réessayer</button></section>
}
