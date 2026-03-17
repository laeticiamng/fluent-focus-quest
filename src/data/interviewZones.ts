// ── Interview Training Zones ─────────────────────────────────────
// 6 core modules mapped to Swiss medical interview competencies
// Each zone generates questions that mimic a real Swiss medical interview

export interface InterviewQuestion {
  id: string;
  zone: InterviewZoneId;
  q: string;          // Question in German
  qFr?: string;       // Question in French
  h: string;          // Hint (key points to cover)
  r: string;          // Reference answer in German
  rFr?: string;       // Reference answer in French
  difficulty: 1 | 2 | 3;
  followUps: string[]; // Pressure training: follow-up questions
  followUpsFr?: string[]; // Follow-up questions in French
  keywords: string[];  // Key vocabulary expected in the answer
}

export type InterviewZoneId =
  | "vorstellung"
  | "motivation"
  | "erfahrung"
  | "fallanalyse"
  | "argumentation"
  | "finale";

export interface InterviewZone {
  id: InterviewZoneId;
  name: string;
  nameFr?: string;
  icon: string;
  description: string;
  descriptionFr?: string;
  color: string;
  narrativeIntro: string;
  questions: InterviewQuestion[];
}

// Pressure training: random interruptions the system can throw
export const PRESSURE_INTERRUPTIONS = [
  "Bitte erklären Sie das nochmal klarer.",
  "Warum haben Sie diese Entscheidung getroffen?",
  "Können Sie ein konkretes Beispiel geben?",
  "Das verstehe ich nicht ganz. Können Sie das anders formulieren?",
  "Was meinen Sie genau damit?",
  "Und wie würden Sie das auf Deutsch sagen?",
  "Stellen Sie sich vor, der Patient fragt nach. Was sagen Sie?",
  "Ihr Oberarzt ist anderer Meinung. Was tun Sie?",
  "Das ist interessant. Können Sie noch tiefer darauf eingehen?",
  "Wie würden Sie das einem Patienten erklären?",
  "Wir haben wenig Zeit. Fassen Sie sich kurz.",
  "Das klingt theoretisch. Haben Sie das auch praktisch erlebt?",
  "Sind Sie sicher? Überlegen Sie nochmal.",
  "Wie würden Ihre Kollegen auf diese Antwort reagieren?",
  "Und wenn es Komplikationen gibt?",
  "Können Sie das in einem Satz zusammenfassen?",
  "Das ist ein guter Punkt. Aber was ist die Alternative?",
  "Der Patient spricht kein Deutsch. Was nun?",
  "Ihre Antwort überzeugt mich noch nicht ganz. Haben Sie noch ein Argument?",
  "Stellen Sie sich vor, Sie sind alleine. Es ist Nacht. Was tun Sie?",
];

// 5-dimension evaluation rubric
export interface DimensionScore {
  language: number;         // 0-20: Grammar accuracy, vocabulary precision
  structure: number;        // 0-20: Clarity, organization, logical flow
  medicalReasoning: number; // 0-20: Clinical reasoning, medical knowledge
  confidence: number;       // 0-20: Professional tone, assertiveness
  persuasion: number;       // 0-20: Convincing power, credibility
}

export interface EvaluationResult {
  scores: DimensionScore;
  globalScore: number;      // 0-100
  strengths: string[];
  improvements: string[];
  betterVersion: string;    // Reformulated improved answer
}

export const DIMENSION_LABELS: Record<keyof DimensionScore, { de: string; fr: string; icon: string }> = {
  language:         { de: "Sprache",          fr: "Langue",             icon: "📝" },
  structure:        { de: "Struktur",         fr: "Structure",          icon: "🏗️" },
  medicalReasoning: { de: "Klinisches Denken", fr: "Raisonnement med.", icon: "🧠" },
  confidence:       { de: "Sicherheit",       fr: "Confiance",          icon: "💪" },
  persuasion:       { de: "Überzeugung",      fr: "Persuasion",         icon: "🎯" },
};

