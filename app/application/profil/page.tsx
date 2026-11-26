'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import {
  ArrowLeft, ArrowRight, CheckCircle2, LogOut, Mail, MapPin, Phone,
  Settings2, ShieldCheck, UserRound, LockKeyhole,
} from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import styles from '../account.module.css'

const REGIONS = ['Niamey','Agadez','Diffa','Dosso','Maradi','Tahoua','Tillabéri','Zinder','Autre région']

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [region, setRegion] = useState('')
  const [status, setStatus] = useState('')
  const [failed, setFailed] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    try {
      const preferences = JSON.parse(localStorage.getItem('niger-app-preferences-v2') || '{}')
      setLargeText(preferences.largeText === true)
      setDark(preferences.theme === 'dark' || (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches))
    } catch { /* préférences facultatives */ }
  }, [])

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      if (data.user) {
        setUser(data.user)
        setName(String(data.user.user_metadata?.full_name || ''))
        setBio(String(data.user.user_metadata?.bio || ''))
        setRegion(String(data.user.user_metadata?.region || ''))
      } else setUser(null)
      setLoading(false)
    }).catch(() => {if(active)setLoading(false)})
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session)=>{
      if (active) {
        setUser(session?.user ?? null)
        if (session?.user) {
          setName(String(session.user.user_metadata?.full_name || ''))
          setBio(String(session.user.user_metadata?.bio || ''))
          setRegion(String(session.user.user_metadata?.region || ''))
        }
      }
    })
    return () => {active = false; subscription.unsubscribe()}
  }, [supabase])

  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !user || busy) return
    setBusy(true); setStatus(''); setFailed(false)
    try {
      if (name.trim().length < 2) throw new Error('Le nom doit contenir au moins 2 caractères.')
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name:name.trim(), bio:bio.trim(), region },
      })
      if (error) throw error
      setUser(data.user)
      setStatus('Votre profil a été enregistré dans votre compte sécurisé.')
    } catch (error) {
      setFailed(true)
      setStatus(error instanceof Error ? error.message : 'Impossible de sauvegarder le profil.')
    } finally {setBusy(false)}
  }

  async function signOut() {
    if (!supabase || busy) return
    setBusy(true); setStatus(''); setFailed(false)
    const { error } = await supabase.auth.signOut()
    if (error) {setStatus(error.message);setFailed(true);setBusy(false);return}
    setUser(null);setBusy(false);setName('');setBio('');setRegion('')
    setStatus('Vous êtes déconnecté.')
  }

  return <main className={styles.shell} data-theme={dark ? 'dark' : 'light'} style={largeText ? {fontSize:'1.095rem'} : undefined}>
    <div className={`${styles.container} ${styles.profileCompact}`}>
      <Link className={styles.back} href="/application/parametres"><ArrowLeft size={17}/> Paramètres</Link>
      <h1 className={styles.heading}>Mon profil</h1>
      <p className={styles.lead}>Gérez vos informations personnelles.</p>
      {loading ? <div className={styles.notice} role="status">Chargement sécurisé de votre compte…</div>
      : !user ? <>
          <div className={styles.accountCard}>
            <span className={styles.avatar}><UserRound size={28}/></span>
            <div className={styles.accountInfo}><strong>Bienvenue dans votre espace</strong><small>Connectez-vous ou créez un compte pour enregistrer votre profil en ligne.</small></div>
          </div>
          <div style={{maxWidth:350,display:'grid',gap:10}}>
            <Link className={styles.primary} href="/application/compte"><LockKeyhole size={18}/> Se connecter</Link>
            <Link className={styles.secondary} href="/application/compte?mode=signup"><UserRound size={18}/> Créer un compte</Link>
          </div>
        </>
      : <>
          <div className={styles.accountCard}>
            <span className={styles.avatar}><UserRound size={29}/></span>
            <div className={styles.accountInfo}>
              <strong>{name || user.email || user.phone || 'Compte utilisateur'}</strong>
              <small>{user.email || user.phone || 'Identité confirmée'}</small>
            </div>
            <span className={styles.pill}><ShieldCheck size={15}/> Connecté</span>
          </div>
          <div className={styles.card}>
            <div className={styles.groupBlock}>
              <h2 style={{margin:'0 0 16px',fontSize:'1.15rem'}}>Informations du profil</h2>
              <form className={styles.form} onSubmit={save}>
                <label className={styles.fieldGroup}><span className={styles.label}>Nom affiché</span><span className={styles.inputWrap}><UserRound size={19}/><input className={styles.input} value={name} onChange={e=>setName(e.target.value)} required maxLength={80} autoComplete="name" placeholder="Votre nom complet"/></span></label>
                <label className={styles.fieldGroup}><span className={styles.label}>Biographie</span><textarea className={styles.textArea} value={bio} onChange={e=>setBio(e.target.value)} maxLength={500} rows={3} placeholder="Présentez-vous en quelques lignes…" /></label>
                <label className={styles.fieldGroup}><span className={styles.label}><MapPin size={17} style={{display:'inline',marginRight:7}}/> Région</span><select className={styles.select} value={region} onChange={e=>setRegion(e.target.value)}><option value="">Non renseignée</option>{REGIONS.map(r=><option key={r} value={r}>{r}</option>)}</select></label>
                <button type="submit" className={styles.primary} disabled={busy}><CheckCircle2 size={18}/>{busy ? 'Enregistrement…' : 'Enregistrer mon profil'}</button>
              </form>
            </div>
          </div>
          <h2 className={styles.sectionTitle}>Identifiants du compte</h2>
          <div className={styles.card}>
            {user.email && <div className={styles.row}><span className={styles.rowIcon}><Mail size={21}/></span><div className={styles.rowText}><strong>E-mail</strong><small>{user.email}</small></div><ShieldCheck size={18} className={styles.arrow}/></div>}
            {user.phone && <div className={styles.row}><span className={styles.rowIcon}><Phone size={21}/></span><div className={styles.rowText}><strong>Téléphone</strong><small>{user.phone}</small></div><ShieldCheck size={18} className={styles.arrow}/></div>}
            <Link className={styles.row} href="/application/compte?mode=reset"><span className={styles.rowIcon}><LockKeyhole size={21}/></span><div className={styles.rowText}><strong>Modifier mon mot de passe</strong><small>Définir un nouveau mot de passe sécurisé</small></div><ArrowRight size={18} className={styles.arrow}/></Link>
            <Link className={styles.row} href="/application/parametres"><span className={styles.rowIcon}><Settings2 size={21}/></span><div className={styles.rowText}><strong>Préférences</strong><small>Affichage, langue et actualités</small></div><ArrowRight size={18} className={styles.arrow}/></Link>
          </div>
          <button className={styles.secondary} disabled={busy} type="button" onClick={signOut}><LogOut size={18}/> Se déconnecter</button>
        </>}
      {status && <p role={failed ? 'alert' : 'status'} className={[styles.status, failed ? styles.err : styles.ok].join(' ')} style={{marginTop:18}}>{status}</p>}
      {!supabase && <div role="alert" className={[styles.status,styles.err].join(' ')}>La connexion nécessite les clés publiques Supabase configurées dans Vercel.</div>}
    </div>
  </main>
}
