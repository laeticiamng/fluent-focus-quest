// ── Context Bundle Aggregation Service ──
// Collects, normalizes, and structures platform data for AI context injection
// Supports multilingual output (de/fr) with German as default

import { PROG, DECKS } from "@/data/content";
import { INTERVIEW_ZONES, type InterviewZone } from "@/data/interviewZones";
import { ESCAPE_ZONES, CENTRAL_MISSION, NARRATIVE } from "@/data/escapeGame";
import { ZONES, DAILY_CHAIN_STEPS, CREATION_BADGES, type Artifact, type ZoneId } from "@/hooks/useProgress";

// ── Language Support ──

export type ContextLanguage = "de" | "fr";

const L: Record<ContextLanguage, Record<string, string>> = {
  de: {
    projectSummary: `Vorbereitungsplattform für ein medizinisches Vorstellungsgespräch in der Schweiz (Spitalzentrum Biel, Angiologie).
Kandidatin: Dr. Laeticia Motongane — Assistenzärztin, Erfahrung Notaufnahme, Ziel Facharztausbildung Angiologie.
Gespräch mit Dr. Attias-Widmer am 30. März 2026.
Module: medizinisches Deutsch-Vokabular, Grammatik, Gesprächssimulation, klinisches Denken, pädagogisches Escape Game "Der Medizinische Komplex".
Gamifizierte Architektur: Zonen freischalten, Artefakte erstellen, Sigils sammeln, Protokoll Lazarus.`,
    profileTitle: "Profil & Fortschritt",
    email: "E-Mail",
    notConnected: "nicht verbunden",
    totalXp: "XP gesamt",
    streak: "Serie (Streak)",
    days: "Tage",
    pomodoros: "Pomodoros",
    artifactsCreated: "Erstellte Artefakte",
    badgesEarned: "Verdiente Abzeichen",
    unlockedZones: "Freigeschaltete Zonen",
    unlockedRooms: "Freigeschaltete Räume",
    dailyChainsCompleted: "Abgeschlossene Tagesketten",
    escapeSolved: "Gelöste Escape-Räume",
    sigilsCollected: "Gesammelte Sigils",
    protocolLazarus: "Protokoll Lazarus",
    activated: "AKTIVIERT",
    notActivated: "nicht aktiviert",
    prepPlanTitle: "Vorbereitungsplan — 20-Tage-Programm",
    artifactsTitle: "Von der Kandidatin erstellte Artefakte",
    total: "Gesamt",
    xpGenerated: "generierte XP",
    byType: "Nach Typ",
    recent: "Letzte",
    interviewTitle: "Gesprächsvorbereitung",
    questionsCovered: "Abgedeckte Fragen",
    avgScore: "Durchschnitt",
    bestScore: "Bester",
    answersCreated: "Erstellte Antworten",
    byZone: "Nach Zone",
    answers: "Antworten",
    escapeTitle: "Escape Game — Der Medizinische Komplex",
    mission: "Mission",
    solvedRooms: "Gelöste Räume",
    puzzles: "Rätsel",
    inProgress: "in Bearbeitung",
    rooms: "Räume",
    progressByZone: "Fortschritt nach Zone",
    vocabTitle: "Vokabeldecks",
    cards: "Karten",
    personalNotes: "Persönliche Notizen",
    quizScores: "QCM-Ergebnisse",
    sessions: "Sitzungen",
    last: "Letzte",
    best: "Beste",
    remainingTasks: "Verbleibende Tagesaufgaben",
    beginner: "Anfängerin: Ermutigung zur Erstellung erster Artefakte (geschmiedete Sätze, Definitionen)",
    priorityInterview: "Priorität: Mehr Antworten für das Vorstellungsgespräch vorbereiten",
    streakBroken: "Serie unterbrochen: Remotivieren und eine einfache Mikroaufgabe vorschlagen",
    streakGoing: "Tage-Serie: Gratulieren und Rhythmus beibehalten",
    urgent: "DRINGEND: Gespräch in",
    daysLabel: "Tag(en) — Fokus Wiederholung und Selbstvertrauen",
    interviewIn: "Gespräch in",
    daysIntensify: "Tagen — Simulationen intensivieren",
    prepNotesHeader: "VORBEREITUNGSNOTIZEN — Gespräch Dr. Attias-Widmer (Spitalzentrum Biel)",
    date: "Datum",
    position: "Stelle: Assistenzärztin Angiologie",
    prepState: "VORBEREITUNGSSTAND",
    creations: "Erstellungen",
    interview: "Gespräch",
    preparedAnswers: "vorbereitete Antworten",
    escapeGame: "Escape Game",
    aiHintsLabel: "KI-HINWEISE",
    contextHeader: "Plattform-Kontext",
    prepNotesLabel: "Vorbereitungsnotizen",
    contextualHints: "Kontextuelle Hinweise",
    conversationHistory: "Gesprächsverlauf",
    platformSummary: "PLATTFORM-ZUSAMMENFASSUNG",
    prepNotes: "VORBEREITUNGSNOTIZEN",
    attachedFiles: "ANGEHÄNGTE DATEIEN",
  },
  fr: {
    projectSummary: `Plateforme de preparation a un entretien medical en Suisse (Spitalzentrum Biel, Angiologie).
Candidate: Dr. Laeticia Motongane — medecin assistante, experience urgences, objectif specialisation angiologie.
Entretien avec Dr. Attias-Widmer le 30 mars 2026.
Modules: vocabulaire medical allemand, grammaire, simulation entretien, raisonnement clinique, escape game pedagogique "Le Complexe Medical".
Architecture gamifiee: zones a debloquer, artefacts a creer, sigils a collecter, Protocole Lazarus.`,
    profileTitle: "Profil & Progression",
    email: "Email",
    notConnected: "non connecte",
    totalXp: "XP total",
    streak: "Serie (streak)",
    days: "jours",
    pomodoros: "Pomodoros",
    artifactsCreated: "Artefacts crees",
    badgesEarned: "Badges gagnes",
    unlockedZones: "Zones debloquees",
    unlockedRooms: "Salles debloquees",
    dailyChainsCompleted: "Chaines quotidiennes completees",
    escapeSolved: "Salles d'escape resolues",
    sigilsCollected: "Sigils collectes",
    protocolLazarus: "Protocole Lazarus",
    activated: "ACTIVE",
    notActivated: "non active",
    prepPlanTitle: "Plan de preparation — Programme 20 jours",
    artifactsTitle: "Artefacts crees par l'utilisatrice",
    total: "Total",
    xpGenerated: "XP genere",
    byType: "Par type",
    recent: "Derniers",
    interviewTitle: "Preparation entretien",
    questionsCovered: "Questions couvertes",
    avgScore: "Score moyen",
    bestScore: "Meilleur",
    answersCreated: "Reponses creees",
    byZone: "Par zone",
    answers: "reponses",
    escapeTitle: "Escape Game — Le Complexe Medical",
    mission: "Mission",
    solvedRooms: "Salles resolues",
    puzzles: "Puzzles",
    inProgress: "en cours",
    rooms: "salles",
    progressByZone: "Progression par zone",
    vocabTitle: "Decks de vocabulaire",
    cards: "cartes",
    personalNotes: "Notes personnelles",
    quizScores: "Scores QCM",
    sessions: "sessions",
    last: "Dernier",
    best: "Meilleur",
    remainingTasks: "Taches du jour restantes",
    beginner: "Debutante: encourager la creation de premiers artefacts (phrases forgees, definitions)",
    priorityInterview: "Priorite: augmenter le nombre de reponses d'entretien preparees",
    streakBroken: "Serie interrompue: remotiver et proposer une micro-tache facile",
    streakGoing: "jours: feliciter et maintenir le rythme",
    urgent: "URGENT: entretien dans",
    daysLabel: "jour(s) — focus revision et confiance",
    interviewIn: "Entretien dans",
    daysIntensify: "jours — intensifier simulations",
    prepNotesHeader: "NOTES DE PREPARATION — Entretien Dr. Attias-Widmer (Spitalzentrum Biel)",
    date: "Date",
    position: "Poste: Assistenzarztin Angiologie",
    prepState: "ETAT DE PREPARATION",
    creations: "creations",
    interview: "Entretien",
    preparedAnswers: "reponses preparees",
    escapeGame: "Escape game",
    aiHintsLabel: "INDICES IA",
    contextHeader: "Contexte Plateforme",
    prepNotesLabel: "Notes de Preparation",
    contextualHints: "Indices Contextuels",
    conversationHistory: "Historique Conversations",
    platformSummary: "RESUME PLATEFORME",
    prepNotes: "NOTES DE PREPARATION",
    attachedFiles: "FICHIERS JOINTS",
  },
};

