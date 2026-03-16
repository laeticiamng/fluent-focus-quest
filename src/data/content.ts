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
  ]},
  // === 3 NOUVEAUX DECKS ===
  { name: "Nombres & Temps", icon: "🔢", cards: [
    {de:"das Geburtsdatum",fr:"date de naissance"},{de:"die Uhrzeit",fr:"l'heure"},
    {de:"der Blutdruck: 120 zu 80",fr:"TA: 12/8"},{de:"die Dosierung",fr:"dosage"},
    {de:"dreimal täglich",fr:"3x par jour"},{de:"alle vier Stunden",fr:"toutes les 4h"},
    {de:"nüchtern seit Mitternacht",fr:"à jeun depuis minuit"},{de:"seit drei Tagen",fr:"depuis 3 jours"},
    {de:"vor zwei Wochen",fr:"il y a 2 semaines"},{de:"der Puls: 72 pro Minute",fr:"pouls: 72/min"},
    {de:"die Temperatur: 38,5 Grad",fr:"T°: 38,5°C"},{de:"die Sättigung: 97 Prozent",fr:"sat: 97%"},
    {de:"der Body-Mass-Index",fr:"IMC"},{de:"Montag bis Freitag",fr:"lundi à vendredi"},
    {de:"die Nachtschicht",fr:"garde de nuit"},{de:"die Frühschicht",fr:"poste du matin"}
  ]},
  { name: "Médicaments", icon: "💊", cards: [
    {de:"das Medikament",fr:"médicament"},{de:"das Rezept",fr:"ordonnance"},
    {de:"die Tablette",fr:"comprimé"},{de:"die Spritze",fr:"injection/seringue"},
    {de:"die Infusion",fr:"perfusion"},{de:"die Salbe",fr:"pommade"},
    {de:"der Wirkstoff",fr:"principe actif"},{de:"die Nebenwirkung",fr:"effet secondaire"},
    {de:"die Allergie",fr:"allergie"},{de:"die Unverträglichkeit",fr:"intolérance"},
    {de:"der Blutverdünner",fr:"anticoagulant"},{de:"das Antibiotikum",fr:"antibiotique"},
    {de:"das Schmerzmittel",fr:"antalgique"},{de:"der Betablocker",fr:"bêtabloquant"},
    {de:"die Thromboseprophylaxe",fr:"prophylaxie TVP"},{de:"das Heparin",fr:"héparine"}
  ]},
  { name: "Verbes Perfekt", icon: "📝", cards: [
    {de:"untersuchen → hat untersucht",fr:"examiner"},{de:"behandeln → hat behandelt",fr:"traiter"},
    {de:"operieren → hat operiert",fr:"opérer"},{de:"verordnen → hat verordnet",fr:"prescrire"},
    {de:"diagnostizieren → hat diagnostiziert",fr:"diagnostiquer"},
    {de:"überweisen → hat überwiesen",fr:"transférer/référer"},
    {de:"entlassen → hat entlassen",fr:"libérer (patient)"},
    {de:"aufnehmen → hat aufgenommen",fr:"admettre"},
    {de:"punktieren → hat punktiert",fr:"ponctionner"},
    {de:"intubieren → hat intubiert",fr:"intuber"},
    {de:"reanimieren → hat reanimiert",fr:"réanimer"},
    {de:"desinfizieren → hat desinfiziert",fr:"désinfecter"},
    {de:"nähen → hat genäht",fr:"suturer"},
    {de:"verbinden → hat verbunden",fr:"panser"},
    {de:"auskultieren → hat auskultiert",fr:"ausculter"},
    {de:"palpieren → hat palpiert",fr:"palper"},
    {de:"dokumentieren → hat dokumentiert",fr:"documenter"},
    {de:"besprechen → hat besprochen",fr:"discuter"},
    {de:"sich vorstellen → hat sich vorgestellt",fr:"se présenter"},
    {de:"einleiten → hat eingeleitet",fr:"initier (traitement)"}
  ]},
  // === DECK 10: 150 MOTS MÉDICAUX ESSENTIELS ===
  { name: "150 Mots essentiels", icon: "🏆", cards: [
    // --- Examen clinique ---
    {de:"die Anamnese",fr:"anamnèse"},{de:"die Inspektion",fr:"inspection"},{de:"die Palpation",fr:"palpation"},
    {de:"die Auskultation",fr:"auscultation"},{de:"die Perkussion",fr:"percussion"},{de:"der Tastbefund",fr:"palpation/résultat"},
    {de:"die Vitalzeichen",fr:"constantes vitales"},{de:"die Sauerstoffsättigung",fr:"saturation O2"},
    {de:"die Herzfrequenz",fr:"fréquence cardiaque"},{de:"der Atemfrequenz",fr:"fréquence respiratoire"},
    // --- Urgences ---
    {de:"der Notfall",fr:"urgence"},{de:"die Reanimation",fr:"réanimation"},{de:"der Schock",fr:"choc"},
    {de:"die Bewusstlosigkeit",fr:"perte de connaissance"},{de:"der Herzstillstand",fr:"arrêt cardiaque"},
    {de:"die Intubation",fr:"intubation"},{de:"der Defibrillator",fr:"défibrillateur"},
    {de:"die Triage",fr:"triage"},{de:"die Stabilisierung",fr:"stabilisation"},
    {de:"die Thoraxdrainage",fr:"drainage thoracique"},
    // --- Chirurgie ---
    {de:"die Operation",fr:"opération"},{de:"die Naht",fr:"suture"},{de:"die Wunde",fr:"plaie"},
    {de:"der Verband",fr:"pansement"},{de:"die Narkose",fr:"anesthésie"},{de:"die Lokalanästhesie",fr:"anesthésie locale"},
    {de:"der Schnitt",fr:"incision"},{de:"die Drainage",fr:"drainage"},{de:"die Klammer",fr:"agrafe"},
    {de:"die Desinfektion",fr:"désinfection"},
    // --- Radiologie ---
    {de:"das Röntgenbild",fr:"radiographie"},{de:"die Computertomographie (CT)",fr:"scanner"},
    {de:"die Magnetresonanztomographie (MRT)",fr:"IRM"},{de:"die Kontrastmittel",fr:"produit de contraste"},
    {de:"der Befundbericht",fr:"compte rendu"},{de:"die Aufnahme",fr:"cliché"},
    // --- Cardiologie ---
    {de:"das Elektrokardiogramm (EKG)",fr:"ECG"},{de:"der Herzinfarkt",fr:"infarctus"},
    {de:"die Herzinsuffizienz",fr:"insuffisance cardiaque"},{de:"das Vorhofflimmern",fr:"fibrillation auriculaire"},
    {de:"der Herzrhythmus",fr:"rythme cardiaque"},{de:"die Echokardiographie",fr:"échocardio"},
    // --- Pneumologie ---
    {de:"die Pneumonie",fr:"pneumonie"},{de:"das Asthma",fr:"asthme"},{de:"die COPD",fr:"BPCO"},
    {de:"der Pneumothorax",fr:"pneumothorax"},{de:"die Bronchoskopie",fr:"bronchoscopie"},
    {de:"das Lungenödem",fr:"OAP"},
    // --- Gastro ---
    {de:"die Appendizitis",fr:"appendicite"},{de:"die Cholezystitis",fr:"cholécystite"},
    {de:"die Pankreatitis",fr:"pancréatite"},{de:"die Gastroskopie",fr:"gastroscopie"},
    {de:"die Koloskopie",fr:"coloscopie"},{de:"der Ileus",fr:"occlusion"},
    // --- Neurologie ---
    {de:"der Schlaganfall",fr:"AVC"},{de:"die Epilepsie",fr:"épilepsie"},
    {de:"die Meningitis",fr:"méningite"},{de:"die Lähmung",fr:"paralysie"},
    {de:"der Tremor",fr:"tremblement"},{de:"die Bewusstseinsstörung",fr:"trouble de conscience"},
    // --- Néphrologie ---
    {de:"die Niereninsuffizienz",fr:"insuffisance rénale"},{de:"die Dialyse",fr:"dialyse"},
    {de:"der Harnwegsinfekt",fr:"infection urinaire"},{de:"die Elektrolytstörung",fr:"trouble électrolytique"},
    // --- Infectiologie ---
    {de:"die Sepsis",fr:"sepsis"},{de:"die Infektion",fr:"infection"},
    {de:"das Antibiogramm",fr:"antibiogramme"},{de:"die Blutkultur",fr:"hémoculture"},
    {de:"die Resistenz",fr:"résistance"},{de:"die Quarantäne",fr:"quarantaine"},
    // --- Endocrinologie ---
    {de:"der Diabetes mellitus",fr:"diabète"},{de:"die Hypothyreose",fr:"hypothyroïdie"},
    {de:"die Hyperthyreose",fr:"hyperthyroïdie"},{de:"das Insulin",fr:"insuline"},
    {de:"der Blutzucker",fr:"glycémie"},
    // --- Hématologie ---
    {de:"die Anämie",fr:"anémie"},{de:"die Leukozytose",fr:"leucocytose"},
    {de:"die Thrombozytopenie",fr:"thrombopénie"},{de:"die Gerinnung",fr:"coagulation"},
    {de:"der INR-Wert",fr:"INR"},{de:"die Transfusion",fr:"transfusion"},
    // --- Biologie / Labo ---
    {de:"die Blutentnahme",fr:"prise de sang"},{de:"das Labor",fr:"laboratoire"},
    {de:"die Blutgasanalyse (BGA)",fr:"gaz du sang"},{de:"das Differenzialblutbild",fr:"NFS"},
    {de:"die Leberwerte",fr:"bilan hépatique"},{de:"die Nierenwerte",fr:"bilan rénal"},
    {de:"der CRP-Wert",fr:"CRP"},{de:"die Gerinnung",fr:"bilan de coagulation"},
    // --- Angiologie spécifique ---
    {de:"die periphere arterielle Verschlusskrankheit (pAVK)",fr:"AOMI"},
    {de:"der Knöchel-Arm-Index (ABI)",fr:"index cheville-bras (IPS)"},
    {de:"die Karotisstenose",fr:"sténose carotidienne"},
    {de:"die tiefe Venenthrombose (TVT)",fr:"thrombose veineuse profonde"},
    {de:"die Lungenembolie",fr:"embolie pulmonaire"},
    {de:"die Varikosis",fr:"maladie variqueuse"},
    {de:"die endovaskuläre Therapie",fr:"traitement endovasculaire"},
    {de:"die perkutane transluminale Angioplastie (PTA)",fr:"angioplastie"},
    {de:"der Stentgraft",fr:"endoprothèse"},{de:"die Thrombektomie",fr:"thrombectomie"},
    {de:"die Lyse",fr:"thrombolyse"},{de:"der Kollateralkreislauf",fr:"circulation collatérale"},
    {de:"die Gehstrecke",fr:"périmètre de marche"},{de:"der Ruheschmerz",fr:"douleur de repos"},
    {de:"das Ulkus",fr:"ulcère"},{de:"die Gangrän",fr:"gangrène"},
    {de:"die Amputation",fr:"amputation"},{de:"der Wundheilungsstörung",fr:"trouble de cicatrisation"},
    // --- Organisation hospitalière ---
    {de:"die Aufnahme",fr:"admission"},{de:"die Entlassung",fr:"sortie"},
    {de:"die Einwilligung",fr:"consentement"},{de:"die Schweigepflicht",fr:"secret médical"},
    {de:"die Patientenverfügung",fr:"directives anticipées"},{de:"der Behandlungsplan",fr:"plan de traitement"},
    {de:"die Fallbesprechung",fr:"staff/discussion de cas"},{de:"die Fortbildung",fr:"formation continue"},
    {de:"die Dokumentation",fr:"documentation"},{de:"die Verlegung",fr:"transfert"},
    // --- Verbes essentiels ---
    {de:"untersuchen",fr:"examiner"},{de:"behandeln",fr:"traiter"},{de:"verordnen",fr:"prescrire"},
    {de:"überweisen",fr:"référer"},{de:"entlassen",fr:"libérer"},{de:"aufnehmen",fr:"admettre"},
    {de:"verbinden",fr:"panser"},{de:"nähen",fr:"suturer"},{de:"intubieren",fr:"intuber"},
    {de:"reanimieren",fr:"réanimer"},{de:"punktieren",fr:"ponctionner"},{de:"auskultieren",fr:"ausculter"},
    {de:"dokumentieren",fr:"documenter"},{de:"besprechen",fr:"discuter"},{de:"einleiten",fr:"initier"},
    // --- Communication ---
    {de:"die Aufklärung",fr:"information du patient"},{de:"die Angehörigen",fr:"proches/famille"},
    {de:"die Beschwerde",fr:"plainte/symptôme"},{de:"die Vorerkrankung",fr:"antécédent"},
    {de:"die Familienanamnese",fr:"antécédents familiaux"},{de:"die Sozialanamnese",fr:"anamnèse sociale"},
    {de:"die Compliance",fr:"observance"},{de:"die Prognose",fr:"pronostic"},
    {de:"die Indikation",fr:"indication"},{de:"die Kontraindikation",fr:"contre-indication"},
    // --- Matériel ---
    {de:"der Katheter",fr:"cathéter"},{de:"die Kanüle",fr:"canule"},
    {de:"die Infusionspumpe",fr:"pousse-seringue"},{de:"der Blasenkatheter",fr:"sonde urinaire"},
    {de:"die Magensonde",fr:"sonde gastrique"},{de:"das Pulsoximeter",fr:"oxymètre de pouls"},
    {de:"das Stethoskop",fr:"stéthoscope"},{de:"die Blutdruckmanschette",fr:"brassard tensionnel"}
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
  {q:"Weitere Interessen?",h:"E-Health + EmotionsCare",r:"Ich habe ein Unternehmen im Bereich digitale Gesundheit gegründet. Das stärkt meine analytischen Fähigkeiten."},
  // === 5 NOUVELLES QUESTIONS ===
  {q:"Was sind Ihre Schwächen?",h:"Honnêteté + amélioration + allemand",r:"Mein Deutsch ist noch nicht perfekt, aber ich arbeite intensiv daran. Ich neige dazu, zu viel Verantwortung zu übernehmen — das lerne ich zu delegieren."},
  {q:"Warum die Schweiz?",h:"Formation + qualité + bilingue",r:"Die Schweiz bietet eine exzellente Weiterbildung, hohe Standards und ein multikulturelles Umfeld. Das bilingue Biel passt perfekt zu meinem Profil."},
  {q:"Wie lösen Sie Konflikte im Team?",h:"Écoute + dialogue + solution",r:"Ich suche immer zuerst das Gespräch. In der Notaufnahme habe ich gelernt, ruhig zu bleiben und gemeinsam Lösungen zu finden."},
  {q:"Warum möchten Sie Ihre aktuelle Stelle verlassen?",h:"Évolution + spécialisation + positif",r:"Ich bin dankbar für die Erfahrung in der Notaufnahme, aber ich möchte mich jetzt spezialisieren. Die Angiologie ist mein Ziel."},
  {q:"Gehaltsvorstellungen?",h:"Flexible + convention + valeur",r:"Ich orientiere mich an den üblichen Konditionen für Assistenzärzte in der Schweiz und bin offen für Ihr Angebot."}
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
  ],exercises:[
    {q:"Ich untersuche ___ Patienten.",fr:"J'examine ___ patient. (accusatif masculin)",opts:["den","dem","der","das"],a:"den"},
    {q:"Der Arzt hilft ___ Patientin.",fr:"Le médecin aide ___ patiente. (datif féminin)",opts:["die","der","den","das"],a:"der"},
    {q:"___ Blutdruck ist zu hoch.",fr:"___ tension artérielle est trop élevée. (nominatif masc.)",opts:["Der","Die","Das","Den"],a:"Der"}
  ]},
  {title:"Verbes modaux",items:[
    {l:"können",e:"pouvoir — Ich kann untersuchen"},{l:"müssen",e:"devoir — Sie müssen nüchtern bleiben"},
    {l:"möchten",e:"souhaiter — Ich möchte mich vorstellen"},{l:"dürfen",e:"permission — Dürfen wir besprechen?"}
  ],exercises:[
    {q:"Sie ___ nüchtern bleiben. (devoir)",fr:"Elles/Ils ___ rester à jeun.",opts:["müssen","können","dürfen","möchten"],a:"müssen"},
    {q:"___ ich eine Frage stellen? (permission)",fr:"___ je poser une question ?",opts:["Darf","Muss","Kann","Will"],a:"Darf"},
    {q:"Ich ___ mich vorstellen. (souhaiter)",fr:"Je ___ me présenter.",opts:["möchte","muss","darf","kann"],a:"möchte"}
  ]},
  {title:"Ordre des mots",items:[
    {l:"Principale",e:"S + V2 + ... + participe EN FIN"},
    {l:"Subordonnée",e:"weil/dass/wenn + S + ... + V EN FIN"},
    {l:"Exemple",e:"Ich glaube, dass der Patient eine Thrombose hat."}
  ],exercises:[
    {q:"Ich glaube, dass der Patient Fieber ___.",fr:"Je crois que le patient ___ de la fièvre. (verbe EN FIN en subordonnée)",opts:["hat","haben","habe","habt"],a:"hat"},
    {q:"Er kommt nicht, ___ er krank ist.",fr:"Il ne vient pas, ___ il est malade.",opts:["weil","denn","und","oder"],a:"weil"},
    {q:"Ich habe den Patienten ___.",fr:"J'ai ___ le patient. (participe passé en fin de phrase)",opts:["untersucht","untersuche","untersuchen","untersuchte"],a:"untersucht"}
  ]},
  {title:"Passif médical",items:[
    {l:"Présent",e:"wird untersucht (est examiné)"},{l:"Passé",e:"wurde operiert (a été opéré)"},
    {l:"Modal",e:"muss untersucht werden (doit être examiné)"}
  ],exercises:[
    {q:"Der Patient ___ morgen operiert. (futur passif)",fr:"Le patient ___ opéré demain.",opts:["wird","wurde","ist","hat"],a:"wird"},
    {q:"Die Wunde ___ gestern genäht. (passé passif)",fr:"La plaie ___ suturée hier.",opts:["wurde","wird","ist","hat"],a:"wurde"},
    {q:"Der Blutdruck muss ___ werden.",fr:"La tension artérielle doit être ___ .",opts:["kontrolliert","kontrollieren","kontrolliere","kontrolle"],a:"kontrolliert"}
  ]},
  {title:"Perfekt médical",items:[
    {l:"Structure",e:"haben/sein + Partizip II en fin de phrase"},
    {l:"haben + PP",e:"Ich habe den Patienten untersucht."},
    {l:"sein + PP (mouvement)",e:"Der Patient ist aufgestanden."},
    {l:"Séparable",e:"aufnehmen → Ich habe den Patienten aufgenommen."}
  ],exercises:[
    {q:"Ich ___ den Patienten untersucht.",fr:"J'___ examiné le patient.",opts:["habe","bin","hat","ist"],a:"habe"},
    {q:"Der Patient ___ gestern aufgestanden.",fr:"Le patient ___ levé hier. (verbe de mouvement → sein)",opts:["ist","hat","habe","bin"],a:"ist"},
    {q:"Wir haben die Wunde ___. (nähen)",fr:"Nous avons ___ la plaie.",opts:["genäht","genähen","nähte","genährt"],a:"genäht"},
    {q:"Die Ärztin hat das Medikament ___. (verschreiben)",fr:"La médecin a ___ le médicament.",opts:["verschrieben","verschreibt","verschreiben","verschrieb"],a:"verschrieben"},
    {q:"Ich habe den Befund ___. (dokumentieren)",fr:"J'ai ___ le compte rendu.",opts:["dokumentiert","dokumentieren","dokumentiere","dokumentiertet"],a:"dokumentiert"}
  ]},
  {title:"Politesse",items:[
    {l:"Könnten Sie...",e:"Pourriez-vous..."},{l:"Ich würde gern...",e:"J'aimerais..."},
    {l:"Hätten Sie Zeit...",e:"Auriez-vous le temps..."}
  ],exercises:[
    {q:"___ Sie mir bitte helfen? (pourriez-vous)",fr:"___ vous m'aider s'il vous plaît ?",opts:["Könnten","Können","Konnten","Könnt"],a:"Könnten"},
    {q:"Ich ___ gern mehr über die Stelle erfahren.",fr:"J'___ volontiers en savoir plus sur le poste.",opts:["würde","werde","will","wollte"],a:"würde"},
    {q:"___ Sie morgen Zeit für ein Gespräch?",fr:"___ vous du temps pour un entretien demain ?",opts:["Hätten","Haben","Hatten","Hat"],a:"Hätten"}
  ]}
];

