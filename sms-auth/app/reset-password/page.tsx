'use client'
import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = getBrowserClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) { setChecking(false); return }
    let alive = true
    void supabase.auth.getUser().then(({ data }) => {
      if (alive) { setAuthorized(Boolean(data.user)); setChecking(false) }
    }).catch(() => { if (alive) setChecking(false) })
    return () => { alive = false }
  }, [supabase])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !authorized) { setError('Ce lien de récupération n’est plus valide. Redemandez un lien depuis la connexion.'); return }
    if (password.length < 10) { setError('Le nouveau mot de passe doit contenir au moins 10 caractères.'); return }
    if (password !== confirm) { setError('Les deux mots de passe ne correspondent pas.'); return }
    setBusy(true); setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPassword(''); setConfirm('')
      router.replace('/dashboard')
      router.refresh()
    } catch {
      setError('Impossible de modifier le mot de passe. Le lien a peut-être expiré ; recommencez la récupération.')
    } finally { setBusy(false) }
  }

  return <main className="authPage">
    <div className="authDecor"><Link className="authBack" href="/login"><ArrowLeft size={17}/> Retour à la connexion</Link>
      <div className="authDecorContent"><span className="authSecure"><ShieldCheck size={18}/> SMS AUTH SECURITY</span><h1>Un accès.<br/><em>Bien protégé.</em></h1>
        <p>Choisissez un nouveau mot de passe afin de protéger vos projets et vos clés API.</p>
      </div><span className="authDecorBottom">SMS AUTH · SECURE MESSAGING PLATFORM</span>
    </div>
    <div className="authRight"><div className="authForm"><Link href="/" className="mobileBrand"><ShieldCheck size={24}/> SMS AUTH</Link>
      <span className="sectionKicker">SÉCURITÉ DU COMPTE</span><h2>Nouveau mot de passe</h2><p>Après validation de votre lien de récupération, vous pouvez sécuriser votre compte.</p>
      {checking ? <p className="configNote"><LoaderCircle className="spin" size={18}/> Vérification de votre session…</p>
      : !authorized ? <div className="errorMessage" role="alert">Aucune session de récupération valide. Ouvrez le lien reçu dans votre e-mail ou demandez-en un nouveau depuis la page de connexion.</div>
      : <form onSubmit={submit}>
        <label className="formLabel" htmlFor="newPassword">Nouveau mot de passe</label>
        <div className="inputFrame"><LockKeyhole size={18}/><input id="newPassword" type={visible?'text':'password'} autoComplete="new-password" minLength={10} required value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" className="iconButton" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Masquer le mot de passe':'Afficher le mot de passe'}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
        <label className="formLabel" htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
        <div className="inputFrame"><LockKeyhole size={18}/><input id="confirmPassword" type={visible?'text':'password'} autoComplete="new-password" minLength={10} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>
        {error && <div className="errorMessage" role="alert">{error}</div>}
        <button type="submit" disabled={busy} className="button buttonPrimary authSubmit">{busy?<LoaderCircle size={18} className="spin"/>:null}Enregistrer et accéder à mon compte <ArrowRight size={17}/></button>
      </form>}
      <div className="authRecoveryActions"><Link className="forgotLink" href="/login">Retour à la connexion</Link></div>
    </div></div>
  </main>
}
