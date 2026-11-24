'use client'

import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import {
  ArrowLeft, Bell, BookOpen, Bookmark, CheckCircle2, ChevronRight, CircleHelp,
  ExternalLink, FileText, Globe2, Info, Languages, LockKeyhole,
  Monitor, Moon, Palette, ShieldCheck, Sun, UserRound,
} from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import styles from '../account.module.css'

type Theme = 'system' | 'light' | 'dark'
type Preferences = { theme: Theme; language: string; notifications: boolean; largeText: boolean }
const KEY = 'niger-app-preferences-v2'
const defaults: Preferences = { theme: 'system', language: 'fr', notifications: false, largeText: false }

function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.nigerTheme = dark ? 'dark' : 'light'
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [prefs, setPrefs] = useState<Preferences>(defaults)
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
      const theme: Theme = raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system'
      const next: Preferences = {
        theme,
        language: ['fr','ha','dje','ar'].includes(raw.language) ? raw.language : 'fr',
        notifications: raw.notifications === true,
        largeText: raw.largeText === true,
      }
      setPrefs(next)
      applyTheme(next.theme)
    } catch {
      setPrefs(defaults)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null)).catch(() => setUser(null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [supabase])

  function update(next: Preferences) {
    setPrefs(next)
    setSaved(false)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      applyTheme(next.theme)
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  const resolvedTheme = prefs.theme === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : prefs.theme
  const displayName = user?.user_metadata?.full_name || user?.email || user?.phone || 'Mon espace personnel'

  return <main className={styles.shell} data-theme={resolvedTheme}>
    <div className={styles.container}>
      <Link href="/application" className={styles.back}><ArrowLeft size={17}/> Retour à l’application</Link>
      <span className={styles.eyebrow}>Application • Espace personnel</span>
      <h1 className={styles.heading}>Paramètres</h1>
      <p className={styles.lead}>Personnalisez votre expérience et retrouvez les options de votre compte dans un espace clair et sécurisé.</p>

      <div className={styles.accountCard}>
        <span className={styles.avatar}><UserRound size={29} /></span>
        <div className={styles.accountInfo}><strong>{displayName}</strong><small>{user ? 'Compte connecté' : 'Connectez-vous pour synchroniser votre identité'}</small></div>
        <Link className={styles.accountAction} href={user ? '/application/profil' : '/application/compte'}>{user ? 'Gérer' : 'Connexion'} <ChevronRight size={17}/></Link>
      </div>

      <h2 className={styles.sectionTitle}>Compte et sécurité</h2>
      <div className={styles.card}>
        <Link className={styles.row} href="/application/profil"><span className={styles.rowIcon}><UserRound size={21}/></span><span className={styles.rowText}><strong>Mon profil</strong><small>Nom, biographie et informations du compte</small></span><ChevronRight size={18} className={styles.arrow}/></Link>
        <Link className={styles.row} href={user ? '/application/compte?mode=reset' : '/application/compte'}><span className={styles.rowIcon}><LockKeyhole size={21}/></span><span className={styles.rowText}><strong>Sécurité et connexion</strong><small>Mot de passe et gestion de l’accès</small></span><ChevronRight size={18} className={styles.arrow}/></Link>
        <a className={styles.row} href="#confidentialite"><span className={styles.rowIcon}><ShieldCheck size={21}/></span><span className={styles.rowText}><strong>Confidentialité</strong><small>Comprendre la gestion de vos données</small></span><ChevronRight size={18} className={styles.arrow}/></a>
      </div>

      <h2 className={styles.sectionTitle}>Affichage et accessibilité</h2>
      <div className={styles.card}>
        <div className={styles.groupBlock}>
          <label className={styles.groupLabel} htmlFor="theme-select"><Palette size={17} style={{verticalAlign:'middle',marginRight:9}}/> Apparence</label>
          <select id="theme-select" className={styles.select} value={prefs.theme} disabled={!ready} onChange={(e:ChangeEvent<HTMLSelectElement>)=>update({...prefs,theme:e.target.value as Theme})}>
            <option value="system">Automatique — selon l’appareil</option>
            <option value="light">Mode clair</option>
            <option value="dark">Mode sombre</option>
          </select>
          <p className={styles.hint} style={{marginTop:8}}><Monitor size={15} style={{display:'inline',marginRight:5}}/><Sun size={15} style={{display:'inline',marginRight:5}}/><Moon size={15} style={{display:'inline',marginRight:5}}/> Thème enregistré sur cet appareil.</p>
        </div>
        <div className={styles.groupBlock}>
          <label className={styles.groupLabel} htmlFor="language-select"><Languages size={17} style={{verticalAlign:'middle',marginRight:9}}/> Langue préférée</label>
          <select id="language-select" className={styles.select} value={prefs.language} disabled={!ready} onChange={e=>update({...prefs,language:e.target.value})}>
            <option value="fr">Français</option><option value="ha">Hausa</option><option value="dje">Zarma</option><option value="ar">العربية — Arabe</option>
          </select>
          <p className={styles.hint} style={{marginTop:8}}>La préférence est mémorisée. L’interface complète reste pour le moment en français.</p>
        </div>
        <div className={styles.row}>
          <span className={styles.rowIcon}><BookOpen size={21}/></span>
          <label htmlFor="large-text" className={styles.rowText}><strong>Texte agrandi</strong><small>Améliorer la lecture dans les pages de compte</small></label>
          <input id="large-text" type="checkbox" className={styles.toggle} checked={prefs.largeText} disabled={!ready} onChange={e=>update({...prefs,largeText:e.target.checked})} aria-label="Activer le texte agrandi"/>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Contenus et notifications</h2>
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.rowIcon}><Bell size={21}/></span>
          <label htmlFor="notifications" className={styles.rowText}><strong>Suivi des actualités</strong><small>Enregistrer ma préférence (notifications push non activées)</small></label>
          <input id="notifications" type="checkbox" className={styles.toggle} checked={prefs.notifications} disabled={!ready} onChange={e=>update({...prefs,notifications:e.target.checked})} aria-label="Mémoriser ma préférence pour les actualités"/>
        </div>
        <Link href="/favoris" className={styles.row}><span className={styles.rowIcon}><Bookmark size={21}/></span><span className={styles.rowText}><strong>Favoris</strong><small>Retrouver vos éléments enregistrés sur cet appareil</small></span><ChevronRight size={18} className={styles.arrow}/></Link>
        <Link href="/application/notifications" className={styles.row}><span className={styles.rowIcon}><FileText size={21}/></span><span className={styles.rowText}><strong>Dernières publications</strong><small>Consulter les nouvelles publications disponibles</small></span><ChevronRight size={18} className={styles.arrow}/></Link>
      </div>

      <h2 className={styles.sectionTitle}>Assistance et informations</h2>
      <div className={styles.card}>
        <Link href="/a-propos" className={styles.row}><span className={styles.rowIcon}><CircleHelp size={21}/></span><span className={styles.rowText}><strong>Aide et présentation</strong><small>Découvrez notre mission et notre équipe</small></span><ChevronRight size={18} className={styles.arrow}/></Link>
        <Link href="/plan-du-site" className={styles.row}><span className={styles.rowIcon}><Globe2 size={21}/></span><span className={styles.rowText}><strong>Plan de l’application</strong><small>Accéder à toutes les rubriques</small></span><ExternalLink size={17} className={styles.arrow}/></Link>
        <div className={styles.row}><span className={styles.rowIcon}><Info size={21}/></span><span className={styles.rowText}><strong>Le Niger et ses Merveilles</strong><small>Interface de l’application · Version 2.1</small></span></div>
      </div>
      <section id="confidentialite" className={styles.notice}><ShieldCheck size={20} style={{flexShrink:0}}/><div><strong>Confidentialité</strong><br/>La connexion est assurée par Supabase Auth. Les préférences d’affichage sont conservées localement ; elles ne sont pas des données publiques. Les favoris restent enregistrés sur cet appareil.</div></section>
      {saved && <p className={styles.hint} role="status" style={{marginTop:13,display:'flex',gap:6,alignItems:'center'}}><CheckCircle2 size={16}/> Préférences enregistrées.</p>}
    </div>
  </main>
}