export const SCENARIOS = [
  {title:"TVP",icon:"🦵",sit:"Frau Müller, 58J. Schwellung linkes Bein seit 3 Tagen.",
    vocab:["die Schwellung","die Thrombose","der Kompressionstest","die Antikoagulation"],
    steps:["Anamnese: Seit wann? Risikofaktoren?","Duplexsonographie: Kompressionstest","Befund: Thrombose V. femoralis","Therapie: Antikoagulation + Kompression"]},
  {title:"Sténose carotide",icon:"🧠",sit:"Herr Schmidt, 72J. TIA vor 2 Wochen. Raucher.",
    vocab:["die TIA","die Stenose","die Karotis-TEA","der Stenosegrad"],
    steps:["Anamnese: TIA-Symptome?","Duplexsonographie A. carotis","Stenosegrad 80% ACI rechts","Empfehlung: Karotis-TEA besprechen"]},
  {title:"Insuff. veineuse",icon:"🦵",sit:"Frau Weber, 45J. Krampfadern, Schweregefühl.",
    vocab:["die Krampfader","der Refluxtest","die Sklerotherapie","die V. saphena magna"],
    steps:["Anamnese: Familie? Stehberuf?","Duplex: Refluxtest","Insuffizienz V. saphena magna","Therapie: Kompression, Sklerotherapie"]},
  {title:"AOMI",icon:"🚶",sit:"Herr Bauer, 65J, Raucher. Wadenschmerzen nach 200m.",
    vocab:["der ABI","die Claudicatio","das Fontaine-Stadium","die PTA"],
    steps:["ABI-Messung: 0.6 rechts","Duplex: Stenose A. femoralis","Fontaine-Stadium IIb","Gehtraining, ggf. PTA"]},
  // === 3 CAS CLINIQUES ANGIOLOGIE DÉTAILLÉS ===
  {title:"Anévrisme aorte abd.",icon:"🫀",sit:"Herr Keller, 74J. Zufallsbefund: Bauchaortenaneurysma 5,8 cm bei Routine-Ultraschall. Raucher seit 40 Jahren, Hypertonie, Hyperlipidämie. Asymptomatisch.",
    vocab:["das Bauchaortenaneurysma (BAA)","der Durchmesser","die Ruptur","die endovaskuläre Aneurysma-Reparatur (EVAR)","die offene Operation","der Stentgraft","die CT-Angiographie","die Operationsindikation"],
    steps:[
      "Anamnese: Risikofaktoren? Bauch- oder Rückenschmerzen? Familienanamnese?",
      "Klinische Untersuchung: Pulsierender Tumor im Abdomen tastbar",
      "Duplexsonographie: BAA infrarenal, maximaler Durchmesser 5,8 cm, kein Leck",
      "CT-Angiographie: Bestätigung des Befundes, Beurteilung der Anatomie für EVAR",
      "Interdisziplinäre Besprechung: Gefäßchirurgie + Angiologie — OP-Indikation bei >5,5 cm",
      "Therapieplanung: EVAR (endovaskulär) vs. offene OP — Patientenaufklärung",
      "Nachsorge: CT-Kontrolle nach 1, 6, 12 Monaten — Endoleak-Screening"
    ]},
  {title:"Ischémie aiguë MI",icon:"🚨",sit:"Frau Hoffmann, 68J. Plötzlicher Schmerz und Blässe rechtes Bein seit 2 Stunden. Vorhofflimmern bekannt, keine Antikoagulation. Kein Fußpuls rechts tastbar.",
    vocab:["der akute Verschluss","die Embolie","die 6 P (Pain, Pallor, Pulselessness, Paresthesia, Paralysis, Poikilothermia)","die Embolektomie","die Lyse","die Heparinisierung","die Revaskularisation","das Kompartmentsyndrom"],
    steps:[
      "Anamnese: Plötzlicher Beginn? Schmerz, Gefühlsstörung, Bewegungseinschränkung?",
      "Klinische Untersuchung: 6 P prüfen — Bein blass, kühl, kein Puls ab A. poplitea",
      "Sofortmaßnahmen: i.v. Heparin 5000 IE Bolus, Tieflagerung, Schmerzmittel",
      "Notfall-Duplexsonographie: Kein Fluss in A. poplitea und distal",
      "CT-Angiographie: Embolischer Verschluss A. poplitea rechts",
      "Notfall-OP: Embolektomie mit Fogarty-Katheter — Reperfusion erfolgreich",
      "Postoperativ: Heparinperfusor, Kompartment-Überwachung, orale Antikoagulation einleiten",
      "Kardiologie-Konsil: Vorhofflimmern — dauerhafte Antikoagulation indiziert"
    ]},
  {title:"Ulcère artériel",icon:"🦶",sit:"Herr Fischer, 78J, Diabetiker. Nicht heilendes Ulkus lateraler Malleolus rechts seit 8 Wochen. Ruheschmerz nachts. Raucher. ABI 0,4.",
    vocab:["das arterielle Ulkus","die kritische Extremitätenischämie (CLI)","der ABI","die pAVK Fontaine IV","die PTA","der Wundabstrich","die Revaskularisation","die Major-Amputation"],
    steps:[
      "Anamnese: Schmerzcharakter? Gehstrecke? Ruheschmerz? Wunddauer? Diabetes-Einstellung?",
      "Klinische Untersuchung: Ulkus 3x2 cm, nekrotischer Rand, fehlende Fußpulse beidseits",
      "ABI-Messung: rechts 0,4 — kritische Ischämie (Fontaine-Stadium IV)",
      "Duplexsonographie: Langstreckige Stenosen A. femoralis superficialis + A. tibialis anterior",
      "CT-Angiographie: Mehretagenverschlüsse — PTA-Möglichkeit evaluieren",
      "Interdisziplinäre Entscheidung: PTA + Stenting A. femoralis, Angiosom-gerechte Revaskularisation",
      "Wundmanagement: Debridement, feuchte Wundbehandlung, Antibiotika nach Abstrich",
      "Langzeit: Gehtraining, Rauchstopp, HbA1c-Optimierung, regelmäßige Kontrolle"
    ]}
];

