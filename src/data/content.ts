export const TARGET = new Date("2026-03-30T08:00:00");

export const PROG = [
  { date: "2026-03-11", title: "Phonétique & Bases", w: 1, tasks: [
    { t: "Matin", d: "Alphabet, prononciation (ch, sch, z, ei, eu, ie, ü, ö, ä). Seedlang 30min", tp: "learn" as const },
    { t: "Midi", d: "Articles der/die/das. Créer 30 flashcards Anki", tp: "grammar" as const },
    { t: "Soir", d: "Se présenter: Ich bin Ärztin, ich arbeite in der Notaufnahme. x5", tp: "speak" as const }
  ]},
  { date: "2026-03-12", title: "Nombres & Verbes", w: 1, tasks: [
    { t: "Matin", d: "Nombres 1-1000, heure, jours, mois", tp: "learn" as const },
    { t: "Midi", d: "Présent: verbes réguliers + sein/haben. 15 verbes", tp: "grammar" as const },
    { t: "Soir", d: "Dialogue accueil patient (Name? Geburtsdatum?). x5", tp: "speak" as const }
  ]},
  { date: "2026-03-13", title: "Corps humain", w: 1, tasks: [
    { t: "Matin", d: "Kopf, Herz, Lunge, Bein, Arm, Bauch, Haut, Blut...", tp: "learn" as const },
    { t: "Midi", d: "Accusatif (den/einen). Ich untersuche den Patienten", tp: "grammar" as const },
    { t: "Soir", d: "Slow German 2 épisodes + répétition", tp: "listen" as const }
  ]},
  { date: "2026-03-14", title: "Symptômes & Questions", w: 1, tasks: [
    { t: "Matin", d: "Schmerzen, Fieber, Atemnot, Schwindel, Schwellung...", tp: "learn" as const },
    { t: "Midi", d: "Négation (nicht/kein), W-Fragen: wo, was, wie, wann", tp: "grammar" as const },
    { t: "Soir", d: "Interrogatoire patient complet. 10 questions par coeur", tp: "speak" as const }
  ]},
  { date: "2026-03-15", title: "Vocabulaire Angiologie", w: 1, tasks: [
    { t: "Matin", d: "Arterie, Vene, Thrombose, Embolie, Stenose, Stent, Bypass", tp: "learn" as const },
    { t: "Midi", d: "Datif (dem/der). Prépositions: in, an, auf, mit, nach", tp: "grammar" as const },
    { t: "Soir", d: "Mini-présentation parcours en allemand (10 phrases)", tp: "write" as const }
  ]},
  { date: "2026-03-16", title: "Consolidation S1", w: 1, tasks: [
    { t: "Matin", d: "RÉVISION: toutes flashcards, podcasts, notes", tp: "review" as const },
    { t: "Midi", d: "Verbes modaux: können, müssen, sollen, wollen, dürfen", tp: "grammar" as const },
    { t: "Soir", d: "1ère simulation entretien. Timer 10 min. Enregistrer!", tp: "speak" as const }
  ]},
  { date: "2026-03-17", title: "Milieu hospitalier", w: 1, tasks: [
    { t: "Matin", d: "Notaufnahme, Station, Visite, Befund, Diagnose, Therapie", tp: "learn" as const },
    { t: "Midi", d: "Lettre de motivation courte en allemand", tp: "write" as const },
    { t: "Soir", d: "YouTube Deutsch für Ärzte (1h) + notes", tp: "listen" as const }
  ]},
  { date: "2026-03-18", title: "Angiologie avancé", w: 2, tasks: [
    { t: "Matin", d: "Duplexsonographie, Angiographie, Katheterisierung", tp: "learn" as const },
    { t: "Midi", d: "Perfekt: ich habe untersucht. 20 participes médicaux", tp: "grammar" as const },
    { t: "Soir", d: "Rédiger un Befundbericht simple en allemand", tp: "write" as const }
  ]},
  { date: "2026-03-19", title: "Phrases cliniques", w: 2, tasks: [
    { t: "Matin", d: "Der Patient klagt über... / Die Untersuchung zeigt...", tp: "learn" as const },
    { t: "Midi", d: "Subordonnées: weil, dass, wenn — verbe EN FIN", tp: "grammar" as const },
    { t: "Soir", d: "Documentaire médical en allemand 45 min", tp: "listen" as const }
  ]},
  { date: "2026-03-20", title: "Écho vasculaire", w: 2, tasks: [
    { t: "Matin", d: "Farbdoppler, Flussmessung, Wandverdickung, Plaque", tp: "learn" as const },
    { t: "Midi", d: "Konjunktiv II: Könnten Sie..., Ich würde gern...", tp: "grammar" as const },
    { t: "Soir", d: "Expliquer un examen écho à un patient. Enregistrer", tp: "speak" as const }
  ]},
  { date: "2026-03-21", title: "Pathologies veineuses", w: 2, tasks: [
    { t: "Matin", d: "Krampfadern, Besenreiser, Kompressionstherapie", tp: "learn" as const },
    { t: "Midi", d: "Prépositions temporelles (seit, vor, nach)", tp: "grammar" as const },
    { t: "Soir", d: "Résumer 3 cas cliniques en allemand", tp: "write" as const }
  ]},
  { date: "2026-03-22", title: "Transmissions", w: 2, tasks: [
    { t: "Matin", d: "Übergabe SBAR, Besprechung, Konsil, Visite", tp: "learn" as const },
    { t: "Midi", d: "Passif: wird untersucht, wurde operiert", tp: "grammar" as const },
    { t: "Soir", d: "Jeu de rôle: Übergabe SBAR en allemand. Timer 3min", tp: "speak" as const }
  ]},
  { date: "2026-03-23", title: "Consolidation S2", w: 2, tasks: [
    { t: "Matin", d: "RÉVISION S2: flashcards + relecture textes", tp: "review" as const },
    { t: "Midi", d: "Vocabulaire entretien: Weiterbildung, Facharztausbildung", tp: "learn" as const },
    { t: "Soir", d: "Simulation entretien complète 20 min. Enregistrer!", tp: "speak" as const }
  ]},
  { date: "2026-03-24", title: "Urgences + Culture CH", w: 2, tasks: [
    { t: "Matin", d: "Urgences vasculaires: akuter Verschluss, Lungenembolie", tp: "learn" as const },
    { t: "Midi", d: "Culture suisse: Grüezi, ponctualité, hiérarchie", tp: "learn" as const },
    { t: "Soir", d: "3 podcasts médicaux + shadowing", tp: "listen" as const }
  ]},
  { date: "2026-03-25", title: "Préparation entretien", w: 3, tasks: [
    { t: "Matin", d: "Relire l'annonce. 15 questions d'entretien", tp: "speak" as const },
    { t: "Midi", d: "Relatives, conjonctions avancées", tp: "grammar" as const },
    { t: "Soir", d: "Simulation entretien FILMÉE 30 min", tp: "speak" as const }
  ]},
  { date: "2026-03-26", title: "Jour d'observation prep", w: 3, tasks: [
    { t: "Matin", d: "Vocabulaire: zuschauen, mitmachen, Arbeitsablauf", tp: "learn" as const },
    { t: "Midi", d: "Préparer 10 questions intelligentes en allemand", tp: "write" as const },
    { t: "Soir", d: "Commenter un examen écho en direct en allemand", tp: "speak" as const }
  ]},
  { date: "2026-03-27", title: "Révision totale", w: 3, tasks: [
    { t: "Matin", d: "TOUTES flashcards, TOUS enregistrements", tp: "review" as const },
    { t: "Midi", d: "Email de confirmation à Dr. Attias-Widmer", tp: "write" as const },
    { t: "Soir", d: "Dernière simulation entretien — timer strict", tp: "speak" as const }
  ]},
  { date: "2026-03-28", title: "Immersion finale", w: 3, tasks: [
    { t: "Matin", d: "2h immersion totale allemand. Zéro français", tp: "listen" as const },
    { t: "Midi", d: "Relire TOUS ses textes. Mémoriser 10 phrases clés", tp: "review" as const },
    { t: "Soir", d: "Préparer tenue + documents + trajet", tp: "rest" as const }
  ]},
  { date: "2026-03-29", title: "Repos actif", w: 3, tasks: [
    { t: "Matin", d: "Révision légère: entretien, angio, politesse", tp: "review" as const },
    { t: "Midi", d: "Dernier run-through oral complet", tp: "speak" as const },
    { t: "Soir", d: "REPOS. Coucher tôt. Du bist bereit.", tp: "rest" as const }
  ]},
  { date: "2026-03-30", title: "JOUR J", w: 3, tasks: [
    { t: "6h", d: "Notes clés + petit-déj + confiance. Du schaffst das!", tp: "speak" as const },
    { t: "Journée", d: "OBSERVATION + ENTRETIEN — Dr. Attias-Widmer", tp: "speak" as const },
    { t: "Soir", d: "Debrief + email de remerciement", tp: "write" as const }
  ]}
];