// ── Types ──

export interface ContextElement {
  type: "profile" | "project" | "progress" | "conversation" | "document" | "setting" | "file" | "content";
  title: string;
  content: string;
  source: string;
  sourceLanguage?: string;
  targetLanguage: string;
  translated?: boolean;
  updatedAt?: string;
}

export interface ConversationSummary {
  title: string;
  summary: string;
  sourceId?: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  path?: string;
  extractedText?: string;
}

export interface ContextBundle {
  projectSummary: string;
  preparationNotes: string;
  platformElements: ContextElement[];
  conversationSummaries: ConversationSummary[];
  uploadedFiles: UploadedFile[];
  aiHints: string[];
  generatedAt: string;
  language: ContextLanguage;
}

// ── Progress data shape (from useProgress) ──
interface ProgressData {
  xp: number;
  streak: number;
  artifacts: Artifact[];
  earnedBadges: string[];
  notes: string;
  pomodoroCount: number;
  questState: {
    currentZoneId: ZoneId;
    unlockedZones: ZoneId[];
    unlockedRooms: string[];
    completedChains: number;
  };
  escapeState: {
    solvedRooms: string[];
    inventory: Array<{ name: string; type: string; roomSource: string }>;
    sigilsCollected: string[];
    solvedPuzzles: string[];
    protocolActivated: boolean;
  };
  done: Record<string, boolean>;
  quizScores: Record<string, Array<{ correct: number; total: number; date: string }>>;
}

