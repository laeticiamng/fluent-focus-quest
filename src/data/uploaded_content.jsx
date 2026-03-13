import { useState, useEffect, useCallback, useRef } from "react";

const BG = "#0B0E14";
const BG2 = "#141820";
const BG3 = "#1C2333";
const BG4 = "#2D3548";
const RED = "#FF4757";
const ORANGE = "#FFA502";
const GREEN = "#2ED573";
const BLUE = "#3742FA";
const PURPLE = "#A55EEA";
const PINK = "#FF6B81";
const CYAN = "#18DCFF";
const WHITE = "#E8ECF1";
const MUTED = "#6B7394";
const FAINT = "#3D4663";
const GOLD = "#FFD700";
const FONT = "system-ui, -apple-system, sans-serif";

const TARGET = new Date("2026-03-30T08:00:00");
const SKEY = "op-bienne-v4";

async function loadSt() {
  try { const r = await window.storage.get(SKEY); return r ? JSON.parse(r.value) : null; }
  catch (e) { return null; }
}
async function saveSt(s) {
  try { await window.storage.set(SKEY, JSON.stringify(s)); } catch (e) { /* */ }
}

const PROG = [
  { date: "2026-03-11", title: "Phonétique & Bases", w: 1, tasks: [
    { t: "Matin", d: "Alphabet, prononciation (ch, sch, z, ei, eu, ie, ü, ö, ä). Seedlang 30min", tp: "learn" },
    { t: "Midi", d: "Articles der/die/das. Créer 30 flashcards Anki", tp: "grammar" },
    { t: "Soir", d: "Se présenter: Ich bin Ärztin, ich arbeite in der Notaufnahme. x5", tp: "speak" }
  ]},
  { date: "2026-03-12", title: "Nombres & Verbes", w: 1, tasks: [
    { t: "Matin", d: "Nombres 1-1000, heure, jours, mois", tp: "learn" },
    { t: "Midi", d: "Présent: verbes réguliers + sein/haben. 15 verbes", tp: "grammar" },
    { t: "Soir", d: "Dialogue accueil patient (Name? Geburtsdatum?). x5", tp: "speak" }
  ]},
  { date: "2026-03-13", title: "Corps humain", w: 1, tasks: [
    { t: "Matin", d: "Kopf, Herz, Lunge, Bein, Arm, Bauch, Haut, Blut...", tp: "learn" },
    { t: "Midi", d: "Accusatif (den/einen). Ich untersuche den Patienten", tp: "grammar" },
    { t: "Soir", d: "Slow German 2 épisodes + répétition", tp: "listen" }
  ]},
  { date: "2026-03-14", title: "Symptômes & Questions", w: 1, tasks: [
    { t: "Matin", d: "Schmerzen, Fieber, Atemnot, Schwindel, Schwellung...", tp: "learn" },
    { t: "Midi", d: "Négation (nicht/kein), W-Fragen: wo, was, wie, wann", tp: "grammar" },
    { t: "Soir", d: "Interrogatoire patient complet. 10 questions par coeur", tp: "speak" }
  ]},
  { date: "2026-03-15", title: "Vocabulaire Angiologie", w: 1, tasks: [
    { t: "Matin", d: "Arterie, Vene, Thrombose, Embolie, Stenose, Stent, Bypass", tp: "learn" },
    { t: "Midi", d: "Datif (dem/der). Prépositions: in, an, auf, mit, nach", tp: "grammar" },
    { t: "Soir", d: "Mini-présentation parcours en allemand (10 phrases)", tp: "write" }
  ]},
  { date: "2026-03-16", title: "Consolidation S1", w: 1, tasks: [
    { t: "Matin", d: "RÉVISION: toutes flashcards, podcasts, notes", tp: "review" },
    { t: "Midi", d: "Verbes modaux: können, müssen, sollen, wollen, dürfen", tp: "grammar" },
    { t: "Soir", d: "1ère simulation entretien. Timer 10 min. Enregistrer!", tp: "speak" }
  ]},
  { date: "2026-03-17", title: "Milieu hospitalier", w: 1, tasks: [
    { t: "Matin", d: "Notaufnahme, Station, Visite, Befund, Diagnose, Therapie", tp: "learn" },
    { t: "Midi", d: "Lettre de motivation courte en allemand", tp: "write" },
    { t: "Soir", d: "YouTube Deutsch für Ärzte (1h) + notes", tp: "listen" }
  ]},
  { date: "2026-03-18", title: "Angiologie avancé", w: 2, tasks: [
    { t: "Matin", d: "Duplexsonographie, Angiographie, Katheterisierung", tp: "learn" },
    { t: "Midi", d: "Perfekt: ich habe untersucht. 20 participes médicaux", tp: "grammar" },
    { t: "Soir", d: "Rédiger un Befundbericht simple en allemand", tp: "write" }
  ]},
  { date: "2026-03-19", title: "Phrases cliniques", w: 2, tasks: [
    { t: "Matin", d: "Der Patient klagt über... / Die Untersuchung zeigt...", tp: "learn" },
    { t: "Midi", d: "Subordonnées: weil, dass, wenn — verbe EN FIN", tp: "grammar" },
    { t: "Soir", d: "Documentaire médical en allemand 45 min", tp: "listen" }
  ]},
  { date: "2026-03-20", title: "Écho vasculaire", w: 2, tasks: [
    { t: "Matin", d: "Farbdoppler, Flussmessung, Wandverdickung, Plaque", tp: "learn" },
    { t: "Midi", d: "Konjunktiv II: Könnten Sie..., Ich würde gern...", tp: "grammar" },
    { t: "Soir", d: "Expliquer un examen écho à un patient. Enregistrer", tp: "speak" }
  ]},
  { date: "2026-03-21", title: "Pathologies veineuses", w: 2, tasks: [
    { t: "Matin", d: "Krampfadern, Besenreiser, Kompressionstherapie", tp: "learn" },
    { t: "Midi", d: "Prépositions temporelles (seit, vor, nach)", tp: "grammar" },
    { t: "Soir", d: "Résumer 3 cas cliniques en allemand", tp: "write" }
  ]},
  { date: "2026-03-22", title: "Transmissions", w: 2, tasks: [
    { t: "Matin", d: "Übergabe SBAR, Besprechung, Konsil, Visite", tp: "learn" },
    { t: "Midi", d: "Passif: wird untersucht, wurde operiert", tp: "grammar" },
    { t: "Soir", d: "Jeu de rôle: Übergabe SBAR en allemand. Timer 3min", tp: "speak" }
  ]},
  { date: "2026-03-23", title: "Consolidation S2", w: 2, tasks: [
    { t: "Matin", d: "RÉVISION S2: flashcards + relecture textes", tp: "review" },
    { t: "Midi", d: "Vocabulaire entretien: Weiterbildung, Facharztausbildung", tp: "learn" },
    { t: "Soir", d: "Simulation entretien complète 20 min. Enregistrer!", tp: "speak" }
  ]},
  { date: "2026-03-24", title: "Urgences + Culture CH", w: 2, tasks: [
    { t: "Matin", d: "Urgences vasculaires: akuter Verschluss, Lungenembolie", tp: "learn" },
    { t: "Midi", d: "Culture suisse: Grüezi, ponctualité, hiérarchie", tp: "learn" },
    { t: "Soir", d: "3 podcasts médicaux + shadowing", tp: "listen" }
  ]},
  { date: "2026-03-25", title: "Préparation entretien", w: 3, tasks: [
    { t: "Matin", d: "Relire l'annonce. 15 questions d'entretien", tp: "speak" },
    { t: "Midi", d: "Relatives, conjonctions avancées", tp: "grammar" },
    { t: "Soir", d: "Simulation entretien FILMÉE 30 min", tp: "speak" }
  ]},
  { date: "2026-03-26", title: "Jour d'observation prep", w: 3, tasks: [
    { t: "Matin", d: "Vocabulaire: zuschauen, mitmachen, Arbeitsablauf", tp: "learn" },
    { t: "Midi", d: "Préparer 10 questions intelligentes en allemand", tp: "write" },
    { t: "Soir", d: "Commenter un examen écho en direct en allemand", tp: "speak" }
  ]},
  { date: "2026-03-27", title: "Révision totale", w: 3, tasks: [
    { t: "Matin", d: "TOUTES flashcards, TOUS enregistrements", tp: "review" },
    { t: "Midi", d: "Email de confirmation à Dr. Attias-Widmer", tp: "write" },
    { t: "Soir", d: "Dernière simulation entretien — timer strict", tp: "speak" }
  ]},
  { date: "2026-03-28", title: "Immersion finale", w: 3, tasks: [
    { t: "Matin", d: "2h immersion totale allemand. Zéro français", tp: "listen" },
    { t: "Midi", d: "Relire TOUS ses textes. Mémoriser 10 phrases clés", tp: "review" },
    { t: "Soir", d: "Préparer tenue + documents + trajet", tp: "rest" }
  ]},
  { date: "2026-03-29", title: "Repos actif", w: 3, tasks: [
    { t: "Matin", d: "Révision légère: entretien, angio, politesse", tp: "review" },
    { t: "Midi", d: "Dernier run-through oral complet", tp: "speak" },
    { t: "Soir", d: "REPOS. Coucher tôt. Du bist bereit.", tp: "rest" }
  ]},
  { date: "2026-03-30", title: "JOUR J", w: 3, tasks: [
    { t: "6h", d: "Notes clés + petit-déj + confiance. Du schaffst das!", tp: "speak" },
    { t: "Journée", d: "OBSERVATION + ENTRETIEN — Dr. Attias-Widmer", tp: "speak" },
    { t: "Soir", d: "Debrief + email de remerciement", tp: "write" }
  ]}
];

