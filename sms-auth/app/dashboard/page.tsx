'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck,
  BookOpenText, Check, CheckCheck, ChevronRight, CircleHelp, Clock3, Code2,
  Copy, ExternalLink, FolderKanban, Globe2, KeyRound, LayoutDashboard,
  LoaderCircle, LockKeyhole, LogOut, Menu, MessageCircle, MoreHorizontal,
  Plus, RefreshCcw, RotateCw, Send, Settings2, ShieldCheck, Smartphone,
  Trash2, UserRound, X,
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser'

type Project = { id:string; name:string; created_at:string }
type ApiKey = { id:string; project_id:string; prefix:string; created_at:string; revoked_at:string|null }
type Attempt = { id:string; project_id:string; phone:string; status:string; provider_status:string|null; created_at:string; verified_at:string|null }
type Overview = {
  user:{id:string;email?:string}; projects:Project[]; keys:ApiKey[]; attempts:Attempt[];
  summary:{projects:number;sent:number;verified:number;failed:number}
}
type Tab = 'overview'|'projects'|'test'|'activity'|'integration'|'settings'
const navigation = [
  { key:'overview',label:'Vue d’ensemble',icon:LayoutDashboard },
  { key:'projects',label:'Mes projets',icon:FolderKanban },
  { key:'test',label:'Envoyer un code',icon:Send },
  { key:'activity',label:'Activité',icon:Activity },
  { key:'integration',label:'Documentation API',icon:Code2 },
  { key:'settings',label:'Configuration',icon:Settings2 },
] as const

