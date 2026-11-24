'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router = useRouter()
  const [signup, setSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const supabase = getBrowserClient()
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase) { setError('Configurez les variables Supabase pour activer les comptes.'); return }
    if (password.length < 10) { setError('Le mot de passe doit compter au moins 10 caractères.'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: {
          emailRedirectTo: (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) + '/auth/callback',
        }})
        if (error) throw error
        if (!data.session) { setNotice('Compte créé. Confirmez votre adresse e-mail avant la connexion.'); setSignup(false); return }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.replace('/dashboard'); router.refresh()
    } catch (e) { setError(e instanceof Error ? e.message : 'Échec de la connexion.') }
    finally { setBusy(false) }
  }
  async function reset() {
    if (!supabase || !email.includes('@')) { setError('Renseignez d’abord votre adresse e-mail.'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) + '/auth/callback?next=/dashboard',
      })
      if (error) throw error
      setNotice('Si ce compte existe, un e-mail de récupération a été envoyé.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Demande impossible.') }
    finally { setBusy(false) }
  }
  return <main className="authPage"><div className="authDecor"><Link className="authBack" href="/"><ArrowLeft size={17}/> Retour au site</Link><div className="authDecorContent"><span className="authSecure"><ShieldCheck size={18}/> SMS AUTH SECURITY</span><h1>Votre espace.<br/><em>Votre contrôle.</em></h1><p>Gérez vos projets, vos clés API et votre système de vérification depuis une console conçue pour vous.</p><div className="authBenefits"><span><LockKeyhole size={17}/> Données d’accès sécurisées</span><span><KeyRound size={17}/> Clés API privées</span></div></div><span className="authDecorBottom">SMS AUTH · SECURE MESSAGING PLATFORM</span></div>
    <div className="authRight"><div className="authForm"><Link href="/" className="mobileBrand"><ShieldCheck size={25}/> SMS AUTH</Link><span className="sectionKicker">ESPACE PERSONNEL</span><h2>{signup ? 'Créer un compte' : 'Bon retour parmi nous.'}</h2><p>{signup ? 'Créez votre espace professionnel pour gérer vos intégrations.' : 'Connectez-vous pour accéder à votre console SMS AUTH.'}</p>
      <div className="authTabs"><button type="button" className={!signup?'active':''} onClick={()=>{setSignup(false);setError('');setNotice('')}}>Connexion</button><button type="button" className={signup?'active':''} onClick={()=>{setSignup(true);setError('');setNotice('')}}>Inscription</button></div>
      <form onSubmit={submit}>
        <label className="formLabel" htmlFor="auth-email">Adresse e-mail</label><div className="inputFrame"><Mail size={19}/><input id="auth-email" type="email" placeholder="nom@entreprise.com" autoComplete="email" value={email} required onChange={e=>setEmail(e.target.value)}/></div>
        <label className="formLabel" htmlFor="auth-password">Mot de passe</label><div className="inputFrame"><LockKeyhole size={19}/><input id="auth-password" type={visible?'text':'password'} autoComplete={signup?'new-password':'current-password'} minLength={10} placeholder="10 caractères minimum" value={password} required onChange={e=>setPassword(e.target.value)}/><button className="iconButton" type="button" aria-label={visible?'Masquer':'Afficher'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
        {!signup && <button type="button" className="forgotLink" onClick={reset}>Mot de passe oublié ?</button>}
        {error && <div className="errorMessage" role="alert">{error}</div>}
        {notice && <div className="successMessage" role="status">{notice}</div>}
        <button disabled={busy||!supabase} type="submit" className="button buttonPrimary authSubmit">{busy?<LoaderCircle size={18} className="spin"/>:null}{signup?'Créer mon compte':'Se connecter'}<ArrowRight size={18}/></button>
      </form>
      {!supabase && <p className="configNote">La connexion sera disponible après configuration des variables Supabase dans votre hébergement.</p>}
      <div className="authFinePrint"><ShieldCheck size={17}/><span>Connexion protégée par Supabase Auth. Vos clés d’API ne sont jamais affichées après leur création.</span></div>
    </div></div>
  </main>
}