// ── Builder ──

export function buildContextBundle(
  progress: ProgressData,
  userEmail?: string,
  conversationSummaries: ConversationSummary[] = [],
  uploadedFiles: UploadedFile[] = [],
  language: ContextLanguage = "de",
): ContextBundle {
  const t = L[language];
  const elements: ContextElement[] = [];
  const aiHints: string[] = [];
  const now = new Date().toISOString();

  // 1. PROJECT SUMMARY
  const projectSummary = t.projectSummary;

  // 2. PROFILE / PROGRESS
  const profileElement = buildProfileElement(progress, userEmail, language);
  elements.push(profileElement);

  // 3. PREPARATION NOTES (from PROG schedule)
  const prepNotes = buildPreparationNotes(progress, language);
  elements.push({
    type: "content",
    title: t.prepPlanTitle,
    content: prepNotes,
    source: "data/content.ts → PROG",
    sourceLanguage: "fr",
    targetLanguage: language,
    translated: language !== "fr",
  });

  // 4. ARTIFACTS (user creations)
  if (progress.artifacts.length > 0) {
    const artifactSummary = buildArtifactSummary(progress.artifacts, language);
    elements.push({
      type: "progress",
      title: t.artifactsTitle,
      content: artifactSummary,
      source: "user_progress → artifacts",
      sourceLanguage: "mixed",
      targetLanguage: language,
      updatedAt: progress.artifacts[progress.artifacts.length - 1]?.date,
    });
  }

  // 5. INTERVIEW PREPARATION
  const interviewElement = buildInterviewContext(progress.artifacts, language);
  elements.push(interviewElement);

  // 6. ESCAPE GAME STATE
  const escapeElement = buildEscapeContext(progress.escapeState, language);
  elements.push(escapeElement);

  // 7. VOCABULARY DECKS
  elements.push({
    type: "content",
    title: t.vocabTitle,
    content: DECKS.map(d => `${d.icon} ${d.name}: ${d.cards.length} ${t.cards}`).join("\n"),
    source: "data/content.ts → DECKS",
    sourceLanguage: "de",
    targetLanguage: language,
  });

  // 8. USER NOTES
  if (progress.notes?.trim()) {
    elements.push({
      type: "document",
      title: t.personalNotes,
      content: progress.notes,
      source: "user_progress → notes",
      sourceLanguage: "mixed",
      targetLanguage: language,
    });
  }

  // 9. QUIZ SCORES
  const quizSummary = buildQuizSummary(progress.quizScores, language);
  if (quizSummary) {
    elements.push({
      type: "progress",
      title: t.quizScores,
      content: quizSummary,
      source: "user_progress → quizScores",
      sourceLanguage: language,
      targetLanguage: language,
    });
  }

  // 10. AI HINTS (contextual)
  aiHints.push(...generateAIHints(progress, language));

  // PREPARATION NOTES (compiled)
  const preparationNotes = buildCompactPreparationNotes(progress, aiHints, language);

  return {
    projectSummary,
    preparationNotes,
    platformElements: elements,
    conversationSummaries,
    uploadedFiles,
    aiHints,
    generatedAt: now,
    language,
  };
}

