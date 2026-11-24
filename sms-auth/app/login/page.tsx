'use client'
import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound,
  LoaderCircle, LockKeyhole, Mail, ShieldCheck,
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser'

type LoginMode = 'email' | 'password'

function friendlyAuthError(error: unknown): string {
  const authError = error as { code?: string; message?: string; status?: number } | null
  const code = (authError?.code || '').toLowerCase()
  const message = (authError?.message || '').toLowerCase()

  if (code === 'invalid_credentials' || code === 'invalid_login_credentials' || message.includes('invalid login credentials')) {
    return 'Adresse e-mail ou mot de passe incorrect. Utilisez plutôt « Continuer avec mon e-mail » pour recevoir un lien de connexion.'
  }
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'Votre e-mail doit être confirmé. Utilisez la connexion par lien sécurisé.'
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || authError?.status === 429) {
    return 'Trop de demandes de connexion. Réessayez dans quelques minutes.'
  }
  if (code === 'email_provider_disabled') return 'La connexion par e-mail est momentanément indisponible.'
  if (code === 'email_address_invalid') return 'Vérifiez votre adresse e-mail.'
  if (code === 'otp_disabled' || code === 'otp_expired') return 'Ce lien a expiré. Demandez un nouveau lien.'
  if (code === 'signup_disabled') return 'La création automatique de compte est désactivée. Contactez le responsable de SMS AUTH.'
  if (message.includes('failed to fetch') || message.includes('network')) return 'Impossible de joindre le serveur. Vérifiez votre connexion Internet.'
  return 'Une erreur est survenue. Veuillez réessayer.'
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [notice, setNotice] = useState('')
  const supabase = getBrowserClient()

  useEffect(() => {
    if (!supabase) return
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) router.replace('/dashboard')
    }).catch(() => {})
    return () => { active = false }
  }, [supabase, router])

  function changeMode(next: LoginMode) {
    setMode(next)
    setError('')
    setNotice('')
    setSent(false)
    setPassword('')
  }

  async function emailContinue(event: FormEvent) {
    event.preventDefault()
    if (!supabase) {
      setError('Le service de connexion est momentanément indisponible.')
      return
    }
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail.includes('@')) {
      setError('Saisissez une adresse e-mail valide.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      // Si le compte n'existe pas, le fournisseur d'identité le crée directement
      // pour SMS AUTH. Aucun compte préalable chez Supabase n'est nécessaire.
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      })
      if (authError) throw authError
      setSent(true)
      setNotice('Un lien de connexion vient d’être demandé. Consultez votre boîte e-mail et ouvrez le lien pour accéder à SMS AUTH.')
    } catch (e) {
      setError(friendlyAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  async function passwordContinue(event: FormEvent) {
    event.preventDefault()
    if (!supabase) {
      setError('Le service de connexion est momentanément indisponible.')
      return
    }
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail.includes('@') || !password) {
      setError('Saisissez votre e-mail et votre mot de passe.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail, password,
      })
      if (authError) throw authError
      if (!data.session) {
        setError('Impossible d’ouvrir la session. Essayez la connexion par e-mail.')
        return
      }
      router.replace('/dashboard')
      router.refresh()
    } catch (e) {
      setError(friendlyAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  async function resetPassword() {
    if (!supabase || !email.trim().includes('@')) {
      setError('Renseignez d’abord votre adresse e-mail.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: window.location.origin + '/auth/callback?next=/reset-password' },
      )
      if (authError) throw authError
      setNotice('Si un compte utilise cette adresse, un lien de changement de mot de passe a été demandé.')
    } catch (e) {
      setError(friendlyAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  return <main className="authPage">
    <div className="authDecor">
      <Link className="authBack" href="/"><ArrowLeft size={17}/> Retour au site</Link>
      <div className="authDecorContent">
        <span className="authSecure"><ShieldCheck size={18}/> SMS AUTH SECURITY</span>
        <h1>Votre espace.<br/><em>En toute simplicité.</em></h1>
        <p>Un accès personnel sécurisé avec votre e-mail. Vos projets et vos clés API restent protégés.</p>
        <div className="authBenefits">
          <span><Mail size={17}/> Un seul e-mail pour commencer</span>
          <span><LockKeyhole size={17}/> Connexion sécurisée sans mot de passe obligatoire</span>
        </div>
      </div>
      <span className="authDecorBottom">SMS AUTH · SECURE MESSAGING PLATFORM</span>
    </div>

    <div className="authRight"><div className="authForm">
      <Link href="/" className="mobileBrand"><ShieldCheck size={25}/> SMS AUTH</Link>
      <span className="sectionKicker">VOTRE ESPACE</span>
      <h2>{sent ? 'Consultez vos e-mails' : 'Bienvenue sur SMS AUTH'}</h2>
      <p>{sent
        ? 'Votre lien de connexion vous permet de confirmer votre adresse et d’ouvrir votre espace personnel.'
        : 'Connectez-vous ou créez votre compte directement ici. Aucun autre compte n’est nécessaire.'}</p>

      {mode === 'email'
        ? <form onSubmit={emailContinue}>
            <label className="formLabel" htmlFor="auth-email">Votre adresse e-mail</label>
            <div className="inputFrame"><Mail size={19}/><input id="auth-email" type="email"
              autoComplete="email" inputMode="email" placeholder="nom@exemple.com" value={email}
              onChange={e=>{setEmail(e.target.value);setSent(false);setError('');setNotice('')}}
              required /></div>
            {error && <div className="errorMessage" role="alert">{error}</div>}
            {notice && <div className="successMessage" role="status"><CheckCircle2 size={18}/> {notice}</div>}
            <button disabled={busy || !supabase} type="submit" className="button buttonPrimary authSubmit">
              {busy ? <LoaderCircle size={18} className="spin"/> : <Mail size={18}/>}
              {sent ? 'Renvoyer un lien' : 'Continuer avec mon e-mail'} <ArrowRight size={18}/>
            </button>
            {sent && <p className="authEmailHint">Vérifiez aussi le dossier Spam. Le lien est personnel et utilisable une seule fois.</p>}
          </form>
        : <form onSubmit={passwordContinue}>
            <label className="formLabel" htmlFor="auth-email">Adresse e-mail</label>
            <div className="inputFrame"><Mail size={19}/><input id="auth-email" type="email"
              autoComplete="email" placeholder="nom@exemple.com" value={email}
              onChange={e=>setEmail(e.target.value)} required /></div>
            <label className="formLabel" htmlFor="auth-password">Mot de passe</label>
            <div className="inputFrame"><LockKeyhole size={19}/><input id="auth-password"
              type={visible?'text':'password'} autoComplete="current-password"
              placeholder="Votre mot de passe" value={password}
              onChange={e=>setPassword(e.target.value)} required />
              <button className="iconButton" type="button" onClick={()=>setVisible(!visible)}
                aria-label={visible?'Masquer le mot de passe':'Afficher le mot de passe'}>
                {visible?<EyeOff size={18}/>:<Eye size={18}/>}
              </button></div>
            {error && <div className="errorMessage" role="alert">{error}</div>}
            {notice && <div className="successMessage" role="status">{notice}</div>}
            <button disabled={busy || !supabase} type="submit" className="button buttonPrimary authSubmit">
              {busy ? <LoaderCircle size={18} className="spin"/> : null}
              Se connecter <ArrowRight size={18}/>
            </button>
            <div className="authRecoveryActions">
              <button type="button" disabled={busy} className="forgotLink"
                onClick={()=>void resetPassword()}>Mot de passe oublié ?</button>
            </div>
          </form>}

      <div className="authSimpleAlternate">
        {mode === 'email'
          ? <button type="button" disabled={busy} onClick={()=>changeMode('password')}>
              <KeyRound size={16}/> Utiliser mon mot de passe
            </button>
          : <button type="button" disabled={busy} onClick={()=>changeMode('email')}>
              <Mail size={16}/> Continuer sans mot de passe
            </button>}
      </div>
      <div className="authFinePrint"><ShieldCheck size={17}/>
        <span>Votre compte est créé automatiquement lors de votre première connexion, après vérification de votre e-mail.</span>
      </div>
      {!supabase && <p className="configNote">La connexion est temporairement indisponible.</p>}
    </div></div>
  </main>
}