export type TaskType = "learn" | "grammar" | "speak" | "listen" | "write" | "review" | "rest";

export const TP_LABELS: Record<TaskType, string> = {
  learn: "Apprendre", grammar: "Grammaire", speak: "Parler",
  listen: "Écouter", write: "Écrire", review: "Réviser", rest: "Repos"
};

export const DECKS = [
  { name: "Angiologie", icon: "🫀", cards: [
    {de:"die Arterie",fr:"artère"},{de:"die Vene",fr:"veine"},{de:"die Thrombose",fr:"thrombose"},
    {de:"die Embolie",fr:"embolie"},{de:"die Stenose",fr:"sténose"},{de:"der Stent",fr:"stent"},
    {de:"der Bypass",fr:"pontage"},{de:"die Revaskularisation",fr:"revascularisation"},
    {de:"der Ultraschall",fr:"échographie"},{de:"die Angiographie",fr:"angiographie"},
    {de:"der Katheter",fr:"cathéter"},{de:"die Embolisation",fr:"embolisation"},
    {de:"die Krampfader",fr:"varice"},{de:"die Kompression",fr:"compression"},
    {de:"der Farbdoppler",fr:"doppler couleur"},{de:"die Wandverdickung",fr:"épaiss. pariétal"},
    {de:"die Plaque",fr:"plaque"},{de:"die Insuffizienz",fr:"insuffisance"},
    {de:"die Dissektion",fr:"dissection"},{de:"das Aneurysma",fr:"anévrisme"},
    {de:"die Sklerotherapie",fr:"sclérothérapie"},{de:"der Verschluss",fr:"occlusion"},
    {de:"die Durchblutung",fr:"perfusion"},{de:"die Verengung",fr:"rétrécissement"}
  ]},
  { name: "Corps humain", icon: "🦴", cards: [
    {de:"der Kopf",fr:"tête"},{de:"das Herz",fr:"coeur"},{de:"die Lunge",fr:"poumon"},
    {de:"das Bein",fr:"jambe"},{de:"der Arm",fr:"bras"},{de:"der Bauch",fr:"ventre"},
    {de:"die Haut",fr:"peau"},{de:"das Blut",fr:"sang"},{de:"der Knochen",fr:"os"},
    {de:"die Niere",fr:"rein"},{de:"die Leber",fr:"foie"},{de:"der Magen",fr:"estomac"},
    {de:"der Rücken",fr:"dos"},{de:"der Hals",fr:"cou"},{de:"die Schulter",fr:"épaule"},
    {de:"das Knie",fr:"genou"},{de:"der Fuß",fr:"pied"},{de:"die Hand",fr:"main"},
    {de:"die Brust",fr:"poitrine"},{de:"das Gehirn",fr:"cerveau"}
  ]},
  { name: "Symptômes", icon: "🤒", cards: [
    {de:"die Schmerzen",fr:"douleurs"},{de:"das Fieber",fr:"fièvre"},{de:"die Atemnot",fr:"dyspnée"},
    {de:"der Schwindel",fr:"vertige"},{de:"die Schwellung",fr:"oedème"},{de:"die Übelkeit",fr:"nausée"},
    {de:"das Erbrechen",fr:"vomissement"},{de:"der Durchfall",fr:"diarrhée"},{de:"der Husten",fr:"toux"},
    {de:"die Blutung",fr:"hémorragie"},{de:"die Müdigkeit",fr:"fatigue"},{de:"die Taubheit",fr:"engourdissement"},
    {de:"das Kribbeln",fr:"fourmillement"},{de:"die Claudicatio",fr:"claudication"},
    {de:"die Zyanose",fr:"cyanose"},{de:"der Brustschmerz",fr:"douleur thoracique"}
  ]},
  { name: "Hôpital", icon: "🏥", cards: [
    {de:"die Notaufnahme",fr:"urgences"},{de:"die Station",fr:"service"},{de:"die Visite",fr:"visite"},
    {de:"der Befund",fr:"résultat"},{de:"die Diagnose",fr:"diagnostic"},{de:"die Therapie",fr:"traitement"},
    {de:"die Überweisung",fr:"transfert"},{de:"das Konsil",fr:"avis spécialisé"},
    {de:"die Übergabe",fr:"transmission"},{de:"die Besprechung",fr:"réunion"},
    {de:"der Facharzt",fr:"spécialiste FMH"},{de:"die Weiterbildung",fr:"form. postgrad."},
    {de:"der Oberarzt",fr:"chef de clinique"},{de:"der Chefarzt",fr:"médecin-chef"},
    {de:"der Assistenzarzt",fr:"méd. assistant"},{de:"die Blutentnahme",fr:"prise de sang"}
  ]},
  { name: "Entretien", icon: "💼", cards: [
    {de:"die Bewerbung",fr:"candidature"},{de:"das Vorstellungsgespräch",fr:"entretien"},
    {de:"die Stärke",fr:"point fort"},{de:"die Teamarbeit",fr:"travail d'équipe"},
    {de:"die Eigeninitiative",fr:"initiative"},{de:"die Belastbarkeit",fr:"résistance stress"},
    {de:"die Facharztausbildung",fr:"formation FMH"},{de:"das Ziel",fr:"objectif"},
    {de:"die Hospitation",fr:"observation"},{de:"die Probezeit",fr:"période essai"},
    {de:"der Lebenslauf",fr:"CV"},{de:"die Weiterbildungsstätte",fr:"lieu formation"}
  ]},
  { name: "Phrases cliniques", icon: "💬", cards: [
    {de:"Der Patient klagt über...",fr:"Le patient se plaint de..."},
    {de:"Die Untersuchung zeigt...",fr:"L'examen montre..."},
    {de:"Ich empfehle...",fr:"Je recommande..."},
    {de:"Der Befund ist unauffällig",fr:"Résultat normal"},
    {de:"Es besteht Verdacht auf...",fr:"Suspicion de..."},
    {de:"Seit wann haben Sie Beschwerden?",fr:"Depuis quand ces symptômes?"},
    {de:"Nehmen Sie Medikamente?",fr:"Prenez-vous des médic.?"},
    {de:"Haben Sie Allergien?",fr:"Des allergies?"},
    {de:"Ich stelle mich kurz vor",fr:"Je me présente"},
    {de:"Könnten Sie bitte ... anordnen?",fr:"Pourriez-vous prescrire...?"}
  ]}
];

