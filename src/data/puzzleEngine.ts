// ===== PUZZLE ENGINE =====
// Transforms the platform from a "gamified workshop" into a true escape game
// with deduction, association, ordering, and clinical reasoning puzzles.

export type PuzzleType =
  | "deduction"        // clinical diagnosis from symptoms
  | "association"      // match symptom → diagnosis
  | "ordering"         // put steps in correct order
  | "completion"       // complete a medical phrase
  | "error_finding"    // find the error in a clinical statement
  | "classification"   // triage: urgent vs non-urgent
  | "decoding"         // decode a medical message
  | "visual_clue"      // identify from an image description (ECG, radio)
  | "multi_step";      // chain of puzzles leading to a final answer

export type PuzzleState = "locked" | "available" | "in_progress" | "solved";

export interface PuzzleHint {
  level: 1 | 2 | 3;
  text: string;
  xpPenalty: number; // XP reduction for using this hint
}

export interface PuzzleStep {
  id: string;
  prompt: string;
  solution: string;
  alternatives?: string[]; // acceptable alternative answers
  hint?: PuzzleHint;
}

export interface Puzzle {
  id: string;
  type: PuzzleType;
  roomId: string;           // which room this puzzle belongs to
  title: string;
  narrative: string;        // story context for the puzzle
  prompt: string;           // the puzzle question/challenge
  hints: PuzzleHint[];      // 3 progressive hints
  solution: string;         // correct answer
  alternatives?: string[];  // acceptable alternative answers
  steps?: PuzzleStep[];     // for multi-step puzzles
  reward: {
    xp: number;
    fragmentName?: string;
    narrativeReveal: string; // story element revealed on solve
  };
  difficulty: 1 | 2 | 3;    // 1=easy, 2=medium, 3=hard
  category: string;         // medical topic
  germanVocab: string[];    // key German words practiced
}

