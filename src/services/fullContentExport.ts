// ── Full Content Extraction Service ──
// Extracts ALL raw content from the platform (no summaries, no truncation)
// for full PDF export. Splits into up to 5 balanced PDFs.

import { PROG, DECKS, IVW, SURVIVAL, GRAM, SCENARIOS, CHECKLIST, MOTIV, SUISSE_AVANTAGES, OBJECTIF, TEMPLATES } from "@/data/content";
import { INTERVIEW_ZONES } from "@/data/interviewZones";
import { ESCAPE_ZONES, CENTRAL_MISSION, NARRATIVE } from "@/data/escapeGame";
import { getAllPuzzles } from "@/data/puzzleEngine";
import type { Artifact } from "@/hooks/useProgress";

export interface FullContentBlock {
  id: string;
  source: "vocabulary" | "grammar" | "interview" | "clinical" | "escape" | "puzzle" | "template" | "motivation" | "checklist" | "preparation" | "artifact" | "note" | "conversation";
  title: string;
  content: string;
  createdAt?: string;
}

interface FullContentProgress {
  artifacts: Artifact[];
  notes: string;
  done: Record<string, boolean>;
  quizScores: Record<string, Array<{ correct: number; total: number; date: string }>>;
}

// ── Main extraction function ──
export function extractFullPlatformContent(
  progress?: FullContentProgress,
  conversationMessages?: Array<{ role: string; content: string; timestamp?: string }>[]
): FullContentBlock[] {
  const blocks: FullContentBlock[] = [];
  let id = 0;
  const nextId = () => `fc-${++id}`;

  // ═══ 1. OBJECTIF & CONTEXT ═══
  blocks.push({
    id: nextId(),
    source: "preparation",
    title: "Objectif — Candidature",
    content: Object.entries(OBJECTIF).map(([k, v]) => `${k}: ${v}`).join("\n"),
  });

  // ═══ 2. PROGRAMME COMPLET (20 jours) ═══
  blocks.push({
    id: nextId(),
    source: "preparation",
    title: "Programme de préparation — 20 jours complet",
    content: PROG.map(day => {
      const tasksText = day.tasks.map(t => {
        const key = progress ? `${day.date}-${t.t}` : "";
        const done = progress?.done[key] ? "✅" : "⬜";
        return `  ${done} [${t.t}] (${t.tp}) ${t.d}`;
      }).join("\n");
      return `--- ${day.date} — ${day.title} (Semaine ${day.w}) ---\n${tasksText}`;
    }).join("\n\n"),
  });

  // ═══ 3. VOCABULAIRE COMPLET — Tous les decks, toutes les cartes ═══
  for (const deck of DECKS) {
    blocks.push({
      id: nextId(),
      source: "vocabulary",
      title: `Vocabulaire: ${deck.icon} ${deck.name} (${deck.cards.length} cartes)`,
      content: deck.cards.map((c, i) => `${i + 1}. ${c.de} → ${c.fr}`).join("\n"),
    });
  }

  // ═══ 4. GRAMMAIRE COMPLÈTE — Règles + exercices ═══
  for (const section of GRAM) {
    const rulesText = section.items.map(item => `• ${item.l}: ${item.e}`).join("\n");
    const exercisesText = section.exercises
      ? section.exercises.map((ex, i) => `  ${i + 1}. ${ex.q}\n     FR: ${ex.fr}\n     Options: ${ex.opts.join(" / ")}\n     Réponse: ${ex.a}`).join("\n")
      : "";
    blocks.push({
      id: nextId(),
      source: "grammar",
      title: `Grammaire: ${section.title}`,
      content: `RÈGLES:\n${rulesText}${exercisesText ? `\n\nEXERCICES:\n${exercisesText}` : ""}`,
    });
  }

  // ═══ 5. QUESTIONS D'ENTRETIEN COMPLÈTES (IVW) ═══
  blocks.push({
    id: nextId(),
    source: "interview",
    title: "Questions d'entretien — Réponses de base (IVW)",
    content: IVW.map((q, i) => `${i + 1}. FRAGE: ${q.q}\n   HINWEIS: ${q.h}\n   ANTWORT: ${q.r}`).join("\n\n"),
  });

  // ═══ 6. INTERVIEW ZONES COMPLÈTES — Questions + réponses + follow-ups + keywords ═══
  for (const zone of INTERVIEW_ZONES) {
    const questionsText = zone.questions.map(q => {
      const lines = [
        `FRAGE [${q.id}] (Diff. ${q.difficulty}): ${q.q}`,
      ];
      if (q.qFr) lines.push(`  FR: ${q.qFr}`);
      lines.push(`  HINWEIS: ${q.h}`);
      lines.push(`  ANTWORT (DE): ${q.r}`);
      if (q.rFr) lines.push(`  ANTWORT (FR): ${q.rFr}`);
      if (q.followUps.length > 0) lines.push(`  FOLLOW-UPS (DE): ${q.followUps.join(" | ")}`);
      if (q.followUpsFr && q.followUpsFr.length > 0) lines.push(`  FOLLOW-UPS (FR): ${q.followUpsFr.join(" | ")}`);
      lines.push(`  KEYWORDS: ${q.keywords.join(", ")}`);
      return lines.join("\n");
    }).join("\n\n");

    blocks.push({
      id: nextId(),
      source: "interview",
      title: `Entretien Zone: ${zone.icon} ${zone.name}${zone.nameFr ? ` / ${zone.nameFr}` : ""} — ${zone.questions.length} questions`,
      content: `Description: ${zone.description}${zone.descriptionFr ? `\nDescription FR: ${zone.descriptionFr}` : ""}\nNarratif: ${zone.narrativeIntro}\n\n${questionsText}`,
    });
  }

  // ═══ 7. PHRASES DE SURVIE ═══
  blocks.push({
    id: nextId(),
    source: "vocabulary",
    title: "Phrases de survie — Communication d'urgence",
    content: SURVIVAL.map(cat =>
      `--- ${cat.cat} ---\n${cat.items.map(item => `  DE: ${item.de}\n  FR: ${item.fr}`).join("\n")}`
    ).join("\n\n"),
  });

  // ═══ 8. CAS CLINIQUES COMPLETS ═══
  for (const sc of SCENARIOS) {
    blocks.push({
      id: nextId(),
      source: "clinical",
      title: `Cas clinique: ${sc.icon} ${sc.title}`,
      content: [
        `SITUATION (DE): ${sc.sit}`,
        sc.sitFr ? `SITUATION (FR): ${sc.sitFr}` : "",
        `\nVOCABULAIRE (DE): ${sc.vocab.join(", ")}`,
        sc.vocabFr ? `VOCABULAIRE (FR): ${sc.vocabFr.join(", ")}` : "",
        `\nÉTAPES (DE):\n${sc.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}`,
        sc.stepsFr ? `\nÉTAPES (FR):\n${sc.stepsFr.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}` : "",
      ].filter(Boolean).join("\n"),
    });
  }

  // ═══ 9. ESCAPE GAME — Contenu narratif complet ═══
  blocks.push({
    id: nextId(),
    source: "escape",
    title: "Escape Game: Mission Centrale — Protocole Lazarus",
    content: `TITRE: ${CENTRAL_MISSION.title} — ${CENTRAL_MISSION.subtitle}\n\nDESCRIPTION COMPLÈTE:\n${CENTRAL_MISSION.description}\n\nCONTEXTE NARRATIF:\n${NARRATIVE.worldContext}\n\nRÔLE DU JOUEUR:\n${NARRATIVE.playerRole}\n\nOBJECTIF ULTIME:\n${NARRATIVE.ultimateGoal}`,
  });

  for (const zone of ESCAPE_ZONES) {
    const roomsText = zone.rooms.map(room => [
      `  SALLE: ${room.icon} ${room.name} — ${room.subtitle}`,
      `  Description: ${room.description}`,
      `  Défi: ${room.challenge}`,
      `  Récompense: ${room.reward.icon} ${room.reward.name} — ${room.reward.description}`,
      `  Narratif (découverte): ${room.narrativeOnDiscover}`,
      `  Narratif (résolu): ${room.narrativeOnSolve}`,
      `  Seuil: ${room.solveThreshold} artefacts (types: ${room.artifactTypes.join(", ") || "tous"})`,
    ].join("\n")).join("\n\n");

    blocks.push({
      id: nextId(),
      source: "escape",
      title: `Escape Zone: ${zone.icon} ${zone.name} — ${zone.subtitle}`,
      content: `Description: ${zone.description}\nNarratif: ${zone.narrative}\nCondition: ${zone.unlockRequirement.details}\n\nSALLES:\n${roomsText}`,
    });
  }

  // ═══ 10. PUZZLES COMPLETS ═══
  const allPuzzles = [...(INTERVIEW_PUZZLES || []), ...(ESCAPE_ROOM_PUZZLES || [])];
  if (allPuzzles.length > 0) {
    blocks.push({
      id: nextId(),
      source: "puzzle",
      title: `Puzzles — ${allPuzzles.length} énigmes complètes`,
      content: allPuzzles.map(p => [
        `PUZZLE: ${p.title} [${p.type}] (Diff. ${p.difficulty})`,
        `Salle: ${p.roomId} | Catégorie: ${p.category}`,
        `Narratif: ${p.narrative}`,
        `Question: ${p.prompt}`,
        `Solution: ${p.solution}`,
        p.alternatives ? `Alternatives: ${p.alternatives.join(", ")}` : "",
        `Indices: ${p.hints.map(h => `[Niv.${h.level}] ${h.text}`).join(" | ")}`,
        `Vocabulaire DE: ${p.germanVocab.join(", ")}`,
        `Récompense: ${p.reward.xp} XP — ${p.reward.narrativeReveal}`,
      ].filter(Boolean).join("\n")).join("\n\n---\n\n"),
    });
  }

  // ═══ 11. TEMPLATES D'ÉCRITURE ═══
  for (const tmpl of TEMPLATES) {
    blocks.push({
      id: nextId(),
      source: "template",
      title: `Template: ${tmpl.title}`,
      content: `VERSION ALLEMANDE:\n${tmpl.de}\n\nVERSION FRANÇAISE:\n${tmpl.fr}`,
    });
  }

  // ═══ 12. CHECKLIST JOUR J ═══
  blocks.push({
    id: nextId(),
    source: "checklist",
    title: "Checklist Jour J — Liste complète",
    content: CHECKLIST.map(cat => `${cat.cat}:\n${cat.items.map(item => `  ☐ ${item}`).join("\n")}`).join("\n\n"),
  });

  // ═══ 13. MOTIVATION — Toutes les phrases ═══
  blocks.push({
    id: nextId(),
    source: "motivation",
    title: `Motivation — ${MOTIV.length} phrases complètes`,
    content: MOTIV.map((m, i) => `${i + 1}. ${m}`).join("\n"),
  });

  // ═══ 14. AVANTAGES SUISSE ═══
  blocks.push({
    id: nextId(),
    source: "motivation",
    title: "Avantages Suisse vs France — Comparatif détaillé",
    content: SUISSE_AVANTAGES.map(a => `${a.icon} ${a.title}\n  ${a.detail}`).join("\n\n"),
  });

  // ═══ 15. USER ARTIFACTS (contenu brut complet) ═══
  if (progress?.artifacts && progress.artifacts.length > 0) {
    for (const artifact of progress.artifacts) {
      blocks.push({
        id: nextId(),
        source: "artifact",
        title: `Artefact [${artifact.type}] — ${artifact.date.split("T")[0]}`,
        content: artifact.content,
        createdAt: artifact.date,
      });
    }
  }

  // ═══ 16. NOTES UTILISATEUR (contenu brut) ═══
  if (progress?.notes?.trim()) {
    blocks.push({
      id: nextId(),
      source: "note",
      title: "Notes personnelles — Texte intégral",
      content: progress.notes,
    });
  }

  // ═══ 17. SCORES QUIZ (données complètes) ═══
  if (progress?.quizScores) {
    const entries = Object.entries(progress.quizScores);
    if (entries.length > 0) {
      blocks.push({
        id: nextId(),
        source: "artifact",
        title: "Scores QCM — Historique complet",
        content: entries.map(([deck, scores]) =>
          `${deck}:\n${scores.map((s, i) => `  Session ${i + 1} (${s.date}): ${s.correct}/${s.total}`).join("\n")}`
        ).join("\n\n"),
      });
    }
  }

  return blocks;
}