export const IVW = [
  {q:"Stellen Sie sich bitte vor.",h:"Parcours + urgences + motivation",r:"Ich bin Dr. Motongane. Ich habe mein Medizinstudium in Frankreich abgeschlossen und arbeite seit Juli 2024 als Assistenzärztin in der Notaufnahme."},
  {q:"Warum Angiologie?",h:"Diagnostic + interventionnel",r:"Die Gefäßmedizin verbindet diagnostische Präzision mit interventionellen Möglichkeiten. Die Kombination aus Ultraschall und Katheter-Interventionen fasziniert mich."},
  {q:"Warum Spitalzentrum Biel?",h:"Bilingue + Gefäßzentrum + Kat.B",r:"Biel bietet ein bilingues Umfeld und ein interdisziplinäres Gefäßzentrum. Als Kategorie-B-Weiterbildungsstätte ist es ideal für mich."},
  {q:"Was sind Ihre Stärken?",h:"Stress + décisions + team",r:"Ich bin belastbar, lerne schnell und bringe Erfahrung aus der Notfallmedizin mit — Stressresistenz und schnelle Entscheidungsfindung."},
  {q:"Wo sehen Sie sich in 5 Jahren?",h:"FMH + Suisse + pratique",r:"Ich möchte meinen FMH in Angiologie abschließen und langfristig in der Schweiz praktizieren."},
  {q:"Wie ist Ihr Deutschniveau?",h:"Honnête + motivée + bilingue",r:"Ich lerne intensiv Deutsch. Das bilingue Umfeld in Biel hilft mir, und ich besuche Sprachkurse."},
  {q:"Erfahrung mit Ultraschall?",h:"FAST urgences + motivation écho",r:"Ich habe regelmäßig FAST-Ultraschall durchgeführt und freue mich, meine Kompetenzen in der Gefäßsonographie zu vertiefen."},
  {q:"Wie gehen Sie mit Stress um?",h:"Priorisation + communication",r:"Die Notaufnahme hat mich gelehrt, unter Druck strukturiert zu arbeiten und klar zu kommunizieren."},
  {q:"Haben Sie Fragen an uns?",h:"Tagesablauf + Weiterbildung",r:"Wie ist der Tagesablauf? Welche Weiterbildungsmöglichkeiten gibt es? Wie funktioniert die Zusammenarbeit?"},
  {q:"Weitere Interessen?",h:"E-Health + EmotionsCare",r:"Ich habe ein Unternehmen im Bereich digitale Gesundheit gegründet. Das stärkt meine analytischen Fähigkeiten."}
];

