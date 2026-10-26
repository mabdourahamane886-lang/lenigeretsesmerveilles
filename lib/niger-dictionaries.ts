export type NigerDictionaryEntry = {
  id: string
  language: string
  languageCode: string
  community: string
  word: string
  french: string
  category: string
  note?: string
  sourceLabel: string
  sourceUrl: string
}

export type NigerLanguage = {
  id: string
  name: string
  community: string
  code: string
  status: string
  description: string
  sourceLabel: string
  sourceUrl: string
}

/**
 * Dictionnaire de démarrage documenté. Ce n'est PAS un dictionnaire exhaustif
 * ni un modèle entraîné. Les formes dialectales doivent être vérifiées par des
 * locuteurs et spécialistes avant d'étendre le corpus.
 */
export const NIGER_LANGUAGES: NigerLanguage[] = [
  { id: 'hausa', name: 'Haoussa', community: 'Haoussa', code: 'ha', status: 'Vocabulaire de base disponible', description: 'Salutations, politesse et vocabulaire quotidien. Des variantes locales et des distinctions de genre existent.', sourceLabel: 'LinguaCommons — Haoussa pour les francophones', sourceUrl: 'https://www.linguacommons.com/language-learning/guides/hausa-from-french' },
  { id: 'zarma', name: 'Zarma / Zarma-Songhaï', community: 'Zarma-Songhaï', code: 'dje', status: 'Vocabulaire de base disponible', description: 'Salutations et expressions de la vie courante. L’orthographe peut varier selon les ressources.', sourceLabel: 'Peace Corps — Zarma Language Lessons', sourceUrl: 'https://www.fsi-language-courses.org/peace-corps-zarma-language-lessons/2-greetings-vocabulary/' },
  { id: 'tamajaq', name: 'Tamajaq / Tamacheq', community: 'Touareg', code: 'tmh', status: 'Petit lexique initial', description: 'Le continuum touareg comprend des variétés régionales distinctes. Les mots ne sont pas automatiquement interchangeables entre toutes les variétés.', sourceLabel: 'Maidjanad — Tamahaq lexique', sourceUrl: 'https://www.maidjanad.com/tamahaq-lexique/' },
  { id: 'fulfulde', name: 'Fulfulde', community: 'Peul / Fulbé', code: 'fuv', status: 'Corpus à enrichir', description: 'Les formes varient fortement selon les variétés régionales. Les entrées doivent être relues par un locuteur du Niger.', sourceLabel: 'ERIC — Dictionnaire de Fulfulde préparé pour le Niger', sourceUrl: 'https://eric.ed.gov/?id=ED403752' },
  { id: 'kanuri', name: 'Kanuri / Kanouri', community: 'Kanouri', code: 'knc', status: 'Expressions initiales', description: 'Quelques salutations et nombres issus d’un jeu de données socioculturel. Vérification locale souhaitable.', sourceLabel: 'Mozilla Data Collective — A Kanuri Sociocultural Dataset', sourceUrl: 'https://mozilladatacollective.com/datasets/cmrxj3m5q0021o907tnm6c9jp' },
  { id: 'arabic', name: 'Arabe', community: 'Communautés arabophones', code: 'ar', status: 'Expressions standard uniquement', description: 'Les entrées de départ sont en arabe standard moderne, pas une description de toutes les variétés arabes parlées au Niger.', sourceLabel: 'Référentiel de langue — arabe standard moderne', sourceUrl: 'https://www.britannica.com/topic/Arabic-language' },
  { id: 'gourmanchema', name: 'Gourmanchéma', community: 'Gourmantché', code: 'gux', status: 'Lexique à collecter', description: 'La base fournit un point de départ documentaire, mais aucune traduction non vérifiée n’est ajoutée ici.', sourceLabel: 'ASJP — Wordlist Gourmanchema', sourceUrl: 'https://asjp.clld.org/languages/GOURMANCHEMA' },
  { id: 'toubou', name: 'Tedaga / Dazaga (langues toubou)', community: 'Toubou', code: 'tuq', status: 'Lexique à valider avec des locuteurs', description: 'Les variétés Tedaga et Dazaga doivent être distinguées. Ce projet n’invente pas de mots lorsque les formes ne sont pas vérifiées.', sourceLabel: 'Glottolog — ressources linguistiques à compléter', sourceUrl: 'https://glottolog.org/' },
]

