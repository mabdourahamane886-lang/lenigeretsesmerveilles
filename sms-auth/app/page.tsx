import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, Code2,
  Fingerprint, Globe2, KeyRound, LockKeyhole, MessageCircle,
  Shield, ShieldCheck, Smartphone, Sparkles, Zap,
} from 'lucide-react'

const features = [
  { icon: ShieldCheck, title: 'Vérification fiable', text: 'Code unique à six chiffres, durée de validité limitée et consommation en une seule utilisation.' },
  { icon: MessageCircle, title: 'WhatsApp officiel', text: 'Envoi via WhatsApp Cloud API avec modèles d’authentification approuvés par Meta.' },
  { icon: Code2, title: 'API pour développeurs', text: 'Intégrez l’envoi et la validation des codes depuis votre serveur avec une clé de projet.' },
  { icon: KeyRound, title: 'Clés maîtrisées', text: 'Créez des identifiants API, affichez-les une seule fois, révoquez-les à tout moment.' },
  { icon: Globe2, title: 'Niger et international', text: 'Numéros au format +227 et prise en charge des formats internationaux E.164.' },
  { icon: Fingerprint, title: 'Protection intégrée', text: 'Hachage HMAC des codes, limitation des tentatives et suivi des événements de livraison.' },
]
export default function HomePage() {
  return <div className="marketing">
    <header className="siteHeader"><div className="siteHeaderInner">
      <Link href="/" className="wordmark"><span className="brandIcon"><ShieldCheck size={22}/></span><span>SMS <b>AUTH</b><small>SECURE MESSAGING PLATFORM</small></span></Link>
      <nav className="siteNavigation" aria-label="Navigation principale"><a href="#fonctionnalites">Fonctionnalités</a><a href="#fonctionnement">Fonctionnement</a><a href="#integration">Intégration</a></nav>
      <Link href="/login" className="headerCta">Accéder à l’espace <ArrowUpRight size={16}/></Link>
    </div></header>

    <main>
      <section className="landingHero">
        <div className="landingGlow glowOne"/><div className="landingGlow glowTwo"/>
        <div className="landingInner">
          <div className="heroCopy">
            <span className="heroTag"><span className="liveDot"/> Plateforme d’authentification nouvelle génération <ArrowRight size={14}/></span>
            <h1>La confiance commence par <em>une vérification.</em></h1>
            <p>Créez une expérience de connexion sûre et fluide. Confirmez les numéros de téléphone avec des codes de vérification envoyés sur WhatsApp, depuis une API conçue pour vos projets.</p>
            <div className="heroButtons">
              <Link href="/login" className="button buttonPrimary">Commencer avec SMS AUTH <ArrowRight size={18}/></Link>
              <a href="#fonctionnement" className="button buttonGhost">Découvrir la solution <ChevronDown size={18}/></a>
            </div>
            <div className="heroBenefits"><span><Check size={16}/> WhatsApp Cloud API</span><span><Check size={16}/> Codes OTP sécurisés</span><span><Check size={16}/> API TypeScript</span></div>
          </div>
          <div className="heroVisual" aria-label="Illustration d'une confirmation WhatsApp">
            <div className="orbit orbitA"/><div className="orbit orbitB"/>
            <div className="floatingNote topNote"><span className="floatingCircle"><LockKeyhole size={18}/></span><span><strong>Connexion sécurisée</strong><small>Vérification à usage unique</small></span><BadgeCheck size={18}/></div>
            <div className="device"><div className="deviceNotch"/><div className="deviceHeader"><span className="deviceAvatar"><ShieldCheck size={21}/></span><span><b>SMS AUTH</b><small>Compte professionnel vérifié</small></span><BadgeCheck size={17}/></div>
              <div className="messageBubble"><div className="messageMeta"><Shield size={14}/> Authentification</div><p>Votre code de confirmation pour accéder à votre compte :</p><div className="otpDigits"><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span></div><div className="messageAction"><KeyRound size={15}/> Copier le code</div><small>Ce code expire dans 5 minutes.</small></div>
              <div className="deviceFooter"><span className="tinyShield"><ShieldCheck size={13}/></span> Vos échanges sont protégés</div>
            </div>
            <div className="floatingNote bottomNote"><span className="floatingCircle green"><Check size={20}/></span><span><strong>Vérification confirmée</strong><small>Accès autorisé après validation</small></span></div>
          </div>
        </div>
        <div className="heroBottom"><span><Zap size={17}/> Une API. Des comptes sécurisés.</span><span>TECHNOLOGIE PENSÉE POUR VOS APPLICATIONS</span></div>
      </section>

      <section id="fonctionnalites" className="contentSection">
        <div className="sectionTop"><span className="sectionKicker"><Sparkles size={16}/> NOTRE PLATEFORME</span><h2>Tout ce qu’il faut pour <span>vérifier avec confiance.</span></h2><p>Les outils essentiels pour connecter votre application à un parcours d’authentification professionnel.</p></div>
        <div className="featureGrid">{features.map(({icon:Icon,title,text},i)=><article className="featureCard" key={title}><span className="featureIcon"><Icon size={23}/></span><span className="featureNum">0{i+1}</span><h3>{title}</h3><p>{text}</p><span className="featureFooter"><span>SMS AUTH</span><ArrowUpRight size={17}/></span></article>)}</div>
      </section>

      <section id="fonctionnement" className="howSection">
        <div><span className="sectionKicker lightKicker">SIMPLE ET SÉCURISÉ</span><h2>Trois étapes.<br/><span>Une identité vérifiée.</span></h2><p>Un parcours naturel pour vos utilisateurs, avec la sécurité et le contrôle nécessaires côté serveur.</p><Link href="/login" className="button buttonWhite">Créer mon espace <ArrowRight size={17}/></Link></div>
        <div className="steps">{[
          ['01','Demande de code','Votre application demande un code après le consentement de l’utilisateur.'],
          ['02','Envoi WhatsApp','SMS AUTH transmet le code via un modèle d’authentification Meta approuvé.'],
          ['03','Confirmation','Votre serveur vérifie le code et peut autoriser l’accès au compte.'],
        ].map(([n,t,desc])=><div className="stepItem" key={n}><span>{n}</span><div><h3>{t}</h3><p>{desc}</p></div><ArrowRight size={20}/></div>)}</div>
      </section>

      <section id="integration" className="integrationSection">
        <div><span className="sectionKicker"><Code2 size={17}/> FAIT POUR LES DÉVELOPPEURS</span><h2>Une intégration <span>qui va à l’essentiel.</span></h2><p>Deux appels API pour envoyer et vérifier un code. Des clés d’accès propres à chaque projet, gérées depuis un tableau de bord intuitif.</p><Link href="/login" className="textAction">Ouvrir la console API <ArrowRight size={18}/></Link></div>
        <div className="codeShowcase"><div className="codeTitle"><span><i/><i/><i/></span> api.sms-auth / otp / send <span>POST</span></div><pre>{'fetch("https://votre-domaine/api/v1/otp/send", {\n  method: "POST",\n  headers: {\n    Authorization: "Bearer sa_live_...",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    phone: "+22790000000",\n    consent: true\n  })\n})'}</pre><div className="codeEnd"><ShieldCheck size={16}/> La clé API reste sur votre serveur.</div></div>
      </section>
      <section className="lastCta"><span className="lastCtaMark"><Smartphone size={33}/></span><div><h2>L’authentification mérite mieux.</h2><p>Donnez à vos utilisateurs une méthode de vérification moderne et maîtrisée.</p></div><Link href="/login" className="button buttonPrimary">Accéder à SMS AUTH <ArrowRight size={18}/></Link></section>
    </main>
    <footer className="siteFooter"><span className="footerBrand"><ShieldCheck size={19}/> SMS AUTH</span><span>Une plateforme d’authentification conçue pour les applications modernes.</span><span>© 2026 SMS AUTH</span></footer>
  </div>
}