export const SURVIVAL = [
  {cat:"Quand tu ne comprends pas",items:[
    {de:"Könnten Sie das bitte wiederholen?",fr:"Pourriez-vous répéter?"},
    {de:"Könnten Sie langsamer sprechen?",fr:"Plus lentement svp?"},
    {de:"Ich habe nicht ganz verstanden.",fr:"Je n'ai pas tout compris."}
  ]},
  {cat:"Gagner du temps",items:[
    {de:"Lassen Sie mich kurz nachdenken.",fr:"Laissez-moi réfléchir."},
    {de:"Wenn ich richtig verstehe...",fr:"Si je comprends bien..."},
    {de:"Ich würde sagen, dass...",fr:"Je dirais que..."}
  ]},
  {cat:"Small talk équipe",items:[
    {de:"Seit wann arbeiten Sie hier?",fr:"Depuis combien de temps ici?"},
    {de:"Das ist sehr interessant, danke!",fr:"Très intéressant, merci!"},
    {de:"Ich freue mich, hier zu sein.",fr:"Ravie d'être ici."}
  ]},
  {cat:"Pendant l'observation",items:[
    {de:"Darf ich zuschauen?",fr:"Puis-je observer?"},
    {de:"Darf ich eine Frage stellen?",fr:"Puis-je poser une question?"},
    {de:"Das möchte ich unbedingt lernen.",fr:"Je veux absolument apprendre ça."}
  ]},
  {cat:"Politesse suisse",items:[
    {de:"Grüezi!",fr:"Bonjour (suisse)"},{de:"Merci vilmal!",fr:"Merci beaucoup (suisse)"},
    {de:"Uf Widerluege!",fr:"Au revoir (suisse)"},
    {de:"Es freut mich, Sie kennenzulernen.",fr:"Ravi(e) de vous rencontrer."}
  ]}
];