export const INTERVIEW_ZONES: InterviewZone[] = [
  {
    id: "vorstellung",
    name: "Vorstellung",
    nameFr: "Présentation",
    icon: "👋",
    description: "Sich sicher und professionell vorstellen",
    descriptionFr: "Se présenter de manière sûre et professionnelle",
    color: "emerald",
    narrativeIntro: "Le Conseil vous attend. Votre premiere impression decidera de la suite...",
    questions: [
      {
        id: "v1", zone: "vorstellung", difficulty: 1,
        q: "Stellen Sie sich bitte vor.",
        qFr: "Présentez-vous s'il vous plaît.",
        h: "Parcours + urgences + motivation Angiologie",
        r: "Guten Tag. Ich bin Dr. Motongane. Ich habe mein Medizinstudium in Frankreich abgeschlossen und arbeite seit Juli 2024 als Assistenzärztin in der Notaufnahme. Ich möchte mich jetzt in der Angiologie spezialisieren.",
        rFr: "Bonjour. Je suis le Dr Motongane. J'ai terminé mes études de médecine en France et je travaille depuis juillet 2024 comme médecin assistante aux urgences. Je souhaite maintenant me spécialiser en angiologie.",
        followUps: ["Warum haben Sie Medizin studiert?", "Seit wann arbeiten Sie in der Notaufnahme?"],
        followUpsFr: ["Pourquoi avez-vous étudié la médecine ?", "Depuis quand travaillez-vous aux urgences ?"],
        keywords: ["Medizinstudium", "Assistenzärztin", "Notaufnahme", "Angiologie", "spezialisieren"],
      },
      {
        id: "v2", zone: "vorstellung", difficulty: 2,
        q: "Können Sie uns Ihren beruflichen Werdegang kurz zusammenfassen?",
        qFr: "Pouvez-vous résumer brièvement votre parcours professionnel ?",
        h: "Chronologique + clair + pertinent",
        r: "Nach meinem Studium in Frankreich habe ich mein Examen bestanden und als Assistenzärztin in der Notaufnahme angefangen. Dort habe ich Erfahrung in der Akutmedizin gesammelt, einschließlich FAST-Ultraschall und Triage. Jetzt suche ich eine Weiterbildungsstelle in der Angiologie.",
        rFr: "Après mes études en France, j'ai réussi mon examen et commencé comme médecin assistante aux urgences. J'y ai acquis de l'expérience en médecine aiguë, y compris l'échographie FAST et le triage. Je cherche maintenant un poste de formation en angiologie.",
        followUps: ["Was haben Sie dort genau gemacht?", "Welche Verantwortung hatten Sie?"],
        followUpsFr: ["Qu'avez-vous fait exactement là-bas ?", "Quelles responsabilités aviez-vous ?"],
        keywords: ["Studium", "Examen", "Assistenzärztin", "Akutmedizin", "Weiterbildungsstelle"],
      },
      {
        id: "v3", zone: "vorstellung", difficulty: 2,
        q: "Was sollten wir über Sie wissen, das nicht im Lebenslauf steht?",
        qFr: "Que devrions-nous savoir sur vous qui ne figure pas dans votre CV ?",
        h: "Personnalite + soft skills + initiative",
        r: "Ich habe ein Start-up im Bereich digitale Gesundheit gegründet, EmotionsCare. Das zeigt meine Eigeninitiative und mein Interesse an Innovation in der Medizin. Außerdem bin ich sehr teamorientiert und lerne gern Neues.",
        rFr: "J'ai fondé une start-up dans la santé numérique, EmotionsCare. Cela montre mon sens de l'initiative et mon intérêt pour l'innovation en médecine. Je suis aussi très orientée équipe et j'aime apprendre de nouvelles choses.",
        followUps: ["Was genau macht Ihr Start-up?", "Wie passt das zur klinischen Arbeit?"],
        followUpsFr: ["Que fait exactement votre start-up ?", "Comment cela s'articule-t-il avec le travail clinique ?"],
        keywords: ["Eigeninitiative", "Innovation", "teamorientiert", "Start-up"],
      },
      {
        id: "v4", zone: "vorstellung", difficulty: 2,
        q: "Wie würden Ihre Kollegen Sie beschreiben?",
        qFr: "Comment vos collègues vous décriraient-ils ?",
        h: "Teamwork + fiabilite + qualites humaines + exemples",
        r: "Meine Kollegen würden sagen, dass ich zuverlässig und kollegial bin. In der Notaufnahme hat man mir oft komplexe Fälle anvertraut, weil ich strukturiert arbeite und gut mit dem Pflegeteam kommuniziere. Ich bin auch die Person, die neue Kolleginnen einarbeitet.",
        rFr: "Mes collègues diraient que je suis fiable et collégiale. Aux urgences, on m'a souvent confié des cas complexes car je travaille de manière structurée et je communique bien avec l'équipe soignante. Je suis aussi la personne qui forme les nouvelles collègues.",
        followUps: ["Können Sie ein konkretes Beispiel geben?", "Gab es auch mal Kritik von Kollegen?"],
        followUpsFr: ["Pouvez-vous donner un exemple concret ?", "Avez-vous déjà reçu des critiques de collègues ?"],
        keywords: ["zuverlässig", "kollegial", "strukturiert", "kommuniziere", "Pflegeteam"],
      },
      {
        id: "v5", zone: "vorstellung", difficulty: 2,
        q: "Was motiviert Sie jeden Tag, als Ärztin zu arbeiten?",
        qFr: "Qu'est-ce qui vous motive chaque jour en tant que médecin ?",
        h: "Passion + contact patient + impact + exemples",
        r: "Der direkte Kontakt mit den Patienten motiviert mich am meisten. Wenn ich einem Patienten helfen kann, seine Krankheit zu verstehen und eine Lösung zu finden — das gibt mir Energie. Die Medizin verbindet wissenschaftliches Denken mit menschlicher Nähe, und das fasziniert mich.",
        rFr: "Le contact direct avec les patients me motive le plus. Quand je peux aider un patient à comprendre sa maladie et trouver une solution — cela me donne de l'énergie. La médecine allie pensée scientifique et proximité humaine, et cela me fascine.",
        followUps: ["Gab es einen Moment, der Sie besonders berührt hat?", "Was machen Sie, wenn die Motivation nachlässt?"],
        followUpsFr: ["Y a-t-il eu un moment qui vous a particulièrement touchée ?", "Que faites-vous quand la motivation baisse ?"],
        keywords: ["Patienten", "motiviert", "Medizin", "wissenschaftlich", "Lösung"],
      },
      {
        id: "v6", zone: "vorstellung", difficulty: 3,
        q: "Warum sollten wir ausgerechnet Sie einstellen?",
        qFr: "Pourquoi devrions-nous vous embaucher vous en particulier ?",
        h: "Profil unique + urgences + bilingual + digital + motivation",
        r: "Ich bringe eine einzigartige Kombination mit: klinische Erfahrung in der Notaufnahme, ein bilinguales Profil Französisch-Deutsch, ein unternehmerisches Denken aus meinem Start-up und eine tiefe Motivation für die Angiologie. Ich bin bereit, hart zu arbeiten und mich schnell zu integrieren.",
        rFr: "J'apporte une combinaison unique : expérience clinique aux urgences, profil bilingue français-allemand, esprit entrepreneurial de ma start-up et une motivation profonde pour l'angiologie. Je suis prête à travailler dur et à m'intégrer rapidement.",
        followUps: ["Was genau macht Sie einzigartig?", "Andere Bewerber haben auch Erfahrung in der Notaufnahme."],
        followUpsFr: ["Qu'est-ce qui vous rend vraiment unique ?", "D'autres candidats ont aussi de l'expérience aux urgences."],
        keywords: ["einzigartig", "klinische Erfahrung", "bilingual", "Motivation", "Angiologie", "integrieren"],
      },
    ],
  },
  {
    id: "motivation",
    name: "Motivation",
    nameFr: "Motivation",
    icon: "🔥",
    description: "Warum die Schweiz, warum Biel, warum Angiologie",
    descriptionFr: "Pourquoi la Suisse, pourquoi Bienne, pourquoi l'angiologie",
    color: "amber",
    narrativeIntro: "La chambre du Conseil exige la verite. Seule la conviction ouvre la porte...",
    questions: [
      {
        id: "m1", zone: "motivation", difficulty: 1,
        q: "Warum möchten Sie in der Schweiz arbeiten?",
        qFr: "Pourquoi souhaitez-vous travailler en Suisse ?",
        h: "Formation FMH + qualite + bilingue",
        r: "Die Schweiz bietet eine exzellente Weiterbildung mit dem FMH-System, hohe medizinische Standards und ein multikulturelles Umfeld. Das bilingue Biel passt perfekt zu meinem Profil.",
        rFr: "La Suisse offre une excellente formation avec le système FMH, des standards médicaux élevés et un environnement multiculturel. Bienne bilingue correspond parfaitement à mon profil.",
        followUps: ["Was wissen Sie über das FMH-System?", "Haben Sie sich auch in Frankreich beworben?"],
        followUpsFr: ["Que savez-vous du système FMH ?", "Avez-vous aussi postulé en France ?"],
        keywords: ["Weiterbildung", "FMH", "Standards", "bilingue", "Biel"],
      },
      {
        id: "m2", zone: "motivation", difficulty: 1,
        q: "Warum Angiologie?",
        qFr: "Pourquoi l'angiologie ?",
        h: "Diagnostic + interventionnel + ultrason",
        r: "Die Gefäßmedizin verbindet diagnostische Präzision mit interventionellen Möglichkeiten. Die Kombination aus Ultraschall und Katheter-Interventionen fasziniert mich besonders.",
        rFr: "La médecine vasculaire allie précision diagnostique et possibilités interventionnelles. La combinaison échographie et cathétérisme me fascine particulièrement.",
        followUps: ["Welche Erfahrung haben Sie bereits in der Gefäßmedizin?", "Was ist Ihr liebstes Verfahren?"],
        followUpsFr: ["Quelle expérience avez-vous déjà en médecine vasculaire ?", "Quelle est votre technique préférée ?"],
        keywords: ["Gefäßmedizin", "diagnostisch", "interventionell", "Ultraschall", "Katheter"],
      },
      {
        id: "m3", zone: "motivation", difficulty: 2,
        q: "Warum Spitalzentrum Biel?",
        qFr: "Pourquoi le Centre hospitalier de Bienne ?",
        h: "Bilingue + Gefäßzentrum + Kat.B + Dr. Attias-Widmer",
        r: "Das Spitalzentrum Biel hat ein interdisziplinäres Gefäßzentrum und ist eine Kategorie-B-Weiterbildungsstätte. Das bilingue Umfeld ermöglicht mir eine sanfte Integration, und die Abteilung unter Dr. Attias-Widmer genießt einen ausgezeichneten Ruf.",
        rFr: "Le Centre hospitalier de Bienne possède un centre vasculaire interdisciplinaire et est un lieu de formation de catégorie B. L'environnement bilingue me permet une intégration en douceur, et le service du Dr Attias-Widmer jouit d'une excellente réputation.",
        followUps: ["Was wissen Sie über unsere Abteilung?", "Kennen Sie Biel?"],
        followUpsFr: ["Que savez-vous de notre service ?", "Connaissez-vous Bienne ?"],
        keywords: ["Gefäßzentrum", "Kategorie-B", "bilingue", "interdisziplinär", "Weiterbildungsstätte"],
      },
      {
        id: "m4", zone: "motivation", difficulty: 2,
        q: "Warum möchten Sie Ihre aktuelle Stelle verlassen?",
        qFr: "Pourquoi souhaitez-vous quitter votre poste actuel ?",
        h: "Positif + evolution + specialisation",
        r: "Ich bin sehr dankbar für die Erfahrung in der Notaufnahme. Aber jetzt möchte ich mich spezialisieren. Die Angiologie ist mein klares Ziel, und die Schweiz bietet mir die beste Weiterbildung dafür.",
        rFr: "Je suis très reconnaissante pour l'expérience aux urgences. Mais maintenant je souhaite me spécialiser. L'angiologie est mon objectif clair, et la Suisse m'offre la meilleure formation pour cela.",
        followUps: ["Was hat Ihnen an den Urgences am meisten gefallen?", "Vermissen Sie die Akutmedizin nicht?"],
        followUpsFr: ["Qu'est-ce qui vous a le plus plu aux urgences ?", "La médecine aiguë ne vous manquera-t-elle pas ?"],
        keywords: ["dankbar", "spezialisieren", "Angiologie", "Ziel", "Weiterbildung"],
      },
      {
        id: "m5", zone: "motivation", difficulty: 2,
        q: "Was wissen Sie über die Angiologie als Fachgebiet?",
        qFr: "Que savez-vous de l'angiologie en tant que spécialité ?",
        h: "Spectre complet: diagnostic vasculaire + interventionnel + chronique + aigu",
        r: "Die Angiologie umfasst die Diagnostik und Therapie von Gefäßerkrankungen: arterielle Verschlusskrankheit, Venenthrombosen, Aneurysmen und Lymphödeme. Sie verbindet nicht-invasive Diagnostik wie die Duplexsonographie mit interventionellen Verfahren wie der Angioplastie. Das fasziniert mich, weil man sowohl ambulant als auch im Notfall arbeitet.",
        rFr: "L'angiologie englobe le diagnostic et le traitement des maladies vasculaires : artériopathie oblitérante, thromboses veineuses, anévrismes et lymphoedèmes. Elle associe le diagnostic non invasif comme l'échographie duplex aux techniques interventionnelles comme l'angioplastie. Cela me fascine car on travaille en ambulatoire comme en urgence.",
        followUps: ["Welche Untersuchungsmethoden kennen Sie?", "Was ist der Unterschied zwischen Angiologie und Gefäßchirurgie?"],
        followUpsFr: ["Quelles méthodes d'examen connaissez-vous ?", "Quelle est la différence entre angiologie et chirurgie vasculaire ?"],
        keywords: ["Gefäßerkrankungen", "Duplexsonographie", "Angioplastie", "Venenthrombosen", "arterielle Verschlusskrankheit"],
      },
      {
        id: "m6", zone: "motivation", difficulty: 3,
        q: "Wie stellen Sie sich Ihre Integration in unser Team vor?",
        qFr: "Comment envisagez-vous votre intégration dans notre équipe ?",
        h: "Proactif + humble + apprendre vite + bilingual advantage",
        r: "Ich möchte von Anfang an aktiv zum Team beitragen. Ich werde aufmerksam zuhören, Fragen stellen und die Abläufe der Abteilung schnell lernen. Mein bilinguales Profil kann in Biel ein Vorteil sein, besonders im Patientenkontakt. Ich bin bereit, mich flexibel anzupassen.",
        rFr: "Je souhaite contribuer activement à l'équipe dès le début. J'écouterai attentivement, poserai des questions et apprendrai rapidement les procédures du service. Mon profil bilingue peut être un atout à Bienne, surtout dans le contact patient. Je suis prête à m'adapter avec flexibilité.",
        followUps: ["Was machen Sie, wenn Sie sich am Anfang überfordert fühlen?", "Wie schnell denken Sie, sich einarbeiten zu können?"],
        followUpsFr: ["Que faites-vous si vous vous sentez dépassée au début ?", "En combien de temps pensez-vous pouvoir vous intégrer ?"],
        keywords: ["Team", "beitragen", "zuhören", "bilingual", "flexibel", "anpassen"],
      },
    ],
  },
  {
    id: "erfahrung",
    name: "Erfahrung",
    nameFr: "Expérience",
    icon: "🩺",
    description: "Berufserfahrung und klinische Kompetenzen zeigen",
    descriptionFr: "Montrer son expérience professionnelle et ses compétences cliniques",
    color: "blue",
    narrativeIntro: "L'Hopital du complexe ouvre ses portes. Prouvez votre expertise...",
    questions: [
      {
        id: "e1", zone: "erfahrung", difficulty: 1,
        q: "Welche klinische Erfahrung bringen Sie mit?",
        qFr: "Quelle expérience clinique apportez-vous ?",
        h: "Urgences + polytrauma + ultrason FAST",
        r: "In der Notaufnahme habe ich ein breites Spektrum an Patienten betreut: Polytraumata, kardiovaskuläre Notfälle, Infektionen. Ich habe regelmäßig FAST-Ultraschall durchgeführt und bei der Triage mitgewirkt.",
        rFr: "Aux urgences, j'ai pris en charge un large éventail de patients : polytraumatismes, urgences cardiovasculaires, infections. J'ai régulièrement réalisé des échographies FAST et participé au triage.",
        followUps: ["Wie viele Patienten pro Schicht?", "Haben Sie auch Nachtdienst gemacht?"],
        followUpsFr: ["Combien de patients par garde ?", "Avez-vous aussi fait des gardes de nuit ?"],
        keywords: ["Notaufnahme", "Polytrauma", "kardiovaskulär", "FAST-Ultraschall", "Triage"],
      },
      {
        id: "e2", zone: "erfahrung", difficulty: 2,
        q: "Erfahrung mit Ultraschall?",
        qFr: "Expérience avec l'échographie ?",
        h: "FAST urgences + motivation echo vasculaire",
        r: "Ich habe regelmäßig FAST-Ultraschall in der Notaufnahme durchgeführt. Ich beherrsche die abdominale und thorakale Sonographie. Ich freue mich darauf, meine Kompetenzen in der Gefäßsonographie zu vertiefen.",
        rFr: "J'ai régulièrement réalisé des échographies FAST aux urgences. Je maîtrise l'échographie abdominale et thoracique. J'ai hâte d'approfondir mes compétences en échographie vasculaire.",
        followUps: ["Wie oft haben Sie den FAST gemacht?", "Kennen Sie den Kompressionstest bei TVT?"],
        followUpsFr: ["Combien de FAST avez-vous réalisés ?", "Connaissez-vous le test de compression pour la TVP ?"],
        keywords: ["FAST-Ultraschall", "Sonographie", "Gefäßsonographie", "abdominale", "thorakale"],
      },
      {
        id: "e3", zone: "erfahrung", difficulty: 2,
        q: "Wie gehen Sie mit Stress um?",
        qFr: "Comment gérez-vous le stress ?",
        h: "Priorisation + communication + exemples",
        r: "Die Notaufnahme hat mich gelehrt, unter Druck strukturiert zu arbeiten. Ich priorisiere nach klinischer Dringlichkeit, kommuniziere klar mit dem Team und bleibe auch in kritischen Situationen ruhig.",
        rFr: "Les urgences m'ont appris à travailler de manière structurée sous pression. Je priorise selon l'urgence clinique, je communique clairement avec l'équipe et je reste calme même en situation critique.",
        followUps: ["Geben Sie ein konkretes Beispiel.", "Und wenn das ganze Team gestresst ist?"],
        followUpsFr: ["Donnez un exemple concret.", "Et quand toute l'équipe est stressée ?"],
        keywords: ["Druck", "strukturiert", "priorisiere", "kommuniziere", "ruhig"],
      },
      {
        id: "e4", zone: "erfahrung", difficulty: 3,
        q: "Beschreiben Sie einen schwierigen Fall, den Sie betreut haben.",
        qFr: "Décrivez un cas difficile que vous avez pris en charge.",
        h: "Cas concret + demarche + resultat + lecon",
        r: "Ein 65-jähriger Patient kam mit akutem Thoraxschmerz. Ich habe sofort ein EKG und Troponin angeordnet, die Diagnose eines Myokardinfarkts gestellt und die Verlegung in die Kardiologie organisiert. Der Patient wurde rechtzeitig behandelt. Das hat mir gezeigt, wie wichtig schnelle Entscheidungen sind.",
        rFr: "Un patient de 65 ans est arrivé avec une douleur thoracique aiguë. J'ai immédiatement prescrit un ECG et une troponine, posé le diagnostic d'infarctus du myocarde et organisé le transfert en cardiologie. Le patient a été traité à temps. Cela m'a montré l'importance des décisions rapides.",
        followUps: ["Was hätten Sie anders gemacht?", "War der Patient alleine? Wie haben Sie die Angehörigen informiert?"],
        followUpsFr: ["Qu'auriez-vous fait différemment ?", "Le patient était-il seul ? Comment avez-vous informé les proches ?"],
        keywords: ["Patient", "EKG", "Troponin", "Diagnose", "Verlegung", "Entscheidung"],
      },
      {
        id: "e5", zone: "erfahrung", difficulty: 2,
        q: "Wie arbeiten Sie im interdisziplinären Team?",
        qFr: "Comment travaillez-vous en équipe interdisciplinaire ?",
        h: "Communication + respect + roles + exemples urgences",
        r: "In der Notaufnahme arbeite ich täglich mit Pflegekräften, Radiologen, Chirurgen und Internisten zusammen. Ich kommuniziere klar und strukturiert, nutze SBAR für Übergaben und respektiere die Expertise jeder Berufsgruppe. Gute Teamarbeit rettet Leben — das habe ich direkt erfahren.",
        rFr: "Aux urgences, je travaille quotidiennement avec des infirmiers, radiologues, chirurgiens et internistes. Je communique de manière claire et structurée, j'utilise le SBAR pour les transmissions et je respecte l'expertise de chaque corps de métier. Un bon travail d'équipe sauve des vies — j'en ai fait l'expérience directe.",
        followUps: ["Was ist SBAR?", "Wie gehen Sie vor, wenn ein Kollege einer anderen Meinung ist?"],
        followUpsFr: ["Qu'est-ce que le SBAR ?", "Comment faites-vous quand un collègue n'est pas d'accord ?"],
        keywords: ["interdisziplinär", "Pflegekräfte", "SBAR", "kommuniziere", "Teamarbeit"],
      },
      {
        id: "e6", zone: "erfahrung", difficulty: 3,
        q: "Haben Sie Erfahrung mit der Patientenaufklärung?",
        qFr: "Avez-vous de l'expérience en information du patient ?",
        h: "Consentement eclaire + langue simple + empathie + compliance",
        r: "Ja. In der Notaufnahme habe ich regelmäßig Patienten über Eingriffe und Diagnosen aufgeklärt. Ich achte darauf, medizinische Begriffe einfach zu erklären, dem Patienten Zeit für Fragen zu geben und sicherzustellen, dass er die Informationen verstanden hat. Empathie und Geduld sind dabei essenziell.",
        rFr: "Oui. Aux urgences, j'ai régulièrement informé les patients sur les interventions et diagnostics. Je veille à expliquer les termes médicaux simplement, à laisser du temps au patient pour poser des questions et à m'assurer qu'il a bien compris. L'empathie et la patience sont essentielles.",
        followUps: ["Wie gehen Sie vor, wenn der Patient nicht versteht?", "Und wenn der Patient den Eingriff ablehnt?"],
        followUpsFr: ["Comment faites-vous si le patient ne comprend pas ?", "Et si le patient refuse l'intervention ?"],
        keywords: ["Patientenaufklärung", "aufgeklärt", "Eingriffe", "Empathie", "verstanden"],
      },
    ],
  },
  {
    id: "fallanalyse",
    name: "Fallanalyse",
    nameFr: "Analyse de cas",
    icon: "🧠",
    description: "Klinisches Denken und diagnostische Kompetenz",
    descriptionFr: "Raisonnement clinique et compétence diagnostique",
    color: "violet",
    narrativeIntro: "La salle de raisonnement clinique est sombre. Seule la logique eclaire le chemin...",
    questions: [
      {
        id: "f1", zone: "fallanalyse", difficulty: 2,
        q: "Ein Patient kommt mit Schwellung und Schmerzen im linken Bein. Was tun Sie?",
        qFr: "Un patient arrive avec un gonflement et des douleurs à la jambe gauche. Que faites-vous ?",
        h: "TVP: anamnese + Wells + duplex + anticoagulation",
        r: "Ich denke an eine tiefe Venenthrombose. Ich erhebe die Anamnese mit Risikofaktoren, mache den Wells-Score, und wenn der Verdacht hoch ist, ordne ich eine Kompressionssonographie an. Bei Bestätigung leite ich eine Antikoagulation ein.",
        rFr: "Je pense à une thrombose veineuse profonde. Je recueille l'anamnèse avec les facteurs de risque, je calcule le score de Wells, et si la suspicion est élevée, je prescris une échographie de compression. En cas de confirmation, j'initie une anticoagulation.",
        followUps: ["Welche Risikofaktoren fragen Sie ab?", "Der Wells-Score ist niedrig. Was nun?", "Wie dosieren Sie die Antikoagulation?"],
        followUpsFr: ["Quels facteurs de risque recherchez-vous ?", "Le score de Wells est bas. Et maintenant ?", "Comment dosez-vous l'anticoagulation ?"],
        keywords: ["Venenthrombose", "Wells-Score", "Kompressionssonographie", "Antikoagulation", "Risikofaktoren"],
      },
      {
        id: "f2", zone: "fallanalyse", difficulty: 2,
        q: "72-jähriger Raucher mit TIA vor 2 Wochen. Wie gehen Sie vor?",
        qFr: "Fumeur de 72 ans avec AIT il y a 2 semaines. Comment procédez-vous ?",
        h: "Stenose carotide: duplex + stenosegrad + TEA",
        r: "Ich denke an eine Karotisstenose als Ursache der TIA. Ich ordne eine Duplexsonographie der Halsschlagader an. Bei einer Stenose über 70% bespreche ich mit der Gefäßchirurgie eine Karotis-TEA oder Stenting.",
        rFr: "Je pense à une sténose carotidienne comme cause de l'AIT. Je prescris une échographie duplex de la carotide. En cas de sténose supérieure à 70%, je discute avec la chirurgie vasculaire d'une endartériectomie carotidienne ou d'un stenting.",
        followUps: ["Was sind die Symptome einer TIA?", "Warum 70%? Welche Leitlinie?"],
        followUpsFr: ["Quels sont les symptômes d'un AIT ?", "Pourquoi 70% ? Quelle recommandation ?"],
        keywords: ["Karotisstenose", "TIA", "Duplexsonographie", "Stenose", "Karotis-TEA"],
      },
      {
        id: "f3", zone: "fallanalyse", difficulty: 3,
        q: "Plötzlicher Schmerz und Blässe im rechten Bein. Kein Puls tastbar. Was ist Ihr Notfallplan?",
        qFr: "Douleur soudaine et pâleur de la jambe droite. Pas de pouls palpable. Quel est votre plan d'urgence ?",
        h: "Ischemie aigue: 6P + heparine + CT-angio + embolectomie",
        r: "Das ist ein akuter arterieller Verschluss — ein Notfall. Ich prüfe die 6 P: Pain, Pallor, Pulselessness, Paresthesia, Paralysis, Poikilothermia. Sofort: Heparin intravenös, Tieflagerung, Schmerztherapie. CT-Angiographie und Gefäßchirurgie alarmieren. Wahrscheinlich Embolektomie nötig.",
        rFr: "C'est une occlusion artérielle aiguë — une urgence. Je vérifie les 6 P : Pain, Pallor, Pulselessness, Paresthesia, Paralysis, Poikilothermia. Immédiatement : héparine intraveineuse, jambe en position déclive, antalgiques. Alerte angio-CT et chirurgie vasculaire. Embolectomie probablement nécessaire.",
        followUps: ["Was ist die häufigste Ursache?", "Der Patient hat Vorhofflimmern. Was bedeutet das langfristig?"],
        followUpsFr: ["Quelle est la cause la plus fréquente ?", "Le patient a une fibrillation auriculaire. Qu'est-ce que cela implique à long terme ?"],
        keywords: ["arterieller Verschluss", "Notfall", "Heparin", "CT-Angiographie", "Embolektomie", "6 P"],
      },
      {
        id: "f4", zone: "fallanalyse", difficulty: 3,
        q: "Zufallsbefund: Bauchaortenaneurysma 5,8 cm. Wie beraten Sie den Patienten?",
        qFr: "Découverte fortuite : anévrisme de l'aorte abdominale 5,8 cm. Comment conseillez-vous le patient ?",
        h: "AAA: taille > 5.5 = OP indication, EVAR vs ouvert, surveillance",
        r: "Ein Bauchaortenaneurysma von 5,8 cm liegt über dem Schwellenwert von 5,5 cm — eine OP-Indikation besteht. Ich erkläre dem Patienten die Optionen: endovaskuläre Versorgung (EVAR) oder offene OP. Eine CT-Angiographie ist nötig für die Planung. Ich bespreche Risiken und Nutzen.",
        rFr: "Un anévrisme de l'aorte abdominale de 5,8 cm dépasse le seuil de 5,5 cm — une indication opératoire existe. J'explique au patient les options : traitement endovasculaire (EVAR) ou chirurgie ouverte. Un angio-CT est nécessaire pour la planification. Je discute des risques et bénéfices.",
        followUps: ["Was ist der Vorteil von EVAR?", "Was passiert ohne Operation?"],
        followUpsFr: ["Quel est l'avantage de l'EVAR ?", "Que se passe-t-il sans opération ?"],
        keywords: ["Bauchaortenaneurysma", "Schwellenwert", "EVAR", "OP-Indikation", "CT-Angiographie"],
      },
      {
        id: "f5", zone: "fallanalyse", difficulty: 2,
        q: "Eine 55-jährige Patientin klagt über Schmerzen in den Beinen beim Gehen, die in Ruhe verschwinden. Was vermuten Sie?",
        qFr: "Une patiente de 55 ans se plaint de douleurs aux jambes à la marche qui disparaissent au repos. Que suspectez-vous ?",
        h: "pAVK: Claudicatio + ABI + Fontaine-Klassifikation + Risikofaktoren",
        r: "Das klingt nach einer Claudicatio intermittens im Rahmen einer peripheren arteriellen Verschlusskrankheit. Ich frage nach Risikofaktoren: Rauchen, Diabetes, Hypertonie, Dyslipidämie. Ich messe den Knöchel-Arm-Index (ABI) und klassifiziere nach Fontaine. Bei einem ABI unter 0,9 ist die Diagnose wahrscheinlich. Therapie: Gehtraining, Risikofaktorkontrolle, eventuell ASS.",
        rFr: "Cela ressemble à une claudication intermittente dans le cadre d'une artériopathie oblitérante des membres inférieurs. Je recherche les facteurs de risque : tabac, diabète, hypertension, dyslipidémie. Je mesure l'index de pression systolique (IPS) et je classifie selon Fontaine. Avec un IPS inférieur à 0,9, le diagnostic est probable. Traitement : réentraînement à la marche, contrôle des facteurs de risque, éventuellement aspirine.",
        followUps: ["Was sind die Fontaine-Stadien?", "Ab wann ist eine Revaskularisation indiziert?"],
        followUpsFr: ["Quels sont les stades de Fontaine ?", "À partir de quand la revascularisation est-elle indiquée ?"],
        keywords: ["Claudicatio intermittens", "Verschlusskrankheit", "Knöchel-Arm-Index", "Fontaine", "Risikofaktoren", "ABI"],
      },
      {
        id: "f6", zone: "fallanalyse", difficulty: 3,
        q: "Ein Patient unter Antikoagulation stürzt und hat ein Hämatom am Kopf. Wie handeln Sie?",
        qFr: "Un patient sous anticoagulation chute et présente un hématome à la tête. Comment agissez-vous ?",
        h: "Urgence neuro + INR + CT cerebral + antagonisation + neurochirurgie",
        r: "Das ist ein potenzieller Notfall — ein intrakranielles Hämatom unter Antikoagulation. Ich prüfe sofort den neurologischen Status und die Glasgow Coma Scale. Dann: Blutentnahme mit INR, ein CT des Schädels ohne Kontrastmittel. Bei Blutung: Antikoagulation antagonisieren — Vitamin K und Prothrombinkomplex bei VKA, Idarucizumab bei Dabigatran. Neurochirurgisches Konsil sofort.",
        rFr: "C'est une urgence potentielle — un hématome intracrânien sous anticoagulation. Je vérifie immédiatement le statut neurologique et le score de Glasgow. Puis : bilan sanguin avec INR, scanner cérébral sans injection. En cas d'hémorragie : antagoniser l'anticoagulation — vitamine K et complexe prothrombinique pour les AVK, idarucizumab pour le dabigatran. Avis neurochirurgical immédiat.",
        followUps: ["Welche Antikoagulantien kennen Sie?", "Der INR ist 4,5. Was tun Sie konkret?"],
        followUpsFr: ["Quels anticoagulants connaissez-vous ?", "L'INR est à 4,5. Que faites-vous concrètement ?"],
        keywords: ["intrakraniell", "Antikoagulation", "Glasgow", "INR", "CT", "antagonisieren", "Neurochirurgie"],
      },
    ],
  },
  {
    id: "argumentation",
    name: "Argumentation",
    nameFr: "Argumentation",
    icon: "⚖️",
    description: "Entscheidungen verteidigen und Fragen meistern",
    descriptionFr: "Défendre ses décisions et maîtriser les questions",
    color: "rose",
    narrativeIntro: "Le Tribunal du complexe vous met a l'epreuve. Defendez vos choix...",
    questions: [
      {
        id: "a1", zone: "argumentation", difficulty: 1,
        q: "Was sind Ihre Stärken?",
        qFr: "Quelles sont vos forces ?",
        h: "Stress + decisions + team + exemples",
        r: "Ich bin belastbar und behalte auch unter Druck einen klaren Kopf. Aus der Notaufnahme bringe ich schnelle Entscheidungsfindung und Teamarbeit mit. Ich bin außerdem sehr lernbereit.",
        rFr: "Je suis résistante et je garde la tête froide même sous pression. Des urgences, j'apporte la prise de décision rapide et le travail d'équipe. Je suis aussi très désireuse d'apprendre.",
        followUps: ["Geben Sie ein Beispiel für Ihre Belastbarkeit.", "Wie zeigt sich Ihre Teamarbeit konkret?"],
        followUpsFr: ["Donnez un exemple de votre résistance au stress.", "Comment votre travail d'équipe se manifeste-t-il concrètement ?"],
        keywords: ["belastbar", "Druck", "Entscheidungsfindung", "Teamarbeit", "lernbereit"],
      },
      {
        id: "a2", zone: "argumentation", difficulty: 2,
        q: "Was sind Ihre Schwächen?",
        qFr: "Quelles sont vos faiblesses ?",
        h: "Honnetete + amelioration + allemand",
        r: "Mein Deutsch ist noch nicht perfekt, aber ich arbeite intensiv daran und mache gute Fortschritte. Ich neige manchmal dazu, zu viel Verantwortung zu übernehmen — das lerne ich zu delegieren.",
        rFr: "Mon allemand n'est pas encore parfait, mais j'y travaille intensément et je fais de bons progrès. J'ai parfois tendance à prendre trop de responsabilités — j'apprends à déléguer.",
        followUps: ["Wie verbessern Sie Ihr Deutsch konkret?", "Bis wann denken Sie, fließend zu sein?"],
        followUpsFr: ["Comment améliorez-vous concrètement votre allemand ?", "Quand pensez-vous être fluide ?"],
        keywords: ["Deutsch", "Fortschritte", "delegieren", "Verantwortung"],
      },
      {
        id: "a3", zone: "argumentation", difficulty: 2,
        q: "Wie lösen Sie Konflikte im Team?",
        qFr: "Comment résolvez-vous les conflits en équipe ?",
        h: "Ecoute + dialogue + solution + calme",
        r: "Ich suche immer zuerst das direkte Gespräch. In der Notaufnahme habe ich gelernt, ruhig zu bleiben, zuzuhören und gemeinsam Lösungen zu finden. Eskalation vermeiden, Respekt bewahren.",
        rFr: "Je cherche toujours d'abord le dialogue direct. Aux urgences, j'ai appris à rester calme, à écouter et à trouver des solutions ensemble. Éviter l'escalade, préserver le respect.",
        followUps: ["Und wenn Ihr Vorgesetzter unrecht hat?", "Geben Sie ein konkretes Beispiel."],
        followUpsFr: ["Et si votre supérieur a tort ?", "Donnez un exemple concret."],
        keywords: ["Gespräch", "ruhig", "zuhören", "Lösungen", "Respekt"],
      },
      {
        id: "a4", zone: "argumentation", difficulty: 2,
        q: "Wo sehen Sie sich in 5 Jahren?",
        qFr: "Où vous voyez-vous dans 5 ans ?",
        h: "FMH + Suisse + pratique + objectifs clairs",
        r: "In fünf Jahren möchte ich meinen FMH in Angiologie abgeschlossen haben. Ich möchte in der Schweiz bleiben und als Fachärztin in einem Gefäßzentrum arbeiten — idealerweise hier in Biel.",
        rFr: "Dans cinq ans, je souhaite avoir terminé mon FMH en angiologie. Je veux rester en Suisse et travailler comme médecin spécialiste dans un centre vasculaire — idéalement ici à Bienne.",
        followUps: ["Und wenn die Weiterbildung länger dauert?", "Planen Sie eine Niederlassung?"],
        followUpsFr: ["Et si la formation prend plus longtemps ?", "Envisagez-vous une installation en libéral ?"],
        keywords: ["FMH", "Angiologie", "Fachärztin", "Gefäßzentrum", "Schweiz"],
      },
      {
        id: "a5", zone: "argumentation", difficulty: 1,
        q: "Wie ist Ihr Deutschniveau?",
        qFr: "Quel est votre niveau d'allemand ?",
        h: "Honnete + motivee + bilingue Biel",
        r: "Ich lerne intensiv Deutsch seit mehreren Wochen. Mein Niveau ist noch im Aufbau, aber ich bin sehr motiviert und mache täglich Fortschritte. Das bilingue Biel hilft mir, beide Sprachen zu nutzen.",
        rFr: "J'apprends l'allemand intensivement depuis plusieurs semaines. Mon niveau est encore en construction, mais je suis très motivée et je fais des progrès quotidiens. Bienne bilingue m'aide à utiliser les deux langues.",
        followUps: ["Besuchen Sie einen Sprachkurs?", "Können Sie einen Befund auf Deutsch schreiben?"],
        followUpsFr: ["Suivez-vous un cours de langue ?", "Pouvez-vous rédiger un compte rendu en allemand ?"],
        keywords: ["Deutsch", "motiviert", "Fortschritte", "bilingue"],
      },
      {
        id: "a6", zone: "argumentation", difficulty: 2,
        q: "Gehaltsvorstellungen?",
        qFr: "Prétentions salariales ?",
        h: "Flexible + convention + valeur + pas le principal",
        r: "Ich orientiere mich an den üblichen Konditionen für Assistenzärzte in der Schweiz. Das Gehalt ist für mich nicht der Hauptgrund für meine Bewerbung — mir geht es um die Weiterbildung und die fachliche Entwicklung.",
        rFr: "Je m'oriente selon les conditions habituelles pour les médecins assistants en Suisse. Le salaire n'est pas la raison principale de ma candidature — c'est la formation et le développement professionnel qui comptent.",
        followUps: ["Kennen Sie das Gehaltsniveau in der Schweiz?"],
        followUpsFr: ["Connaissez-vous le niveau de salaire en Suisse ?"],
        keywords: ["Konditionen", "Assistenzärzte", "Weiterbildung", "Entwicklung"],
      },
    ],
  },
  {
    id: "finale",
    name: "Finale Simulation",
    nameFr: "Simulation finale",
    icon: "🏛️",
    description: "Vollständige Entretien-Simulation unter Druck",
    descriptionFr: "Simulation complète d'entretien sous pression",
    color: "amber",
    narrativeIntro: "Le Protocole Lazarus est pret. L'activation finale exige une performance parfaite...",
    questions: [
      {
        id: "fin1", zone: "finale", difficulty: 3,
        q: "Stellen Sie sich bitte vor und erklären Sie, warum Sie hier sind.",
        qFr: "Présentez-vous et expliquez pourquoi vous êtes ici.",
        h: "Intro complete: parcours + motivation + objectif + enthousiasme",
        r: "Guten Tag. Ich bin Dr. Motongane. Nach meinem Medizinstudium in Frankreich habe ich als Assistenzärztin in der Notaufnahme gearbeitet. Dort habe ich gelernt, unter Druck zu arbeiten, Patienten zu triagieren und FAST-Ultraschall durchzuführen. Jetzt möchte ich mich in der Angiologie spezialisieren. Ihr Gefäßzentrum in Biel bietet die ideale Kombination aus Weiterbildung und bilingualem Umfeld.",
        rFr: "Bonjour. Je suis le Dr Motongane. Après mes études de médecine en France, j'ai travaillé comme médecin assistante aux urgences. J'y ai appris à travailler sous pression, à trier les patients et à réaliser des échographies FAST. Je souhaite maintenant me spécialiser en angiologie. Votre centre vasculaire à Bienne offre la combinaison idéale de formation et d'environnement bilingue.",
        followUps: ["Warum sollten wir Sie einstellen und nicht jemand anderen?", "Was unterscheidet Sie von anderen Bewerbern?"],
        followUpsFr: ["Pourquoi devrions-nous vous embaucher plutôt qu'un autre ?", "Qu'est-ce qui vous distingue des autres candidats ?"],
        keywords: ["Medizinstudium", "Notaufnahme", "Angiologie", "Gefäßzentrum", "Biel", "spezialisieren"],
      },
      {
        id: "fin2", zone: "finale", difficulty: 3,
        q: "Ein Patient hat einen akuten Beinschmerz. Erklären Sie Ihr Vorgehen — als ob Sie mit dem Chefarzt sprechen.",
        qFr: "Un patient a une douleur aiguë à la jambe. Expliquez votre démarche — comme si vous parliez au chef de service.",
        h: "Demarche structuree + vocabulaire precis + confiance",
        r: "Ich denke differentialdiagnostisch an einen akuten arteriellen Verschluss oder eine tiefe Venenthrombose. Bei fehlendem Puls und blassem Bein ist ein arterieller Verschluss wahrscheinlich. Ich gebe sofort Heparin, lagere das Bein tief und alarmiere die Gefäßchirurgie. Parallel ordne ich eine CT-Angiographie an.",
        rFr: "En diagnostic différentiel, je pense à une occlusion artérielle aiguë ou une thrombose veineuse profonde. En l'absence de pouls et avec un membre pâle, l'occlusion artérielle est probable. J'administre immédiatement de l'héparine, je place la jambe en position déclive et j'alerte la chirurgie vasculaire. En parallèle, je prescris un angio-CT.",
        followUps: ["Der Patient hat Vorhofflimmern. Ändert das etwas?", "Die CT zeigt einen Verschluss der A. poplitea. Nächster Schritt?"],
        followUpsFr: ["Le patient a une fibrillation auriculaire. Cela change-t-il quelque chose ?", "Le scanner montre une occlusion de l'artère poplitée. Prochaine étape ?"],
        keywords: ["differentialdiagnostisch", "arterieller Verschluss", "Venenthrombose", "Heparin", "Gefäßchirurgie", "CT-Angiographie"],
      },
      {
        id: "fin3", zone: "finale", difficulty: 3,
        q: "Haben Sie Fragen an uns?",
        qFr: "Avez-vous des questions pour nous ?",
        h: "Questions intelligentes: Tagesablauf + Weiterbildung + team",
        r: "Ja, gerne. Wie sieht ein typischer Arbeitstag in der Angiologie aus? Welche Weiterbildungsmöglichkeiten gibt es im Gefäßzentrum? Wie funktioniert die Zusammenarbeit mit der Gefäßchirurgie? Und gibt es regelmäßige Fortbildungen oder interdisziplinäre Besprechungen?",
        rFr: "Oui, volontiers. À quoi ressemble une journée type en angiologie ? Quelles possibilités de formation existe-t-il au centre vasculaire ? Comment fonctionne la collaboration avec la chirurgie vasculaire ? Et y a-t-il des formations continues ou des réunions interdisciplinaires régulières ?",
        followUps: ["Was erwarten Sie konkret von Ihrer Weiterbildung?"],
        followUpsFr: ["Qu'attendez-vous concrètement de votre formation ?"],
        keywords: ["Arbeitstag", "Weiterbildungsmöglichkeiten", "Zusammenarbeit", "Fortbildungen", "interdisziplinär"],
      },
      {
        id: "fin4", zone: "finale", difficulty: 3,
        q: "Eine Kollegin macht einen Fehler bei der Medikamentendosierung. Was tun Sie?",
        qFr: "Une collègue fait une erreur de dosage médicamenteux. Que faites-vous ?",
        h: "Securite du patient + communication directe + incident reporting + pas de blame",
        r: "Die Patientensicherheit hat oberste Priorität. Ich spreche die Kollegin sofort und respektvoll an, damit der Fehler korrigiert werden kann. Dann informiere ich den Oberarzt und dokumentiere den Vorfall im Fehlermeldesystem. Es geht nicht um Schuldzuweisung, sondern um Prävention und Lernkultur.",
        rFr: "La sécurité du patient est la priorité absolue. Je m'adresse immédiatement et respectueusement à la collègue pour que l'erreur puisse être corrigée. Puis j'informe le médecin-chef et je documente l'incident dans le système de déclaration d'erreurs. Il ne s'agit pas de blâmer, mais de prévention et de culture d'apprentissage.",
        followUps: ["Was machen Sie, wenn die Kollegin den Fehler leugnet?", "Kennen Sie das CIRS-System?"],
        followUpsFr: ["Que faites-vous si la collègue nie l'erreur ?", "Connaissez-vous le système CIRS ?"],
        keywords: ["Patientensicherheit", "Fehler", "korrigiert", "Oberarzt", "Fehlermeldesystem", "Prävention"],
      },
      {
        id: "fin5", zone: "finale", difficulty: 3,
        q: "Ein Patient mit pAVK Stadium III fragt Sie, ob er operiert werden muss. Erklären Sie es verständlich.",
        qFr: "Un patient avec une AOMI stade III vous demande s'il doit être opéré. Expliquez-le de manière compréhensible.",
        h: "Communication patient: simple + empathique + options + decision partagee",
        r: "Ich erkläre dem Patienten: Sie haben eine Durchblutungsstörung in Ihrem Bein. Im Stadium III haben Sie auch in Ruhe Schmerzen, und das Gewebe bekommt nicht genug Blut. Wir müssen jetzt handeln, um Ihr Bein zu retten. Es gibt verschiedene Möglichkeiten: eine Katheter-Behandlung durch die Arterie oder eine Operation. Wir besprechen gemeinsam, welche Option für Sie am besten ist. Haben Sie dazu Fragen?",
        rFr: "J'explique au patient : vous avez un trouble de la circulation dans votre jambe. Au stade III, vous avez des douleurs même au repos, et les tissus ne reçoivent pas assez de sang. Nous devons agir maintenant pour sauver votre jambe. Il y a plusieurs possibilités : un traitement par cathéter à travers l'artère ou une opération. Nous discuterons ensemble de la meilleure option pour vous. Avez-vous des questions ?",
        followUps: ["Der Patient hat Angst vor der Operation. Was sagen Sie?", "Er fragt nach Alternativen."],
        followUpsFr: ["Le patient a peur de l'opération. Que dites-vous ?", "Il demande des alternatives."],
        keywords: ["Durchblutungsstörung", "Ruhe", "Schmerzen", "Katheter", "Operation", "gemeinsam"],
      },
      {
        id: "fin6", zone: "finale", difficulty: 3,
        q: "Fassen Sie in 60 Sekunden zusammen, warum Sie die ideale Kandidatin für diese Stelle sind.",
        qFr: "Résumez en 60 secondes pourquoi vous êtes la candidate idéale pour ce poste.",
        h: "Elevator pitch: parcours + competences + motivation + valeur ajoutee + enthousiasme",
        r: "Ich bin Assistenzärztin mit klinischer Erfahrung in der Notaufnahme, wo ich gelernt habe, unter Druck zu arbeiten, schnell zu entscheiden und im Team zu kommunizieren. Ich möchte mich in der Angiologie spezialisieren, weil mich die Kombination aus Diagnostik und Intervention fasziniert. Mein bilinguales Profil, mein unternehmerisches Denken und meine starke Motivation machen mich zur richtigen Person für Ihr Gefäßzentrum in Biel. Ich bin bereit, mich voll einzusetzen.",
        rFr: "Je suis médecin assistante avec une expérience clinique aux urgences, où j'ai appris à travailler sous pression, à décider rapidement et à communiquer en équipe. Je veux me spécialiser en angiologie car la combinaison diagnostic-intervention me fascine. Mon profil bilingue, mon esprit entrepreneurial et ma forte motivation font de moi la bonne personne pour votre centre vasculaire à Bienne. Je suis prête à m'investir pleinement.",
        followUps: ["Das war gut. Aber was macht Sie besser als andere?"],
        followUpsFr: ["C'était bien. Mais qu'est-ce qui vous rend meilleure que les autres ?"],
        keywords: ["Notaufnahme", "Angiologie", "Diagnostik", "bilingual", "Motivation", "Gefäßzentrum", "einzusetzen"],
      },
    ],
  },
];

