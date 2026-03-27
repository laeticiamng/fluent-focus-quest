// ── Context Bundle Aggregation Service ──
// Collects, normalizes, and structures platform data for AI context injection

import { PROG, DECKS, GERMAN_TEXTS } from "@/data/content";
import { INTERVIEW_ZONES, type InterviewZone } from "@/data/interviewZones";
import { ESCAPE_ZONES, CENTRAL_MISSION, NARRATIVE } from "@/data/escapeGame";
import { ZONES, DAILY_CHAIN_STEPS, CREATION_BADGES, type Artifact, type ZoneId } from "@/hooks/useProgress";

// ── Types ──

export interface ContextElement {
  type: "profile" | "project" | "progress" | "conversation" | "document" | "setting" | "file" | "content";
  title: string;
  content: string;
  source: string;
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
): ContextBundle {
  const elements: ContextElement[] = [];
  const aiHints: string[] = [];
  const now = new Date().toISOString();

  // 1. PROJECT SUMMARY
  const projectSummary = buildProjectSummary();

  // 2. PROFILE / PROGRESS
  const profileElement = buildProfileElement(progress, userEmail);
  elements.push(profileElement);

  // 3. PREPARATION NOTES (from PROG schedule)
  const prepNotes = buildPreparationNotes(progress);
  elements.push({
    type: "content",
    title: "Plan de preparation — Programme 20 jours",
    content: prepNotes,
    source: "data/content.ts → PROG",
  });

  // 4. ARTIFACTS (user creations)
  if (progress.artifacts.length > 0) {
    const artifactSummary = buildArtifactSummary(progress.artifacts);
    elements.push({
      type: "progress",
      title: "Artefacts crees par l'utilisatrice",
      content: artifactSummary,
      source: "user_progress → artifacts",
      updatedAt: progress.artifacts[progress.artifacts.length - 1]?.date,
    });
  }

  // 5. INTERVIEW PREPARATION
  const interviewElement = buildInterviewContext(progress.artifacts);
  elements.push(interviewElement);

  // 6. ESCAPE GAME STATE
  const escapeElement = buildEscapeContext(progress.escapeState);
  elements.push(escapeElement);

  // 7. VOCABULARY DECKS
  elements.push({
    type: "content",
    title: "Decks de vocabulaire",
    content: DECKS.map(d => `${d.icon} ${d.name}: ${d.cards.length} cartes`).join("\n"),
    source: "data/content.ts → DECKS",
  });

  // 8. USER NOTES
  if (progress.notes?.trim()) {
    elements.push({
      type: "document",
      title: "Notes personnelles",
      content: progress.notes,
      source: "user_progress → notes",
    });
  }

  // 9. QUIZ SCORES
  const quizSummary = buildQuizSummary(progress.quizScores);
  if (quizSummary) {
    elements.push({
      type: "progress",
      title: "Scores QCM",
      content: quizSummary,
      source: "user_progress → quizScores",
    });
  }

  // 10. AI HINTS (contextual)
  aiHints.push(...generateAIHints(progress));

  // PREPARATION NOTES (compiled)
  const preparationNotes = buildCompactPreparationNotes(progress, aiHints);

  return {
    projectSummary,
    preparationNotes,
    platformElements: elements,
    conversationSummaries,
    uploadedFiles,
    aiHints,
    generatedAt: now,
  };
}

// ── Sub-builders ──

function buildProjectSummary(): string {
  return `Plateforme de preparation a un entretien medical en Suisse (Spitalzentrum Biel, Angiologie).
Candidate: Dr. Laeticia Motongane — medecin assistante, experience urgences, objectif specialisation angiologie.
Entretien avec Dr. Attias-Widmer le 30 mars 2026.
Modules: vocabulaire medical allemand, grammaire, simulation entretien, raisonnement clinique, escape game pedagogique "Le Complexe Medical".
Architecture gamifiee: zones a debloquer, artefacts a creer, sigils a collecter, Protocole Lazarus.`;
}

