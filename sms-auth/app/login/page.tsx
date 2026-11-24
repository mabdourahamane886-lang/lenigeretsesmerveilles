'use client'
import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser'

/** Messages compréhensibles, sans révéler si une adresse appartient à un compte. */
function errorMessage(error: unknown): string {
  const auth = error as { code?: string; message?: string; status?: number } | null
  const code = (auth?.code || '').toLowerCase()
  const message = (auth?.message || '').toLowerCase()
  if (code === 'invalid_credentials' || code === 'invalid_login_credentials' || message.includes('invalid login credentials')) {
    return 'Adresse e-mail ou mot de passe incorrect. Vérifiez vos informations, utilisez « Mot de passe oublié ? » ou créez un compte si nécessaire.'
  }
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'Votre adresse e-mail n’est pas encore confirmée. Ouvrez le message reçu lors de votre inscription.'
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || auth?.status === 429) {
    return 'Trop de demandes. Attendez quelques minutes avant de réessayer.'
  }
  if (code === 'email_provider_disabled' || code === 'email_address_invalid') {
    return 'Cette adresse e-mail ne peut pas être utilisée actuellement. Vérifiez votre adresse ou contactez l’administrateur.'
  }
  if (code === 'weak_password' || message.includes('password should be')) {
    return 'Choisissez un mot de passe plus sécurisé, avec au moins 10 caractères.'
  }
  if (code === 'signup_disabled') return 'La création de comptes est désactivée sur ce projet Supabase.'
  if (message.includes('failed to fetch') || message.includes('network')) return 'Impossible de joindre le serveur. Vérifiez votre connexion Internet puis réessayez.'
  return 'La demande n’a pas pu aboutir. Réessayez ou utilisez la récupération par e-mail.'
}