// Get all questions across all zones
export function getAllInterviewQuestions(): InterviewQuestion[] {
  return INTERVIEW_ZONES.flatMap(z => z.questions);
}

// Get zone by id
export function getInterviewZone(id: InterviewZoneId): InterviewZone | undefined {
  return INTERVIEW_ZONES.find(z => z.id === id);
}

// Build the AI evaluation prompt with 5-dimension scoring
export function buildEvaluationPrompt(question: string, reference: string, userAnswer: string, zone: InterviewZoneId): string {
  return `Tu es un coach d'entretien medical pour un poste d'assistante en angiologie au Spitalzentrum Biel (Suisse).

Zone d'entretien: ${zone}
Question posee : "${question}"
Reponse de reference : "${reference}"
Reponse de la candidate : "${userAnswer}"

Evalue la reponse selon 5 dimensions (note sur 20 chacune):

1. SPRACHE (Langue) — grammaire, vocabulaire medical allemand, precision
2. STRUKTUR (Structure) — organisation, clarte, logique du propos
3. KLINISCHES DENKEN (Raisonnement medical) — pertinence clinique, connaissances
4. SICHERHEIT (Confiance) — ton professionnel, assurance, posture
5. ÜBERZEUGUNG (Persuasion) — pouvoir de conviction, credibilite

Reponds en JSON strict (pas de markdown autour):
{
  "scores": {
    "language": <0-20>,
    "structure": <0-20>,
    "medicalReasoning": <0-20>,
    "confidence": <0-20>,
    "persuasion": <0-20>
  },
  "globalScore": <0-100>,
  "strengths": ["<point fort 1>", "<point fort 2>"],
  "improvements": ["<suggestion 1>", "<suggestion 2>"],
  "betterVersion": "<version amelioree de la reponse en allemand>"
}`;
}

