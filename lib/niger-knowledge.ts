export type NigerKnowledgeEntry = {
  id: string
  title: string
  keywords: string[]
  content: string
  sourceLabel: string
  sourceUrl: string
}

/**
 * Starter knowledge base for Merveilles IA.
 * Keep entries concise, sourced, and reviewed before expanding them.
 * This is retrieval context, not model training.
 */
export const NIGER_KNOWLEDGE: NigerKnowledgeEntry[] = [
  {
    id: 'regions',
    title: 'Les huit régions du Niger',
    keywords: ['région', 'régions', 'administrative', 'niamey', 'agadez', 'diffa', 'dosso', 'maradi', 'tahoua', 'tillabéri', 'zinder'],
    content: 'Le Niger compte huit régions administratives : Agadez, Diffa, Dosso, Maradi, Tahoua, Tillabéri, Zinder et la région de Niamey, qui a un statut particulier. Pour une fiche régionale complète, distinguer la région administrative, sa ville principale, ses départements et ses communes. Ne pas inventer les chiffres démographiques : ils dépendent de l’année et de la source.',
    sourceLabel: 'Portail officiel du gouvernement du Niger',
    sourceUrl: 'https://www.gouv.ne/',
  },
  {
    id: 'tourism',
    title: 'Sites touristiques du Niger',
    keywords: ['tourisme', 'touristique', 'visiter', 'voyage', 'site', 'sites', 'merveille', 'merveilles', 'destination'],
    content: 'Le patrimoine touristique du Niger comprend des paysages sahariens, des villes historiques, des sites culturels et des espaces naturels. Les possibilités de visite, les autorisations, les accès et les conditions de sécurité peuvent évoluer : il faut les vérifier auprès de sources officielles et locales avant de recommander un déplacement.',
    sourceLabel: 'Sites touristiques — Gouvernement du Niger',
    sourceUrl: 'https://www.gouv.ne/index.php/lenigerpresentation/les-sites-touristiques-du-niger',
  },
  {
    id: 'agadez',
    title: 'Centre historique d’Agadez',
    keywords: ['agadez', 'mosquée', 'minaret', 'architecture', 'unesco', 'patrimoine mondial'],
    content: 'Le centre historique d’Agadez est inscrit sur la Liste du patrimoine mondial de l’UNESCO. La ville est connue pour son architecture en terre et sa grande mosquée avec son minaret emblématique. Pour les détails historiques, les critères d’inscription et la description officielle, privilégier la fiche de l’UNESCO.',
    sourceLabel: 'UNESCO — Centre historique d’Agadez',
    sourceUrl: 'https://whc.unesco.org/en/list/1268/',
  },
  {
    id: 'parc-w',
    title: 'Complexe naturel W-Arly-Pendjari',
    keywords: ['parc w', 'parc national', 'faune', 'animaux', 'biodiversité', 'nature', 'girafe', 'éléphant', 'unesco'],
    content: 'Le parc national du W fait partie du complexe transnational W-Arly-Pendjari, inscrit au patrimoine mondial. Il s’agit d’un espace naturel important pour la biodiversité de la région. Les règles d’accès, les circuits autorisés et la situation sécuritaire doivent être vérifiés avant toute visite.',
    sourceLabel: 'UNESCO — Complexe W-Arly-Pendjari',
    sourceUrl: 'https://whc.unesco.org/en/list/749/',
  },
  {
    id: 'cure-salee',
    title: 'Cure Salée',
    keywords: ['cure salée', 'cure salee', 'éleveurs', 'nomades', 'pastoralisme', 'tradition', 'festival'],
    content: 'La Cure Salée est un rassemblement pastoral traditionnel associé aux communautés d’éleveurs du nord du Niger. Elle est liée aux déplacements saisonniers des troupeaux et constitue un événement culturel important. Les dates, le lieu précis et le programme changent selon les éditions : ne pas les annoncer sans vérification récente.',
    sourceLabel: 'À documenter avec des sources institutionnelles et locales récentes',
    sourceUrl: 'https://www.gouv.ne/',
  },
  {
    id: 'langues',
    title: 'Langues du Niger',
    keywords: ['langue', 'langues', 'haoussa', 'zarma', 'songhaï', 'tamasheq', 'tamajaq', 'fulfulde', 'kanuri', 'arabe'],
    content: 'Le Niger est multilingue. Le haoussa, le zarma-songhaï, le tamasheq/tamajaq, le fulfulde, le kanuri et l’arabe font notamment partie des langues utilisées dans le pays, aux côtés d’autres langues. Les usages varient selon les régions et les communautés. Pour une traduction, préciser si possible la langue, la variante locale et le contexte.',
    sourceLabel: 'Portail officiel du gouvernement du Niger',
    sourceUrl: 'https://www.gouv.ne/',
  },
  {
    id: 'gastronomie',
    title: 'Gastronomie nigérienne',
    keywords: ['cuisine', 'gastronomie', 'plat', 'plats', 'recette', 'moringa', 'mil', 'sorgho', 'niébé'],
    content: 'La cuisine nigérienne varie selon les régions et les communautés. Le mil, le sorgho, le riz, les légumineuses, les légumes et différentes sauces occupent une place importante dans de nombreux repas. Pour décrire un plat, préciser les variantes régionales et distinguer les recettes familiales des recettes présentées comme représentatives de tout le pays.',
    sourceLabel: 'Fiche de synthèse culturelle — à enrichir par des sources culinaires locales',
    sourceUrl: 'https://www.gouv.ne/',
  },
  {
    id: 'geographie',
    title: 'Géographie du Niger',
    keywords: ['géographie', 'climat', 'désert', 'sahara', 'sahel', 'fleuve', 'fleuve niger', 'frontière', 'superficie'],
    content: 'Le Niger est un pays enclavé d’Afrique de l’Ouest. Son territoire comprend des zones sahariennes au nord et des zones sahéliennes plus au sud. Le fleuve Niger traverse le sud-ouest du pays et passe près de Niamey. Pour les chiffres exacts de superficie, de population ou de climat, indiquer la source et l’année de référence.',
    sourceLabel: 'Portail officiel du gouvernement du Niger',
    sourceUrl: 'https://www.gouv.ne/',
  },
  {
    id: 'artisanat',
    title: 'Artisanat et savoir-faire',
    keywords: ['artisanat', 'artisan', 'cuir', 'bijou', 'bijoux', 'cuivre', 'tissage', 'poterie', 'vannerie'],
    content: 'Les savoir-faire artisanaux du Niger comprennent notamment le travail du cuir, la bijouterie, le tissage, la poterie et la vannerie, avec des pratiques qui varient selon les régions et les communautés. Pour présenter un artisan ou une technique, privilégier le nom du créateur, sa localité et son accord pour publier des informations ou des images.',
    sourceLabel: 'À enrichir avec des artisans et institutions culturelles locales',
    sourceUrl: 'https://www.gouv.ne/',
  },
  {
    id: 'actualites',
    title: 'Actualités et événements',
    keywords: ['actualité', 'actualités', 'aujourd’hui', 'aujourd hui', 'date', 'festival', 'événement', 'évènements', 'programme', 'prix', 'horaire'],
    content: 'Les actualités, dates de festivals, horaires, prix, conditions d’accès et informations de sécurité sont des données susceptibles de changer. Ne pas répondre comme si une information était actuelle sans consulter une source récente. Afficher la date de vérification et citer la source lorsqu’une recherche en direct est disponible.',
    sourceLabel: 'Règle de fraîcheur des informations',
    sourceUrl: 'https://www.gouv.ne/',
  },,

  {
    id: 'history-niger',
    title: 'Histoire du Niger',
    keywords: ['histoire du niger', 'histoire', 'indépendance', '1960', 'colonisation', 'république'],
    content: 'Le Niger est devenu indépendant le 3 août 1960. Pour raconter son histoire, distinguer les périodes précoloniales, la période coloniale, l’indépendance et l’histoire politique contemporaine. Associer les dates et interprétations historiques à des sources fiables et à leur contexte.',
    sourceLabel: 'Encyclopaedia Britannica — Niger',
    sourceUrl: 'https://www.britannica.com/place/Niger',
  },
  {
    id: 'niamey',
    title: 'Niamey, capitale du Niger',
    keywords: ['niamey', 'capitale', 'ville de niamey'],
    content: 'Niamey est la capitale du Niger, située dans le sud-ouest du pays près du fleuve Niger. Elle accueille les principales institutions nationales et constitue un centre administratif, culturel et économique. Vérifier les horaires et événements auprès de sources locales récentes.',
    sourceLabel: 'Encyclopaedia Britannica — Niger',
    sourceUrl: 'https://www.britannica.com/place/Niger',
  },
  {
    id: 'air-tenere',
    title: 'Massif de l’Aïr et désert du Ténéré',
    keywords: ['aïr', 'air', 'ténéré', 'tenere', 'désert', 'sahara'],
    content: 'Le massif de l’Aïr et le désert du Ténéré forment un vaste ensemble de paysages sahariens au nord du Niger. Avant de recommander une visite, vérifier les conditions d’accès, les autorisations et les recommandations de sécurité.',
    sourceLabel: 'UNESCO — Réserves naturelles de l’Aïr et du Ténéré',
    sourceUrl: 'https://whc.unesco.org/',
  },
  {
    id: 'culture-tuareg',
    title: 'Cultures touarègues et artisanat',
    keywords: ['touareg', 'touaregs', 'tamajaq', 'tamacheq', 'artisanat', 'bijouterie'],
    content: 'Les communautés touarègues possèdent des traditions diverses en matière de langue, de poésie, de musique, d’artisanat et de mobilité pastorale. Les pratiques diffèrent selon les familles et les régions ; éviter de présenter une coutume comme universelle.',
    sourceLabel: 'UNESCO — patrimoine culturel immatériel',
    sourceUrl: 'https://ich.unesco.org/',
  },
  {
    id: 'fleuve-niger',
    title: 'Le fleuve Niger et ses usages',
    keywords: ['fleuve niger', 'fleuve', 'pêche', 'irrigation', 'niamey'],
    content: 'Le fleuve Niger traverse le sud-ouest du pays et soutient différents usages, notamment la pêche, l’agriculture irriguée et les écosystèmes riverains. Les données hydrologiques et environnementales doivent être datées et vérifiées auprès d’organismes compétents.',
    sourceLabel: 'Autorité du Bassin du Niger',
    sourceUrl: 'https://www.abn.ne/',
  },
  {
    id: 'agriculture-elevage',
    title: 'Agriculture, élevage et pastoralisme',
    keywords: ['agriculture', 'élevage', 'elevage', 'pastoralisme', 'mil', 'sorgho', 'transhumance'],
    content: 'L’agriculture pluviale, les céréales, l’élevage et le pastoralisme comptent parmi les moyens de subsistance importants au Niger. Les systèmes de production dépendent notamment des pluies, de l’accès à l’eau et des marchés. Les chiffres de production doivent toujours être datés et sourcés.',
    sourceLabel: 'FAO — Niger',
    sourceUrl: 'https://www.fao.org/niger/',
  },
  {
    id: 'musique-danse',
    title: 'Musique, danse et expressions orales',
    keywords: ['musique', 'danse', 'chants', 'poésie', 'conte', 'tradition orale'],
    content: 'La musique, la danse, les contes, la poésie et les récits transmis oralement participent à la diversité culturelle du Niger. Les styles, instruments et répertoires varient selon les communautés et les contextes. Attribuer une pratique à une communauté seulement lorsque l’information est confirmée.',
    sourceLabel: 'UNESCO — patrimoine culturel immatériel',
    sourceUrl: 'https://ich.unesco.org/',
  },
  {
    id: 'conseil-traduction',
    title: 'Conseils pour une traduction fiable',
    keywords: ['traduire', 'traduction', 'comment dire', 'prononciation', 'orthographe', 'dialecte', 'variante'],
    content: 'Pour une traduction fiable, préciser la langue et si possible la variante locale, le contexte, le niveau de politesse et le destinataire. Distinguer traduction littérale et formulation naturelle. Si une forme n’a pas été vérifiée par un locuteur compétent, signaler cette limite plutôt que d’inventer une réponse certaine.',
    sourceLabel: 'Règle éditoriale de Merveilles IA',
    sourceUrl: 'https://www.gouv.ne/',
  },
]

const normalize = (value: string) =>
  value.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export function findNigerKnowledge(question: string, limit = 4): NigerKnowledgeEntry[] {
  const normalizedQuestion = normalize(question)
  const terms = normalizedQuestion.split(/[^a-z0-9]+/).filter((term) => term.length > 2)
  const scored = NIGER_KNOWLEDGE.map((entry) => {
    const title = normalize(entry.title)
    const keywords = entry.keywords.map(normalize)
    let score = 0
    for (const keyword of keywords) {
      if (normalizedQuestion.includes(keyword)) score += keyword.includes(' ') ? 3 : 2
    }
    for (const term of terms) {
      if (title.includes(term)) score += 2
    }
    return { entry, score }
  }).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((item) => item.entry)
}