export const GRAM = [
  {title:"Articles & Cas",items:[
    {l:"Nominatif",e:"der / die / das / die (pl.)"},{l:"Accusatif",e:"den / die / das / die"},
    {l:"Datif",e:"dem / der / dem / den+n"},{l:"Astuce",e:"Accusatif=COD, Datif=COI (mit/bei/nach/zu)"}
  ]},
  {title:"Verbes modaux",items:[
    {l:"können",e:"pouvoir — Ich kann untersuchen"},{l:"müssen",e:"devoir — Sie müssen nüchtern bleiben"},
    {l:"möchten",e:"souhaiter — Ich möchte mich vorstellen"},{l:"dürfen",e:"permission — Dürfen wir besprechen?"}
  ]},
  {title:"Ordre des mots",items:[
    {l:"Principale",e:"S + V2 + ... + participe EN FIN"},
    {l:"Subordonnée",e:"weil/dass/wenn + S + ... + V EN FIN"},
    {l:"Exemple",e:"Ich glaube, dass der Patient eine Thrombose hat."}
  ]},
  {title:"Passif médical",items:[
    {l:"Présent",e:"wird untersucht (est examiné)"},{l:"Passé",e:"wurde operiert (a été opéré)"},
    {l:"Modal",e:"muss untersucht werden (doit être examiné)"}
  ]},
  {title:"Politesse",items:[
    {l:"Könnten Sie...",e:"Pourriez-vous..."},{l:"Ich würde gern...",e:"J'aimerais..."},
    {l:"Hätten Sie Zeit...",e:"Auriez-vous le temps..."}
  ]}
];

