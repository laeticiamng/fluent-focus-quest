// ── Interview Training Zones ─────────────────────────────────────
// 6 core modules mapped to Swiss medical interview competencies
// Each zone generates questions that mimic a real Swiss medical interview

export interface InterviewQuestion {
  id: string;
  zone: InterviewZoneId;
  q: string;          // Question in German
  h: string;          // Hint (key points to cover)
  r: string;          // Reference answer
  difficulty: 1 | 2 | 3;
  followUps: string[]; // Pressure training: follow-up questions
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
  icon: string;
  description: string;
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
    icon: "👋",
    description: "Sich sicher und professionell vorstellen",
    color: "emerald",
    narrativeIntro: "Le Conseil vous attend. Votre premiere impression decidera de la suite...",
    questions: [
      {
        id: "v1", zone: "vorstellung", difficulty: 1,
        q: "Stellen Sie sich bitte vor.",
        h: "Parcours + urgences + motivation Angiologie",
        r: "Guten Tag. Ich bin Dr. Motongane. Ich habe mein Medizinstudium in Frankreich abgeschlossen und arbeite seit Juli 2024 als Assistenzärztin in der Notaufnahme. Ich möchte mich jetzt in der Angiologie spezialisieren.",
        followUps: ["Warum haben Sie Medizin studiert?", "Seit wann arbeiten Sie in der Notaufnahme?"],
        keywords: ["Medizinstudium", "Assistenzärztin", "Notaufnahme", "Angiologie", "spezialisieren"],
      },
      {
        id: "v2", zone: "vorstellung", difficulty: 2,
        q: "Können Sie uns Ihren beruflichen Werdegang kurz zusammenfassen?",
        h: "Chronologique + clair + pertinent",
        r: "Nach meinem Studium in Frankreich habe ich mein Examen bestanden und als Assistenzärztin in der Notaufnahme angefangen. Dort habe ich Erfahrung in der Akutmedizin gesammelt, einschließlich FAST-Ultraschall und Triage. Jetzt suche ich eine Weiterbildungsstelle in der Angiologie.",
        followUps: ["Was haben Sie dort genau gemacht?", "Welche Verantwortung hatten Sie?"],
        keywords: ["Studium", "Examen", "Assistenzärztin", "Akutmedizin", "Weiterbildungsstelle"],
      },
      {
        id: "v3", zone: "vorstellung", difficulty: 2,
        q: "Was sollten wir über Sie wissen, das nicht im Lebenslauf steht?",
        h: "Personnalite + soft skills + initiative",
        r: "Ich habe ein Start-up im Bereich digitale Gesundheit gegründet, EmotionsCare. Das zeigt meine Eigeninitiative und mein Interesse an Innovation in der Medizin. Außerdem bin ich sehr teamorientiert und lerne gern Neues.",
        followUps: ["Was genau macht Ihr Start-up?", "Wie passt das zur klinischen Arbeit?"],
        keywords: ["Eigeninitiative", "Innovation", "teamorientiert", "Start-up"],
      },
      {
        id: "v4", zone: "vorstellung", difficulty: 2,
        q: "Wie würden Ihre Kollegen Sie beschreiben?",
        h: "Teamwork + fiabilite + qualites humaines + exemples",
        r: "Meine Kollegen würden sagen, dass ich zuverlässig und kollegial bin. In der Notaufnahme hat man mir oft komplexe Fälle anvertraut, weil ich strukturiert arbeite und gut mit dem Pflegeteam kommuniziere. Ich bin auch die Person, die neue Kolleginnen einarbeitet.",
        followUps: ["Können Sie ein konkretes Beispiel geben?", "Gab es auch mal Kritik von Kollegen?"],
        keywords: ["zuverlässig", "kollegial", "strukturiert", "kommuniziere", "Pflegeteam"],
      },
      {
        id: "v5", zone: "vorstellung", difficulty: 2,
        q: "Was motiviert Sie jeden Tag, als Ärztin zu arbeiten?",
        h: "Passion + contact patient + impact + exemples",
        r: "Der direkte Kontakt mit den Patienten motiviert mich am meisten. Wenn ich einem Patienten helfen kann, seine Krankheit zu verstehen und eine Lösung zu finden — das gibt mir Energie. Die Medizin verbindet wissenschaftliches Denken mit menschlicher Nähe, und das fasziniert mich.",
        followUps: ["Gab es einen Moment, der Sie besonders berührt hat?", "Was machen Sie, wenn die Motivation nachlässt?"],
        keywords: ["Patienten", "motiviert", "Medizin", "wissenschaftlich", "Lösung"],
      },
      {
        id: "v6", zone: "vorstellung", difficulty: 3,
        q: "Warum sollten wir ausgerechnet Sie einstellen?",
        h: "Profil unique + urgences + bilingual + digital + motivation",
        r: "Ich bringe eine einzigartige Kombination mit: klinische Erfahrung in der Notaufnahme, ein bilinguales Profil Französisch-Deutsch, ein unternehmerisches Denken aus meinem Start-up und eine tiefe Motivation für die Angiologie. Ich bin bereit, hart zu arbeiten und mich schnell zu integrieren.",
        followUps: ["Was genau macht Sie einzigartig?", "Andere Bewerber haben auch Erfahrung in der Notaufnahme."],
        keywords: ["einzigartig", "klinische Erfahrung", "bilingual", "Motivation", "Angiologie", "integrieren"],
      },
    ],
  },
  {
    id: "motivation",
    name: "Motivation",
    icon: "🔥",
    description: "Warum die Schweiz, warum Biel, warum Angiologie",
    color: "amber",
    narrativeIntro: "La chambre du Conseil exige la verite. Seule la conviction ouvre la porte...",
    questions: [
      {
        id: "m1", zone: "motivation", difficulty: 1,
        q: "Warum möchten Sie in der Schweiz arbeiten?",
        h: "Formation FMH + qualite + bilingue",
        r: "Die Schweiz bietet eine exzellente Weiterbildung mit dem FMH-System, hohe medizinische Standards und ein multikulturelles Umfeld. Das bilingue Biel passt perfekt zu meinem Profil.",
        followUps: ["Was wissen Sie über das FMH-System?", "Haben Sie sich auch in Frankreich beworben?"],
        keywords: ["Weiterbildung", "FMH", "Standards", "bilingue", "Biel"],
      },
      {
        id: "m2", zone: "motivation", difficulty: 1,
        q: "Warum Angiologie?",
        h: "Diagnostic + interventionnel + ultrason",
        r: "Die Gefäßmedizin verbindet diagnostische Präzision mit interventionellen Möglichkeiten. Die Kombination aus Ultraschall und Katheter-Interventionen fasziniert mich besonders.",
        followUps: ["Welche Erfahrung haben Sie bereits in der Gefäßmedizin?", "Was ist Ihr liebstes Verfahren?"],
        keywords: ["Gefäßmedizin", "diagnostisch", "interventionell", "Ultraschall", "Katheter"],
      },
      {
        id: "m3", zone: "motivation", difficulty: 2,
        q: "Warum Spitalzentrum Biel?",
        h: "Bilingue + Gefäßzentrum + Kat.B + Dr. Attias-Widmer",
        r: "Das Spitalzentrum Biel hat ein interdisziplinäres Gefäßzentrum und ist eine Kategorie-B-Weiterbildungsstätte. Das bilingue Umfeld ermöglicht mir eine sanfte Integration, und die Abteilung unter Dr. Attias-Widmer genießt einen ausgezeichneten Ruf.",
        followUps: ["Was wissen Sie über unsere Abteilung?", "Kennen Sie Biel?"],
        keywords: ["Gefäßzentrum", "Kategorie-B", "bilingue", "interdisziplinär", "Weiterbildungsstätte"],
      },
      {
        id: "m4", zone: "motivation", difficulty: 2,
        q: "Warum möchten Sie Ihre aktuelle Stelle verlassen?",
        h: "Positif + evolution + specialisation",
        r: "Ich bin sehr dankbar für die Erfahrung in der Notaufnahme. Aber jetzt möchte ich mich spezialisieren. Die Angiologie ist mein klares Ziel, und die Schweiz bietet mir die beste Weiterbildung dafür.",
        followUps: ["Was hat Ihnen an den Urgences am meisten gefallen?", "Vermissen Sie die Akutmedizin nicht?"],
        keywords: ["dankbar", "spezialisieren", "Angiologie", "Ziel", "Weiterbildung"],
      },
      {
        id: "m5", zone: "motivation", difficulty: 2,
        q: "Was wissen Sie über die Angiologie als Fachgebiet?",
        h: "Spectre complet: diagnostic vasculaire + interventionnel + chronique + aigu",
        r: "Die Angiologie umfasst die Diagnostik und Therapie von Gefäßerkrankungen: arterielle Verschlusskrankheit, Venenthrombosen, Aneurysmen und Lymphödeme. Sie verbindet nicht-invasive Diagnostik wie die Duplexsonographie mit interventionellen Verfahren wie der Angioplastie. Das fasziniert mich, weil man sowohl ambulant als auch im Notfall arbeitet.",
        followUps: ["Welche Untersuchungsmethoden kennen Sie?", "Was ist der Unterschied zwischen Angiologie und Gefäßchirurgie?"],
        keywords: ["Gefäßerkrankungen", "Duplexsonographie", "Angioplastie", "Venenthrombosen", "arterielle Verschlusskrankheit"],
      },
      {
        id: "m6", zone: "motivation", difficulty: 3,
        q: "Wie stellen Sie sich Ihre Integration in unser Team vor?",
        h: "Proactif + humble + apprendre vite + bilingual advantage",
        r: "Ich möchte von Anfang an aktiv zum Team beitragen. Ich werde aufmerksam zuhören, Fragen stellen und die Abläufe der Abteilung schnell lernen. Mein bilinguales Profil kann in Biel ein Vorteil sein, besonders im Patientenkontakt. Ich bin bereit, mich flexibel anzupassen.",
        followUps: ["Was machen Sie, wenn Sie sich am Anfang überfordert fühlen?", "Wie schnell denken Sie, sich einarbeiten zu können?"],
        keywords: ["Team", "beitragen", "zuhören", "bilingual", "flexibel", "anpassen"],
      },
    ],
  },
  {
    id: "erfahrung",
    name: "Erfahrung",
    icon: "🩺",
    description: "Berufserfahrung und klinische Kompetenzen zeigen",
    color: "blue",
    narrativeIntro: "L'Hopital du complexe ouvre ses portes. Prouvez votre expertise...",
    questions: [
      {
        id: "e1", zone: "erfahrung", difficulty: 1,
        q: "Welche klinische Erfahrung bringen Sie mit?",
        h: "Urgences + polytrauma + ultrason FAST",
        r: "In der Notaufnahme habe ich ein breites Spektrum an Patienten betreut: Polytraumata, kardiovaskuläre Notfälle, Infektionen. Ich habe regelmäßig FAST-Ultraschall durchgeführt und bei der Triage mitgewirkt.",
        followUps: ["Wie viele Patienten pro Schicht?", "Haben Sie auch Nachtdienst gemacht?"],
        keywords: ["Notaufnahme", "Polytrauma", "kardiovaskulär", "FAST-Ultraschall", "Triage"],
      },
      {
        id: "e2", zone: "erfahrung", difficulty: 2,
        q: "Erfahrung mit Ultraschall?",
        h: "FAST urgences + motivation echo vasculaire",
        r: "Ich habe regelmäßig FAST-Ultraschall in der Notaufnahme durchgeführt. Ich beherrsche die abdominale und thorakale Sonographie. Ich freue mich darauf, meine Kompetenzen in der Gefäßsonographie zu vertiefen.",
        followUps: ["Wie oft haben Sie den FAST gemacht?", "Kennen Sie den Kompressionstest bei TVT?"],
        keywords: ["FAST-Ultraschall", "Sonographie", "Gefäßsonographie", "abdominale", "thorakale"],
      },
      {
        id: "e3", zone: "erfahrung", difficulty: 2,
        q: "Wie gehen Sie mit Stress um?",
        h: "Priorisation + communication + exemples",
        r: "Die Notaufnahme hat mich gelehrt, unter Druck strukturiert zu arbeiten. Ich priorisiere nach klinischer Dringlichkeit, kommuniziere klar mit dem Team und bleibe auch in kritischen Situationen ruhig.",
        followUps: ["Geben Sie ein konkretes Beispiel.", "Und wenn das ganze Team gestresst ist?"],
        keywords: ["Druck", "strukturiert", "priorisiere", "kommuniziere", "ruhig"],
      },
      {
        id: "e4", zone: "erfahrung", difficulty: 3,
        q: "Beschreiben Sie einen schwierigen Fall, den Sie betreut haben.",
        h: "Cas concret + demarche + resultat + lecon",
        r: "Ein 65-jähriger Patient kam mit akutem Thoraxschmerz. Ich habe sofort ein EKG und Troponin angeordnet, die Diagnose eines Myokardinfarkts gestellt und die Verlegung in die Kardiologie organisiert. Der Patient wurde rechtzeitig behandelt. Das hat mir gezeigt, wie wichtig schnelle Entscheidungen sind.",
        followUps: ["Was hätten Sie anders gemacht?", "War der Patient alleine? Wie haben Sie die Angehörigen informiert?"],
        keywords: ["Patient", "EKG", "Troponin", "Diagnose", "Verlegung", "Entscheidung"],
      },
      {
        id: "e5", zone: "erfahrung", difficulty: 2,
        q: "Wie arbeiten Sie im interdisziplinären Team?",
        h: "Communication + respect + roles + exemples urgences",
        r: "In der Notaufnahme arbeite ich täglich mit Pflegekräften, Radiologen, Chirurgen und Internisten zusammen. Ich kommuniziere klar und strukturiert, nutze SBAR für Übergaben und respektiere die Expertise jeder Berufsgruppe. Gute Teamarbeit rettet Leben — das habe ich direkt erfahren.",
        followUps: ["Was ist SBAR?", "Wie gehen Sie vor, wenn ein Kollege einer anderen Meinung ist?"],
        keywords: ["interdisziplinär", "Pflegekräfte", "SBAR", "kommuniziere", "Teamarbeit"],
      },
      {
        id: "e6", zone: "erfahrung", difficulty: 3,
        q: "Haben Sie Erfahrung mit der Patientenaufklärung?",
        h: "Consentement eclaire + langue simple + empathie + compliance",
        r: "Ja. In der Notaufnahme habe ich regelmäßig Patienten über Eingriffe und Diagnosen aufgeklärt. Ich achte darauf, medizinische Begriffe einfach zu erklären, dem Patienten Zeit für Fragen zu geben und sicherzustellen, dass er die Informationen verstanden hat. Empathie und Geduld sind dabei essenziell.",
        followUps: ["Wie gehen Sie vor, wenn der Patient nicht versteht?", "Und wenn der Patient den Eingriff ablehnt?"],
        keywords: ["Patientenaufklärung", "aufgeklärt", "Eingriffe", "Empathie", "verstanden"],
      },
    ],
  },
  {
    id: "fallanalyse",
    name: "Fallanalyse",
    icon: "🧠",
    description: "Klinisches Denken und diagnostische Kompetenz",
    color: "violet",
    narrativeIntro: "La salle de raisonnement clinique est sombre. Seule la logique eclaire le chemin...",
    questions: [
      {
        id: "f1", zone: "fallanalyse", difficulty: 2,
        q: "Ein Patient kommt mit Schwellung und Schmerzen im linken Bein. Was tun Sie?",
        h: "TVP: anamnese + Wells + duplex + anticoagulation",
        r: "Ich denke an eine tiefe Venenthrombose. Ich erhebe die Anamnese mit Risikofaktoren, mache den Wells-Score, und wenn der Verdacht hoch ist, ordne ich eine Kompressionssonographie an. Bei Bestätigung leite ich eine Antikoagulation ein.",
        followUps: ["Welche Risikofaktoren fragen Sie ab?", "Der Wells-Score ist niedrig. Was nun?", "Wie dosieren Sie die Antikoagulation?"],
        keywords: ["Venenthrombose", "Wells-Score", "Kompressionssonographie", "Antikoagulation", "Risikofaktoren"],
      },
      {
        id: "f2", zone: "fallanalyse", difficulty: 2,
        q: "72-jähriger Raucher mit TIA vor 2 Wochen. Wie gehen Sie vor?",
        h: "Stenose carotide: duplex + stenosegrad + TEA",
        r: "Ich denke an eine Karotisstenose als Ursache der TIA. Ich ordne eine Duplexsonographie der Halsschlagader an. Bei einer Stenose über 70% bespreche ich mit der Gefäßchirurgie eine Karotis-TEA oder Stenting.",
        followUps: ["Was sind die Symptome einer TIA?", "Warum 70%? Welche Leitlinie?"],
        keywords: ["Karotisstenose", "TIA", "Duplexsonographie", "Stenose", "Karotis-TEA"],
      },
      {
        id: "f3", zone: "fallanalyse", difficulty: 3,
        q: "Plötzlicher Schmerz und Blässe im rechten Bein. Kein Puls tastbar. Was ist Ihr Notfallplan?",
        h: "Ischemie aigue: 6P + heparine + CT-angio + embolectomie",
        r: "Das ist ein akuter arterieller Verschluss — ein Notfall. Ich prüfe die 6 P: Pain, Pallor, Pulselessness, Paresthesia, Paralysis, Poikilothermia. Sofort: Heparin intravenös, Tieflagerung, Schmerztherapie. CT-Angiographie und Gefäßchirurgie alarmieren. Wahrscheinlich Embolektomie nötig.",
        followUps: ["Was ist die häufigste Ursache?", "Der Patient hat Vorhofflimmern. Was bedeutet das langfristig?"],
        keywords: ["arterieller Verschluss", "Notfall", "Heparin", "CT-Angiographie", "Embolektomie", "6 P"],
      },
      {
        id: "f4", zone: "fallanalyse", difficulty: 3,
        q: "Zufallsbefund: Bauchaortenaneurysma 5,8 cm. Wie beraten Sie den Patienten?",
        h: "AAA: taille > 5.5 = OP indication, EVAR vs ouvert, surveillance",
        r: "Ein Bauchaortenaneurysma von 5,8 cm liegt über dem Schwellenwert von 5,5 cm — eine OP-Indikation besteht. Ich erkläre dem Patienten die Optionen: endovaskuläre Versorgung (EVAR) oder offene OP. Eine CT-Angiographie ist nötig für die Planung. Ich bespreche Risiken und Nutzen.",
        followUps: ["Was ist der Vorteil von EVAR?", "Was passiert ohne Operation?"],
        keywords: ["Bauchaortenaneurysma", "Schwellenwert", "EVAR", "OP-Indikation", "CT-Angiographie"],
      },
      {
        id: "f5", zone: "fallanalyse", difficulty: 2,
        q: "Eine 55-jährige Patientin klagt über Schmerzen in den Beinen beim Gehen, die in Ruhe verschwinden. Was vermuten Sie?",
        h: "pAVK: Claudicatio + ABI + Fontaine-Klassifikation + Risikofaktoren",
        r: "Das klingt nach einer Claudicatio intermittens im Rahmen einer peripheren arteriellen Verschlusskrankheit. Ich frage nach Risikofaktoren: Rauchen, Diabetes, Hypertonie, Dyslipidämie. Ich messe den Knöchel-Arm-Index (ABI) und klassifiziere nach Fontaine. Bei einem ABI unter 0,9 ist die Diagnose wahrscheinlich. Therapie: Gehtraining, Risikofaktorkontrolle, eventuell ASS.",
        followUps: ["Was sind die Fontaine-Stadien?", "Ab wann ist eine Revaskularisation indiziert?"],
        keywords: ["Claudicatio intermittens", "Verschlusskrankheit", "Knöchel-Arm-Index", "Fontaine", "Risikofaktoren", "ABI"],
      },
      {
        id: "f6", zone: "fallanalyse", difficulty: 3,
        q: "Ein Patient unter Antikoagulation stürzt und hat ein Hämatom am Kopf. Wie handeln Sie?",
        h: "Urgence neuro + INR + CT cerebral + antagonisation + neurochirurgie",
        r: "Das ist ein potenzieller Notfall — ein intrakranielles Hämatom unter Antikoagulation. Ich prüfe sofort den neurologischen Status und die Glasgow Coma Scale. Dann: Blutentnahme mit INR, ein CT des Schädels ohne Kontrastmittel. Bei Blutung: Antikoagulation antagonisieren — Vitamin K und Prothrombinkomplex bei VKA, Idarucizumab bei Dabigatran. Neurochirurgisches Konsil sofort.",
        followUps: ["Welche Antikoagulantien kennen Sie?", "Der INR ist 4,5. Was tun Sie konkret?"],
        keywords: ["intrakraniell", "Antikoagulation", "Glasgow", "INR", "CT", "antagonisieren", "Neurochirurgie"],
      },
    ],
  },
  {
    id: "argumentation",
    name: "Argumentation",
    icon: "⚖️",
    description: "Entscheidungen verteidigen und Fragen meistern",
    color: "rose",
    narrativeIntro: "Le Tribunal du complexe vous met a l'epreuve. Defendez vos choix...",
    questions: [
      {
        id: "a1", zone: "argumentation", difficulty: 1,
        q: "Was sind Ihre Stärken?",
        h: "Stress + decisions + team + exemples",
        r: "Ich bin belastbar und behalte auch unter Druck einen klaren Kopf. Aus der Notaufnahme bringe ich schnelle Entscheidungsfindung und Teamarbeit mit. Ich bin außerdem sehr lernbereit.",
        followUps: ["Geben Sie ein Beispiel für Ihre Belastbarkeit.", "Wie zeigt sich Ihre Teamarbeit konkret?"],
        keywords: ["belastbar", "Druck", "Entscheidungsfindung", "Teamarbeit", "lernbereit"],
      },
      {
        id: "a2", zone: "argumentation", difficulty: 2,
        q: "Was sind Ihre Schwächen?",
        h: "Honnetete + amelioration + allemand",
        r: "Mein Deutsch ist noch nicht perfekt, aber ich arbeite intensiv daran und mache gute Fortschritte. Ich neige manchmal dazu, zu viel Verantwortung zu übernehmen — das lerne ich zu delegieren.",
        followUps: ["Wie verbessern Sie Ihr Deutsch konkret?", "Bis wann denken Sie, fließend zu sein?"],
        keywords: ["Deutsch", "Fortschritte", "delegieren", "Verantwortung"],
      },
      {
        id: "a3", zone: "argumentation", difficulty: 2,
        q: "Wie lösen Sie Konflikte im Team?",
        h: "Ecoute + dialogue + solution + calme",
        r: "Ich suche immer zuerst das direkte Gespräch. In der Notaufnahme habe ich gelernt, ruhig zu bleiben, zuzuhören und gemeinsam Lösungen zu finden. Eskalation vermeiden, Respekt bewahren.",
        followUps: ["Und wenn Ihr Vorgesetzter unrecht hat?", "Geben Sie ein konkretes Beispiel."],
        keywords: ["Gespräch", "ruhig", "zuhören", "Lösungen", "Respekt"],
      },
      {
        id: "a4", zone: "argumentation", difficulty: 2,
        q: "Wo sehen Sie sich in 5 Jahren?",
        h: "FMH + Suisse + pratique + objectifs clairs",
        r: "In fünf Jahren möchte ich meinen FMH in Angiologie abgeschlossen haben. Ich möchte in der Schweiz bleiben und als Fachärztin in einem Gefäßzentrum arbeiten — idealerweise hier in Biel.",
        followUps: ["Und wenn die Weiterbildung länger dauert?", "Planen Sie eine Niederlassung?"],
        keywords: ["FMH", "Angiologie", "Fachärztin", "Gefäßzentrum", "Schweiz"],
      },
      {
        id: "a5", zone: "argumentation", difficulty: 1,
        q: "Wie ist Ihr Deutschniveau?",
        h: "Honnete + motivee + bilingue Biel",
        r: "Ich lerne intensiv Deutsch seit mehreren Wochen. Mein Niveau ist noch im Aufbau, aber ich bin sehr motiviert und mache täglich Fortschritte. Das bilingue Biel hilft mir, beide Sprachen zu nutzen.",
        followUps: ["Besuchen Sie einen Sprachkurs?", "Können Sie einen Befund auf Deutsch schreiben?"],
        keywords: ["Deutsch", "motiviert", "Fortschritte", "bilingue"],
      },
      {
        id: "a6", zone: "argumentation", difficulty: 2,
        q: "Gehaltsvorstellungen?",
        h: "Flexible + convention + valeur + pas le principal",
        r: "Ich orientiere mich an den üblichen Konditionen für Assistenzärzte in der Schweiz. Das Gehalt ist für mich nicht der Hauptgrund für meine Bewerbung — mir geht es um die Weiterbildung und die fachliche Entwicklung.",
        followUps: ["Kennen Sie das Gehaltsniveau in der Schweiz?"],
        keywords: ["Konditionen", "Assistenzärzte", "Weiterbildung", "Entwicklung"],
      },
    ],
  },
  {
    id: "finale",
    name: "Finale Simulation",
    icon: "🏛️",
    description: "Vollständige Entretien-Simulation unter Druck",
    color: "amber",
    narrativeIntro: "Le Protocole Lazarus est pret. L'activation finale exige une performance parfaite...",
    questions: [
      {
        id: "fin1", zone: "finale", difficulty: 3,
        q: "Stellen Sie sich bitte vor und erklären Sie, warum Sie hier sind.",
        h: "Intro complete: parcours + motivation + objectif + enthousiasme",
        r: "Guten Tag. Ich bin Dr. Motongane. Nach meinem Medizinstudium in Frankreich habe ich als Assistenzärztin in der Notaufnahme gearbeitet. Dort habe ich gelernt, unter Druck zu arbeiten, Patienten zu triagieren und FAST-Ultraschall durchzuführen. Jetzt möchte ich mich in der Angiologie spezialisieren. Ihr Gefäßzentrum in Biel bietet die ideale Kombination aus Weiterbildung und bilingualem Umfeld.",
        followUps: ["Warum sollten wir Sie einstellen und nicht jemand anderen?", "Was unterscheidet Sie von anderen Bewerbern?"],
        keywords: ["Medizinstudium", "Notaufnahme", "Angiologie", "Gefäßzentrum", "Biel", "spezialisieren"],
      },
      {
        id: "fin2", zone: "finale", difficulty: 3,
        q: "Ein Patient hat einen akuten Beinschmerz. Erklären Sie Ihr Vorgehen — als ob Sie mit dem Chefarzt sprechen.",
        h: "Demarche structuree + vocabulaire precis + confiance",
        r: "Ich denke differentialdiagnostisch an einen akuten arteriellen Verschluss oder eine tiefe Venenthrombose. Bei fehlendem Puls und blassem Bein ist ein arterieller Verschluss wahrscheinlich. Ich gebe sofort Heparin, lagere das Bein tief und alarmiere die Gefäßchirurgie. Parallel ordne ich eine CT-Angiographie an.",
        followUps: ["Der Patient hat Vorhofflimmern. Ändert das etwas?", "Die CT zeigt einen Verschluss der A. poplitea. Nächster Schritt?"],
        keywords: ["differentialdiagnostisch", "arterieller Verschluss", "Venenthrombose", "Heparin", "Gefäßchirurgie", "CT-Angiographie"],
      },
      {
        id: "fin3", zone: "finale", difficulty: 3,
        q: "Haben Sie Fragen an uns?",
        h: "Questions intelligentes: Tagesablauf + Weiterbildung + team",
        r: "Ja, gerne. Wie sieht ein typischer Arbeitstag in der Angiologie aus? Welche Weiterbildungsmöglichkeiten gibt es im Gefäßzentrum? Wie funktioniert die Zusammenarbeit mit der Gefäßchirurgie? Und gibt es regelmäßige Fortbildungen oder interdisziplinäre Besprechungen?",
        followUps: ["Was erwarten Sie konkret von Ihrer Weiterbildung?"],
        keywords: ["Arbeitstag", "Weiterbildungsmöglichkeiten", "Zusammenarbeit", "Fortbildungen", "interdisziplinär"],
      },
      {
        id: "fin4", zone: "finale", difficulty: 3,
        q: "Eine Kollegin macht einen Fehler bei der Medikamentendosierung. Was tun Sie?",
        h: "Securite du patient + communication directe + incident reporting + pas de blame",
        r: "Die Patientensicherheit hat oberste Priorität. Ich spreche die Kollegin sofort und respektvoll an, damit der Fehler korrigiert werden kann. Dann informiere ich den Oberarzt und dokumentiere den Vorfall im Fehlermeldesystem. Es geht nicht um Schuldzuweisung, sondern um Prävention und Lernkultur.",
        followUps: ["Was machen Sie, wenn die Kollegin den Fehler leugnet?", "Kennen Sie das CIRS-System?"],
        keywords: ["Patientensicherheit", "Fehler", "korrigiert", "Oberarzt", "Fehlermeldesystem", "Prävention"],
      },
      {
        id: "fin5", zone: "finale", difficulty: 3,
        q: "Ein Patient mit pAVK Stadium III fragt Sie, ob er operiert werden muss. Erklären Sie es verständlich.",
        h: "Communication patient: simple + empathique + options + decision partagee",
        r: "Ich erkläre dem Patienten: Sie haben eine Durchblutungsstörung in Ihrem Bein. Im Stadium III haben Sie auch in Ruhe Schmerzen, und das Gewebe bekommt nicht genug Blut. Wir müssen jetzt handeln, um Ihr Bein zu retten. Es gibt verschiedene Möglichkeiten: eine Katheter-Behandlung durch die Arterie oder eine Operation. Wir besprechen gemeinsam, welche Option für Sie am besten ist. Haben Sie dazu Fragen?",
        followUps: ["Der Patient hat Angst vor der Operation. Was sagen Sie?", "Er fragt nach Alternativen."],
        keywords: ["Durchblutungsstörung", "Ruhe", "Schmerzen", "Katheter", "Operation", "gemeinsam"],
      },
      {
        id: "fin6", zone: "finale", difficulty: 3,
        q: "Fassen Sie in 60 Sekunden zusammen, warum Sie die ideale Kandidatin für diese Stelle sind.",
        h: "Elevator pitch: parcours + competences + motivation + valeur ajoutee + enthousiasme",
        r: "Ich bin Assistenzärztin mit klinischer Erfahrung in der Notaufnahme, wo ich gelernt habe, unter Druck zu arbeiten, schnell zu entscheiden und im Team zu kommunizieren. Ich möchte mich in der Angiologie spezialisieren, weil mich die Kombination aus Diagnostik und Intervention fasziniert. Mein bilinguales Profil, mein unternehmerisches Denken und meine starke Motivation machen mich zur richtigen Person für Ihr Gefäßzentrum in Biel. Ich bin bereit, mich voll einzusetzen.",
        followUps: ["Das war gut. Aber was macht Sie besser als andere?"],
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
