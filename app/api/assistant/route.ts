import { NextResponse } from 'next/server'
import { findNigerKnowledge } from '../../../lib/niger-knowledge'
import { findNigerDictionary, NIGER_LANGUAGES } from '../../../lib/niger-dictionaries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

const SYSTEM_INSTRUCTION = `Tu es Niger IA, l'assistant culturel intelligent du site « Le Niger et ses Merveilles ». Tu dois être attentif au contexte de la conversation, mémoriser le fil de la discussion pendant la session, demander une précision quand une demande est ambiguë et proposer des réponses nuancées, utiles et naturelles. Pour les problèmes complexes, présente directement une conclusion, les raisons principales et les étapes pratiques, sans exposer de raisonnement interne privé. Tu n'es pas conscient au sens humain et ne prétends pas l'être : décris-toi comme un assistant IA capable de suivre le contexte.
Ton domaine principal est exclusivement le Niger : ses huit régions, son histoire, ses patrimoines, ses langues, ses communautés, ses traditions, sa gastronomie, son tourisme et ses enjeux culturels. Si une question est hors sujet, réponds brièvement puis propose un lien avec le Niger.
Réponds en français par défaut et dans la langue de l'utilisateur si tu la reconnais. Le Niger est multilingue : prends en charge notamment le haoussa, le zarma-songhaï, le tamajaq/tamacheq, le fulfulde, le kanuri, l'arabe, le gourmanchéma et les langues toubou (tedaga/dazaga). Ces noms ne correspondent pas à une relation simple « une ethnie = une langue ». Si une forme n'est pas dans le dictionnaire vérifié, indique l'incertitude et demande la variante locale au lieu d'inventer une traduction. Préserve les caractères spéciaux et l'écriture arabe. Réponds en texte propre et directement lisible sur téléphone. N’utilise jamais la syntaxe Markdown visible : aucun signe # pour les titres, aucun ** ou __ pour le gras, aucune ligne --- et aucun astérisque pour les listes. Fais des titres simples, par exemple « 1. Les principaux sites », puis des paragraphes et des puces simples si nécessaire. Donne une réponse complète jusqu’à sa conclusion : développe les sections annoncées, ne t’arrête pas au milieu d’une phrase ou d’une liste. Pour une question demandant des détails, privilégie une réponse structurée mais suffisamment complète.
Utilise les messages précédents de la conversation pour garder le contexte et adapter ta réponse. Ne prétends pas apprendre durablement ni modifier tes connaissances à partir d'une conversation. Ne présente jamais une information incertaine comme un fait établi. Si tu ne sais pas, dis-le clairement et recommande une source fiable. Ne fabrique ni horaires, ni prix, ni liens, ni événements.
Lorsque le contexte documentaire ci-dessous fournit une source pertinente, appuie-toi dessus et indique le nom de la source ainsi que son lien. Ne dis pas que tu as consulté une source en direct si ce n’est pas le cas. Si les documents sont insuffisants, précise la limite et ne complète pas les détails manquants par invention.\nReste respectueux de toutes les communautés et traditions du Niger.`

const DEFAULT_MODEL = 'gemini-3.8-flash'
const FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite']