// Heuristic local evaluation (fallback when AI unavailable)
export function evaluateLocally(userAnswer: string, question: InterviewQuestion): EvaluationResult {
  const words = userAnswer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const answer = userAnswer.toLowerCase();

  // Language score (0-20)
  let language = 5;
  const hasCapital = /^[A-ZÄÖÜ]/.test(userAnswer);
  const hasPeriod = /[.!?]$/.test(userAnswer.trim());
  const hasVerb = /\b(ist|bin|habe|hat|war|wurde|möchte|kann|muss|arbeite|bringe|suche|denke|lerne|freue)\b/i.test(answer);
  const hasGermanChars = /[äöüß]/i.test(answer);
  if (hasCapital) language += 3;
  if (hasPeriod) language += 2;
  if (hasVerb) language += 4;
  if (hasGermanChars) language += 3;
  if (wordCount > 15) language += 3;

  // Structure score (0-20)
  let structure = 5;
  const sentenceCount = userAnswer.split(/[.!?]+/).filter(s => s.trim()).length;
  if (sentenceCount >= 2) structure += 4;
  if (sentenceCount >= 3) structure += 3;
  if (wordCount >= 20) structure += 4;
  if (wordCount >= 40) structure += 4;

  // Medical reasoning score (0-20)
  let medicalReasoning = 3;
  const matchedKeywords = question.keywords.filter(kw => answer.includes(kw.toLowerCase()));
  medicalReasoning += Math.min(12, matchedKeywords.length * 3);
  const hasMedicalTerms = /\b(patient|diagnos|therap|untersuch|befund|ultraschall|angiolog|chirurg|klinik|sonograph)\b/i.test(answer);
  if (hasMedicalTerms) medicalReasoning += 5;

  // Confidence score (0-20)
  let confidence = 5;
  const hasFirstPerson = /\bich\b/i.test(answer);
  const hasAssertive = /\b(ich bin|ich habe|ich möchte|ich kann|ich bringe)\b/i.test(answer);
  const hasHedging = /\b(vielleicht|eventuell|ich glaube|ich denke vielleicht)\b/i.test(answer);
  if (hasFirstPerson) confidence += 4;
  if (hasAssertive) confidence += 5;
  if (wordCount >= 25) confidence += 3;
  if (hasHedging) confidence -= 3;
  if (!hasHedging && hasAssertive) confidence += 3;

  // Persuasion score (0-20)
  let persuasion = 4;
  const hasConcreteExample = /\b(beispiel|erfahrung|in der notaufnahme|konkret|dort habe ich)\b/i.test(answer);
  const hasMotivation = /\b(motiviert|begeistert|freue mich|interesse|fasziniert|ideal)\b/i.test(answer);
  if (hasConcreteExample) persuasion += 5;
  if (hasMotivation) persuasion += 4;
  if (matchedKeywords.length >= 3) persuasion += 4;
  if (sentenceCount >= 3 && hasAssertive) persuasion += 3;

  // Clamp all scores
  const clamp = (n: number) => Math.max(0, Math.min(20, Math.round(n)));
  const scores: DimensionScore = {
    language: clamp(language),
    structure: clamp(structure),
    medicalReasoning: clamp(medicalReasoning),
    confidence: clamp(confidence),
    persuasion: clamp(persuasion),
  };

  const globalScore = scores.language + scores.structure + scores.medicalReasoning + scores.confidence + scores.persuasion;

  // Generate feedback
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (scores.language >= 14) strengths.push("Bon niveau de langue allemande");
  else improvements.push("Enrichis ton vocabulaire medical allemand");

  if (scores.structure >= 14) strengths.push("Reponse bien structuree");
  else improvements.push("Structure ta reponse: introduction → argument → exemple → conclusion");

  if (scores.medicalReasoning >= 14) strengths.push("Raisonnement clinique pertinent");
  else improvements.push(`Integre plus de mots-cles: ${question.keywords.filter(k => !answer.includes(k.toLowerCase())).slice(0, 3).join(", ")}`);

  if (scores.confidence >= 14) strengths.push("Ton professionnel et assure");
  else improvements.push("Utilise des formulations assertives: 'Ich bin...', 'Ich habe...'");

  if (scores.persuasion >= 14) strengths.push("Argumentation convaincante");
  else improvements.push("Ajoute un exemple concret pour renforcer ta credibilite");

  if (strengths.length === 0) strengths.push("Tu as pris le temps de repondre — continue");
  if (improvements.length === 0) improvements.push("Excellent travail — continue de t'entrainer");

  return {
    scores,
    globalScore,
    strengths,
    improvements,
    betterVersion: question.r,
  };
}