// ── Sub-builders ──

function buildProfileElement(progress: ProgressData, userEmail: string | undefined, lang: ContextLanguage): ContextElement {
  const t = L[lang];
  const lines = [
    `${t.email}: ${userEmail || t.notConnected}`,
    `${t.totalXp}: ${progress.xp}`,
    `${t.streak}: ${progress.streak} ${t.days}`,
    `${t.pomodoros}: ${progress.pomodoroCount}`,
    `${t.artifactsCreated}: ${progress.artifacts.length}`,
    `${t.badgesEarned}: ${progress.earnedBadges.length} / ${CREATION_BADGES.length}`,
    `${t.unlockedZones}: ${progress.questState.unlockedZones.join(", ")}`,
    `${t.unlockedRooms}: ${progress.questState.unlockedRooms.length}`,
    `${t.dailyChainsCompleted}: ${progress.questState.completedChains}`,
    `${t.escapeSolved}: ${progress.escapeState.solvedRooms.length}`,
    `${t.sigilsCollected}: ${progress.escapeState.sigilsCollected.length}/7`,
    `${t.protocolLazarus}: ${progress.escapeState.protocolActivated ? t.activated : t.notActivated}`,
  ];
  return {
    type: "profile",
    title: t.profileTitle,
    content: lines.join("\n"),
    source: "user_progress",
    sourceLanguage: lang,
    targetLanguage: lang,
  };
}

function buildPreparationNotes(progress: ProgressData, lang: ContextLanguage): string {
  const today = new Date().toISOString().split("T")[0];
  const lines: string[] = [];

  for (const day of PROG) {
    const isPast = day.date < today;
    const isToday = day.date === today;
    const tasksStatus = day.tasks.map(t => {
      const key = `${day.date}-${t.t}`;
      const done = progress.done[key];
      return `  ${done ? "✅" : "⬜"} [${t.t}] ${t.d}`;
    }).join("\n");

    lines.push(`${isToday ? "▶ " : isPast ? "✓ " : "  "}${day.date} — ${day.title}\n${tasksStatus}`);
  }
  return lines.join("\n\n");
}