export const CHECKLIST = [
  {cat:"📄 Documents",items:["CV DE+FR imprimé","Lettre motivation DE imprimée","Diplômes copies certifiées","Dossier MEBEKO complet","10 questions préparées écrites","Bloc-notes + stylo"]},
  {cat:"👔 Tenue",items:["Tenue professionnelle repassée","Chaussures propres confortables","Stéthoscope","Badge/pièce d'identité","Montre (pas téléphone)"]},
  {cat:"🚗 Logistique",items:["Trajet planifié (arrivée 15min avance)","Adresse exacte vérifiée","Téléphone chargé 100%","Numéro de contact secrétariat","Parapluie (au cas où)"]},
  {cat:"🧠 Mental",items:["Relire 10 phrases clés","Relire réponses entretien","Petit-déjeuner complet","3 respirations profondes","Écouter podcast DE 15min","JE SUIS MÉDECIN. JE MÉRITE CETTE PLACE."]}
];

export const MOTIV = [
  // Objectif clair
  "Tu passes de faisant fonction interne → médecin assistante en angiologie 🏆",
  "Le 30 mars, tu ne passes pas un entretien. Tu prends ta place. 🔥",
  "Ce poste = début du FMH en angiologie. Le vrai début de ta carrière ⭐",
  "Dr. Attias-Widmer t'attend. Le Gefäßzentrum Biel t'attend. Tu es prête.",
  "Imagine-toi le 1er avril en blouse au Gefäßzentrum, tes patients devant toi 🩺",
  // Suisse vs France
  "Suisse : salaire x3, formation structurée, respect du médecin. Tu mérites ça. 🇨🇭",
  "En Suisse, un assistant gagne 8 000-10 000 CHF/mois. En France? 1 800€ net. Le choix est fait.",
  "En Suisse, 50h/semaine max. En France, 80h sans compter. Qualité de vie = Suisse 🏔️",
  "FMH angiologie = titre reconnu dans toute l'Europe. La France ne t'offre pas ça.",
  "Bienne = ville bilingue FR/DE. Tu ne pars pas dans l'inconnu, tu vas vers TON environnement.",
  "La Suisse forme mieux, paie mieux, respecte mieux ses médecins. Point.",
  "Système de santé suisse = moyens, matériel, temps pour tes patients. Pas de pénurie.",
  "Congés, RTT, 13ème mois, mutuelle top, retraite solide — la Suisse protège ses médecins 🛡️",
  // Rappel du parcours
  "Tu as survécu aux urgences françaises. Tu peux TOUT faire 💪",
  "Tu as géré des polytraumas à 3h du matin. Un entretien en allemand? Easy.",
  "Chaque garde de nuit en France t'a préparée pour ce moment. Utilise cette force.",
  "Tu es médecin. Tu as sauvé des vies. Apprendre 150 mots d'allemand? Rien comparé à ça.",
  // Motivation quotidienne
  "Chaque mot allemand appris = un outil de plus pour tes futurs patients 📈",
  "L'inconfort est temporaire. Le FMH est pour toujours. Pousse encore.",
  "17 jours. 408 heures. C'est tout ce qui te sépare de ta nouvelle vie.",
  "Tu n'apprends pas l'allemand pour un examen. Tu l'apprends pour TES patients.",
  "Ton profil est unique : urgences + motivation + bilinguisme. Personne d'autre n'est toi.",
  "Du schaffst das! 🇩🇪 — Et tu le sais au fond de toi.",
  "Jetzt geht's los! Le moment c'est MAINTENANT. Pas demain. Maintenant. 🔥",
  "Chaque heure compte. Fais-la compter. Pas de scrolling, pas de distraction.",
  "La douleur de l'effort est temporaire. La fierté d'avoir réussi est éternelle 🌟",
  "Dans 3 semaines tu seras en Suisse. Dans 3 ans tu auras ton FMH. Tout commence ici.",
  "Le doute est normal. L'abandon ne l'est pas. Continue.",
  "Tu ne fais pas ça pour prouver quelque chose. Tu fais ça parce que tu le MÉRITES.",
];