function buildProfileElement(progress: ProgressData, userEmail?: string): ContextElement {
  const lines = [
    `Email: ${userEmail || "non connecte"}`,
    `XP total: ${progress.xp}`,
    `Serie (streak): ${progress.streak} jours`,
    `Pomodoros: ${progress.pomodoroCount}`,
    `Artefacts crees: ${progress.artifacts.length}`,
    `Badges gagnes: ${progress.earnedBadges.length} / ${CREATION_BADGES.length}`,
    `Zones debloquees: ${progress.questState.unlockedZones.join(", ")}`,
    `Salles debloquees: ${progress.questState.unlockedRooms.length}`,
    `Chaines quotidiennes completees: ${progress.questState.completedChains}`,
    `Salles d'escape resolues: ${progress.escapeState.solvedRooms.length}`,
    `Sigils collectes: ${progress.escapeState.sigilsCollected.length}/7`,
    `Protocole Lazarus: ${progress.escapeState.protocolActivated ? "ACTIVE" : "non active"}`,
  ];
  return {
    type: "profile",
    title: "Profil & Progression",
    content: lines.join("\n"),
    source: "user_progress",
  };
}

function buildPreparationNotes(progress: ProgressData): string {
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

function buildArtifactSummary(artifacts: Artifact[]): string {
  const byType: Record<string, number> = {};
  for (const a of artifacts) {
    byType[a.type] = (byType[a.type] || 0) + 1;
  }

  const typeLines = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `  ${type}: ${count}`)
    .join("\n");

  const totalXp = artifacts.reduce((s, a) => s + a.xpEarned, 0);

  // Last 5 artifacts
  const recent = artifacts.slice(-5).reverse().map(a =>
    `  [${a.date.split("T")[0]}] ${a.type} — ${a.content.slice(0, 80)}${a.content.length > 80 ? "..." : ""}`
  ).join("\n");

  return `Total: ${artifacts.length} artefacts | XP genere: ${totalXp}\n\nPar type:\n${typeLines}\n\nDerniers:\n${recent}`;
}

function buildInterviewContext(artifacts: Artifact[]): ContextElement {
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
    return `  ${z.icon} ${z.name}: ${count} reponses`;
  }).join("\n");

  return {
    type: "progress",
    title: "Preparation entretien",
    content: `Questions couvertes: ${uniqueQuestions}/36+
Score moyen: ${avgScore}/100 | Meilleur: ${bestScore}/100
Reponses creees: ${interviewArtifacts.length}

Par zone:\n${zonesCovered}`,
    source: "user_progress → artifacts[interview_answer]",
  };
}

function buildEscapeContext(escapeState: ProgressData["escapeState"]): ContextElement {
  const totalRooms = ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const zoneStatus = ESCAPE_ZONES.map(z => {
    const solved = z.rooms.filter(r => escapeState.solvedRooms.includes(r.id)).length;
    return `  ${z.icon} ${z.name}: ${solved}/${z.rooms.length} salles`;
  }).join("\n");

  return {
    type: "progress",
    title: "Escape Game — Le Complexe Medical",
    content: `Mission: ${CENTRAL_MISSION.title}
Salles resolues: ${escapeState.solvedRooms.length}/${totalRooms}
Sigils: ${escapeState.sigilsCollected.length}/7
Puzzles: ${escapeState.solvedPuzzles.length}
Protocole Lazarus: ${escapeState.protocolActivated ? "ACTIVE" : "en cours"}

Progression par zone:\n${zoneStatus}`,
    source: "user_progress → escapeState",
  };
}

function buildQuizSummary(quizScores: ProgressData["quizScores"]): string | null {
  const entries = Object.entries(quizScores);
  if (entries.length === 0) return null;

  return entries.map(([deck, scores]) => {
    const last = scores[scores.length - 1];
    const best = scores.reduce((b, s) => s.correct / s.total > b.correct / b.total ? s : b, scores[0]);
    return `  ${deck}: ${scores.length} sessions | Dernier: ${last.correct}/${last.total} | Meilleur: ${best.correct}/${best.total}`;
  }).join("\n");
}

