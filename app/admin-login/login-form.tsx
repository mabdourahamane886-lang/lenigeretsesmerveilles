'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm({
  next,
  errorCode,
}: {
  next: string
  errorCode?: string
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(
    errorCode === 'unauthorized'
      ? 'Ce compte est connecté mais ne possède pas les droits administrateur.'
      : errorCode === 'config'
        ? 'Supabase Auth n’est pas correctement configuré sur le serveur.'
        : null,
  )
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error ?? 'Impossible de se connecter.')
        return
      }

      router.replace(next)
      router.refresh()
    } catch {
      setError('Impossible de joindre le serveur. Réessayez dans un instant.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="loginCard" onSubmit={handleSubmit}>
      <div className="loginCardHead"><span className="brandmark">🇳🇪</span><div><strong>Connexion administrateur</strong><span>Accès à votre tableau de bord</span></div></div>
      <label>E-mail<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="administrateur@exemple.com" /></label>
      <label>Mot de passe<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" /></label>
      {error && <p className="formError" role="alert">{error}</p>}
      <button className="btn primary" type="submit" disabled={pending}>{pending ? 'Connexion…' : 'Se connecter'}</button>
      <Link className="loginBack" href="/">← Retour au site public</Link>
    </form>
  )
}
