'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { isAuthError } from '@supabase/supabase-js'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole,
  Mail, Phone, ShieldCheck, UserRound, AlertCircle, LoaderCircle,
} from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import styles from '../account.module.css'

type Mode = 'login' | 'signup' | 'recover' | 'verify' | 'reset'
type Channel = 'email' | 'phone'

function normalizedPhone(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, '')
  const international = compact.startsWith('00') ? '+' + compact.slice(2) : compact
  if (/^\d{8}$/.test(international)) return '+227' + international
  if (/^227\d{8}$/.test(international)) return '+' + international
  if (!/^\+[1-9]\d{7,14}$/.test(international)) return null
  if (international.startsWith('+227') && international.length !== 12) return null
  return international
}

function translatedError(error: unknown, channel: Channel) {
  if (!isAuthError(error)) {
    return error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.'
  }

  switch (error.code) {
    case 'invalid_credentials':
      return channel === 'phone'
        ? 'Utilisez le numéro déjà associé à votre compte ou connectez-vous par e-mail.'
        : 'Connexion impossible avec cette adresse et ce mot de passe. Vous pouvez réinitialiser votre mot de passe.'
    case 'email_not_confirmed':
      return 'Confirmez votre adresse e-mail avant de vous connecter.'
    case 'phone_not_confirmed':
      return 'Votre numéro doit être confirmé avant la connexion.'
    case 'phone_provider_disabled':
    case 'sms_send_failed':
      return 'L’accès par téléphone est indisponible. Utilisez votre adresse e-mail.'
    case 'over_email_send_rate_limit':
    case 'over_sms_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Trop de tentatives. Réessayez plus tard.'
    case 'otp_expired':
      return 'Code invalide ou expiré. Demandez un nouveau code.'
    default:
      return 'Impossible de terminer cette opération. Réessayez dans quelques instants.'
  }
}