function generateAIHints(progress: ProgressData): string[] {
  const hints: string[] = [];
  const today = new Date().toISOString().split("T")[0];
  const todayProg = PROG.find(p => p.date === today);

  if (todayProg) {
    const pending = todayProg.tasks.filter(t => !progress.done[`${today}-${t.t}`]);
    if (pending.length > 0) {
      hints.push(`Taches du jour restantes: ${pending.map(t => t.d).join(" | ")}`);
    }
  }

  if (progress.artifacts.length < 5) {
    hints.push("Debutante: encourager la creation de premiers artefacts (phrases forgees, definitions)");
  }

  const interviewCount = progress.artifacts.filter(a => a.type === "interview_answer").length;
  if (interviewCount < 10) {
    hints.push("Priorite: augmenter le nombre de reponses d'entretien preparees");
  }

  if (progress.streak === 0) {
    hints.push("Serie interrompue: remotiver et proposer une micro-tache facile");
  } else if (progress.streak >= 5) {
    hints.push(`Serie de ${progress.streak} jours: feliciter et maintenir le rythme`);
  }

  const daysUntil = Math.max(0, Math.ceil((new Date("2026-03-30").getTime() - Date.now()) / 864e5));
  if (daysUntil <= 3) {
    hints.push(`URGENT: entretien dans ${daysUntil} jour(s) — focus revision et confiance`);
  } else if (daysUntil <= 7) {
    hints.push(`Entretien dans ${daysUntil} jours — intensifier simulations`);
  }

  return hints;
}

function buildCompactPreparationNotes(progress: ProgressData, hints: string[]): string {
  const daysUntil = Math.max(0, Math.ceil((new Date("2026-03-30").getTime() - Date.now()) / 864e5));

  return `NOTES DE PREPARATION — Entretien Dr. Attias-Widmer (Spitalzentrum Biel)
Date: 30 mars 2026 | J-${daysUntil}
Poste: Assistenzarztin Angiologie

ETAT DE PREPARATION:
• XP: ${progress.xp} | Serie: ${progress.streak} jours
• Artefacts: ${progress.artifacts.length} creations
• Entretien: ${progress.artifacts.filter(a => a.type === "interview_answer").length} reponses preparees
• Escape game: ${progress.escapeState.solvedRooms.length} salles / ${progress.escapeState.sigilsCollected.length} sigils

INDICES IA:
${hints.map(h => `• ${h}`).join("\n")}`;
}

// ── Compact context for AI prompts ──

export function buildCompactContext(bundle: ContextBundle): string {
  const sections = [
    `# Contexte Plateforme\n${bundle.projectSummary}`,
    `# Notes de Preparation\n${bundle.preparationNotes}`,
  ];

  // Add key elements only
  for (const el of bundle.platformElements) {
    if (el.type === "profile" || el.type === "progress") {
      sections.push(`## ${el.title}\n${el.content}`);
    }
  }

  if (bundle.aiHints.length > 0) {
    sections.push(`# Indices Contextuels\n${bundle.aiHints.map(h => `- ${h}`).join("\n")}`);
  }

  if (bundle.conversationSummaries.length > 0) {
    sections.push(`# Historique Conversations\n${bundle.conversationSummaries.map(c => `## ${c.title}\n${c.summary}`).join("\n\n")}`);
  }

  return sections.join("\n\n");
}

// ── Extended context for PDFs ──

export function buildExtendedContext(bundle: ContextBundle): string {
  const sections = [
    `RESUME PLATEFORME\n${"=".repeat(40)}\n${bundle.projectSummary}`,
    `\nNOTES DE PREPARATION\n${"=".repeat(40)}\n${bundle.preparationNotes}`,
  ];

  for (const el of bundle.platformElements) {
    sections.push(`\n${el.title.toUpperCase()}\n${"-".repeat(40)}\n${el.content}\n(Source: ${el.source})`);
  }

  if (bundle.uploadedFiles.length > 0) {
    sections.push(`\nFICHIERS JOINTS\n${"-".repeat(40)}\n${bundle.uploadedFiles.map(f => `• ${f.name} (${(f.size / 1024).toFixed(1)} Ko)`).join("\n")}`);
  }

  return sections.join("\n\n");
}