export const SUISSE_AVANTAGES = [
  { icon: "💰", title: "Salaire x3 à x4", detail: "Assistant·e en Suisse : 8 000-10 000 CHF/mois vs 1 800€ net en France. Même après impôts et coût de la vie, tu gagnes nettement plus." },
  { icon: "📚", title: "Formation FMH structurée", detail: "Programme clair sur 5 ans, objectifs définis, supervision régulière, congrès financés. Le FMH est reconnu dans toute l'Europe." },
  { icon: "⏰", title: "Horaires respectés", detail: "50h/semaine max, gardes compensées en repos ou en salaire. Fini les 80h non comptées des hôpitaux français." },
  { icon: "🏔️", title: "Qualité de vie", detail: "Bienne : lac, montagnes, 30 min de Berne. Ville bilingue FR/DE. Nature au quotidien, transport impeccable." },
  { icon: "🏥", title: "Moyens hospitaliers", detail: "Matériel neuf, personnel suffisant, temps pour chaque patient. Pas de pénurie chronique comme en France." },
  { icon: "🛡️", title: "Protection sociale", detail: "13ème mois, mutuelle complète, système de retraite solide (3 piliers), congés payés respectés." },
  { icon: "🌍", title: "Bienne = transition douce", detail: "Ville bilingue français-allemand. Tu peux pratiquer ta médecine en français tout en progressant en allemand. Transition naturelle." },
  { icon: "📈", title: "Évolution de carrière", detail: "Chef·fe de clinique en 6-8 ans, ouverture de cabinet possible, reconnaissance internationale du titre FMH." },
];

