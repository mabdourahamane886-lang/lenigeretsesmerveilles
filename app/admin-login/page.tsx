import LoginForm from './login-form'

type SearchParams = Promise<{ next?: string; error?: string }>

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const next = params.next?.startsWith('/admin') ? params.next : '/admin'

  return (
    <main className="page loginPage">
      <div className="container loginWrap">
        <div className="loginIntro">
          <span className="eyebrow loginEyebrow">🇳🇪 Espace sécurisé</span>
          <div className="kicker">Administration</div>
          <h1>Gérer Le Niger et ses Merveilles.</h1>
          <p className="lead">Connectez-vous avec un compte autorisé pour publier les régions, merveilles, articles, cultures et campagnes.</p>
          <div className="loginFacts">
            <span>🔐 Accès réservé</span><span>•</span><span>Supabase Auth</span><span>•</span><span>Rôles administrateurs</span>
          </div>
        </div>
        <LoginForm
          next={next}
          errorCode={params.error}
        />
      </div>
    </main>
  )
}