// ===== INTERVIEW ZONE PUZZLES: "Der Ärzterat" =====
export const INTERVIEW_PUZZLES: Puzzle[] = [
  // --- Room 1: Vorstellung ---
  {
    id: "iv-vorstellung-1",
    type: "ordering",
    roomId: "aerzterat-vorstellung",
    title: "Strukturierte Vorstellung",
    narrative: "Le terminal d'accueil du Conseil Medical s'allume. Un message apparait : 'Identifiez-vous selon le protocole.' Tu dois construire ta presentation dans le bon ordre.",
    prompt: "Remets ces elements dans l'ordre correct pour une presentation medicale professionnelle en allemand :",
    hints: [
      { level: 1, text: "Commence par ton identite, puis ta formation.", xpPenalty: 5 },
      { level: 2, text: "L'ordre classique : Nom → Formation → Experience → Interet / Specialite.", xpPenalty: 10 },
      { level: 3, text: "1. Name/Herkunft 2. Ausbildung 3. Berufserfahrung 4. Fachinteresse", xpPenalty: 15 },
    ],
    solution: "Name/Herkunft → Ausbildung → Berufserfahrung → Fachinteresse",
    alternatives: ["Name → Ausbildung → Erfahrung → Interesse"],
    reward: {
      xp: 30,
      fragmentName: "Fragment de Protocole",
      narrativeReveal: "Le terminal accepte ton identification. Un premier panneau du Conseil s'illumine.",
    },
    difficulty: 1,
    category: "Vorstellung",
    germanVocab: ["Ich bin Ärztin", "Ausbildung", "Berufserfahrung", "Fachinteresse", "Herkunft"],
  },
  {
    id: "iv-vorstellung-2",
    type: "completion",
    roomId: "aerzterat-vorstellung",
    title: "Pitch de presentation",
    narrative: "Le Conseil demande une presentation orale. Complete la phrase d'introduction.",
    prompt: "Complete la phrase : 'Ich bin ___ aus ___. Ich arbeite derzeit in der ___. Ich interessiere mich besonders für die ___.'",
    hints: [
      { level: 1, text: "Pense a ton titre medical, ton pays, ton service actuel, et ta specialite.", xpPenalty: 5 },
      { level: 2, text: "Ärztin / Frankreich / Notaufnahme / Angiologie", xpPenalty: 10 },
      { level: 3, text: "Ich bin Ärztin aus Frankreich. Ich arbeite derzeit in der Notaufnahme. Ich interessiere mich besonders für die Angiologie.", xpPenalty: 15 },
    ],
    solution: "Ärztin, Frankreich, Notaufnahme, Angiologie",
    alternatives: ["Ärztin aus Frankreich, Notaufnahme, Angiologie"],
    reward: {
      xp: 25,
      narrativeReveal: "Ta voix resonne dans la salle du Conseil. Le deuxieme panneau s'active.",
    },
    difficulty: 1,
    category: "Vorstellung",
    germanVocab: ["Ärztin", "Frankreich", "Notaufnahme", "Angiologie", "derzeit"],
  },

  // --- Room 2: Motivation ---
  {
    id: "iv-motivation-1",
    type: "completion",
    roomId: "aerzterat-motivation",
    title: "Warum die Schweiz?",
    narrative: "Le panneau central affiche : 'Warum möchten Sie in der Schweiz arbeiten?' Tu dois construire une reponse structuree.",
    prompt: "Construis une reponse motivee en utilisant ces 3 elements cles : Gesundheitssystem, Weiterbildung, Angiologie",
    hints: [
      { level: 1, text: "Mentionne la qualite du systeme de sante suisse.", xpPenalty: 5 },
      { level: 2, text: "Structure : systeme → formation → specialite. Utilise 'weil' pour justifier.", xpPenalty: 10 },
      { level: 3, text: "Ich möchte in der Schweiz arbeiten, weil das Gesundheitssystem hervorragend ist. Die Weiterbildung in der Angiologie interessiert mich besonders.", xpPenalty: 15 },
    ],
    solution: "Gesundheitssystem + Weiterbildung + Angiologie",
    reward: {
      xp: 35,
      fragmentName: "Fragment de Motivation",
      narrativeReveal: "Le Conseil hoche la tete. Un troisieme panneau s'active — ta motivation est reconnue.",
    },
    difficulty: 2,
    category: "Motivation",
    germanVocab: ["Gesundheitssystem", "Weiterbildung", "hervorragend", "weil", "interessieren"],
  },

  // --- Room 3: Erfahrung ---
  {
    id: "iv-erfahrung-1",
    type: "ordering",
    roomId: "aerzterat-erfahrung",
    title: "Parcours professionnel",
    narrative: "Le Conseil demande ton parcours chronologique. Remets les etapes dans l'ordre.",
    prompt: "Remets ces etapes de carriere dans le bon ordre chronologique :",
    hints: [
      { level: 1, text: "Commence par les etudes.", xpPenalty: 5 },
      { level: 2, text: "Etudes → Stage → Urgences → Specialisation.", xpPenalty: 10 },
      { level: 3, text: "Studium → Praktikum → Notaufnahme → Weiterbildung (Angiologie)", xpPenalty: 15 },
    ],
    solution: "Studium → Praktikum → Notaufnahme → Weiterbildung",
    reward: {
      xp: 25,
      narrativeReveal: "Le chronometre du Conseil affiche ton parcours complet. Impressionnant.",
    },
    difficulty: 1,
    category: "Erfahrung",
    germanVocab: ["Studium", "Praktikum", "Notaufnahme", "Weiterbildung", "Facharztausbildung"],
  },

  // --- Room 4: Fallanalyse (Cas clinique) ---
  {
    id: "iv-fall-1",
    type: "deduction",
    roomId: "aerzterat-fallanalyse",
    title: "Diagnostic d'urgence",
    narrative: "Alarme dans la salle du Conseil ! Un cas clinique apparait sur l'ecran central. Le patient presente : Dyspnoe + Tachykardie + Beinschmerzen.",
    prompt: "Patient, 45 ans : Dyspnoe, Tachykardie, einseitige Beinschwellung. Quelle est ta Verdachtsdiagnose ?",
    hints: [
      { level: 1, text: "Pense a une cause vasculaire.", xpPenalty: 5 },
      { level: 2, text: "La combinaison dyspnee + douleur au mollet evoque une thrombose avec complication pulmonaire.", xpPenalty: 10 },
      { level: 3, text: "Lungenembolie (bei Verdacht auf tiefe Beinvenenthrombose)", xpPenalty: 15 },
    ],
    solution: "Lungenembolie",
    alternatives: ["Lungenarterienembolie", "LAE", "Pulmonale Embolie"],
    reward: {
      xp: 45,
      fragmentName: "Fragment Clinique",
      narrativeReveal: "Diagnostic correct ! Le moniteur affiche 'VERIFIZIERT'. Le Conseil reconnait ton raisonnement clinique.",
    },
    difficulty: 2,
    category: "Klinischer Fall",
    germanVocab: ["Dyspnoe", "Tachykardie", "Beinschwellung", "Verdachtsdiagnose", "Lungenembolie", "Beinvenenthrombose"],
  },
  {
    id: "iv-fall-2",
    type: "association",
    roomId: "aerzterat-fallanalyse",
    title: "Diagnostic differentiel",
    narrative: "Le Conseil presente un tableau de symptomes et diagnostics. Associe chaque symptome au bon diagnostic.",
    prompt: "Associe chaque symptome au diagnostic correspondant :",
    hints: [
      { level: 1, text: "Pense aux localisations anatomiques.", xpPenalty: 5 },
      { level: 2, text: "Beinschmerz → veineux / Dyspnoe → pulmonaire / Brustschmerz → cardiaque.", xpPenalty: 10 },
      { level: 3, text: "Beinschmerz→TVT, Dyspnoe→Lungenembolie, Brustschmerz→Myokardinfarkt", xpPenalty: 15 },
    ],
    solution: "Beinschmerz→TVT|Dyspnoe→Lungenembolie|Brustschmerz→Myokardinfarkt",
    reward: {
      xp: 40,
      narrativeReveal: "Les associations sont correctes. Le panneau diagnostique s'illumine en vert.",
    },
    difficulty: 2,
    category: "Differentialdiagnose",
    germanVocab: ["Beinschmerz", "TVT", "Dyspnoe", "Lungenembolie", "Brustschmerz", "Myokardinfarkt"],
  },

  // --- Room 5: Argumentation ---
  {
    id: "iv-argument-1",
    type: "completion",
    roomId: "aerzterat-argumentation",
    title: "Pourquoi vous ?",
    narrative: "Le Chef du Conseil pose la question finale : 'Warum sollten wir Sie einstellen?'",
    prompt: "Construis 3 arguments solides pour repondre a 'Warum sollten wir Sie einstellen?' Utilise les mots cles : Erfahrung, Motivation, Teamfähigkeit",
    hints: [
      { level: 1, text: "Mentionne ton experience clinique concrète.", xpPenalty: 5 },
      { level: 2, text: "Argument 1: experience / Argument 2: motivation / Argument 3: qualite personnelle.", xpPenalty: 10 },
      { level: 3, text: "Ich bringe Erfahrung aus der Notaufnahme mit. Ich bin hochmotiviert, mich in der Angiologie weiterzubilden. Ich bin teamfähig und belastbar.", xpPenalty: 15 },
    ],
    solution: "Erfahrung + Motivation + Teamfähigkeit",
    reward: {
      xp: 40,
      fragmentName: "Fragment d'Argumentation",
      narrativeReveal: "Le Conseil delibère... et approuve. Tu as convaincu.",
    },
    difficulty: 3,
    category: "Argumentation",
    germanVocab: ["einstellen", "Erfahrung", "Motivation", "Teamfähigkeit", "belastbar", "weiterzubilden"],
  },

  // --- Room 6: Finale ---
  {
    id: "iv-finale-1",
    type: "multi_step",
    roomId: "aerzterat-finale",
    title: "L'entretien final",
    narrative: "Le Chefarzt entre dans la salle. C'est l'entretien final. Tu dois repondre a 3 questions enchainées sans aide.",
    prompt: "Reponds aux 3 questions du Chefarzt dans l'ordre :",
    hints: [
      { level: 1, text: "Rappelle-toi des salles precedentes : presentation, motivation, cas clinique.", xpPenalty: 10 },
      { level: 2, text: "Q1: Qui es-tu? Q2: Pourquoi ici? Q3: Cas clinique rapide.", xpPenalty: 20 },
      { level: 3, text: "Utilise les reponses que tu as construites dans les salles precedentes.", xpPenalty: 30 },
    ],
    solution: "Vorstellung + Motivation + Klinischer Fall",
    steps: [
      {
        id: "finale-step-1",
        prompt: "Stellen Sie sich bitte vor.",
        solution: "Ich bin Ärztin aus Frankreich",
        alternatives: ["Mein Name ist", "Ich heisse"],
      },
      {
        id: "finale-step-2",
        prompt: "Warum möchten Sie bei uns arbeiten?",
        solution: "Gesundheitssystem, Weiterbildung, Angiologie",
        alternatives: ["Schweiz", "Weiterbildung"],
      },
      {
        id: "finale-step-3",
        prompt: "Ein Patient kommt mit Dyspnoe und Beinschmerzen. Was vermuten Sie?",
        solution: "Lungenembolie",
        alternatives: ["Verdacht auf Lungenembolie", "LAE"],
      },
    ],
    reward: {
      xp: 60,
      fragmentName: "Sigil du Conseil",
      narrativeReveal: "Le Chefarzt se leve et te serre la main. 'Willkommen im Team.' Le Sigil du Conseil brille — tu as ete acceptee.",
    },
    difficulty: 3,
    category: "Entretien Final",
    germanVocab: ["Vorstellung", "Motivation", "Verdachtsdiagnose", "Willkommen", "Team"],
  },
];