const hausa = 'LinguaCommons — Haoussa pour les francophones'
const hausaUrl = 'https://www.linguacommons.com/language-learning/guides/hausa-from-french'
const zarma = 'Peace Corps — Zarma Language Lessons'
const zarmaUrl = 'https://www.fsi-language-courses.org/peace-corps-zarma-language-lessons/2-greetings-vocabulary/'
const fulfulde = 'Polyglot Club — Central-Eastern Niger Fulfulde greetings'
const fulfuldeUrl = 'https://polyglotclub.com/wiki/Language/Central-eastern-niger-fulfulde/Vocabulary/How-to-Say-Hello-and-Greetings'
const tamahaq = 'Maidjanad — Tamahaq lexique'
const tamahaqUrl = 'https://www.maidjanad.com/tamahaq-lexique/'

const rawEntries: Omit<NigerDictionaryEntry, 'id'>[] = [
  ...[
    ['Sannu', 'Bonjour / salut', 'Salutation'],
    ['Ina kwana?', 'Bonjour (le matin)', 'Salutation'],
    ['Yaya kake?', 'Comment vas-tu ? (adressé à un homme)', 'Salutation'],
    ['Lafiya lau', 'Je vais bien / très bien', 'Salutation'],
    ['Na gode', 'Merci', 'Politesse'],
    ['Na gode sosai', 'Merci beaucoup', 'Politesse'],
    ['Don Allah', 'S’il vous plaît', 'Politesse'],
    ['Ī / I', 'Oui', 'Réponse'],
    ['A’a', 'Non', 'Réponse'],
    ['gida', 'Maison', 'Vie quotidienne'],
    ['ruwa', 'Eau', 'Vie quotidienne'],
    ['abinci', 'Nourriture', 'Vie quotidienne'],
    ['ci', 'Manger', 'Verbe'],
    ['sha', 'Boire', 'Verbe'],
    ['mutum', 'Personne / homme selon le contexte', 'Personnes'],
    ['mace', 'Femme', 'Personnes'],
    ['yaro', 'Garçon / enfant masculin', 'Personnes'],
    ['yarinya', 'Fille', 'Personnes'],
    ['yau', 'Aujourd’hui', 'Temps'],
    ['gobe', 'Demain', 'Temps'],
    ['jiya', 'Hier', 'Temps'],
    ['littafi', 'Livre', 'École'],
    ['rana', 'Soleil / jour selon le contexte', 'Nature'],
    ['mota', 'Voiture', 'Transport'],
  ].map(([word, french, category]) => ({ language: 'Haoussa', languageCode: 'ha', community: 'Haoussa', word, french, category, sourceLabel: hausa, sourceUrl: hausaUrl })),
  ...[
    ['Fofo', 'Bonjour / salutations (également employé comme remerciement selon le contexte)', 'Salutation'],
    ['Mate ni go?', 'Comment vas-tu ?', 'Salutation'],
    ['Ay go baani', 'Je vais bien / je suis en bonne santé', 'Salutation'],
    ['Baani samay', 'En bonne santé ; formule de réponse', 'Salutation'],
    ['Mate kwaara?', 'Comment va la maison / le village ?', 'Salutation'],
    ['Mate goy?', 'Comment va le travail ?', 'Salutation'],
    ['Mate ni kani?', 'Comment as-tu dormi ?', 'Salutation'],
    ['Kala tonton', 'À plus tard', 'Au revoir'],
    ['Kala suba', 'À demain', 'Au revoir'],
    ['Ay ma ka ti …', 'Je m’appelle … (modèle de phrase)', 'Présentation'],
    ['Ohõ', 'Oui', 'Réponse'],
    ['Hã’ã', 'Non', 'Réponse'],
    ['Saabu', 'Remercier / merci selon le contexte', 'Politesse'],
    ['Yaafa ay se', 'Excuse-moi / pardonne-moi', 'Politesse'],
    ['boro', 'Personne', 'Personnes'],
    ['cawandiko', 'Enseignant / formateur', 'École'],
    ['fu', 'Famille / maison selon le contexte', 'Vie quotidienne'],
    ['goy', 'Travail', 'Vie quotidienne'],
    ['kani', 'Dormir / sommeil', 'Vie quotidienne'],
    ['zankey', 'Enfants', 'Personnes'],
  ].map(([word, french, category]) => ({ language: 'Zarma / Zarma-Songhaï', languageCode: 'dje', community: 'Zarma-Songhaï', word, french, category, sourceLabel: zarma, sourceUrl: zarmaUrl })),
  ...[
    ['Madiyafou', 'Bonjour / bon matin', 'Salutation'],
    ['Ma Touled', 'Comment vas-tu ?', 'Salutation'],
    ['Al Kheir', 'Bien / en bonne santé', 'Salutation'],
    ['Ayoh', 'Oui', 'Réponse'],
    ['Kala', 'Non', 'Réponse'],
    ['Ar Toufat', 'Bonne nuit / à demain', 'Au revoir'],
    ['Negla', 'Allons-y', 'Action'],
    ['Houlan', 'Beaucoup', 'Quantité'],
    ['Anobi', 'Enfant', 'Personnes'],
    ['Asarouf', 'Excuse-moi / pardon', 'Politesse'],
    ['Tekabart', 'Maison', 'Vie quotidienne'],
    ['Aden', 'Homme', 'Personnes'],
  ].map(([word, french, category]) => ({ language: 'Tamahaq (variété touareg)', languageCode: 'tmh', community: 'Touareg', word, french, category, sourceLabel: tamahaq, sourceUrl: tamahaqUrl })),
  ...[
    ['Foma', 'Salutation générale adressée à une personne', 'Salutation'],
    ['Foma, foma', 'Salutation générale à une personne', 'Salutation'],
    ['Fomon', 'Salutation adressée à un groupe', 'Salutation'],
    ['Engido', 'Réponse à « Foma » ou « Fomon »', 'Salutation'],
    ['A walli jam?', 'Bonjour le matin ? (à une personne)', 'Salutation'],
    ['On balli jam?', 'Bonjour le matin ? (à un groupe)', 'Salutation'],
    ['A nyalli jam?', 'Salutation de l’après-midi (à une personne)', 'Salutation'],
    ['A hiri jam?', 'Salutation du soir (à une personne)', 'Salutation'],
    ['A jamo?', 'Comment vas-tu ?', 'Salutation'],
    ['On yambe?', 'Comment allez-vous ? (à un groupe)', 'Salutation'],
    ['Jam pelem', 'Réponse de paix / bonne santé à une salutation', 'Salutation'],
  ].map(([word, french, category]) => ({ language: 'Fulfulde (variété du centre-est du Niger)', languageCode: 'fuv', community: 'Peul / Fulbé', word, french, category, sourceLabel: fulfulde, sourceUrl: fulfuldeUrl })),
  ...[
    ['Saléfagna', 'Salut / salutation neutre', 'Salutation'],
    ['ndawatou', 'Salutation du matin (une personne)', 'Salutation'],
    ['ndawatoundo', 'Salutation du matin (plusieurs personnes)', 'Salutation'],
    ['Nda doubdoc', 'Salutation de la mi-journée / comment vas-tu ?', 'Salutation'],
    ['Lakka / fal', 'Un', 'Nombre'],
    ['Indi', 'Deux', 'Nombre'],
    ['Yake', 'Trois', 'Nombre'],
    ['Dio', 'Quatre', 'Nombre'],
  ].map(([word, french, category]) => ({ language: 'Kanuri / Kanouri', languageCode: 'knc', community: 'Kanouri', word, french, category, sourceLabel: 'Mozilla Data Collective — A Kanuri Sociocultural Dataset', sourceUrl: 'https://mozilladatacollective.com/datasets/cmrxj3m5q0021o907tnm6c9jp' })),
  ...[
    ['السلام عليكم', 'Que la paix soit sur vous (salutation)', 'Salutation'],
    ['وعليكم السلام', 'Et que la paix soit sur vous aussi (réponse)', 'Salutation'],
    ['شكراً', 'Merci', 'Politesse'],
    ['من فضلك', 'S’il vous plaît', 'Politesse'],
    ['نعم', 'Oui', 'Réponse'],
    ['لا', 'Non', 'Réponse'],
    ['كيف حالك؟', 'Comment vas-tu ?', 'Salutation'],
    ['أنا بخير', 'Je vais bien', 'Salutation'],
  ].map(([word, french, category]) => ({ language: 'Arabe standard moderne', languageCode: 'ar', community: 'Communautés arabophones', word, french, category, sourceLabel: 'Arabe standard moderne — expressions de base', sourceUrl: 'https://www.britannica.com/topic/Arabic-language', note: 'Arabe standard ; la formulation locale peut différer.' })),

  ...[
    ['صباح الخير', 'Bonjour (le matin)', 'Salutation'],
    ['مساء الخير', 'Bonsoir', 'Salutation'],
    ['أهلاً وسهلاً', 'Bienvenue', 'Salutation'],
    ['كيف اسمك؟', 'Comment t’appelles-tu ?', 'Présentation'],
    ['اسمي ...', 'Je m’appelle ...', 'Présentation'],
    ['أين ...؟', 'Où se trouve ... ?', 'Question'],
    ['كم السعر؟', 'Quel est le prix ?', 'Commerce'],
    ['أنا لا أفهم', 'Je ne comprends pas', 'Communication'],
    ['هل تتكلم الفرنسية؟', 'Parles-tu français ?', 'Communication'],
    ['إلى اللقاء', 'Au revoir', 'Au revoir'],
    ['بيت', 'Maison', 'Vie quotidienne'],
    ['ماء', 'Eau', 'Vie quotidienne'],
    ['طعام', 'Nourriture', 'Vie quotidienne'],
    ['كتاب', 'Livre', 'École'],
    ['مدرسة', 'École', 'École'],
    ['صديق', 'Ami', 'Personnes'],
    ['عائلة', 'Famille', 'Personnes'],
    ['اليوم', 'Aujourd’hui', 'Temps'],
    ['غداً', 'Demain', 'Temps'],
    ['أمس', 'Hier', 'Temps'],
  ].map(([word, french, category]) => ({ language: 'Arabe standard moderne', languageCode: 'ar', community: 'Communautés arabophones', word, french, category, sourceLabel: 'Arabe standard moderne — expressions de base', sourceUrl: 'https://www.britannica.com/topic/Arabic-language', note: 'Arabe standard ; les formulations locales peuvent différer.' })),
]

export const NIGER_DICTIONARY: NigerDictionaryEntry[] = rawEntries.map((entry, index) => ({ ...entry, id: entry.languageCode + '-' + index }))

const normalize = (value: string) => value.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['’]/g, '')

export function findNigerDictionary(question: string, limit = 12): NigerDictionaryEntry[] {
  const q = normalize(question)
  const tokens = q.split(/[^a-z0-9\u0600-\u06ff]+/).filter((token) => token.length > 1)
  const scored = NIGER_DICTIONARY.map((entry) => {
    const word = normalize(entry.word)
    const french = normalize(entry.french)
    const language = normalize(entry.language)
    let score = 0
    if (q.includes(word) || word.includes(q) && q.length > 2) score += 6
    if (q.includes(french)) score += 4
    if (q.includes(language) || language.includes(q) && q.length > 2) score += 3
    for (const token of tokens) if (word.includes(token) || french.includes(token)) score += 1
    return { entry, score }
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(({ entry }) => entry)
}