export default function AuthPage() {
  const supabase = useMemo(() => createClient(), [])
  const [mode, setMode] = useState<Mode>('login')
  const [channel, setChannel] = useState<Channel>('email')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [fullName, setFullName] = useState('')
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accept, setAccept] = useState(false)
  const [pendingPhone, setPendingPhone] = useState('')
  const [verifyPurpose, setVerifyPurpose] = useState<'signup' | 'recovery'>('signup')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get('mode')
    if (requestedMode === 'reset') setMode('reset')
    else if (requestedMode === 'signup') setMode('signup')
    else if (requestedMode === 'recover') setMode('recover')
    const callbackError = new URLSearchParams(window.location.search).get('error')
    if (callbackError) {
      setNotice('Le lien de vérification est invalide ou expiré. Demandez un nouveau lien.')
      setIsError(true)
    }
  }, [])

  const switchMode = (next: Mode) => {
    setMode(next)
    setNotice('')
    setIsError(false)
    setBusy(false)
    setToken('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || busy) return
    setBusy(true)
    setNotice('')
    setIsError(false)
    try {
      const email = contact.trim().toLowerCase()
      const phone = channel === 'phone' ? normalizedPhone(contact) : null
      if (mode !== 'reset' && mode !== 'verify') {
        if (channel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Saisissez une adresse e-mail valide.')
        if (channel === 'phone' && !phone) throw new Error('Saisissez un numéro valide, par exemple +227 90 00 00 00.')
      }

      if (mode === 'login') {
        if (!password) throw new Error('Le mot de passe est obligatoire.')
        const credentials = channel === 'phone' ? { phone: phone!, password } : { email, password }
        const { error } = await supabase.auth.signInWithPassword(credentials)
        if (error) throw error
        window.location.assign('/application/profil')
        return
      }

      if (mode === 'signup') {
        if (fullName.trim().length < 2) throw new Error('Indiquez votre nom complet.')
        if (password.length < 10) throw new Error('Utilisez un mot de passe d’au moins 10 caractères.')
        if (password !== passwordConfirm) throw new Error('Les mots de passe ne correspondent pas.')
        if (!accept) throw new Error('Acceptez les conditions d’utilisation avant de continuer.')
        const { data, error } = channel === 'phone'
          ? await supabase.auth.signUp({ phone: phone!, password, options: { data: { full_name: fullName.trim() } } })
          : await supabase.auth.signUp({
              email, password,
              options: {
                data: { full_name: fullName.trim() },
                emailRedirectTo: window.location.origin + '/auth/callback?next=%2Fapplication%2Fprofil',
              },
            })
        if (error) throw error
        if (data.session) {
          window.location.assign('/application/profil')
          return
        }
        if (channel === 'phone') {
          setPendingPhone(phone!)
          setVerifyPurpose('signup')
          setMode('verify')
          setNotice('Un code de confirmation vous a été envoyé par SMS.')
        } else {
          setNotice('Compte créé. Consultez votre boîte e-mail pour confirmer votre adresse avant la connexion.')
        }
        return
      }

      if (mode === 'recover') {
        if (channel === 'email') {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/auth/callback?next=%2Fapplication%2Fcompte%3Fmode%3Dreset',
          })
          if (error) throw error
          setNotice('Si cette adresse correspond à un compte, vous recevrez un lien de réinitialisation.')
        } else {
          const { error } = await supabase.auth.signInWithOtp({ phone: phone!, options: { shouldCreateUser: false } })
          if (error) throw error
          setPendingPhone(phone!)
          setVerifyPurpose('recovery')
          setMode('verify')
          setNotice('Saisissez le code SMS reçu pour réinitialiser le mot de passe.')
        }
        return
      }

      if (mode === 'verify') {
        if (!/^\d{6,8}$/.test(token.trim())) throw new Error('Saisissez le code numérique reçu par SMS.')
        const { error } = await supabase.auth.verifyOtp({ phone: pendingPhone, token: token.trim(), type: 'sms' })
        if (error) throw error
        if (verifyPurpose === 'recovery') {
          switchMode('reset')
          setNotice('Numéro vérifié. Définissez maintenant votre nouveau mot de passe.')
        } else {
          window.location.assign('/application/profil')
        }
        return
      }

      if (mode === 'reset') {
        if (password.length < 10 || password !== passwordConfirm) throw new Error('Saisissez deux fois le même mot de passe d’au moins 10 caractères.')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Session de récupération expirée. Redemandez un lien ou un code de vérification.')
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setPassword('')
        setPasswordConfirm('')
        setNotice('Mot de passe enregistré. Votre compte est prêt.')
      }
    } catch (error) {
      setIsError(true)
      setNotice(translatedError(error, channel))
    } finally {
      setBusy(false)
    }
  }

  const title = {
    login: 'Connectez-vous à votre compte',
    signup: 'Créer votre compte',
    recover: 'Récupérer votre accès',
    verify: 'Confirmer votre numéro',
    reset: 'Définir un mot de passe',
  }[mode]

  return <main className={styles.shell}>
    <div className={styles.narrow}>
      <Link href="/application/parametres" className={styles.back}><ArrowLeft size={17} /> Paramètres</Link>
      <header className={styles.formHeader}>
        <div className={styles.formLogo}><ShieldCheck size={30} aria-hidden="true" /></div>
        <span className={styles.eyebrow}>Le Niger et ses Merveilles</span>
        <h1>{title}</h1>
        <p>Un espace personnel sécurisé pour découvrir, enregistrer et partager le patrimoine du Niger.</p>
      </header>
      <section className={[styles.card, styles.authCard].join(' ')}>
        {!supabase && <p className={[styles.status, styles.err].join(' ')} role="alert">La connexion est temporairement indisponible. Réessayez plus tard.</p>}
        <form onSubmit={submit} className={styles.form}>
          {(mode === 'login' || mode === 'signup' || mode === 'recover') && <>
            <div className={styles.fieldGroup}>
              <span className={styles.label}>Méthode d’identification</span>
              <div className={styles.segmented} role="group" aria-label="Choisir e-mail ou téléphone">
                <button className={styles.segment} type="button" aria-pressed={channel === 'email'} onClick={() => {setChannel('email');setContact('');setNotice('')}}><Mail size={17} /> E-mail</button>
                <button className={styles.segment} type="button" aria-pressed={channel === 'phone'} onClick={() => {setChannel('phone');setContact('');setNotice('')}}><Phone size={17} /> Téléphone</button>
              </div>
            </div>
            {mode === 'signup' && <label className={styles.fieldGroup}><span className={styles.label}>Nom complet</span><span className={styles.inputWrap}><UserRound size={19} /><input className={styles.input} value={fullName} onChange={e=>setFullName(e.target.value)} autoComplete="name" maxLength={80} required placeholder="Votre nom et prénom" /></span></label>}
            <label className={styles.fieldGroup}>
              <span className={styles.label}>{channel === 'email' ? 'Adresse e-mail' : 'Numéro de téléphone'}</span>
              <span className={styles.inputWrap}>{channel === 'email' ? <Mail size={19} /> : <Phone size={19} />}
                <input className={styles.input} type={channel === 'email' ? 'email' : 'tel'} inputMode={channel === 'phone' ? 'tel' : 'email'} value={contact} onChange={e=>setContact(e.target.value)} autoComplete={channel === 'email' ? 'email' : 'tel'} maxLength={254} required placeholder={channel === 'email' ? 'vous@exemple.com' : '+227 90 00 00 00'} />
              </span>
              {channel === 'phone' && <span className={styles.hint}>Indicatif +227 pour le Niger. Un numéro international au format +pays est aussi accepté.</span>}
            </label>
          </>}

          {(mode === 'login' || mode === 'signup' || mode === 'reset') && <>
            <label className={styles.fieldGroup}>
              <span className={styles.label}>{mode === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe'}</span>
              <span className={styles.inputWrap}><LockKeyhole size={19} /><input className={styles.input} type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 10} required placeholder={mode === 'login' ? 'Votre mot de passe' : 'Au moins 10 caractères'} />
                <button type="button" className={styles.eye} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} onClick={() => setShowPassword(s=>!s)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </span>
            </label>
            {(mode === 'signup' || mode === 'reset') && <label className={styles.fieldGroup}><span className={styles.label}>Confirmer le mot de passe</span><span className={styles.inputWrap}><KeyRound size={19}/><input className={styles.input} type={showPassword ? 'text' : 'password'} value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} minLength={10} autoComplete="new-password" required placeholder="Répétez votre mot de passe" /></span></label>}
          </>}

          {mode === 'verify' && <label className={styles.fieldGroup}><span className={styles.label}>Code envoyé à {pendingPhone}</span><span className={styles.inputWrap}><Phone size={19}/><input className={styles.input} value={token} onChange={e=>setToken(e.target.value.replace(/\D/g, ''))} type="text" inputMode="numeric" pattern="[0-9]{6,8}" maxLength={8} autoComplete="one-time-code" required placeholder="Code de vérification" /></span></label>}
          {mode === 'signup' && <label className={styles.checkLine}><input type="checkbox" checked={accept} onChange={e=>setAccept(e.target.checked)}/><span>J’accepte les conditions d’utilisation et la politique de confidentialité de la plateforme.</span></label>}
          {notice && <div role={isError ? 'alert' : 'status'} className={[styles.status, isError ? styles.err : styles.ok].join(' ')}>{isError ? <AlertCircle size={15} style={{display:'inline',marginRight:7}}/> : <CheckCircle2 size={15} style={{display:'inline',marginRight:7}}/>}{notice}</div>}
          <button className={styles.primary} type="submit" disabled={busy || !supabase}>{busy ? <LoaderCircle size={18} className="animate-spin" /> : mode === 'login' ? <LockKeyhole size={18} /> : <ArrowRight size={18} />}
            {busy ? 'Traitement en cours…' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : mode === 'recover' ? 'Envoyer la récupération' : mode === 'verify' ? 'Vérifier le code' : 'Enregistrer le mot de passe'}
          </button>
          {mode === 'login' && <div className={styles.inlineActions}><button type="button" className={styles.textLink} onClick={()=>switchMode('recover')}>Mot de passe oublié ?</button><button type="button" className={styles.textLink} onClick={()=>switchMode('signup')}>Créer un compte</button></div>}
          {mode === 'signup' && <button type="button" className={styles.textLink} onClick={()=>switchMode('login')}>Déjà inscrit ? Se connecter</button>}
          {(mode === 'recover' || mode === 'verify' || mode === 'reset') && <button type="button" className={styles.textLink} onClick={()=>switchMode('login')}>Revenir à la connexion</button>}
        </form>
      </section>
    </div>
  </main>
}