export default function LoginPage() {
  const router = useRouter()
  const [signup, setSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [showRecovery, setShowRecovery] = useState(false)
  const supabase = getBrowserClient()

  // Ne pas obliger une personne déjà connectée à saisir ses identifiants.
  useEffect(() => {
    if (!supabase) return
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) router.replace('/dashboard')
    }).catch(() => { /* Le formulaire reste disponible sans session. */ })
    return () => { active = false }
  }, [supabase, router])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase) { setError('Connexion indisponible : configuration Supabase manquante.'); return }
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) { setError('Saisissez votre adresse e-mail et votre mot de passe.'); return }
    // Un ancien compte Bickri Service Agency peut utiliser un mot de passe de moins
    // de 10 caractères : imposer cette règle à la connexion rejetterait ce compte.
    if (signup && password.length < 10) {
      setError('Pour créer un compte, choisissez un mot de passe d’au moins 10 caractères.')
      return
    }
    setBusy(true); setError(''); setNotice(''); setShowRecovery(false)
    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail, password,
          options: { emailRedirectTo: window.location.origin + '/auth/callback' },
        })
        if (error) throw error
        if (!data.session) {
          setNotice('Si une confirmation est nécessaire, consultez votre boîte e-mail. Si vous possédez déjà un compte Bickri Service Agency, utilisez « Connexion » ou « Mot de passe oublié ? ».')
          setSignup(false)
          setPassword('')
          return
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
        if (error) throw error
        if (!data.session) { setError('Connexion non établie. Réessayez ou récupérez votre compte par e-mail.'); return }
      }
      router.replace('/dashboard')
      router.refresh()
    } catch (e) {
      const auth = e as { code?: string; message?: string } | null
      const invalid = /invalid.*credentials/i.test((auth?.code || '') + ' ' + (auth?.message || ''))
      setShowRecovery(!signup && invalid)
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  async function emailAccess(mode: 'recovery' | 'link') {
    if (!supabase || !email.trim().includes('@')) {
      setError('Renseignez votre adresse e-mail avant de demander un lien sécurisé.')
      return
    }
    setBusy(true); setError(''); setNotice(''); setShowRecovery(false)
    const cleanEmail = email.trim().toLowerCase()
    try {
      if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin + '/auth/callback?next=/reset-password',
        })
        if (error) throw error
        setNotice('Si cette adresse correspond à un compte, un e-mail de réinitialisation a été demandé. Ouvrez le lien depuis votre messagerie pour définir un nouveau mot de passe.')
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: window.location.origin + '/auth/callback',
          },
        })
        if (error) throw error
        setNotice('Si cette adresse possède un compte, un lien de connexion sécurisé a été demandé. Consultez votre messagerie.')
      }
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return <main className="authPage">
    <div className="authDecor">
      <Link className="authBack" href="/"><ArrowLeft size={17}/> Retour au site</Link>
      <div className="authDecorContent"><span className="authSecure"><ShieldCheck size={18}/> SMS AUTH SECURITY</span><h1>Votre espace.<br/><em>Votre contrôle.</em></h1>
        <p>Gérez vos projets, vos clés API et votre système de vérification depuis une console conçue pour vous.</p>
        <div className="authBenefits"><span><LockKeyhole size={17}/> Données d’accès sécurisées</span><span><KeyRound size={17}/> Clés API privées</span></div>
      </div>
      <span className="authDecorBottom">SMS AUTH · SECURE MESSAGING PLATFORM</span>
    </div>
    <div className="authRight"><div className="authForm">
      <Link href="/" className="mobileBrand"><ShieldCheck size={25}/> SMS AUTH</Link>
      <span className="sectionKicker">ESPACE PERSONNEL</span>
      <h2>{signup ? 'Créer un compte' : 'Bon retour parmi nous.'}</h2>
      <p>{signup ? 'Créez votre espace professionnel pour gérer vos intégrations.' : 'Utilisez le compte associé à votre projet Supabase Bickri Service Agency.'}</p>
      <div className="authTabs">
        <button type="button" className={!signup?'active':''} onClick={()=>{setSignup(false);setError('');setNotice('')}}>Connexion</button>
        <button type="button" className={signup?'active':''} onClick={()=>{setSignup(true);setError('');setNotice('')}}>Inscription</button>
      </div>
      <form onSubmit={submit}>
        <label className="formLabel" htmlFor="auth-email">Adresse e-mail</label>
        <div className="inputFrame"><Mail size={19}/><input id="auth-email" type="email" placeholder="nom@entreprise.com" autoComplete="email" value={email} required onChange={e=>setEmail(e.target.value)}/></div>
        <label className="formLabel" htmlFor="auth-password">Mot de passe</label>
        <div className="inputFrame"><LockKeyhole size={19}/><input id="auth-password" type={visible?'text':'password'} autoComplete={signup?'new-password':'current-password'} minLength={signup?10:undefined} placeholder={signup?'10 caractères minimum':'Votre mot de passe'} value={password} required onChange={e=>setPassword(e.target.value)}/><button className="iconButton" type="button" aria-label={visible?'Masquer':'Afficher'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
        {error && <div className="errorMessage" role="alert">{error}</div>}
        {showRecovery && !signup && <div className="authRecoveryPrompt"><p><KeyRound size={18}/> Le compte Supabase ne peut pas être ouvert avec ces identifiants. Utilisez un lien sécurisé reçu par e-mail, sans modifier votre compte.</p><button type="button" disabled={busy || !supabase} onClick={() => void emailAccess('link')}>Recevoir un lien de connexion <ArrowRight size={16}/></button><button type="button" disabled={busy || !supabase} onClick={() => void emailAccess('recovery')}>Définir un nouveau mot de passe</button></div>}
        {notice && <div className="successMessage" role="status">{notice}</div>}
        <button disabled={busy||!supabase} type="submit" className="button buttonPrimary authSubmit">{busy?<LoaderCircle size={18} className="spin"/>:null}{signup?'Créer mon compte':'Se connecter'}<ArrowRight size={18}/></button>
      </form>
      {!signup && <div className="authRecoveryActions">
        <button type="button" disabled={busy||!supabase} className="forgotLink" onClick={()=>void emailAccess('recovery')}>Mot de passe oublié ?</button>
        <button type="button" disabled={busy||!supabase} className="forgotLink" onClick={()=>void emailAccess('link')}>Recevoir un lien de connexion par e-mail</button>
      </div>}
      {!supabase && <p className="configNote">La connexion sera disponible après configuration des variables Supabase dans votre hébergement.</p>}
      <div className="authFinePrint"><ShieldCheck size={17}/><span>Connexion protégée par Supabase Auth. Aucun mot de passe n’est conservé dans SMS AUTH.</span></div>
    </div></div>
  </main>
}