const titles:Record<Tab,string> = {
  overview:'Vue d’ensemble',projects:'Mes projets',test:'Tester un envoi',
  activity:'Historique des envois',integration:'Intégration API',settings:'Configuration',
}
const descriptions:Record<Tab,string> = {
  overview:'L’essentiel de votre plateforme en un coup d’œil.',
  projects:'Créez des projets et gérez leurs identifiants API en toute sécurité.',
  test:'Envoyez un véritable code WhatsApp à un numéro ayant donné son accord.',
  activity:'Suivez les demandes de vérification et leurs états de livraison.',
  integration:'Connectez SMS AUTH à vos sites web et applications.',
  settings:'Consultez l’état de votre environnement de déploiement.',
}
const errors: Record<string,string> = {
  unauthorized:'Votre session a expiré. Reconnectez-vous.', invalid_phone:'Numéro invalide. Exemple : +22790000000.',
  consent_required:'Le destinataire doit accepter de recevoir un code.',
  meta_not_configured:'Connectez les identifiants Meta WhatsApp dans votre environnement.',
  whatsapp_send_failed:'Meta a refusé ou n’a pas pu envoyer le message. Vérifiez le modèle et les autorisations.',
  otp_cooldown:'Un code a déjà été demandé. Attendez au moins une minute.',
  otp_phone_limit:'Limite de cinq codes par heure atteinte pour ce numéro.',
  otp_project_limit:'Quota horaire du projet atteint.',
  invalid_api_key:'Clé API invalide.', code_expired:'Ce code a expiré.',
  code_invalid_or_used:'Code incorrect, expiré ou déjà utilisé.',
  already_verified:'Ce code a déjà été vérifié.',
  project_limit_reached:'Vous pouvez créer jusqu’à cinq projets.',
  supabase_not_configured:'La base de données Supabase n’est pas encore configurée.',
}
function niceError(code:string) { return errors[code] || code.replaceAll('_',' ') }
function formatDate(value:string) {
  return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value))
}
function statusLabel(value:string) {
  return ({pending:'En attente',sent:'Envoyé',failed:'Échec',verified:'Vérifié',expired:'Expiré',delivered:'Livré',read:'Lu',accepted:'Accepté'} as Record<string,string>)[value] || value
}
async function jsonRequest(path:string, method='GET',body?:unknown) {
  const response = await fetch(path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'})
  const data = await response.json()
  if (!response.ok) throw new Error(niceError(data.error || 'request_failed'))
  return data
}

export default function DashboardPage() {
  const router = useRouter()
  const [tab,setTab] = useState<Tab>('overview')
  const [overview,setOverview] = useState<Overview|null>(null)
  const [loading,setLoading] = useState(true)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')
  const [mobileMenu,setMobileMenu] = useState(false)
  const [projectName,setProjectName] = useState('')
  const [selected,setSelected] = useState('')
  const [apiKey,setApiKey] = useState('')
  const [testPhone,setTestPhone] = useState('+227')
  const [testConsent,setTestConsent] = useState(false)
  const [challenge,setChallenge] = useState('')
  const [otp,setOtp] = useState('')
  const [verified,setVerified] = useState(false)
  const [health,setHealth] = useState<{database_ready:boolean;whatsapp_ready:boolean}|null>(null)

  const refresh = useCallback(async () => {
    const data = await jsonRequest('/api/overview') as Overview
    setOverview(data)
    setSelected(previous => data.projects.some(p=>p.id===previous) ? previous : (data.projects[0]?.id || ''))
  },[])
  useEffect(() => {
    let alive=true
    const supabase=getBrowserClient()
    if (!supabase) { setError('Configurez votre projet Supabase avant d’utiliser le dashboard.');setLoading(false);return }
    void (async()=>{
      const {data}=await supabase.auth.getUser()
      if(!alive)return
      if(!data.user){router.replace('/login');return}
      try{await refresh()}catch(e){if(alive)setError(e instanceof Error?e.message:'Impossible de charger le dashboard.')}
      finally{if(alive)setLoading(false)}
    })()
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
      if(event==='SIGNED_OUT')router.replace('/login')
    })
    return ()=>{alive=false;subscription.unsubscribe()}
  },[refresh,router])

  useEffect(()=> {
    if(tab!=='settings')return
    void fetch('/api/health',{cache:'no-store'}).then(r=>r.json()).then(setHealth).catch(()=>setHealth(null))
  },[tab])

  function switchTab(next:Tab){setTab(next);setMobileMenu(false);setError('');setSuccess('')}
  async function act(callback:()=>Promise<void>){
    setBusy(true);setError('');setSuccess('')
    try{await callback()}catch(e){setError(e instanceof Error?e.message:'Une erreur est survenue.')}
    finally{setBusy(false)}
  }
  async function createProject(e:FormEvent){
    e.preventDefault()
    await act(async()=>{
      const data=await jsonRequest('/api/projects','POST',{name:projectName})
      setApiKey(data.api_key);setProjectName('');setSelected(data.project.id)
      await refresh();setSuccess('Projet créé. Copiez immédiatement sa clé API : elle ne sera plus affichée.')
    })
  }
  async function rotate(projectId:string){
    await act(async()=>{
      const data=await jsonRequest('/api/projects/keys','POST',{action:'rotate',project_id:projectId})
      setApiKey(data.api_key);await refresh();setSuccess('Nouvelle clé créée. Conservez-la dans un gestionnaire de secrets.')
    })
  }
  async function revoke(key:ApiKey){
    if(!window.confirm('Révoquer cette clé ? Les applications qui l’utilisent ne pourront plus envoyer de codes.'))return
    await act(async()=>{
      await jsonRequest('/api/projects/keys','POST',{action:'revoke',project_id:key.project_id,key_id:key.id})
      await refresh();setSuccess('La clé API a été révoquée.')
    })
  }
  async function sendTest(e:FormEvent){
    e.preventDefault()
    await act(async()=>{
      const data=await jsonRequest('/api/test','POST',{project_id:selected,phone:testPhone,consent:testConsent})
      setChallenge(data.challenge_id);setVerified(false);setOtp('')
      setSuccess('Demande acceptée par Meta. Saisissez le code reçu sur WhatsApp pour terminer la vérification.')
      await refresh()
    })
  }
  async function verifyTest(e:FormEvent){
    e.preventDefault()
    await act(async()=>{
      await jsonRequest('/api/test/verify','POST',{project_id:selected,challenge_id:challenge,code:otp})
      setVerified(true);setSuccess('Code confirmé. Le numéro a été vérifié avec succès.');await refresh()
    })
  }
  async function logout(){
    const client=getBrowserClient()
    await client?.auth.signOut()
    router.replace('/login')
  }
  async function copy(value:string){
    try{await navigator.clipboard.writeText(value);setSuccess('Copié dans le presse-papiers.')}catch{setError('Copie impossible sur cet appareil.')}
  }

  const projects=overview?.projects||[]
  const keys=overview?.keys||[]
  const events=overview?.attempts||[]
  const summary=overview?.summary||{projects:0,sent:0,verified:0,failed:0}
  const currentProject=projects.find(p=>p.id===selected)
  const activeKeys=keys.filter(k=>!k.revoked_at)
  const userLabel=overview?.user.email?.split('@')[0]||'Mon compte'
  return <div className="consoleShell">
    <aside className={mobileMenu?'sideBar sideOpen':'sideBar'}>
      <div className="sideTop"><Link href="/" className="wordmark consoleLogo"><span className="brandIcon"><ShieldCheck size={21}/></span><span>SMS <b>AUTH</b><small>DEVELOPER CONSOLE</small></span></Link><button className="sideClose" aria-label="Fermer le menu" onClick={()=>setMobileMenu(false)}><X size={20}/></button></div>
      <div className="sideSectionLabel">WORKSPACE</div>
      <nav className="sideNav" aria-label="Navigation console">{navigation.map(({key,label,icon:Icon})=><button key={key} type="button" className={tab===key?'sideLink sideActive':'sideLink'} onClick={()=>switchTab(key)}><Icon size={20}/><span>{label}</span>{tab===key&&<span className="sideActiveDot"/>}</button>)}</nav>
      <div className="sideBottom"><div className="sideHelp"><div className="sideHelpIcon"><LockKeyhole size={20}/></div><strong>La sécurité avant tout.</strong><p>Ne partagez jamais vos clés API ou vos codes de vérification.</p><button onClick={()=>switchTab('integration')}>Lire la documentation <ArrowRight size={15}/></button></div><button className="sideLogout" onClick={logout}><LogOut size={18}/> Se déconnecter</button></div>
    </aside>

    <div className="consoleMain">
      <header className="consoleHeader"><div className="headerLeft"><button className="mobileToggle" onClick={()=>setMobileMenu(true)} aria-label="Ouvrir le menu"><Menu size={21}/></button><span>Console</span><ChevronRight size={16}/><strong>{titles[tab]}</strong></div><div className="headerRight"><span className="environment"><span className="liveDot"/> Production</span><span className="userAvatar"><UserRound size={20}/></span><span className="headerUsername">{userLabel}</span></div></header>
      <main className="consoleContent">
        <div className="consoleTitle"><div><div className="titleEyebrow"><span className="liveDot"/> SMS AUTH PLATFORM <span>/</span> V1.0</div><h1>{titles[tab]}</h1><p>{descriptions[tab]}</p></div>{tab==='overview'&&<button className="button buttonLight" type="button" disabled={loading} onClick={()=>void act(refresh)}><RefreshCcw size={17}/> Actualiser</button>}</div>
        {error&&<div className="dashboardAlert errorAlert" role="alert"><CircleHelp size={18}/>{error}<button onClick={()=>setError('')} aria-label="Fermer"><X size={16}/></button></div>}
        {success&&<div className="dashboardAlert successAlert" role="status"><CheckCheck size={18}/>{success}<button onClick={()=>setSuccess('')} aria-label="Fermer"><X size={16}/></button></div>}
        {apiKey&&<div className="keyReveal"><div><span className="keyEyebrow"><LockKeyhole size={15}/> CLÉ API PRIVÉE · AFFICHAGE UNIQUE</span><h3>Conservez cette clé maintenant</h3><p>Stockez-la uniquement dans les variables secrètes de votre serveur. Elle ne pourra plus être affichée.</p></div><div className="keyRevealCode"><code>{apiKey}</code><button type="button" onClick={()=>void copy(apiKey)}><Copy size={17}/> Copier</button></div><button className="keyDismiss" aria-label="Masquer la clé" onClick={()=>setApiKey('')}><X size={19}/></button></div>}
        {loading?<div className="loadingPanel"><LoaderCircle className="spin" size={26}/> Chargement de votre espace sécurisé…</div>:null}

        {!loading&&tab==='overview'&&<div className="consoleStack">
          <section className="metricsGrid">
            {[
              {label:'Projets actifs',value:summary.projects,icon:FolderKanban,detail:'Espaces configurés',tone:'purple'},
              {label:'Codes envoyés',value:summary.sent,icon:Send,detail:'Sur les 100 dernières demandes',tone:'blue'},
              {label:'Numéros vérifiés',value:summary.verified,icon:BadgeCheck,detail:'Vérifications validées',tone:'green'},
              {label:'Envois échoués',value:summary.failed,icon:Activity,detail:'Demandes à examiner',tone:'orange'},
            ].map(({label,value,icon:Icon,detail,tone})=><article className="metricCard" key={label}><div className="metricTop"><span>{label}</span><span className={'metricIcon '+tone}><Icon size={21}/></span></div><div className="metricValue">{value.toLocaleString('fr-FR')}</div><div className="metricDetail"><ArrowDownRight size={15}/>{detail}</div></article>)}
          </section>
          <div className="overviewGrid">
            <section className="panel"><div className="panelHead"><div><h2>Vos projets</h2><p>Les environnements connectés à SMS AUTH.</p></div><button className="iconButton lightIcon" aria-label="Voir les projets" onClick={()=>switchTab('projects')}><ArrowUpRight size={19}/></button></div>
              {projects.length?<div className="projectMiniList">{projects.slice(0,4).map(p=><button className="projectMini" key={p.id} onClick={()=>{setSelected(p.id);switchTab('projects')}}><span className="projectMiniIcon"><FolderKanban size={19}/></span><span><strong>{p.name}</strong><small>Créé le {formatDate(p.created_at)}</small></span><ChevronRight size={18}/></button>)}</div>:<div className="emptyState"><span><FolderKanban size={25}/></span><strong>Aucun projet pour le moment</strong><p>Créez votre premier projet pour recevoir votre clé API.</p><button className="button buttonPrimary" onClick={()=>switchTab('projects')}><Plus size={17}/> Créer un projet</button></div>}
            </section>
            <section className="panel"><div className="panelHead"><div><h2>Dernière activité</h2><p>Les codes demandés récemment.</p></div><button className="iconButton lightIcon" aria-label="Voir toute l'activité" onClick={()=>switchTab('activity')}><ArrowUpRight size={19}/></button></div>
              {events.length?<div className="recentEvents">{events.slice(0,5).map(a=><div key={a.id} className="recentEvent"><span className="eventCircle"><MessageCircle size={18}/></span><span><strong>{a.phone}</strong><small>{formatDate(a.created_at)}</small></span><span className={'stateBadge '+a.status}>{statusLabel(a.status)}</span></div>)}</div>:<div className="emptyState"><span><Clock3 size={25}/></span><strong>Pas encore d’activité</strong><p>Vos premiers envois WhatsApp apparaîtront ici.</p><button className="button buttonOutline" onClick={()=>switchTab('test')}>Tester un envoi <ArrowRight size={15}/></button></div>}
            </section>
          </div>
          <section className="quickStart"><div className="quickIcon"><Code2 size={28}/></div><div><span>POUR COMMENCER</span><h2>Connectez votre première application.</h2><p>Créez une clé API, configurez votre modèle Meta, puis testez l’envoi d’un code en quelques étapes.</p></div><button className="button buttonWhite" onClick={()=>switchTab('integration')}>Documentation <ArrowRight size={17}/></button></section>
        </div>}

        {!loading&&tab==='projects'&&<div className="consoleStack">
          <div className="twoColumnProjects"><section className="panel"><div className="panelHead"><div><h2>Créer un projet</h2><p>Une clé API privée sera générée automatiquement.</p></div><span className="circleIcon"><Plus size={20}/></span></div><form onSubmit={createProject} className="panelForm"><label htmlFor="project-name" className="formLabel">Nom du projet</label><div className="inputFrame"><FolderKanban size={19}/><input id="project-name" required minLength={2} maxLength={80} placeholder="Ex. Le Niger et ses Merveilles" value={projectName} onChange={e=>setProjectName(e.target.value)}/></div><button className="button buttonPrimary" type="submit" disabled={busy||!projectName.trim()}>{busy?<LoaderCircle className="spin" size={17}/>:<Plus size={17}/>} Créer et générer la clé</button></form><p className="formHint"><ShieldCheck size={15}/> Jusqu’à cinq projets par compte.</p></section>
          <section className="panel"><div className="panelHead"><div><h2>Vos intégrations</h2><p>{projects.length} projet{projects.length>1?'s':''} créé{projects.length>1?'s':''}</p></div><FolderKanban size={21}/></div>{projects.length?<div className="projectsFullList">{projects.map(p=><button className={selected===p.id?'projectFull selected':'projectFull'} key={p.id} onClick={()=>setSelected(p.id)}><span className="projectInitial">{p.name.slice(0,1).toUpperCase()}</span><span><strong>{p.name}</strong><small>{p.id.slice(0,8)}… · {formatDate(p.created_at)}</small></span>{selected===p.id?<Check size={19}/>:<ChevronRight size={19}/>}</button>)}</div>:<div className="emptyState"><FolderKanban size={25}/><p>Créez votre premier projet pour commencer.</p></div>}</section></div>
          {currentProject&&<section className="panel"><div className="panelHead"><div><h2>Clés API — {currentProject.name}</h2><p>Les clés sont affichées en clair seulement lors de leur création.</p></div><button className="button buttonOutline" onClick={()=>void rotate(selected)} disabled={busy}><RotateCw size={17}/> Nouvelle clé</button></div><div className="keyList">{keys.filter(k=>k.project_id===selected).map(k=><div className="keyRow" key={k.id}><span className="keyRowIcon"><KeyRound size={18}/></span><span><strong>{k.prefix}••••••••</strong><small>Créée le {formatDate(k.created_at)}</small></span><span className={'stateBadge '+(k.revoked_at?'failed':'verified')}>{k.revoked_at?'Révoquée':'Active'}</span>{!k.revoked_at&&<button className="iconButton dangerIcon" title="Révoquer cette clé" aria-label="Révoquer cette clé" onClick={()=>void revoke(k)} disabled={busy}><Trash2 size={18}/></button>}</div>)}</div></section>}
        </div>}

        {!loading&&tab==='test'&&<div className="consoleStack"><div className="testGrid">
          <section className="panel"><div className="panelHead"><div><h2>Envoyer un code WhatsApp</h2><p>Testez le parcours réel avec votre propre numéro.</p></div><span className="circleIcon"><Send size={20}/></span></div>
            <form className="panelForm" onSubmit={sendTest}><label className="formLabel" htmlFor="test-project">Projet</label><select className="nativeSelect" id="test-project" value={selected} onChange={e=>{setSelected(e.target.value);setChallenge('');setVerified(false)}} required><option value="">Sélectionnez un projet</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <label className="formLabel" htmlFor="test-phone">Numéro de téléphone WhatsApp</label><div className="inputFrame"><Smartphone size={18}/><input id="test-phone" type="tel" autoComplete="tel" required value={testPhone} onChange={e=>setTestPhone(e.target.value)} placeholder="+22790000000"/></div><p className="formHint">Format international E.164, indicatif du Niger : +227.</p><label className="checkboxLine"><input type="checkbox" checked={testConsent} onChange={e=>setTestConsent(e.target.checked)}/><span>Je confirme que ce numéro m’appartient ou que son propriétaire a expressément demandé ce code.</span></label><button className="button buttonPrimary" type="submit" disabled={busy||!selected||!testConsent}>{busy?<LoaderCircle className="spin" size={17}/>:<Send size={17}/>} Envoyer le code sur WhatsApp</button>
            </form>
          </section>
          <section className="panel verifyPanel"><div className="panelHead"><div><h2>Vérifier le code</h2><p>Le code n’est jamais affiché par SMS AUTH.</p></div><span className="circleIcon"><ShieldCheck size={20}/></span></div>
            <div className={challenge?'verificationIntro verificationReady':'verificationIntro'}><span><LockKeyhole size={25}/></span><h3>{verified?'Numéro vérifié':challenge?'Code envoyé':'En attente d’un code'}</h3><p>{verified?'Le parcours de vérification est terminé.':challenge?'Consultez WhatsApp et saisissez le code reçu.':'Envoyez d’abord une demande de confirmation depuis le formulaire.'}</p></div>
            {challenge&&!verified&&<form className="panelForm" onSubmit={verifyTest}><label className="formLabel" htmlFor="test-otp">Code de confirmation à 6 chiffres</label><div className="inputFrame codeInput"><KeyRound size={18}/><input id="test-otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" autoComplete="one-time-code" value={otp} required onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/></div><button className="button buttonOutline" disabled={busy||otp.length!==6}>{busy?<LoaderCircle className="spin" size={17}/>:<CheckCheck size={17}/>} Confirmer le code</button></form>}
          </section>
        </div><div className="infoBanner"><CircleHelp size={20}/><div><strong>Avant le premier test</strong><p>Configurez l’accès Meta, un numéro WhatsApp Business Platform et un modèle AUTHENTICATION approuvé. Sans ces paramètres, aucun message réel ne peut être envoyé.</p></div><button onClick={()=>switchTab('settings')}>Configuration <ChevronRight size={16}/></button></div></div>}

        {!loading&&tab==='activity'&&<section className="panel"><div className="panelHead"><div><h2>Journal de vérification</h2><p>Les 100 dernières demandes de vos projets, sans codes OTP ni secrets.</p></div><button className="button buttonOutline" onClick={()=>void act(refresh)} disabled={busy}><RefreshCcw size={16}/> Actualiser</button></div>
          {events.length?<div className="activityTableWrap"><table className="activityTable"><thead><tr><th>NUMÉRO</th><th>PROJET</th><th>CANAL</th><th>VÉRIFICATION</th><th>LIVRAISON</th><th>DATE</th></tr></thead><tbody>{events.map(e=><tr key={e.id}><td><strong>{e.phone}</strong></td><td>{projects.find(p=>p.id===e.project_id)?.name||'Projet'}</td><td><span className="channelLabel"><MessageCircle size={14}/> WhatsApp</span></td><td><span className={'stateBadge '+e.status}>{statusLabel(e.status)}</span></td><td>{e.provider_status?statusLabel(e.provider_status):'—'}</td><td>{formatDate(e.created_at)}</td></tr>)}</tbody></table></div>:<div className="emptyState"><Clock3 size={26}/><strong>Votre journal est vide</strong><p>Les tentatives apparaîtront après un premier envoi.</p></div>}</section>}

        {!loading&&tab==='integration'&&<div className="consoleStack"><div className="integrationGrid"><section className="panel"><span className="sectionKicker">API REST · HTTPS</span><h2>Deux endpoints. Une intégration.</h2><p className="integrateText">Utilisez votre clé API uniquement depuis le serveur de votre application. Les appels côté navigateur exposeraient vos identifiants.</p><div className="docEndpoint"><span>POST</span><code>/api/v1/otp/send</code><p>Envoie une demande de vérification sur WhatsApp après consentement.</p></div><div className="docEndpoint"><span>POST</span><code>/api/v1/otp/verify</code><p>Valide une fois le code OTP associé à une demande.</p></div><button className="button buttonPrimary" onClick={()=>switchTab('projects')}><KeyRound size={17}/> Gérer mes clés API</button></section>
          <section className="panel"><div className="panelHead"><h2>Exemple TypeScript</h2><span className="tinyBadge">SERVER ONLY</span></div><pre className="docCode">{'const url = process.env.SMS_AUTH_URL;\nconst key = process.env.SMS_AUTH_API_KEY;\n\nconst response = await fetch(\n  url + "/api/v1/otp/send", {\n  method: "POST",\n  headers: {\n    Authorization: "Bearer " + key,\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    phone: "+22790000000",\n    consent: true\n  })\n});\n\nconst { challenge_id } =\n  await response.json();'}</pre><button className="copyCode" onClick={()=>void copy('POST /api/v1/otp/send\\nAuthorization: Bearer sa_live_...\\n{"phone":"+22790000000","consent":true}') }><Copy size={16}/> Copier l’exemple API</button></section></div>
          <section className="panel"><div className="panelHead"><h2>Bonnes pratiques</h2><ShieldCheck size={21}/></div><div className="bestPractices">{[
            ['Conservez vos clés privées','Utilisez les variables secrètes de votre backend, jamais une application mobile ou une page web.'],
            ['Demandez le consentement','Un message de confirmation doit être demandé par son destinataire, pas envoyé à des inconnus.'],
            ['Associez la vérification au compte','Votre application doit vérifier le challenge avant d’autoriser une opération sensible.'],
          ].map(([title,text])=><div key={title}><Check size={18}/><span><strong>{title}</strong><small>{text}</small></span></div>)}</div></section>
        </div>}

        {!loading&&tab==='settings'&&<div className="consoleStack"><div className="settingsGrid"><section className="panel"><div className="panelHead"><div><h2>État des services</h2><p>Disponibilité des paramètres côté serveur.</p></div><Settings2 size={20}/></div><div className="serviceRow"><span className="serviceIcon"><Globe2 size={20}/></span><span><strong>Supabase</strong><small>Base de données et authentification</small></span><span className={'stateBadge '+(health?.database_ready?'verified':'failed')}>{health?.database_ready?'Configuré':'À configurer'}</span></div><div className="serviceRow"><span className="serviceIcon"><MessageCircle size={20}/></span><span><strong>Meta WhatsApp Cloud API</strong><small>Envoi des modèles d’authentification</small></span><span className={'stateBadge '+(health?.whatsapp_ready?'verified':'failed')}>{health?.whatsapp_ready?'Paramètres présents':'À configurer'}</span></div><div className="serviceRow"><span className="serviceIcon"><KeyRound size={20}/></span><span><strong>Secrets et clés</strong><small>Conservés sur votre serveur</small></span><span className="stateBadge verified">Serveur</span></div></section>
          <section className="panel"><div className="panelHead"><div><h2>Compte administrateur</h2><p>Accès à votre console.</p></div><UserRound size={21}/></div><div className="accountBlock"><span className="accountAvatar"><UserRound size={25}/></span><div><strong>{overview?.user.email||'Compte sécurisé'}</strong><small>Authentification Supabase</small></div></div><button className="button buttonOutline" onClick={logout}><LogOut size={18}/> Se déconnecter</button><p className="formHint">Les identifiants Meta et les clés secrètes sont définis dans les variables d’environnement, pas dans cette interface.</p></section></div></div>}
      </main>
      <footer className="consoleFooter"><span>© 2026 SMS AUTH</span><span><ShieldCheck size={15}/> Authentification sécurisée · Niger & international</span></footer>
    </div>
    {mobileMenu&&<button className="mobileOverlay" aria-label="Fermer le menu" onClick={()=>setMobileMenu(false)}/>}
  </div>
}