function buildArtifactSummary(artifacts: Artifact[], lang: ContextLanguage): string {
  const t = L[lang];
  const byType: Record<string, number> = {};
  for (const a of artifacts) {
    byType[a.type] = (byType[a.type] || 0) + 1;
  }

  const typeLines = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `  ${type}: ${count}`)
    .join("\n");

  const totalXp = artifacts.reduce((s, a) => s + a.xpEarned, 0);

  const recent = artifacts.slice(-5).reverse().map(a =>
    `  [${a.date.split("T")[0]}] ${a.type} — ${a.content.slice(0, 80)}${a.content.length > 80 ? "..." : ""}`
  ).join("\n");

  return `${t.total}: ${artifacts.length} artefacts | ${t.xpGenerated}: ${totalXp}\n\n${t.byType}:\n${typeLines}\n\n${t.recent}:\n${recent}`;
}

function buildInterviewContext(artifacts: Artifact[], lang: ContextLanguage): ContextElement {
  const t = L[lang];
  const interviewArtifacts = artifacts.filter(a => a.type === "interview_answer");
  const uniqueQuestions = new Set(interviewArtifacts.map(a => a.metadata?.simQuestionId)).size;
  const scores = interviewArtifacts
    .filter(a => a.metadata?.globalScore)
    .map(a => a.metadata!.globalScore as number);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const zonesCovered = INTERVIEW_ZONES.map(z => {
    const count = interviewArtifacts.filter(a => {
      const q = z.questions.find(q => q.id === a.metadata?.simQuestionId);
      return !!q;
    }).length;
    return `  ${z.icon} ${z.name}: ${count} ${t.answers}`;
  }).join("\n");

  return {
    type: "progress",
    title: t.interviewTitle,
    content: `${t.questionsCovered}: ${uniqueQuestions}/36+
${t.avgScore}: ${avgScore}/100 | ${t.bestScore}: ${bestScore}/100
${t.answersCreated}: ${interviewArtifacts.length}

${t.byZone}:\n${zonesCovered}`,
    source: "user_progress → artifacts[interview_answer]",
    sourceLanguage: "mixed",
    targetLanguage: lang,
  };
}

function buildEscapeContext(escapeState: ProgressData["escapeState"], lang: ContextLanguage): ContextElement {
  const t = L[lang];
  const totalRooms = ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const zoneStatus = ESCAPE_ZONES.map(z => {
    const solved = z.rooms.filter(r => escapeState.solvedRooms.includes(r.id)).length;
    return `  ${z.icon} ${z.name}: ${solved}/${z.rooms.length} ${t.rooms}`;
  }).join("\n");

  return {
    type: "progress",
    title: t.escapeTitle,
    content: `${t.mission}: ${CENTRAL_MISSION.title}
${t.solvedRooms}: ${escapeState.solvedRooms.length}/${totalRooms}
Sigils: ${escapeState.sigilsCollected.length}/7
${t.puzzles}: ${escapeState.solvedPuzzles.length}
${t.protocolLazarus}: ${escapeState.protocolActivated ? t.activated : t.inProgress}

${t.progressByZone}:\n${zoneStatus}`,
    source: "user_progress → escapeState",
    sourceLanguage: "fr",
    targetLanguage: lang,
    translated: lang !== "fr",
  };
}

function buildQuizSummary(quizScores: ProgressData["quizScores"], lang: ContextLanguage): string | null {
  const t = L[lang];
  const entries = Object.entries(quizScores);
  if (entries.length === 0) return null;

  return entries.map(([deck, scores]) => {
    const last = scores[scores.length - 1];
    const best = scores.reduce((b, s) => s.correct / s.total > b.correct / b.total ? s : b, scores[0]);
    return `  ${deck}: ${scores.length} ${t.sessions} | ${t.last}: ${last.correct}/${last.total} | ${t.best}: ${best.correct}/${best.total}`;
  }).join("\n");
}

