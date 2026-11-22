import LoginForm from './login-form'

type SearchParams = Promise<{ next?: string; error?: string }>

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const next = params.next?.startsWith('/admin') ? params.next : '/admin'

  return (
    <main className="page loginPage">
      <div className="container loginWrap">
        <div className="loginIntro">
          <span className="kicker">Le Niger et ses Merveilles</span>
          <h1>Espace éditorial</h1>
          <p className="lead">Connecte-toi pour publier une photo, rédiger un article ou gérer les contenus du site.</p>
        </div>
        <LoginForm
          next={next}
          errorCode={params.error}
        />
      </div>
    </main>
  )
}