// ===== CLINICAL PUZZLES: for existing zones =====
export const CLINICAL_PUZZLES: Puzzle[] = [
  // Forge zone puzzles
  {
    id: "forge-puzzle-1",
    type: "completion",
    roomId: "forge-anvil",
    title: "Vocabulaire d'urgence",
    narrative: "Le terminal de la Forge affiche un message incomplet. Retrouve le mot medical manquant.",
    prompt: "Complete : 'Der Patient klagt über starke ___ im Brustbereich.' (Le patient se plaint de fortes ___ dans la zone thoracique.)",
    hints: [
      { level: 1, text: "C'est un symptome tres courant aux urgences.", xpPenalty: 3 },
      { level: 2, text: "Ca signifie 'douleurs'.", xpPenalty: 5 },
      { level: 3, text: "Schmerzen", xpPenalty: 8 },
    ],
    solution: "Schmerzen",
    reward: { xp: 20, narrativeReveal: "Le terminal accepte. Un mot de plus dans la base de donnees du Complexe." },
    difficulty: 1,
    category: "Notfallvokabular",
    germanVocab: ["Schmerzen", "Brustbereich", "klagen über"],
  },
  {
    id: "forge-puzzle-2",
    type: "error_finding",
    roomId: "forge-workbench",
    title: "Correction clinique",
    narrative: "Un rapport medical contient une erreur. Trouve-la !",
    prompt: "Trouve l'erreur : 'Die Patientin hat eine Temperatur von 38.5°C. Sie hat kein Fieber.'",
    hints: [
      { level: 1, text: "Verifie la coherence entre la temperature et le diagnostic.", xpPenalty: 3 },
      { level: 2, text: "38.5°C est considere comme de la fievre (Fieber).", xpPenalty: 5 },
      { level: 3, text: "L'erreur est 'kein Fieber' — 38.5°C = Fieber.", xpPenalty: 8 },
    ],
    solution: "kein Fieber",
    alternatives: ["38.5 ist Fieber", "kein Fieber ist falsch"],
    reward: { xp: 25, narrativeReveal: "Erreur corrigee ! Le dossier est mis a jour dans les systemes du Complexe." },
    difficulty: 1,
    category: "Dokumentation",
    germanVocab: ["Temperatur", "Fieber", "Patientin"],
  },

  // Grammar zone puzzles
  {
    id: "gram-puzzle-1",
    type: "ordering",
    roomId: "gram-roots",
    title: "Construction de phrase",
    narrative: "L'Arbre des Regles demande de reconstruire une phrase medicale.",
    prompt: "Remets les mots dans le bon ordre pour former une phrase correcte : 'untersuchen / den Patienten / muss / Der Arzt'",
    hints: [
      { level: 1, text: "En allemand, le verbe conjugue est en 2e position.", xpPenalty: 3 },
      { level: 2, text: "Sujet + Verbe + Complement.", xpPenalty: 5 },
      { level: 3, text: "Der Arzt muss den Patienten untersuchen.", xpPenalty: 8 },
    ],
    solution: "Der Arzt muss den Patienten untersuchen",
    reward: { xp: 20, narrativeReveal: "La branche grammaticale se deploie. L'Arbre grandit." },
    difficulty: 1,
    category: "Satzstruktur",
    germanVocab: ["untersuchen", "Patient", "Arzt", "müssen"],
  },

  // Clinical zone puzzles
  {
    id: "clin-puzzle-1",
    type: "deduction",
    roomId: "clin-triage",
    title: "Triage d'urgence",
    narrative: "Trois patients arrivent simultanement aux urgences. Qui traiter en premier ?",
    prompt: "Patient A: Kopfschmerzen seit 2 Tagen. Patient B: Akute Atemnot + Zyanose. Patient C: Schnittwunde am Finger. Qui est prioritaire ?",
    hints: [
      { level: 1, text: "Cherche les signes vitaux menaces.", xpPenalty: 5 },
      { level: 2, text: "L'atemnot (dyspnee) + cyanose = urgence vitale.", xpPenalty: 10 },
      { level: 3, text: "Patient B — detresse respiratoire aigue.", xpPenalty: 15 },
    ],
    solution: "Patient B",
    alternatives: ["B", "Patient B: Akute Atemnot"],
    reward: { xp: 35, narrativeReveal: "Triage correct ! Le patient B est stabilise. Les systemes de monitoring se rallument." },
    difficulty: 2,
    category: "Triage",
    germanVocab: ["Atemnot", "Zyanose", "Kopfschmerzen", "Schnittwunde", "akut"],
  },
  {
    id: "clin-puzzle-2",
    type: "classification",
    roomId: "clin-ward",
    title: "Urgence vs Consultation",
    narrative: "Le systeme de tri du Service est en panne. Classe ces cas.",
    prompt: "Classe ces situations : Urgent (U) ou Consultation planifiee (C) : 1) Brustschmerzen mit Ausstrahlung in den linken Arm. 2) Kontrolluntersuchung nach OP. 3) Akute Blutung.",
    hints: [
      { level: 1, text: "Les douleurs thoraciques irradiant au bras gauche sont un signe d'alerte.", xpPenalty: 5 },
      { level: 2, text: "1=U (possible infarctus), 2=C (controle), 3=U (hemorragie).", xpPenalty: 10 },
      { level: 3, text: "1:U, 2:C, 3:U", xpPenalty: 15 },
    ],
    solution: "1:U, 2:C, 3:U",
    alternatives: ["U, C, U", "Urgent, Consultation, Urgent"],
    reward: { xp: 30, narrativeReveal: "Systeme de tri restaure. Le service fonctionne a nouveau." },
    difficulty: 2,
    category: "Klassifikation",
    germanVocab: ["Brustschmerzen", "Ausstrahlung", "Kontrolluntersuchung", "Blutung"],
  },
  {
    id: "clin-puzzle-3",
    type: "deduction",
    roomId: "clin-chief",
    title: "Le diagnostic du Chef",
    narrative: "Le Chefarzt te teste. Un patient complexe se presente.",
    prompt: "Patient, 65 ans, diabetique : Claudicatio intermittens, Ruheschmerz im rechten Bein, blasse kalte Haut. Quelle est la pathologie vasculaire ?",
    hints: [
      { level: 1, text: "C'est une pathologie arterielle peripherique.", xpPenalty: 5 },
      { level: 2, text: "Claudication + douleur au repos + peau pale et froide = ischemie.", xpPenalty: 10 },
      { level: 3, text: "Periphere arterielle Verschlusskrankheit (pAVK)", xpPenalty: 15 },
    ],
    solution: "pAVK",
    alternatives: ["Periphere arterielle Verschlusskrankheit", "PAVK", "Periphere Arterielle Verschlusskrankheit"],
    reward: { xp: 50, narrativeReveal: "Le Chefarzt acquiesce. 'Sehr gut.' Ton raisonnement vasculaire est valide." },
    difficulty: 3,
    category: "Gefäßmedizin",
    germanVocab: ["Claudicatio intermittens", "Ruheschmerz", "Verschlusskrankheit", "pAVK", "Ischämie"],
  },
];