// ── Split blocks into up to 5 balanced PDF groups ──
export type PdfGroup = {
  id: number;
  title: string;
  blocks: FullContentBlock[];
};

export function splitIntoPdfGroups(blocks: FullContentBlock[]): PdfGroup[] {
  // Group by logical category
  const categories: Record<string, FullContentBlock[]> = {
    "Vocabulaire & Grammaire": [],
    "Entretien & Questions": [],
    "Cas cliniques & Escape Game": [],
    "Préparation & Programme": [],
    "Artefacts & Notes": [],
  };

  for (const block of blocks) {
    switch (block.source) {
      case "vocabulary":
      case "grammar":
        categories["Vocabulaire & Grammaire"].push(block);
        break;
      case "interview":
        categories["Entretien & Questions"].push(block);
        break;
      case "clinical":
      case "escape":
      case "puzzle":
        categories["Cas cliniques & Escape Game"].push(block);
        break;
      case "preparation":
      case "template":
      case "checklist":
      case "motivation":
        categories["Préparation & Programme"].push(block);
        break;
      case "artifact":
      case "note":
      case "conversation":
        categories["Artefacts & Notes"].push(block);
        break;
    }
  }

  // Build groups, skip empty ones
  const groups: PdfGroup[] = [];
  let idx = 1;
  for (const [title, groupBlocks] of Object.entries(categories)) {
    if (groupBlocks.length > 0) {
      groups.push({ id: idx++, title, blocks: groupBlocks });
    }
  }

  return groups;
}