function normalizeModel(value: string) {
  return value.trim().replace(/^models\//, '')
}

function isModelUnavailable(status: number, message: string) {
  if (status === 404) return true
  return status === 400 && /model.*(not found|not supported|not available|does not exist)|not found.*model|unknown model/i.test(message)
}

function isRetryable(status: number) {
  // Erreurs temporaires ou limites : essayer le prochain modèle.
  return status === 408 || status === 429 || status >= 500
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      { error: 'L’assistant IA n’est pas encore configuré. Ajoutez GEMINI_API_KEY dans les variables d’environnement du projet.' },
      { status: 503 },
    )
  }

  const body = await request.json().catch(() => null)
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
  const validMessages = messages
    .filter((item): item is ChatMessage => item && (item.role === 'user' || item.role === 'model') && typeof item.content === 'string')
    .slice(-12)
    .map((item) => ({ role: item.role, parts: [{ text: item.content.slice(0, 6000) }] }))

  if (!validMessages.length || validMessages[validMessages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Envoyez une question pour commencer.' }, { status: 400 })
  }

  const lastQuestion = validMessages[validMessages.length - 1]?.parts?.[0]?.text || ''
  // Pour les questions de suivi (« et pourquoi ? », « combien ? », « développe »),
  // réutiliser les derniers messages utilisateur afin que la recherche locale
  // conserve le sujet de la discussion, comme le fait le contexte du chat.
  const recentUserQuestions = validMessages
    .filter((item) => item.role === 'user')
    .slice(-4)
    .map((item) => item.parts[0].text)
  const isFollowUp = lastQuestion.trim().split(/\\s+/).length <= 9 ||
    /^(et|alors|pourquoi|comment|lesquels|lesquelles|laquelle|lequel|leur|ça|cela|ceci|continue|développe|explique davantage|et ensuite)\\b/i.test(lastQuestion.trim())
  const retrievalQuestion = isFollowUp
    ? [...recentUserQuestions.slice(0, -1), lastQuestion].join('\\n')
    : lastQuestion
  const [localKnowledgeEntries, supabaseKnowledgeEntries] = await Promise.all([
    Promise.resolve(findNigerKnowledge(retrievalQuestion, 5)),
    findSupabaseKnowledge(retrievalQuestion, 5),
  ])
  const dictionaryEntries = findNigerDictionary(retrievalQuestion, 14)
  const localKnowledgeContext = localKnowledgeEntries.length
    ? localKnowledgeEntries.map((entry, index) =>
        (index + 1) + '. ' + entry.title + '\\n' + entry.content + '\\nSource : ' + entry.sourceLabel + ' — ' + entry.sourceUrl
      ).join('\\n\\n')
    : ''
  const supabaseKnowledgeContext = supabaseKnowledgeEntries.length
    ? supabaseKnowledgeEntries.map((entry, index) =>
        (index + 1) + '. [' + entry.category + '] ' + entry.title + '\\n' + entry.content
      ).join('\\n\\n')
    : ''
  const combinedKnowledgeContext = [localKnowledgeContext, supabaseKnowledgeContext].filter(Boolean).join('\\n\\n')
  const knowledgeContext = combinedKnowledgeContext
    ? '\\n\\nCONNAISSANCES DOCUMENTAIRES DISPONIBLES (base locale et, si configurée, base Supabase) :\\n' + combinedKnowledgeContext
    : '\\n\\nAucune fiche documentaire locale ou Supabase correspondante n’a été trouvée. Ne prétends pas que la base contient une réponse vérifiée.'
  const dictionaryContext = dictionaryEntries.length
    ? '\n\nENTRÉES DU DICTIONNAIRE MULTILINGUE LOCAL (références de départ ; respecter les notes et la variété indiquée) :\n' + dictionaryEntries.map((entry, index) => (index + 1) + '. Langue : ' + entry.language + ' ; communauté associée : ' + entry.community + ' ; expression : « ' + entry.word + ' » ; sens : ' + entry.french + (entry.note ? ' ; note : ' + entry.note : '') + ' ; source : ' + entry.sourceLabel + ' — ' + entry.sourceUrl).join('\n')
    : '\n\nDICTIONNAIRE : aucune entrée locale correspondante n’a été trouvée. Ne fabrique pas de mot ou de traduction. Propose de préciser la langue/variante ou d’ajouter une contribution validée.'
  const languageContext = '\n\nLANGUES RÉFÉRENCÉES : ' + NIGER_LANGUAGES.map((item) => item.name + ' (' + item.community + '; statut : ' + item.status + '; référence : ' + item.sourceUrl + ')').join(' ; ')
  const systemInstruction = SYSTEM_INSTRUCTION + knowledgeContext + dictionaryContext + languageContext

  const configuredModel = normalizeModel(process.env.GEMINI_MODEL || DEFAULT_MODEL) || DEFAULT_MODEL
  const models = [...new Set([configuredModel, ...FALLBACK_MODELS])]
  let lastStatus = 502
  let lastMessage = 'Aucun modèle n’a répondu.'
  let networkFailure = false

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`

    try {
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: validMessages,
          generationConfig: { temperature: 0.55, maxOutputTokens: 4096 },
        }),
        signal: AbortSignal.timeout(18000),
        cache: 'no-store',
      })

      const data = await upstream.json().catch(() => ({}))

      if (upstream.ok) {
        const answer = data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || '')
          .join('')
          .trim()

        if (!answer) {
          console.error('Gemini returned no text:', model, JSON.stringify(data?.promptFeedback || {}))
          return NextResponse.json(
            { error: 'Gemini n’a pas généré de texte. Reformulez votre question et réessayez.' },
            { status: 502 },
          )
        }

        return NextResponse.json(
          { answer, model },
          { headers: { 'Cache-Control': 'no-store' } },
        )
      }

      lastStatus = upstream.status
      lastMessage = typeof data?.error?.message === 'string' ? data.error.message : 'Erreur Gemini inconnue'
      console.error('Gemini API error:', upstream.status, model, lastMessage)

      if (isModelUnavailable(upstream.status, lastMessage) || isRetryable(upstream.status)) {
        continue
      }

      if (upstream.status === 401 || upstream.status === 403) {
        return NextResponse.json(
          { error: 'La clé Gemini est refusée. Vérifiez GEMINI_API_KEY et que Gemini API est activée pour cette clé.' },
          { status: 502 },
        )
      }

      if (upstream.status === 400) {
        return NextResponse.json(
          { error: 'Gemini a refusé le format de la requête. Vérifiez la configuration du modèle et réessayez.' },
          { status: 502 },
        )
      }

      return NextResponse.json(
        { error: 'Gemini ne peut pas répondre pour le moment. Réessayez plus tard.' },
        { status: 502 },
      )
    } catch (error) {
      // Une panne réseau ou un timeout sur un modèle ne doit pas empêcher
      // l'essai des modèles de secours.
      networkFailure = true
      lastStatus = 504
      lastMessage = error instanceof Error ? error.message : 'Erreur réseau inconnue'
      console.error('Gemini fetch failed; trying next model:', model, lastMessage)
      continue
    }
  }

  console.error('Tous les modèles Gemini ont échoué:', { lastStatus, lastMessage, networkFailure })
  return NextResponse.json(
    {
      error: networkFailure
        ? 'Les modèles Gemini ne répondent pas actuellement. Vérifiez la connexion du serveur et réessayez.'
        : 'Aucun modèle Gemini disponible pour cette clé. Vérifiez GEMINI_API_KEY et les modèles autorisés dans Google AI Studio.',
    },
    { status: 502, headers: { 'Cache-Control': 'no-store' } },
  )
}