// ===== META-PUZZLE: Protocole Lazarus =====
export interface MetaPuzzleFragment {
  id: string;
  name: string;
  icon: string;
  source: string; // which zone/achievement provides this
  obtained: boolean;
}

export const META_PUZZLE_FRAGMENTS: MetaPuzzleFragment[] = [
  { id: "meta-forge", name: "Sigil de la Forge", icon: "🔨", source: "forge", obtained: false },
  { id: "meta-grammar", name: "Sigil de l'Arbre", icon: "🌳", source: "grammar", obtained: false },
  { id: "meta-studio", name: "Sigil de la Voix", icon: "🎙️", source: "studio", obtained: false },
  { id: "meta-clinical", name: "Sigil Clinique", icon: "🏥", source: "clinical", obtained: false },
  { id: "meta-lab", name: "Sigil du Laboratoire", icon: "⚗️", source: "laboratory", obtained: false },
  { id: "meta-archive", name: "Sigil des Archives", icon: "📚", source: "archive", obtained: false },
  { id: "meta-aerzterat", name: "Sigil du Conseil", icon: "⚕️", source: "aerzterat", obtained: false },
];

export const META_PUZZLE = {
  id: "protocole-lazarus",
  title: "Protocole Lazarus",
  narrative: "Les 7 Sigils de Maitrise sont reunis. Le mecanisme central du Complexe Medical attend d'etre active. Place chaque Sigil dans le bon ordre pour deverrouiller le Protocole Lazarus.",
  prompt: "Place les Sigils dans l'ordre logique de la formation medicale :",
  solution: "Forge → Arbre → Voix → Clinique → Laboratoire → Archives → Conseil",
  reward: {
    title: "Protocole Lazarus Active",
    narrative: "Le Complexe Medical de Biel reprend vie. Tous les systemes sont en ligne. Tu es reconnue comme Assistenzärztin du Gefässzentrum. Le protocole est termine — mais ton voyage ne fait que commencer.",
    finalRank: "Assistenzärztin",
  },
};