export const OBJECTIF = {
  avant: "Faisant fonction interne — France",
  apres: "Médecin assistante en angiologie — Suisse",
  lieu: "Spitalzentrum Biel — Gefäßzentrum",
  chef: "Dr. Attias-Widmer",
  date: "30 mars 2026",
  fmh: "FMH Angiologie (5 ans)",
  specialite: "Angiologie : écho vasculaire, cathétérisme, interventions endovasculaires",
};

export const LVLS = ["Anfänger","Lehrling","Fortgeschritten","Kompetent","Experte","Meister","Chefarzt"];

// Builder Rank system — medical career progression
export const BUILDER_RANKS = [
  { id: "anfaenger", name: "Anfänger", nameShort: "ANF", icon: "🔰", minXp: 0, color: "text-muted-foreground", bg: "from-slate-500/15 to-slate-500/5", border: "border-slate-500/25", glow: "", desc: "Premier pas dans l'univers medical allemand" },
  { id: "famulant", name: "Famulant", nameShort: "FAM", icon: "📋", minXp: 150, color: "text-info", bg: "from-info/15 to-info/5", border: "border-info/25", glow: "shadow-info/10", desc: "Tu observes, tu apprends, tu poses les fondations" },
  { id: "assistenzarzt", name: "Assistenzarzt", nameShort: "ASS", icon: "🩺", minXp: 400, color: "text-emerald-400", bg: "from-emerald-500/15 to-emerald-500/5", border: "border-emerald-500/25", glow: "shadow-emerald-500/15", desc: "Tu construis activement ton arsenal medical" },
  { id: "oberarzt", name: "Oberarzt", nameShort: "OA", icon: "⚕️", minXp: 800, color: "text-violet-400", bg: "from-violet-500/15 to-violet-500/5", border: "border-violet-500/25", glow: "shadow-violet-500/15", desc: "Maitrise solide — tu diriges ton apprentissage" },
  { id: "leitender", name: "Leitender Oberarzt", nameShort: "LOA", icon: "🏅", minXp: 1500, color: "text-amber-400", bg: "from-amber-500/15 to-amber-500/5", border: "border-amber-500/25", glow: "shadow-amber-500/20", desc: "Excellence et autonomie — le Gefäßzentrum t'attend" },
  { id: "chefarzt", name: "Chefarzt", nameShort: "CA", icon: "👑", minXp: 3000, color: "text-amber-300", bg: "from-amber-400/20 to-amber-400/5", border: "border-amber-400/30", glow: "shadow-amber-400/25", desc: "Maitrise absolue — tu es prete pour tout" },
] as const;