export const SCENARIOS = [
  {title:"TVP",icon:"🦵",sit:"Frau Müller, 58J. Schwellung linkes Bein seit 3 Tagen.",
    steps:["Anamnese: Seit wann? Risikofaktoren?","Duplexsonographie: Kompressionstest","Befund: Thrombose V. femoralis","Therapie: Antikoagulation + Kompression"]},
  {title:"Sténose carotide",icon:"🧠",sit:"Herr Schmidt, 72J. TIA vor 2 Wochen. Raucher.",
    steps:["Anamnese: TIA-Symptome?","Duplexsonographie A. carotis","Stenosegrad 80% ACI rechts","Empfehlung: Karotis-TEA besprechen"]},
  {title:"Insuff. veineuse",icon:"🦵",sit:"Frau Weber, 45J. Krampfadern, Schweregefühl.",
    steps:["Anamnese: Familie? Stehberuf?","Duplex: Refluxtest","Insuffizienz V. saphena magna","Therapie: Kompression, Sklerotherapie"]},
  {title:"AOMI",icon:"🚶",sit:"Herr Bauer, 65J, Raucher. Wadenschmerzen nach 200m.",
    steps:["ABI-Messung: 0.6 rechts","Duplex: Stenose A. femoralis","Fontaine-Stadium IIb","Gehtraining, ggf. PTA"]}
];

export const CHECKLIST = [
  {cat:"Documents",items:["CV DE+FR","Lettre motivation DE","Diplômes copies","Dossier MEBEKO","Questions préparées"]},
  {cat:"Tenue",items:["Tenue professionnelle","Stéthoscope","Trajet planifié (15min avance)","Téléphone chargé"]},
  {cat:"Mental",items:["Relire 10 phrases clés","Petit-déjeuner complet","Respirer 3x","JE SUIS MÉDECIN. JE MÉRITE CETTE PLACE."]}
];

export const MOTIV = [
  "Ce poste = FMH angiologie 🏆","Chaque mot appris = un outil pour tes patients 💪",
  "Tu as survécu aux urgences, tu peux tout faire 🔥","Dr. Attias-Widmer t'attend le 30 mars",
  "L'inconfort est temporaire. Le FMH est pour toujours ⭐","Tu es médecin. Tu mérites cette place 👩‍⚕️",
  "Jetzt geht's los! 🇩🇪","Ton profil est unique, personne d'autre n'est toi",
  "Bienne t'attend 🇨🇭","Chaque heure compte — fais-la compter 🕐"
];

export const LVLS = ["Anfänger","Lehrling","Fortgeschritten","Kompetent","Experte","Meister","Chefarzt"];