// ===== PUZZLE VALIDATION HELPERS =====
export function normalizePuzzleAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?'"()]/g, "")
    .replace(/\s+/g, " ");
}

export function checkPuzzleAnswer(puzzle: Puzzle, answer: string): boolean {
  const normalized = normalizePuzzleAnswer(answer);
  const normalizedSolution = normalizePuzzleAnswer(puzzle.solution);

  if (normalized === normalizedSolution) return true;

  // Check alternatives
  if (puzzle.alternatives) {
    for (const alt of puzzle.alternatives) {
      if (normalized === normalizePuzzleAnswer(alt)) return true;
    }
  }

  // Partial match: if the answer contains all key words of the solution
  const solutionWords = normalizedSolution.split(/[\s→|,+]+/).filter(w => w.length > 2);
  const matchCount = solutionWords.filter(w => normalized.includes(w)).length;
  if (solutionWords.length > 0 && matchCount >= Math.ceil(solutionWords.length * 0.7)) {
    return true;
  }

  return false;
}

export function checkStepAnswer(step: PuzzleStep, answer: string): boolean {
  const normalized = normalizePuzzleAnswer(answer);
  const normalizedSolution = normalizePuzzleAnswer(step.solution);

  if (normalized.includes(normalizedSolution) || normalizedSolution.includes(normalized)) return true;

  if (step.alternatives) {
    for (const alt of step.alternatives) {
      const normAlt = normalizePuzzleAnswer(alt);
      if (normalized.includes(normAlt) || normAlt.includes(normalized)) return true;
    }
  }

  return false;
}

// ===== GET PUZZLES BY ROOM =====
export function getPuzzlesForRoom(roomId: string): Puzzle[] {
  return [...INTERVIEW_PUZZLES, ...CLINICAL_PUZZLES].filter(p => p.roomId === roomId);
}

// ===== GET ALL PUZZLES =====
export function getAllPuzzles(): Puzzle[] {
  return [...INTERVIEW_PUZZLES, ...CLINICAL_PUZZLES];
}