function generateAIHints(progress: ProgressData, lang: ContextLanguage): string[] {
  const t = L[lang];
  const hints: string[] = [];
  const today = new Date().toISOString().split("T")[0];
  const todayProg = PROG.find(p => p.date === today);

  if (todayProg) {
    const pending = todayProg.tasks.filter(task => !progress.done[`${today}-${task.t}`]);
    if (pending.length > 0) {
      hints.push(`${t.remainingTasks}: ${pending.map(task => task.d).join(" | ")}`);
    }
  }

  if (progress.artifacts.length < 5) {
    hints.push(t.beginner);
  }

  const interviewCount = progress.artifacts.filter(a => a.type === "interview_answer").length;
  if (interviewCount < 10) {
    hints.push(t.priorityInterview);
  }

  if (progress.streak === 0) {
    hints.push(t.streakBroken);
  } else if (progress.streak >= 5) {
    hints.push(`${progress.streak}-${t.streakGoing}`);
  }

  const daysUntil = Math.max(0, Math.ceil((new Date("2026-03-30").getTime() - Date.now()) / 864e5));
  if (daysUntil <= 3) {
    hints.push(`${t.urgent} ${daysUntil} ${t.daysLabel}`);
  } else if (daysUntil <= 7) {
    hints.push(`${t.interviewIn} ${daysUntil} ${t.daysIntensify}`);
  }

  return hints;
}

function buildCompactPreparationNotes(progress: ProgressData, hints: string[], lang: ContextLanguage): string {
  const t = L[lang];
  const daysUntil = Math.max(0, Math.ceil((new Date("2026-03-30").getTime() - Date.now()) / 864e5));

  return `${t.prepNotesHeader}
${t.date}: 30. März 2026 | T-${daysUntil}
${t.position}

${t.prepState}:
• XP: ${progress.xp} | ${t.streak}: ${progress.streak} ${t.days}
• Artefakte: ${progress.artifacts.length} ${t.creations}
• ${t.interview}: ${progress.artifacts.filter(a => a.type === "interview_answer").length} ${t.preparedAnswers}
• ${t.escapeGame}: ${progress.escapeState.solvedRooms.length} ${t.rooms} / ${progress.escapeState.sigilsCollected.length} Sigils

${t.aiHintsLabel}:
${hints.map(h => `• ${h}`).join("\n")}`;
}

// ── Compact context for AI prompts ──

export function buildCompactContext(bundle: ContextBundle): string {
  const t = L[bundle.language];
  const sections = [
    `# ${t.contextHeader}\n${bundle.projectSummary}`,
    `# ${t.prepNotesLabel}\n${bundle.preparationNotes}`,
  ];

  for (const el of bundle.platformElements) {
    if (el.type === "profile" || el.type === "progress") {
      sections.push(`## ${el.title}\n${el.content}`);
    }
  }

  if (bundle.aiHints.length > 0) {
    sections.push(`# ${t.contextualHints}\n${bundle.aiHints.map(h => `- ${h}`).join("\n")}`);
  }

  if (bundle.conversationSummaries.length > 0) {
    sections.push(`# ${t.conversationHistory}\n${bundle.conversationSummaries.map(c => `## ${c.title}\n${c.summary}`).join("\n\n")}`);
  }

  return sections.join("\n\n");
}

// ── Extended context for PDFs ──

export function buildExtendedContext(bundle: ContextBundle): string {
  const t = L[bundle.language];
  const sections = [
    `${t.platformSummary}\n${"=".repeat(40)}\n${bundle.projectSummary}`,
    `\n${t.prepNotes}\n${"=".repeat(40)}\n${bundle.preparationNotes}`,
  ];

  for (const el of bundle.platformElements) {
    sections.push(`\n${el.title.toUpperCase()}\n${"-".repeat(40)}\n${el.content}\n(Source: ${el.source}${el.translated ? ` | ${el.sourceLanguage} → ${el.targetLanguage}` : ""})`);
  }

  if (bundle.uploadedFiles.length > 0) {
    sections.push(`\n${t.attachedFiles}\n${"-".repeat(40)}\n${bundle.uploadedFiles.map(f => `• ${f.name} (${(f.size / 1024).toFixed(1)} Ko)`).join("\n")}`);
  }

  return sections.join("\n\n");
}