const DECKS = [
  { name: "Angiologie", icon: "🫀", color: RED, cards: [
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
  { name: "Corps humain", icon: "🦴", color: BLUE, cards: [
    {de:"der Kopf",fr:"tête"},{de:"das Herz",fr:"coeur"},{de:"die Lunge",fr:"poumon"},
    {de:"das Bein",fr:"jambe"},{de:"der Arm",fr:"bras"},{de:"der Bauch",fr:"ventre"},
    {de:"die Haut",fr:"peau"},{de:"das Blut",fr:"sang"},{de:"der Knochen",fr:"os"},
    {de:"die Niere",fr:"rein"},{de:"die Leber",fr:"foie"},{de:"der Magen",fr:"estomac"},
    {de:"der Rücken",fr:"dos"},{de:"der Hals",fr:"cou"},{de:"die Schulter",fr:"épaule"},
    {de:"das Knie",fr:"genou"},{de:"der Fuß",fr:"pied"},{de:"die Hand",fr:"main"},
    {de:"die Brust",fr:"poitrine"},{de:"das Gehirn",fr:"cerveau"}
  ]},
  { name: "Symptômes", icon: "🤒", color: ORANGE, cards: [
    {de:"die Schmerzen",fr:"douleurs"},{de:"das Fieber",fr:"fièvre"},{de:"die Atemnot",fr:"dyspnée"},
    {de:"der Schwindel",fr:"vertige"},{de:"die Schwellung",fr:"oedème"},{de:"die Übelkeit",fr:"nausée"},
    {de:"das Erbrechen",fr:"vomissement"},{de:"der Durchfall",fr:"diarrhée"},{de:"der Husten",fr:"toux"},
    {de:"die Blutung",fr:"hémorragie"},{de:"die Müdigkeit",fr:"fatigue"},{de:"die Taubheit",fr:"engourdissement"},
    {de:"das Kribbeln",fr:"fourmillement"},{de:"die Claudicatio",fr:"claudication"},
    {de:"die Zyanose",fr:"cyanose"},{de:"der Brustschmerz",fr:"douleur thoracique"}
  ]},
  { name: "Hôpital", icon: "🏥", color: GREEN, cards: [
    {de:"die Notaufnahme",fr:"urgences"},{de:"die Station",fr:"service"},{de:"die Visite",fr:"visite"},
    {de:"der Befund",fr:"résultat"},{de:"die Diagnose",fr:"diagnostic"},{de:"die Therapie",fr:"traitement"},
    {de:"die Überweisung",fr:"transfert"},{de:"das Konsil",fr:"avis spécialisé"},
    {de:"die Übergabe",fr:"transmission"},{de:"die Besprechung",fr:"réunion"},
    {de:"der Facharzt",fr:"spécialiste FMH"},{de:"die Weiterbildung",fr:"form. postgrad."},
    {de:"der Oberarzt",fr:"chef de clinique"},{de:"der Chefarzt",fr:"médecin-chef"},
    {de:"der Assistenzarzt",fr:"méd. assistant"},{de:"die Blutentnahme",fr:"prise de sang"}
  ]},
  { name: "Entretien", icon: "💼", color: PURPLE, cards: [
    {de:"die Bewerbung",fr:"candidature"},{de:"das Vorstellungsgespräch",fr:"entretien"},
    {de:"die Stärke",fr:"point fort"},{de:"die Teamarbeit",fr:"travail d'équipe"},
    {de:"die Eigeninitiative",fr:"initiative"},{de:"die Belastbarkeit",fr:"résistance stress"},
    {de:"die Facharztausbildung",fr:"formation FMH"},{de:"das Ziel",fr:"objectif"},
    {de:"die Hospitation",fr:"observation"},{de:"die Probezeit",fr:"période essai"},
    {de:"der Lebenslauf",fr:"CV"},{de:"die Weiterbildungsstätte",fr:"lieu formation"}
  ]},
  { name: "Phrases cliniques", icon: "💬", color: CYAN, cards: [
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

const IVW = [
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

const SURVIVAL = [
  {cat:"Quand tu ne comprends pas",color:ORANGE,items:[
    {de:"Könnten Sie das bitte wiederholen?",fr:"Pourriez-vous répéter?"},
    {de:"Könnten Sie langsamer sprechen?",fr:"Plus lentement svp?"},
    {de:"Ich habe nicht ganz verstanden.",fr:"Je n'ai pas tout compris."}
  ]},
  {cat:"Gagner du temps",color:BLUE,items:[
    {de:"Lassen Sie mich kurz nachdenken.",fr:"Laissez-moi réfléchir."},
    {de:"Wenn ich richtig verstehe...",fr:"Si je comprends bien..."},
    {de:"Ich würde sagen, dass...",fr:"Je dirais que..."}
  ]},
  {cat:"Small talk équipe",color:GREEN,items:[
    {de:"Seit wann arbeiten Sie hier?",fr:"Depuis combien de temps ici?"},
    {de:"Das ist sehr interessant, danke!",fr:"Très intéressant, merci!"},
    {de:"Ich freue mich, hier zu sein.",fr:"Ravie d'être ici."}
  ]},
  {cat:"Pendant l'observation",color:PURPLE,items:[
    {de:"Darf ich zuschauen?",fr:"Puis-je observer?"},
    {de:"Darf ich eine Frage stellen?",fr:"Puis-je poser une question?"},
    {de:"Das möchte ich unbedingt lernen.",fr:"Je veux absolument apprendre ça."}
  ]},
  {cat:"Politesse suisse",color:GOLD,items:[
    {de:"Grüezi!",fr:"Bonjour (suisse)"},{de:"Merci vilmal!",fr:"Merci beaucoup (suisse)"},
    {de:"Uf Widerluege!",fr:"Au revoir (suisse)"},
    {de:"Es freut mich, Sie kennenzulernen.",fr:"Ravi(e) de vous rencontrer."}
  ]}
];

const GRAM = [
  {title:"Articles & Cas",color:BLUE,items:[
    {l:"Nominatif",e:"der / die / das / die (pl.)"},{l:"Accusatif",e:"den / die / das / die"},
    {l:"Datif",e:"dem / der / dem / den+n"},{l:"Astuce",e:"Accusatif=COD, Datif=COI (mit/bei/nach/zu)"}
  ]},
  {title:"Verbes modaux",color:PURPLE,items:[
    {l:"können",e:"pouvoir — Ich kann untersuchen"},{l:"müssen",e:"devoir — Sie müssen nüchtern bleiben"},
    {l:"möchten",e:"souhaiter — Ich möchte mich vorstellen"},{l:"dürfen",e:"permission — Dürfen wir besprechen?"}
  ]},
  {title:"Ordre des mots",color:GREEN,items:[
    {l:"Principale",e:"S + V2 + ... + participe EN FIN"},
    {l:"Subordonnée",e:"weil/dass/wenn + S + ... + V EN FIN"},
    {l:"Exemple",e:"Ich glaube, dass der Patient eine Thrombose hat."}
  ]},
  {title:"Passif médical",color:CYAN,items:[
    {l:"Présent",e:"wird untersucht (est examiné)"},{l:"Passé",e:"wurde operiert (a été opéré)"},
    {l:"Modal",e:"muss untersucht werden (doit être examiné)"}
  ]},
  {title:"Politesse",color:PINK,items:[
    {l:"Könnten Sie...",e:"Pourriez-vous..."},{l:"Ich würde gern...",e:"J'aimerais..."},
    {l:"Hätten Sie Zeit...",e:"Auriez-vous le temps..."}
  ]}
];

const SCENARIOS = [
  {title:"TVP",icon:"🦵",sit:"Frau Müller, 58J. Schwellung linkes Bein seit 3 Tagen.",
    steps:["Anamnese: Seit wann? Risikofaktoren?","Duplexsonographie: Kompressionstest","Befund: Thrombose V. femoralis","Therapie: Antikoagulation + Kompression"]},
  {title:"Sténose carotide",icon:"🧠",sit:"Herr Schmidt, 72J. TIA vor 2 Wochen. Raucher.",
    steps:["Anamnese: TIA-Symptome?","Duplexsonographie A. carotis","Stenosegrad 80% ACI rechts","Empfehlung: Karotis-TEA besprechen"]},
  {title:"Insuff. veineuse",icon:"🦵",sit:"Frau Weber, 45J. Krampfadern, Schweregefühl.",
    steps:["Anamnese: Familie? Stehberuf?","Duplex: Refluxtest","Insuffizienz V. saphena magna","Therapie: Kompression, Sklerotherapie"]},
  {title:"AOMI",icon:"🚶",sit:"Herr Bauer, 65J, Raucher. Wadenschmerzen nach 200m.",
    steps:["ABI-Messung: 0.6 rechts","Duplex: Stenose A. femoralis","Fontaine-Stadium IIb","Gehtraining, ggf. PTA"]}
];

const CHECKLIST = [
  {cat:"Documents",items:["CV DE+FR","Lettre motivation DE","Diplômes copies","Dossier MEBEKO","Questions préparées"]},
  {cat:"Tenue",items:["Tenue professionnelle","Stéthoscope","Trajet planifié (15min avance)","Téléphone chargé"]},
  {cat:"Mental",items:["Relire 10 phrases clés","Petit-déjeuner complet","Respirer 3x","JE SUIS MÉDECIN. JE MÉRITE CETTE PLACE."]}
];

const MOTIV = [
  "Ce poste = FMH angiologie","Chaque mot = un outil pour tes patients",
  "Tu as survécu aux urgences","Dr. Attias-Widmer t'attend le 30",
  "L'inconfort est temporaire. Le FMH est pour toujours",
  "Tu es médecin. Tu mérites cette place","Jetzt geht's los",
  "Ton profil est unique","Bienne t'attend","Chaque heure compte"
];

const TP_COLORS = { learn: BLUE, grammar: PURPLE, speak: RED, listen: ORANGE, write: GREEN, review: "#E67E22", rest: MUTED };
const TP_LABELS = { learn: "Apprendre", grammar: "Grammaire", speak: "Parler", listen: "Écouter", write: "Écrire", review: "Réviser", rest: "Repos" };
const LVLS = ["Anfänger","Lehrling","Fortgeschritten","Kompetent","Experte","Meister","Chefarzt"];

function Pill({ color, children }) {
  return (
    <span style={{ background: color + "22", color: color, fontSize: 10, padding: "2px 7px", borderRadius: 16, fontWeight: 700 }}>{children}</span>
  );
}

function Bar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: BG3, borderRadius: 6, height: 6, overflow: "hidden", width: "100%" }}>
      <div style={{ background: color || GREEN, height: "100%", width: pct + "%", transition: "width .4s", borderRadius: 6 }} />
    </div>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("dash");
  const [now, setNow] = useState(new Date());
  const [done, setDone] = useState({});
  const [xp, setXp] = useState(0);
  const [di, setDi] = useState(null);
  const [ci, setCi] = useState(0);
  const [flip, setFlip] = useState(false);
  const [qz, setQz] = useState(false);
  const [qS, setQS] = useState({ c: 0, t: 0 });
  const [qO, setQO] = useState([]);
  const [qA, setQA] = useState(null);
  const [ii, setIi] = useState(0);
  const [sa, setSa] = useState(false);
  const [mi, setMi] = useState(0);
  const [calD, setCalD] = useState(null);
  const [rat, setRat] = useState({});
  const [cl, setCl] = useState({});
  const [sci, setSci] = useState(0);
  const [scs, setScs] = useState(0);
  const [tmr, setTmr] = useState(0);
  const [tmrOn, setTmrOn] = useState(false);
  const [tmrM, setTmrM] = useState(25);
  const ref = useRef(null);

  useEffect(() => {
    loadSt().then(st => {
      if (st) { st.done && setDone(st.done); st.xp && setXp(st.xp); st.rat && setRat(st.rat); st.cl && setCl(st.cl); }
      setLoaded(true);
    });
  }, []);

  useEffect(() => { if (loaded) saveSt({ done, xp, rat, cl }); }, [done, xp, rat, cl, loaded]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setMi(i => (i + 1) % MOTIV.length), 5000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (tmrOn && tmr > 0) { ref.current = setTimeout(() => setTmr(t => t - 1), 1000); }
    else if (tmrOn && tmr === 0) { setTmrOn(false); setXp(x => x + 20); }
    return () => clearTimeout(ref.current);
  }, [tmrOn, tmr]);

  const diff = TARGET - now;
  const dd = Math.max(0, Math.floor(diff / 864e5));
  const hh = Math.max(0, Math.floor((diff % 864e5) / 36e5));
  const mn = Math.max(0, Math.floor((diff % 36e5) / 6e4));
  const sc = Math.max(0, Math.floor((diff % 6e4) / 1e3));
  const tStr = now.toISOString().split("T")[0];
  const tP = PROG.find(d => d.date === tStr) || PROG[0];
  const dNum = (PROG.findIndex(d => d.date === tStr) + 1) || 1;
  const tDone = tP.tasks.filter((_, i) => done[tP.date + "-" + i]).length;
  const totDone = Object.values(done).filter(Boolean).length;
  const totTasks = PROG.reduce((a, d) => a + d.tasks.length, 0);
  const pct = Math.round((totDone / totTasks) * 100);
  const level = Math.floor(xp / 100) + 1;
  const lvlPct = xp % 100;

  const toggle = (date, idx) => {
    const k = date + "-" + idx;
    const was = done[k];
    setDone(p => ({ ...p, [k]: !p[k] }));
    setXp(x => was ? Math.max(0, x - 25) : x + 25);
  };

  const mkO = useCallback((dk, idx) => {
    const c = dk.cards[idx];
    let o = [c.fr];
    const pool = dk.cards.map(x => x.fr).filter(f => f !== c.fr);
    while (o.length < Math.min(4, dk.cards.length)) {
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (!o.includes(r)) o.push(r);
    }
    return o.sort(() => Math.random() - 0.5);
  }, []);

  const startQuiz = (i) => { setDi(i); setQz(true); setCi(0); setQS({ c: 0, t: 0 }); setQA(null); setQO(mkO(DECKS[i], 0)); setTab("cards"); };
  const startFC = (i) => { setDi(i); setQz(false); setCi(0); setFlip(false); setTab("cards"); };

  const answer = (a) => {
    const correct = DECKS[di].cards[ci].fr;
    const ok = a === correct;
    setQA({ sel: a, correct: correct, ok: ok });
    setQS(s => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
    if (ok) setXp(x => x + 10);
    setTimeout(() => {
      if (ci < DECKS[di].cards.length - 1) {
        const n = ci + 1; setCi(n); setQA(null); setQO(mkO(DECKS[di], n));
      } else { setQA("done"); }
    }, 900);
  };

  const bx = { background: BG2, borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: "1px solid " + BG3 };
  const bt = { background: BG3, border: "none", color: WHITE, padding: "10px 18px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: FONT };

  if (!loaded) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontFamily: FONT }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 44 }}>🔥</div><div style={{ marginTop: 10 }}>Chargement...</div></div>
      </div>
    );
  }

  if (tab === "cards" && di !== null) {
    const dk = DECKS[di];
    if (qz) {
      const isDone = qA === "done";
      return (
        <div style={{ background: BG, minHeight: "100vh", fontFamily: FONT, color: WHITE, padding: 14 }}>
          <div style={{ maxWidth: 460, margin: "0 auto" }}>
            <button onClick={() => { setTab("vocab"); setQz(false); }} style={{ ...bt, background: "transparent", color: MUTED, marginBottom: 12 }}>← Retour</button>
            {isDone ? (
              <div style={{ textAlign: "center", marginTop: 30 }}>
                <div style={{ fontSize: 52 }}>{qS.c === qS.t ? "🏆" : "💪"}</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: "10px 0" }}>Quiz terminé!</h2>
                <div style={{ fontSize: 40, fontWeight: 900, color: qS.c === qS.t ? GREEN : ORANGE }}>{qS.c}/{qS.t}</div>
                <p style={{ color: MUTED, margin: "10px 0 20px" }}>+{qS.c * 10} XP</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={() => startQuiz(di)} style={{ ...bt, background: RED }}>Recommencer</button>
                  <button onClick={() => setTab("vocab")} style={bt}>Autres decks</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "12px 0" }}>
                  <span style={{ color: dk.color, fontWeight: 700, fontSize: 13 }}>{dk.icon} {dk.name}</span>
                  <span style={{ color: MUTED, fontSize: 12 }}>{ci + 1}/{dk.cards.length}</span>
                </div>
                <div style={{ ...bx, padding: "32px 18px", textAlign: "center", borderColor: dk.color + "33" }}>
                  <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Traduire</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{dk.cards[ci].de}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  {qO.map((o, i) => {
                    let bg = BG3;
                    let bd = "1px solid " + BG4;
                    if (qA && qA !== "done") {
                      if (o === qA.correct) { bg = GREEN + "33"; bd = "2px solid " + GREEN; }
                      else if (o === qA.sel && !qA.ok) { bg = RED + "33"; bd = "2px solid " + RED; }
                    }
                    return (
                      <button key={i} onClick={() => { if (!qA) answer(o); }} style={{ background: bg, border: bd, color: WHITE, padding: "13px 8px", borderRadius: 10, fontSize: 13, cursor: qA ? "default" : "pointer", fontFamily: FONT }}>{o}</button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 12 }}><Bar value={ci} max={dk.cards.length} color={dk.color} /></div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div style={{ background: BG, minHeight: "100vh", fontFamily: FONT, color: WHITE, padding: 14 }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <button onClick={() => setTab("vocab")} style={{ ...bt, background: "transparent", color: MUTED, marginBottom: 12 }}>← Retour</button>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "12px 0" }}>
            <span style={{ color: dk.color, fontWeight: 700 }}>{dk.icon} {dk.name}</span>
            <span style={{ color: MUTED }}>{ci + 1}/{dk.cards.length}</span>
          </div>
          <div onClick={() => setFlip(!flip)} style={{ ...bx, padding: "44px 18px", textAlign: "center", cursor: "pointer", borderColor: flip ? dk.color : BG3, background: flip ? dk.color + "0F" : BG2, minHeight: 160, display: "flex", flexDirection: "column", justifyContent: "center", userSelect: "none" }}>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>{flip ? "Français" : "Deutsch"}</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{flip ? dk.cards[ci].fr : dk.cards[ci].de}</div>
            {!flip && <div style={{ fontSize: 11, color: FAINT, marginTop: 14 }}>Tap pour révéler</div>}
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
            <button onClick={() => { setCi(ci - 1); setFlip(false); }} disabled={ci === 0} style={{ ...bt, opacity: ci === 0 ? 0.3 : 1 }}>←</button>
            <button onClick={() => { setXp(x => x + 5); if (ci < dk.cards.length - 1) { setCi(ci + 1); setFlip(false); } else { setTab("vocab"); } }} style={{ ...bt, background: dk.color, flex: 1 }}>{ci === dk.cards.length - 1 ? "Terminé ✓" : "Suivant →"}</button>
          </div>
        </div>
      </div>
    );
  }

  const TaskRow = ({ task, idx, date, small }) => {
    const k = date + "-" + idx;
    const d = done[k];
    return (
      <div onClick={() => toggle(date, idx)} style={{ background: d ? GREEN + "0A" : BG2, borderRadius: small ? 9 : 12, padding: small ? "8px 10px" : "12px 14px", marginBottom: small ? 4 : 8, cursor: "pointer", border: "1px solid " + (d ? GREEN + "33" : BG3), opacity: d ? 0.5 : 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid " + (d ? GREEN : TP_COLORS[task.tp]), background: d ? GREEN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: WHITE }}>{d ? "✓" : ""}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: small ? 11 : 12 }}>{task.t}</span>
              <Pill color={TP_COLORS[task.tp]}>{TP_LABELS[task.tp]}</Pill>
            </div>
            <p style={{ fontSize: small ? 11 : 12, color: d ? MUTED : WHITE, lineHeight: 1.4, textDecoration: d ? "line-through" : "none" }}>{task.d}</p>
          </div>
        </div>
      </div>
    );
  };

  const navItems = [
    { id: "dash", icon: "🎯", label: "Mission" }, { id: "today", icon: "📋", label: "Jour" },
    { id: "vocab", icon: "🧠", label: "Vocab" }, { id: "gram", icon: "📐", label: "Gram." },
    { id: "iv", icon: "💼", label: "Entretien" }, { id: "sim", icon: "🏥", label: "Clinique" },
    { id: "tools", icon: "🛠️", label: "Outils" }, { id: "cal", icon: "📅", label: "Plan" }
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: FONT, color: WHITE }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: BG + "ee", backdropFilter: "blur(10px)", borderBottom: "1px solid " + BG3, padding: "5px 4px", display: "flex", justifyContent: "center", gap: 1, overflowX: "auto" }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ background: tab === n.id ? BG3 : "transparent", border: "none", color: tab === n.id ? WHITE : MUTED, padding: "5px 8px", borderRadius: 8, fontSize: 10, cursor: "pointer", fontWeight: tab === n.id ? 700 : 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, fontFamily: FONT, flexShrink: 0 }}>
            <span style={{ fontSize: 14 }}>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "10px 12px 80px" }}>

        {tab === "dash" && <div>
          <div style={{ ...bx, borderColor: RED + "22" }}>
            <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 3, textAlign: "center", marginBottom: 8 }}>🔥 Countdown Jour J</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {[{v:dd,l:"j"},{v:hh,l:"h"},{v:mn,l:"m"},{v:sc,l:"s"}].map((x,i) => (
                <div key={i} style={{ textAlign: "center", minWidth: 42 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 900, color: i === 0 ? RED : WHITE }}>{String(x.v).padStart(2,"0")}</div>
                  <div style={{ fontSize: 8, color: MUTED }}>{x.l}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: RED, fontWeight: 600 }}>Dr. Attias-Widmer — Spitalzentrum Biel</div>
          </div>
          <div style={{ ...bx, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: RED + "18", border: "2px solid " + RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: RED }}>{level}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 700, fontSize: 13 }}>{LVLS[Math.min(level-1,6)]}</span><span style={{ color: ORANGE, fontWeight: 700, fontSize: 11 }}>{xp} XP</span></div>
              <Bar value={lvlPct} max={100} color={RED} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
            {[{v:"J"+dNum,l:"/20",c:BLUE},{v:pct+"%",l:"fait",c:GREEN},{v:totDone,l:"/"+totTasks,c:PURPLE},{v:DECKS.reduce((a,d)=>a+d.cards.length,0),l:"mots",c:CYAN}].map((s,i) => (
              <div key={i} style={{ background: BG2, borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.c }}>{s.v}</div><div style={{ fontSize: 9, color: MUTED }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ background: RED + "0A", borderRadius: 10, padding: "10px 14px", borderLeft: "3px solid " + RED, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: RED }}>{MOTIV[mi]}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[{t:"today",i:"📋",l:"Aujourd'hui"},{t:"vocab",i:"🧠",l:"Vocab"},{t:"iv",i:"💼",l:"Entretien"},{t:"sim",i:"🏥",l:"Cas cliniques"},{t:"tools",i:"🛠️",l:"Outils"},{t:"cal",i:"📅",l:"Planning"}].map((a,i) => (
              <button key={i} onClick={() => setTab(a.t)} style={{ background: BG2, border: "1px solid " + BG3, borderRadius: 11, padding: "14px 8px", cursor: "pointer", textAlign: "center", fontFamily: FONT }}>
                <div style={{ fontSize: 20, marginBottom: 3 }}>{a.i}</div><div style={{ color: WHITE, fontWeight: 600, fontSize: 11 }}>{a.l}</div>
              </button>
            ))}
          </div>
        </div>}

        {tab === "today" && <div>
          <div style={{ ...bx, borderColor: BLUE + "33", marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase" }}>Semaine {tP.w}</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginTop: 3, marginBottom: 5 }}>{tP.title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><div style={{ flex: 1 }}><Bar value={tDone} max={tP.tasks.length} color={GREEN} /></div><span style={{ color: GREEN, fontWeight: 700, fontSize: 12 }}>{tDone}/{tP.tasks.length}</span></div>
          </div>
          {tP.tasks.map((t, i) => <TaskRow key={i} task={t} idx={i} date={tP.date} />)}
          {tDone === tP.tasks.length && <div style={{ background: GREEN + "0D", borderRadius: 12, padding: 16, textAlign: "center", border: "1px solid " + GREEN + "33" }}><div style={{ fontSize: 32 }}>🎉</div><div style={{ fontSize: 16, fontWeight: 900, color: GREEN }}>Journée complète!</div></div>}
        </div>}

        {tab === "vocab" && <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>🧠 Vocabulaire — {DECKS.reduce((a,d) => a + d.cards.length, 0)} mots</h2>
          {DECKS.map((dk, i) => (
            <div key={i} style={{ ...bx, borderColor: dk.color + "22" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{dk.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{dk.name}</div><div style={{ fontSize: 10, color: MUTED }}>{dk.cards.length} mots</div></div>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => startFC(i)} style={{ ...bt, flex: 1 }}>📇 Flashcards</button>
                <button onClick={() => startQuiz(i)} style={{ ...bt, flex: 1, background: dk.color + "1A", color: dk.color }}>⚡ Quiz</button>
              </div>
            </div>
          ))}
        </div>}

        {tab === "gram" && <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>📐 Grammaire essentielle</h2>
          {GRAM.map((g, gi) => (
            <div key={gi} style={{ ...bx, borderColor: g.color + "22" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: g.color, marginBottom: 8 }}>{g.title}</h3>
              {g.items.map((c, ci) => (
                <div key={ci} style={{ background: BG3, borderRadius: 7, padding: "7px 10px", marginBottom: 3 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: g.color }}>{c.l}</div>
                  <div style={{ fontSize: 12, color: WHITE }}>{c.e}</div>
                </div>
              ))}
            </div>
          ))}
        </div>}

        {tab === "iv" && <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>💼 Entretien — Réponds À VOIX HAUTE</h2>
          <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap" }}>
            {IVW.map((_, i) => (
              <button key={i} onClick={() => { setIi(i); setSa(false); }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid " + (ii === i ? RED : BG3), background: ii === i ? RED + "22" : rat[i] ? GREEN + "18" : BG2, color: ii === i ? RED : rat[i] ? GREEN : MUTED, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: FONT }}>{i + 1}</button>
            ))}
          </div>
          <div style={{ ...bx, borderColor: RED + "33" }}>
            <div style={{ fontSize: 9, color: RED, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Frage {ii + 1}/10</div>
            <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>{IVW[ii].q}</div>
            <div style={{ background: ORANGE + "0F", borderRadius: 8, padding: "7px 10px", borderLeft: "3px solid " + ORANGE }}>
              <div style={{ fontSize: 10, color: ORANGE, fontWeight: 600 }}>💡 {IVW[ii].h}</div>
            </div>
          </div>
          <button onClick={() => setSa(!sa)} style={{ ...bt, width: "100%", background: sa ? BG3 : RED, marginBottom: 8 }}>{sa ? "Masquer" : "🔓 Révéler"}</button>
          {sa && <div>
            <div style={{ ...bx, borderColor: GREEN + "33" }}>
              <div style={{ fontSize: 10, color: GREEN, fontWeight: 700, marginBottom: 4 }}>Antwort:</div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>{IVW[ii].r}</div>
            </div>
            <div style={bx}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Auto-évaluation:</div>
              <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                {[{v:1,e:"😰"},{v:2,e:"😕"},{v:3,e:"🙂"},{v:4,e:"😊"},{v:5,e:"🔥"}].map(r => (
                  <button key={r.v} onClick={() => { setRat(p => ({...p, [ii]: r.v})); setXp(x => x + 15); }} style={{ background: rat[ii] === r.v ? GREEN + "22" : BG3, border: "1px solid " + (rat[ii] === r.v ? GREEN : BG4), borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}>
                    <div style={{ fontSize: 18 }}>{r.e}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>}
        </div>}

        {tab === "sim" && <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>🏥 Cas cliniques</h2>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {SCENARIOS.map((s, i) => (
              <button key={i} onClick={() => { setSci(i); setScs(0); }} style={{ flex: 1, background: sci === i ? RED + "22" : BG2, border: "1px solid " + (sci === i ? RED : BG3), borderRadius: 8, padding: "8px 4px", cursor: "pointer", textAlign: "center", fontFamily: FONT }}>
                <div style={{ fontSize: 16 }}>{s.icon}</div><div style={{ fontSize: 8, color: sci === i ? RED : MUTED, marginTop: 2 }}>{s.title}</div>
              </button>
            ))}
          </div>
          <div style={{ ...bx, borderColor: RED + "33" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: RED, marginBottom: 8 }}>{SCENARIOS[sci].icon} {SCENARIOS[sci].title}</h3>
            <div style={{ background: BLUE + "0F", borderRadius: 8, padding: "10px 12px", marginBottom: 10, borderLeft: "3px solid " + BLUE }}>
              <div style={{ fontSize: 12, lineHeight: 1.4 }}>{SCENARIOS[sci].sit}</div>
            </div>
            {SCENARIOS[sci].steps.map((st, i) => (
              <div key={i} onClick={() => setScs(Math.max(scs, i + 1))} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5, cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: i < scs ? GREEN : BG3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 700, color: WHITE }}>{i < scs ? "✓" : (i + 1)}</div>
                <div style={{ fontSize: 12, color: i < scs ? WHITE : MUTED, filter: i <= scs ? "none" : "blur(3px)" }}>{st}</div>
              </div>
            ))}
          </div>
        </div>}

        {tab === "tools" && <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>🛠️ Outils</h2>
          <div style={{ ...bx, borderColor: RED + "22" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: RED, marginBottom: 8 }}>⏱️ Pomodoro</h3>
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "monospace", fontSize: 48, fontWeight: 900, color: tmr > 0 ? RED : WHITE }}>{String(Math.floor(tmr / 60)).padStart(2, "0")}:{String(tmr % 60).padStart(2, "0")}</div>
            </div>
            <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 8 }}>
              {[15, 25, 45].map(m => (
                <button key={m} onClick={() => { setTmr(m * 60); setTmrOn(false); setTmrM(m); }} style={{ ...bt, background: tmrM === m ? RED : BG3 }}>{m}m</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
              <button onClick={() => { if (!tmrOn && tmr === 0) setTmr(tmrM * 60); setTmrOn(!tmrOn); }} style={{ ...bt, background: tmrOn ? ORANGE : GREEN }}>{tmrOn ? "⏸ Pause" : "▶ Start"}</button>
              <button onClick={() => { setTmrOn(false); setTmr(0); }} style={bt}>↺ Reset</button>
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 14, marginBottom: 8 }}>🆘 Phrases de survie</h3>
          {SURVIVAL.map((cat, ci) => (
            <div key={ci} style={{ ...bx, borderColor: cat.color + "22" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: cat.color, marginBottom: 8 }}>{cat.cat}</div>
              {cat.items.map((p, pi) => (
                <div key={pi} style={{ marginBottom: 5, padding: "3px 0", borderBottom: pi < cat.items.length - 1 ? "1px solid " + BG3 : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.de}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{p.fr}</div>
                </div>
              ))}
            </div>
          ))}

          <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 14, marginBottom: 8 }}>🇨🇭 DO / DON'T Jour J</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ ...bx, borderColor: GREEN + "22" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, marginBottom: 6 }}>✅ DO</div>
              {["15 min en avance","Serrer la main","Grüezi / Uf Widerluege","Vouvoyer (Sie)","Poser des questions","Remercier chacun","Accepter le café"].map((d, i) => (
                <div key={i} style={{ fontSize: 10, color: WHITE, lineHeight: 1.5 }}>{d}</div>
              ))}
            </div>
            <div style={{ ...bx, borderColor: RED + "22" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 6 }}>❌ DON'T</div>
              {["Jamais en retard","Pas tutoyer","Pas interrompre","Pas critiquer FR vs CH","Pas de téléphone","Pas voix forte","Email merci le soir"].map((d, i) => (
                <div key={i} style={{ fontSize: 10, color: WHITE, lineHeight: 1.5 }}>{d}</div>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 14, marginBottom: 8 }}>✅ Checklist Jour J</h3>
          {CHECKLIST.map((cat, catI) => (
            <div key={catI} style={bx}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{cat.cat}</div>
              {cat.items.map((item, itemI) => {
                const k = "cl-" + catI + "-" + itemI;
                return (
                  <div key={itemI} onClick={() => setCl(p => ({...p, [k]: !p[k]}))} style={{ display: "flex", gap: 7, alignItems: "center", padding: "4px 0", cursor: "pointer" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid " + (cl[k] ? GREEN : BG4), background: cl[k] ? GREEN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: WHITE }}>{cl[k] ? "✓" : ""}</div>
                    <div style={{ fontSize: 11, color: cl[k] ? MUTED : WHITE, textDecoration: cl[k] ? "line-through" : "none" }}>{item}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>}

        {tab === "cal" && <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>📅 Planning 20 jours</h2>
          {[1, 2, 3].map(w => {
            const wColor = [BLUE, ORANGE, GREEN][w - 1];
            const wLabel = ["S1 — Fondations (A1→A2)", "S2 — Accélération (A2→B1)", "S3 — Performance (B1→B2)"][w - 1];
            return (
              <div key={w} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: wColor, marginBottom: 6, padding: "6px 10px", background: wColor + "0F", borderRadius: 8, borderLeft: "3px solid " + wColor }}>{wLabel}</div>
                {PROG.filter(d => d.w === w).map((day, dayI) => {
                  const isT = day.date === tStr;
                  const allD = day.tasks.every((_, ti) => done[day.date + "-" + ti]);
                  const cnt = day.tasks.filter((_, ti) => done[day.date + "-" + ti]).length;
                  const open = calD === day.date;
                  return (
                    <div key={dayI}>
                      <div onClick={() => setCalD(open ? null : day.date)} style={{ background: isT ? RED + "0A" : BG2, borderRadius: open ? "8px 8px 0 0" : 8, padding: "8px 10px", marginBottom: open ? 0 : 3, border: "1px solid " + (isT ? RED + "44" : BG3), cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            {allD && <span style={{ color: GREEN, fontSize: 11 }}>✓</span>}
                            <span style={{ fontWeight: 700, fontSize: 11, color: isT ? RED : WHITE }}>{isT ? "→ " : ""}{day.title}</span>
                          </div>
                          <span style={{ fontSize: 9, color: MUTED }}>{cnt}/{day.tasks.length} {open ? "▾" : "▸"}</span>
                        </div>
                      </div>
                      {open && (
                        <div style={{ background: BG2, borderRadius: "0 0 8px 8px", padding: "6px 8px 8px", marginBottom: 3, border: "1px solid " + BG3, borderTop: "none" }}>
                          {day.tasks.map((t, ti) => (
                            <TaskRow key={ti} task={t} idx={ti} date={day.date} small />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>}

      </div>
    </div>
  );
}
