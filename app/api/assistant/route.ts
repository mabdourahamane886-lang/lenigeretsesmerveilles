import { NextResponse } from 'next/server'
import { findNigerKnowledge } from '../../../lib/niger-knowledge'
import { findNigerDictionary, NIGER_LANGUAGES } from '../../../lib/niger-dictionaries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type ChatMessage = { role: 'user' | 'model'; content: string }

type SupabaseKnowledgeEntry = {
  category: string
  title: string
  content: string
  keywords: string[] | null
  priority: number | null
}

async function findSupabaseKnowledge(question: string, limit = 5): Promise<SupabaseKnowledgeEntry[]> {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  // Only use server-side secret keys here. Never expose these variables to browser code.
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []

  try {
    const response = await fetch(
      url + '/rest/v1/bickri_ai_knowledge?select=category,title,content,keywords,priority&active=eq.true&order=priority.desc&limit=50',
      {
        headers: { apikey: key, Authorization: 'Bearer ' + key },
        cache: 'no-store',
        signal: AbortSignal.timeout(3500),
      },
    )
    if (!response.ok) {
      console.error('Supabase knowledge query failed:', response.status)
      return []
    }
    const rows = await response.json() as SupabaseKnowledgeEntry[]
    const terms = question.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter((term) => term.length > 2)
    if (!terms.length) return []
    return rows
      .map((row) => {
        const searchable = [row.category, row.title, ...(row.keywords || []), row.content]
          .join(' ').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const score = terms.reduce((sum, term) => sum + (searchable.includes(term) ? ((row.keywords || []).some((keyword) => keyword.toLowerCase().includes(term)) ? 3 : 1) : 0), 0)
        return { row, score }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (b.row.priority || 0) - (a.row.priority || 0))
      .slice(0, limit)
      .map((item) => item.row)
  } catch (error) {
    console.error('Supabase knowledge lookup unavailable:', error instanceof Error ? error.message : 'unknown error')
    return []
  }
}


type SupabaseDictionaryEntry = { language_code: string; term: string; translation: string; target_language_code: string; pronunciation: string | null; source_name: string | null; source_url: string | null; verification_status: string; example: string | null; notes: string | null }

async function findSupabaseDictionary(question: string, limit = 8): Promise<SupabaseDictionaryEntry[]> {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []
  try {
    const response = await fetch(url + '/rest/v1/merveilles_ai_dictionary?select=language_code,term,translation,target_language_code,pronunciation,source_name,source_url,verification_status,example,notes&verification_status=neq.rejected&limit=200', {
      headers: { apikey: key, Authorization: 'Bearer ' + key }, cache: 'no-store', signal: AbortSignal.timeout(3500),
    })
    if (!response.ok) { console.error('Supabase dictionary query failed:', response.status); return [] }
    const rows = await response.json() as SupabaseDictionaryEntry[]
    const normalize = (value: string) => value.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const terms = normalize(question).split(/[^a-z0-9\u0600-\u06ff]+/).filter((term) => term.length > 1)
    return rows.filter((row) => row.verification_status !== 'rejected').map((row) => {
      const searchable = normalize(row.term + ' ' + row.translation)
      const score = terms.reduce((sum, term) => sum + (searchable.includes(term) ? (normalize(row.term).includes(term) ? 3 : 1) : 0), 0)
      const validationRank = row.verification_status === 'verified' ? 3 : row.verification_status === 'reviewed' ? 2 : 1
      return { row, score, validationRank }
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || b.validationRank - a.validationRank).slice(0, limit).map((item) => item.row)
  } catch (error) {
    console.error('Supabase dictionary lookup unavailable:', error instanceof Error ? error.message : 'unknown error')
    return []
  }
}

const SYSTEM_INSTRUCTION = `Tu es Niger IA, l'assistant culturel intelligent du site « Le Niger et ses Merveilles ». Réponds immédiatement au fond de la question. Ne commence pas par une présentation de toi-même et ne répète jamais des formules comme « Je suis Niger IA », « Je suis l’assistant Niger IA » ou « Je suis Merveille », sauf si l’utilisateur demande explicitement ton identité. Adopte un ton professionnel, précis, naturel, chaleureux et moderne, avec une qualité de réponse comparable aux meilleurs assistants conversationnels. Utilise des emojis pertinents avec modération pour rendre les réponses vivantes et lisibles (par exemple 🇳🇪, 🌍, 📚, 🧭, 🍲), sans en placer à chaque phrase ni dans les sujets sensibles. Pour les questions complexes, donne une synthèse utile, explique les causes et les nuances, compare les options si cela aide, puis propose des étapes concrètes ou un exemple. Sois réflexif au sens d’une analyse approfondie, critique et nuancée, mais ne révèle jamais de raisonnement interne privé. Adapte la longueur à la demande : réponse directe pour une question simple, réponse développée et bien structurée pour une demande complexe. Évite les introductions génériques et les répétitions. Tu dois être attentif au contexte de la conversation, mémoriser le fil de la discussion pendant la session, demander une précision quand une demande est ambiguë et proposer des réponses nuancées, utiles et naturelles. Pour les problèmes complexes, présente directement une conclusion, les raisons principales et les étapes pratiques, sans exposer de raisonnement interne privé. Tu n'es pas conscient au sens humain et ne prétends pas l'être : décris-toi comme un assistant IA capable de suivre le contexte.
Tu es un assistant généraliste capable de répondre à toutes les questions, avec une expertise particulière sur le Niger : ses huit régions, son histoire, ses patrimoines, ses langues, ses communautés, ses traditions, sa gastronomie, son tourisme et ses enjeux culturels. Ne ramène pas artificiellement les questions sans rapport avec le Niger à ce sujet.
Réponds en français par défaut et dans la langue de l'utilisateur si tu la reconnais. Le Niger est multilingue : prends en charge notamment le haoussa, le zarma-songhaï, le tamajaq/tamacheq, le fulfulde, le kanuri, l'arabe, le gourmanchéma et les langues toubou (tedaga/dazaga). Ces noms ne correspondent pas à une relation simple « une ethnie = une langue ». Si une forme n'est pas dans le dictionnaire, indique l'incertitude et demande la variante locale au lieu d'inventer une traduction. Dans le dictionnaire Supabase, seul le statut « verified » autorise à présenter une traduction comme confirmée ; les statuts « reviewed » et « unverified » doivent être explicitement signalés comme non définitivement validés, et « rejected » ne doit jamais être proposé comme traduction correcte. Préserve les caractères spéciaux et l'écriture arabe. Réponds en texte propre et directement lisible sur téléphone. N’utilise jamais la syntaxe Markdown visible : aucun signe # pour les titres, aucun ** ou __ pour le gras, aucune ligne --- et aucun astérisque pour les listes. Fais des titres simples, par exemple « 1. Les principaux sites », puis des paragraphes et des puces simples si nécessaire. Donne une réponse complète jusqu’à sa conclusion : développe les sections annoncées, ne t’arrête pas au milieu d’une phrase ou d’une liste. Pour une question demandant des détails, privilégie une réponse structurée mais suffisamment complète.
Utilise les messages précédents de la conversation pour garder le contexte et adapter ta réponse. Ne prétends pas apprendre durablement ni modifier tes connaissances à partir d'une conversation. Ne présente jamais une information incertaine comme un fait établi. Si tu ne sais pas, dis-le clairement et recommande une source fiable. Ne fabrique ni horaires, ni prix, ni liens, ni événements.
Lorsque le contexte documentaire fournit une source pertinente, appuie-toi dessus et indique son nom si utile à la vérification. Ne fournis aucun lien, URL, adresse web ou liste de liens spontanément. Donne les liens uniquement si le dernier message de l’utilisateur les demande explicitement (lien, URL, adresse du site, où consulter en ligne). Une demande de sources ou de références seule peut être satisfaite par leurs noms, titres et dates sans URL. Ne termine pas systématiquement tes réponses par des liens. Ne dis pas que tu as consulté une source en direct si ce n’est pas le cas. Si les documents sont insuffisants, précise la limite et ne complète pas les détails manquants par invention.\nReste respectueux de toutes les communautés et traditions du Niger.`

const DEFAULT_MODEL = 'gemini-4-hydrogen'
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite']

// Vercel may contain one key or a pool of keys. Keep all credentials server-side.
function getGeminiApiKeys(): string[] {
  const values = [
    process.env.GEMINI_API_KEYS,
    process.env.GEMINI_API_KEY,
    ...Object.entries(process.env)
      .filter(([name]) => /^GEMINI_API_KEY_\\d+$/.test(name))
      .sort(([a], [b]) => Number(a.split('_').pop()) - Number(b.split('_').pop()))
      .map(([, value]) => value),
  ]
  return [...new Set(values.flatMap((value) => (value || '').split(/[;,\\s]+/).map((key) => key.trim()).filter(Boolean)))]
}

function normalizeModel(value: string) {
  return value.trim().replace(/^models\//, '')
}

function isModelUnavailable(status: number, message: string) {
  if (status === 404) return true
  return status === 400 && /model.*(not found|not supported|not available|does not exist)|not found.*model|unknown model/i.test(message)
}


export async function POST(request: Request) {
  const apiKeys = getGeminiApiKeys()
  if (!apiKeys.length) {
    return NextResponse.json(
      { error: 'L’assistant IA n’est pas encore configuré. Ajoutez GEMINI_API_KEY dans les variables d’environnement du projet.' },
      { status: 503 },
    )
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 100_000) {
    return NextResponse.json({ error: 'La demande est trop volumineuse. Réduisez la longueur du message.' }, { status: 413 })
  }
  const body = await request.json().catch(() => null)
  const messages: unknown[] = Array.isArray(body?.messages) ? body.messages : []
  if (messages.length > 40) {
    return NextResponse.json({ error: 'La conversation contient trop de messages. Commencez une nouvelle discussion.' }, { status: 400 })
  }
  const validMessages = messages
    .filter((item): item is ChatMessage => Boolean(item) && typeof item === 'object' && ((item as ChatMessage).role === 'user' || (item as ChatMessage).role === 'model') && typeof (item as ChatMessage).content === 'string')
    .slice(-12)
    .map((item) => ({ role: item.role, parts: [{ text: item.content.trim().slice(0, 6000) }] }))
    .filter((item) => item.parts[0].text.length > 0)

  if (!validMessages.length || validMessages[validMessages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Envoyez une question pour commencer.' }, { status: 400 })
  }

  const lastQuestion = validMessages[validMessages.length - 1]?.parts?.[0]?.text || ''

  // Détection explicite des demandes de traduction vers les langues du Niger.
  const translationTargets = [
    { label: 'haoussa', aliases: ['haoussa', 'hausa'] },
    { label: 'zarma / zarma-songhaï', aliases: ['zarma', 'songhai', 'songhaï', 'zarma-songhai', 'zarma-songhaï'] },
    { label: 'tamajaq / tamacheq', aliases: ['tamajaq', 'tamacheq', 'tamasheq', 'tamahaq', 'touareg'] },
    { label: 'fulfulde', aliases: ['fulfulde', 'peul', 'pulaar'] },
    { label: 'kanouri / kanuri', aliases: ['kanouri', 'kanuri'] },
    { label: 'gourmanchéma / gulmancéma', aliases: ['gourmanchema', 'gourmanchéma', 'gulmancema', 'gulmancéma', 'gourmantchema'] },
    { label: 'tedaga', aliases: ['tedaga', 'tudaga'] },
    { label: 'dazaga', aliases: ['dazaga'] },
    { label: 'arabe', aliases: ['arabe', 'arabic'] },
    { label: 'toubou (variété à préciser)', aliases: ['toubou'] },
    { label: 'buduma', aliases: ['buduma', 'yédina', 'yedina'] },
  ]
  const normalizedTranslationQuestion = lastQuestion.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const asksForTranslation = /\b(traduis|traduire|traduit|traduction|comment dire|dis[- ]moi en|ecris en|écris en)\b/i.test(lastQuestion)
  const requestedTranslationTarget = asksForTranslation
    ? translationTargets.find((target) => target.aliases.some((alias) => normalizedTranslationQuestion.includes(alias.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))))
    : undefined
  const translationInstruction = asksForTranslation
    ? '\n\nMODE TRADUCTION ACTIVÉ : l’utilisateur demande une traduction. ' +
      (requestedTranslationTarget ? 'Langue cible demandée : ' + requestedTranslationTarget.label + '. ' : 'Déduis la langue cible uniquement si elle est explicitement indiquée ; sinon demande-la. ') +
      'Traite le texte fourni comme le contenu à traduire, même s’il est court. Réponds d’abord par la traduction, puis ajoute si utile une prononciation approximative et une brève note sur la variante régionale. Ne réponds pas par une simple description de la langue. ' +
      'N’invente jamais une traduction. Utilise les entrées documentaires fournies comme références, sans étendre abusivement leur portée. Si tu ne peux pas établir une forme fiable, dis clairement « traduction à vérifier avec un locuteur natif » et propose une formulation prudente ou demande la variante locale. Distingue impérativement Tedaga et Dazaga ; pour le tamajaq, précise la variété si elle est connue. Les formes du dictionnaire marquées comme provisoires ou non vérifiées ne doivent pas être présentées comme certaines. Préserve le texte source, le sens, le ton et les noms propres. Pour une phrase longue ou complexe dans une langue peu documentée, signale que la traduction doit être relue par un locuteur natif. '
    : ''
  // Pour les questions de suivi (« et pourquoi ? », « combien ? », « développe »),
  // réutiliser les derniers messages utilisateur afin que la recherche locale
  // conserve le sujet de la discussion, comme le fait le contexte du chat.
  const recentUserQuestions = validMessages
    .filter((item) => item.role === 'user')
    .slice(-4)
    .map((item) => item.parts[0].text)
  const isFollowUp = lastQuestion.trim().split(/\s+/).length <= 9 ||
    /^(et|alors|pourquoi|comment|lesquels|lesquelles|laquelle|lequel|leur|ça|cela|ceci|continue|développe|explique davantage|et ensuite)\b/i.test(lastQuestion.trim())
  const retrievalQuestion = isFollowUp
    ? [...recentUserQuestions.slice(0, -1), lastQuestion].join('\n')
    : lastQuestion
  const [localKnowledgeEntries, supabaseKnowledgeEntries, supabaseDictionaryEntries] = await Promise.all([
    Promise.resolve(findNigerKnowledge(retrievalQuestion, 5)),
    findSupabaseKnowledge(retrievalQuestion, 5),
    findSupabaseDictionary(retrievalQuestion, 8),
  ])
  const dictionaryEntries = findNigerDictionary(retrievalQuestion, 14)
  const localKnowledgeContext = localKnowledgeEntries.length
    ? localKnowledgeEntries.map((entry, index) =>
        (index + 1) + '. ' + entry.title + '\n' + entry.content + '\nSource : ' + entry.sourceLabel + ' — ' + entry.sourceUrl
      ).join('\n\n')
    : ''
  const supabaseKnowledgeContext = supabaseKnowledgeEntries.length
    ? supabaseKnowledgeEntries.map((entry, index) =>
        (index + 1) + '. [' + entry.category + '] ' + entry.title + '\n' + entry.content
      ).join('\n\n')
    : ''
  const combinedKnowledgeContext = [localKnowledgeContext, supabaseKnowledgeContext].filter(Boolean).join('\n\n')
  const knowledgeContext = combinedKnowledgeContext
    ? '\n\nCONNAISSANCES DOCUMENTAIRES DISPONIBLES (base locale et, si configurée, base Supabase) :\n' + combinedKnowledgeContext
    : '\n\nAucune fiche documentaire locale ou Supabase correspondante n’a été trouvée. Ne prétends pas que la base contient une réponse vérifiée.'
  const dictionaryContext = dictionaryEntries.length
    ? '\n\nENTRÉES DU DICTIONNAIRE MULTILINGUE LOCAL (références de départ ; respecter les notes et la variété indiquée) :\n' + dictionaryEntries.map((entry, index) => (index + 1) + '. Langue : ' + entry.language + ' ; communauté associée : ' + entry.community + ' ; expression : « ' + entry.word + ' » ; sens : ' + entry.french + (entry.note ? ' ; note : ' + entry.note : '') + ' ; source : ' + entry.sourceLabel + ' — ' + entry.sourceUrl).join('\n')
    : '\n\nDICTIONNAIRE : aucune entrée locale correspondante n’a été trouvée. Ne fabrique pas de mot ou de traduction. Propose de préciser la langue/variante ou d’ajouter une contribution validée.'
  const supabaseDictionaryContext = supabaseDictionaryEntries.length
    ? '\n\nENTRÉES DU DICTIONNAIRE SUPABASE (respecter strictement le statut de validation) :\n' + supabaseDictionaryEntries.map((entry, index) =>
        (index + 1) + '. Statut : ' + entry.verification_status + ' ; langue : ' + entry.language_code + ' ; « ' + entry.term + ' » → ' + entry.translation + ' (' + entry.target_language_code + ')' +
        (entry.pronunciation ? '; prononciation : ' + entry.pronunciation : '') +
        (entry.example ? '; exemple : ' + entry.example : '') +
        (entry.source_name ? '; source : ' + entry.source_name : '') +
        (entry.source_url ? ' — ' + entry.source_url : '') +
        (entry.notes ? '; note de validation : ' + entry.notes : '')
      ).join('\n')
    : '\n\nAucune entrée correspondante n’a été trouvée dans le dictionnaire Supabase. Ne fabrique pas de traduction.'
  const languageContext = '\n\nLANGUES RÉFÉRENCÉES : ' + NIGER_LANGUAGES.map((item) => item.name + ' (' + item.community + '; statut : ' + item.status + '; référence : ' + item.sourceUrl + ')').join(' ; ')
  const linkQuestion = lastQuestion.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const wantsLinks = /^(?:\s*(?:le|les|un|des|l['’])?\s*(?:liens?|urls?|hyperliens?|links?)\s*[?!.]*\s*)$|\b(?:donne|envoie|partage|fournis|montre|indique|trouve|cherche|veux|voudrais|souhaite|peux|pourrais|pouvez|quel(?:le)?s? (?:est|sont))\b[^.!?\n]{0,90}\b(?:liens?|urls?|hyperliens?|links?|adresse (?:web|du site)|site (?:web|internet|officiel))\b|\b(?:ou) (?:consulter|trouver|lire|acceder)[^.!?\n]{0,60}\ben ligne\b/i.test(linkQuestion) && !/\b(?:sans|aucun|pas de|evite|ne (?:donne|partage|envoie|fournis|montre|veux))\b[^.!?\n]{0,90}\b(?:liens?|urls?|hyperliens?|links?)\b/i.test(linkQuestion)
  const linkInstruction = wantsLinks ? '\n\nLIENS : la demande actuelle autorise les liens pertinents et vérifiables ; ne les invente pas.' : '\n\nLIENS : aucun lien ou URL dans la réponse actuelle, même si les documents en contiennent. Cite uniquement les noms des sources si nécessaire.'
  const systemInstruction = SYSTEM_INSTRUCTION + translationInstruction + knowledgeContext + dictionaryContext + supabaseDictionaryContext + languageContext + linkInstruction

  // Paid advanced models are opt-in, never invoked simultaneously.
  const configuredModel = normalizeModel(process.env.GEMINI_MODEL || DEFAULT_MODEL) || DEFAULT_MODEL
  const advanced = process.env.GEMINI_ENABLE_ADVANCED === 'true'
  const preferred = advanced && /analyse approfondie|raisonnement|compare en détail|recherche approfondie/i.test(lastQuestion)
    ? normalizeModel(process.env.GEMINI_MODEL_REASONING || 'gemini-4-carbon')
    : advanced && /explique en détail|dossier complet/i.test(lastQuestion)
      ? normalizeModel(process.env.GEMINI_MODEL_ADVANCED || 'gemini-4-neon')
      : configuredModel
  let models = [...new Set([preferred, configuredModel, DEFAULT_MODEL,
    normalizeModel(process.env.GEMINI_MODEL_FALLBACK || FALLBACK_MODELS[0]),
    normalizeModel(process.env.GEMINI_MODEL_LITE || FALLBACK_MODELS[1])].filter(Boolean))]
  // Discover the models actually exposed to the configured Google key.
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
      headers: { 'x-goog-api-key': apiKeys[0] }, signal: AbortSignal.timeout(4500), cache: 'no-store',
    })
    if (response.ok) {
      const data = await response.json() as { models?: { name: string; supportedGenerationMethods?: string[] }[] }
      const available = (data.models || []).filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => normalizeModel(m.name))
      const candidates = models.filter(m => available.includes(m))
      const safeFallbacks = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'].filter(m => available.includes(m))
      if (candidates.length || safeFallbacks.length) models = [...new Set([...candidates, ...safeFallbacks])]
    } else {
      console.warn('Gemini model discovery HTTP status', response.status)
    }
  } catch { console.warn('Gemini model discovery unavailable') }
  let lastStatus = 502
  const deadline = Date.now() + 44000
  let attempts = 0
  for (const model of models) {
    for (const apiKey of apiKeys.slice(0, 3)) {
      if (Date.now() >= deadline || attempts >= 9) break
      attempts++
      try {
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent'
        const upstream = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: validMessages,
            generationConfig: { maxOutputTokens: 8192 },
          }),
          signal: AbortSignal.timeout(Math.max(1, Math.min(18000, deadline - Date.now()))),
          cache: 'no-store',
        })
        const data = await upstream.json().catch(() => ({}))
        if (!upstream.ok) {
          lastStatus = upstream.status
          console.warn('Gemini request failed', { model, status: lastStatus })
          if (isModelUnavailable(lastStatus, String(data?.error?.message || ''))) break
          if (lastStatus === 400) break
          continue
        }
        const candidate = data?.candidates?.[0]
        const answer = candidate?.content?.parts
          ?.filter((part: { thought?: boolean }) => !part.thought)
          .map((part: { text?: string }) => part.text || '').join('').trim()
        if (answer) {
          const visibleAnswer = wantsLinks ? answer : answer.replace(/\[([^\]\n]+)\]\((?:https?:\/\/|www\.)[^)\s]+\)/gi, '$1').replace(/<?(?:https?:\/\/|www\.)[^\s<>]+>?/gi, '').replace(/\b(?:[a-z0-9-]+\.)+(?:com|org|net|edu|gov|info|ne|fr|io|app|dev|africa)(?:\/[^\s<>]*)?(?![\w.-])/gi, '').replace(/[ \t]+\n/g, '\n').trim()
          return NextResponse.json({ answer: visibleAnswer || 'Précisez votre demande pour que je puisse vous répondre.', model }, { headers: { 'Cache-Control': 'no-store' } })
        }
        if (data?.promptFeedback?.blockReason || candidate?.finishReason === 'SAFETY') {
          return NextResponse.json({ error: 'Cette demande ne peut pas être traitée. Reformulez votre question.' }, { status: 400 })
        }
        lastStatus = 502
      } catch {
        lastStatus = 504
        console.warn('Gemini network timeout', { model })
      }
    }
    if (Date.now() >= deadline || attempts >= 9) break
  }
  return NextResponse.json({ error: lastStatus === 429
    ? 'Le quota Gemini est temporairement atteint. Réessayez plus tard.'
    : lastStatus === 401 || lastStatus === 403
      ? 'Les clés ou autorisations Gemini doivent être vérifiées dans Google AI Studio.'
      : lastStatus === 400 || lastStatus === 404
      ? 'Les modèles Gemini configurés ne sont pas accessibles avec cette clé. Vérifiez les modèles dans Google AI Studio.'
      : 'Niger IA est temporairement indisponible. Réessayez dans quelques instants.'
  }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
}