export type BuilderRankId = typeof BUILDER_RANKS[number]["id"];

export function getBuilderRank(xp: number) {
  let rank = BUILDER_RANKS[0];
  for (const r of BUILDER_RANKS) {
    if (xp >= r.minXp) rank = r;
  }
  const idx = BUILDER_RANKS.indexOf(rank);
  const nextRank = idx < BUILDER_RANKS.length - 1 ? BUILDER_RANKS[idx + 1] : null;
  const progressToNext = nextRank
    ? Math.min(1, (xp - rank.minXp) / (nextRank.minXp - rank.minXp))
    : 1;
  const xpToNext = nextRank ? nextRank.minXp - xp : 0;
  return { rank, nextRank, progressToNext, xpToNext, rankIndex: idx };
}

// === TEMPLATES D'ÉCRITURE ===
export const TEMPLATES = [
  {
    title: "📧 Email de remerciement (Jour J soir)",
    icon: "📧",
    de: `Sehr geehrte Frau Dr. Attias-Widmer,

ich möchte mich herzlich für die Möglichkeit bedanken, heute im Gefäßzentrum des Spitalzentrums Biel zu hospitieren.

Der Einblick in die Arbeit Ihres Teams — insbesondere in der Gefäßsonographie und der interdisziplinären Zusammenarbeit — hat mich sehr beeindruckt und meine Motivation für die Angiologie weiter gestärkt.

Ich würde mich sehr freuen, Teil Ihres Teams werden zu dürfen, und stehe Ihnen für weitere Fragen jederzeit zur Verfügung.

Mit freundlichen Grüßen,
Dr. Laeticia Motongane`,
    fr: `Chère Dr. Attias-Widmer,

Je tiens à vous remercier chaleureusement pour l'opportunité d'observer aujourd'hui au centre vasculaire du Spitalzentrum Biel.

L'aperçu du travail de votre équipe — en particulier l'échographie vasculaire et la collaboration interdisciplinaire — m'a beaucoup impressionnée et a renforcé ma motivation pour l'angiologie.

Je serais ravie de rejoindre votre équipe et reste à votre disposition pour toute question.

Cordialement,
Dr. Laeticia Motongane`
  },
  {
    title: "📋 Befundbericht (rapport médical)",
    icon: "📋",
    de: `BEFUNDBERICHT — Duplexsonographie

Patient: [Name], [Geburtsdatum]
Datum: [Datum]
Zuweiser: [Arzt]
Fragestellung: [V.a. TVP / Stenose / etc.]

Technik: Farbkodierte Duplexsonographie

Befund:
- [Beschreibung der Gefäße]
- [Flussmessung / Kompressionstest]
- [Wandmorphologie]

Beurteilung:
[Zusammenfassung und Empfehlung]

gez. Dr. [Name]`,
    fr: `RAPPORT D'EXAMEN — Écho-Doppler

Patient: [Nom], [Date de naissance]
Date: [Date]
Prescripteur: [Médecin]
Question: [Suspicion TVP / Sténose / etc.]

Technique: Écho-Doppler couleur

Résultat:
- [Description des vaisseaux]
- [Mesure de flux / Test de compression]
- [Morphologie pariétale]

Conclusion:
[Résumé et recommandation]

Signé Dr. [Nom]`
  },
  {
    title: "📝 Übergabe SBAR (transmissions)",
    icon: "📝",
    de: `ÜBERGABE — SBAR-Schema

S — Situation:
"Ich übergebe Herrn/Frau [Name], [Alter] Jahre, aufgenommen wegen [Grund]."

B — Background:
"Vorerkrankungen: [Liste]. Aktuelle Medikation: [Liste]."

A — Assessment:
"Aktuell: [Vitalzeichen, Beschwerden, Veränderungen]."

R — Recommendation:
"Ich empfehle: [nächste Schritte, Kontrollen, Konsile]."`,
    fr: `TRANSMISSION — Schéma SBAR

S — Situation:
"Je transmets M./Mme [Nom], [Âge] ans, admis(e) pour [Motif]."

B — Background:
"Antécédents: [Liste]. Traitement actuel: [Liste]."

A — Assessment:
"Actuellement: [Constantes, plaintes, évolution]."

R — Recommendation:
"Je recommande: [prochaines étapes, contrôles, avis]."`,
  },
  {
    title: "✉️ Lettre de motivation",
    icon: "✉️",
    de: `Sehr geehrte Frau Dr. Attias-Widmer,

mit großem Interesse bewerbe ich mich um die Stelle als Assistenzärztin in der Angiologie am Spitalzentrum Biel.

Nach meinem Medizinstudium in Frankreich und meiner Tätigkeit in der Notaufnahme möchte ich mich nun in der Gefäßmedizin spezialisieren. Ihre Abteilung als Kategorie-B-Weiterbildungsstätte bietet ideale Voraussetzungen.

Meine Erfahrung in der Notfallmedizin hat mir Belastbarkeit, Teamfähigkeit und schnelle Entscheidungsfindung vermittelt. Das bilingue Umfeld in Biel passt hervorragend zu meinem deutsch-französischen Profil.

Ich freue mich auf ein persönliches Gespräch.

Mit freundlichen Grüßen,
Dr. Laeticia Motongane`,
    fr: `Chère Dr. Attias-Widmer,

C'est avec grand intérêt que je postule au poste de médecin assistante en angiologie au Spitalzentrum Biel.

Après mes études de médecine en France et mon expérience aux urgences, je souhaite me spécialiser en médecine vasculaire. Votre service en tant que lieu de formation catégorie B offre des conditions idéales.

Mon expérience en médecine d'urgence m'a apporté résistance au stress, esprit d'équipe et prise de décision rapide. L'environnement bilingue de Bienne correspond parfaitement à mon profil franco-allemand.

Je me réjouis d'un entretien personnel.

Cordialement,
Dr. Laeticia Motongane`
  }
];
