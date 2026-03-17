import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import {
  ESCAPE_ZONES,
  computeRoomProgress,
  computeRoomStatus,
  computeZoneStatus,
  type EscapeFragment,
  type FragmentType,
  type RoomStatus,
} from "@/data/escapeGame";

interface QuizScore {
  correct: number;
  total: number;
  date: string;
}

export type ArtifactType =
  | "phrase_forged"
  | "definition_written"
  | "phrase_assembled"
  | "grammar_phrase"
  | "grammar_rule"
  | "grammar_transform"
  | "interview_answer"
  | "script"
  | "diagnostic"
  | "clinical_note"
  | "case_patient"
  | "document"
  | "recording";

export interface Artifact {
  id: string;
  type: ArtifactType;
  sourceModule: string;
  content: string;
  feedback?: string;
  xpEarned: number;
  date: string;
  version?: number;
  metadata?: Record<string, unknown>;
}

export const XP_VALUES = {
  PHRASE_FORGED: 20,
  DEFINITION_WRITTEN: 15,
  PHRASE_ASSEMBLED: 10,
  GRAMMAR_PHRASE: 20,
  GRAMMAR_RULE: 30,
  GRAMMAR_TRANSFORM: 15,
  INTERVIEW_ANSWER: 25,
  INTERVIEW_IMPROVED: 15,
  SCRIPT_WRITTEN: 50,
  DIAGNOSTIC_BUILT: 40,
  CLINICAL_NOTE: 35,
  CASE_PATIENT: 45,
  DOCUMENT: 40,
  RECORDING: 20,
  FLASHCARD_FLIP: 3,
  QCM_CORRECT: 5,
  GRAMMAR_QCM: 5,
  POMODORO: 20,
  RATING_HIGH: 10,
  TASK_TOGGLE: 25,
  ANALYSIS: 30,
} as const;

// ===== LEGACY ZONE SYSTEM (kept for backward compat) =====
export type ZoneId = "forge" | "grammar" | "studio" | "clinical" | "atelier" | "archive";

export interface Zone {
  id: ZoneId;
  name: string;
  icon: string;
  description: string;
  color: string;
  unlockCondition: (artifacts: Artifact[], state: ProgressState) => boolean;
  unlockHint: string;
  rooms: ZoneRoom[];
}

export interface ZoneRoom {
  id: string;
  name: string;
  icon: string;
  unlockCondition: (artifacts: Artifact[], state: ProgressState) => boolean;
  unlockHint: string;
}

export interface QuestStep {
  id: string;
  label: string;
  icon: string;
  zoneId: ZoneId;
  completed: boolean;
}

export const ZONES: Zone[] = [
  {
    id: "forge", name: "La Forge", icon: "🔨", description: "Forge tes premieres armes linguistiques", color: "amber",
    unlockCondition: () => true, unlockHint: "Toujours accessible",
    rooms: [
      { id: "forge-vocab", name: "Enclume a mots", icon: "📖", unlockCondition: () => true, unlockHint: "" },
      { id: "forge-phrases", name: "Etabli de phrases", icon: "✍️", unlockCondition: (a) => a.filter(x => x.type === "phrase_forged").length >= 3, unlockHint: "Forge 3 phrases" },
      { id: "forge-master", name: "Salle du Maitre Forgeron", icon: "⚒️", unlockCondition: (a) => a.filter(x => x.type === "phrase_forged").length >= 15, unlockHint: "Forge 15 phrases" },
    ],
  },
  {
    id: "grammar", name: "L'Arbre des Regles", icon: "🌳", description: "Construis l'architecture de ta grammaire", color: "grammar",
    unlockCondition: (a) => a.filter(x => x.type === "phrase_forged").length >= 5, unlockHint: "Forge 5 phrases pour debloquer",
    rooms: [
      { id: "gram-roots", name: "Racines", icon: "🌱", unlockCondition: () => true, unlockHint: "" },
      { id: "gram-branches", name: "Branches", icon: "🌿", unlockCondition: (a) => a.filter(x => x.type === "grammar_phrase" || x.type === "grammar_rule").length >= 3, unlockHint: "Construis 3 regles" },
      { id: "gram-canopy", name: "Canopee", icon: "🌲", unlockCondition: (a) => a.filter(x => x.type === "grammar_phrase" || x.type === "grammar_rule" || x.type === "grammar_transform").length >= 10, unlockHint: "10 constructions grammaticales" },
    ],
  },
  {
    id: "studio", name: "Le Studio", icon: "💼", description: "Prepare tes reponses d'entretien comme un pro", color: "accent",
    unlockCondition: (a) => a.filter(x => x.type === "grammar_phrase" || x.type === "grammar_rule" || x.type === "grammar_transform").length >= 3, unlockHint: "Construis 3 regles de grammaire",
    rooms: [
      { id: "studio-prep", name: "Salle de preparation", icon: "📝", unlockCondition: () => true, unlockHint: "" },
      { id: "studio-record", name: "Studio d'enregistrement", icon: "🎙️", unlockCondition: (a) => a.filter(x => x.type === "interview_answer").length >= 5, unlockHint: "Cree 5 reponses" },
      { id: "studio-master", name: "Salle de conference", icon: "🏛️", unlockCondition: (a) => new Set(a.filter(x => x.type === "interview_answer").map(x => x.metadata?.questionIdx)).size >= 15, unlockHint: "15 questions couvertes" },
    ],
  },
  {
    id: "clinical", name: "L'Hopital", icon: "🏥", description: "Raisonnement clinique en allemand medical", color: "clinical",
    unlockCondition: (a) => a.filter(x => x.type === "interview_answer").length >= 3, unlockHint: "Cree 3 reponses d'entretien",
    rooms: [
      { id: "clin-triage", name: "Triage", icon: "🚑", unlockCondition: () => true, unlockHint: "" },
      { id: "clin-ward", name: "Service", icon: "🩺", unlockCondition: (a) => a.filter(x => x.type === "diagnostic" || x.type === "clinical_note").length >= 3, unlockHint: "3 diagnostics construits" },
      { id: "clin-chief", name: "Bureau du Chef", icon: "👨‍⚕️", unlockCondition: (a) => a.filter(x => x.type === "diagnostic" || x.type === "clinical_note" || x.type === "case_patient").length >= 8, unlockHint: "8 dossiers cliniques" },
    ],
  },
  {
    id: "atelier", name: "Les Ateliers", icon: "✨", description: "9 ateliers de creation avancee", color: "primary",
    unlockCondition: (a) => a.filter(x => x.type === "diagnostic" || x.type === "clinical_note").length >= 1, unlockHint: "Construis 1 diagnostic clinique",
    rooms: [
      { id: "atl-basic", name: "Ateliers de base", icon: "🧪", unlockCondition: () => true, unlockHint: "" },
      { id: "atl-advanced", name: "Ateliers avances", icon: "⚡", unlockCondition: (a) => a.length >= 20, unlockHint: "20 creations au total" },
      { id: "atl-master", name: "Atelier du Maitre", icon: "👑", unlockCondition: (a) => a.length >= 50, unlockHint: "50 creations au total" },
    ],
  },
  {
    id: "archive", name: "Les Archives", icon: "📚", description: "Ton portfolio et tes statistiques de progression", color: "info",
    unlockCondition: (a) => a.length >= 10, unlockHint: "Cree 10 artefacts au total",
    rooms: [
      { id: "arch-gallery", name: "Galerie", icon: "🖼️", unlockCondition: () => true, unlockHint: "" },
      { id: "arch-stats", name: "Observatoire", icon: "📊", unlockCondition: (a) => a.length >= 25, unlockHint: "25 creations" },
      { id: "arch-legend", name: "Hall of Fame", icon: "🏆", unlockCondition: (a) => a.length >= 75, unlockHint: "75 creations" },
    ],
  },
];

// ===== DAILY CHAIN (now: Daily Mission Protocol) =====
export const DAILY_CHAIN_STEPS: { id: string; label: string; activeLabel: string; icon: string; zoneId: ZoneId; artifactTypes: ArtifactType[]; minCount: number }[] = [
  { id: "chain-forge", label: "Forge 2 phrases", activeLabel: "Forge en cours", icon: "🔨", zoneId: "forge", artifactTypes: ["phrase_forged"], minCount: 2 },
  { id: "chain-grammar", label: "Construis 1 regle", activeLabel: "Construction en cours", icon: "🌳", zoneId: "grammar", artifactTypes: ["grammar_phrase", "grammar_rule", "grammar_transform"], minCount: 1 },
  { id: "chain-studio", label: "Cree 1 reponse", activeLabel: "Creation en cours", icon: "🎙️", zoneId: "studio", artifactTypes: ["interview_answer"], minCount: 1 },
  { id: "chain-clinical", label: "Construis 1 diagnostic", activeLabel: "Diagnostic en cours", icon: "🏥", zoneId: "clinical", artifactTypes: ["diagnostic", "clinical_note"], minCount: 1 },
  { id: "chain-free", label: "Creation libre", activeLabel: "Creation libre en cours", icon: "⚗️", zoneId: "atelier", artifactTypes: [], minCount: 1 },
];

export const CREATION_BADGES = [
  { id: "first_creation", label: "Premiere forge", emoji: "🔨", condition: (a: Artifact[]) => a.length >= 1 },
  { id: "phrase_10", label: "10 phrases forgees", emoji: "✍️", condition: (a: Artifact[]) => a.filter(x => x.type === "phrase_forged").length >= 10 },
  { id: "phrase_50", label: "Forgeron actif", emoji: "⚒️", condition: (a: Artifact[]) => a.filter(x => x.type === "phrase_forged").length >= 50 },
  { id: "first_script", label: "Premier script redige", emoji: "📋", condition: (a: Artifact[]) => a.filter(x => x.type === "script").length >= 1 },
  { id: "first_diagnostic", label: "Premier diagnostic", emoji: "🏥", condition: (a: Artifact[]) => a.filter(x => x.type === "diagnostic" || x.type === "clinical_note").length >= 1 },
  { id: "interview_5", label: "5 reponses creees", emoji: "💬", condition: (a: Artifact[]) => a.filter(x => x.type === "interview_answer").length >= 5 },
  { id: "interview_book", label: "Book complet", emoji: "📚", condition: (a: Artifact[]) => new Set(a.filter(x => x.type === "interview_answer").map(x => x.metadata?.questionIdx)).size >= 20 },
  { id: "grammar_rules_5", label: "Constructeur de regles", emoji: "🌳", condition: (a: Artifact[]) => a.filter(x => x.type === "grammar_rule" || x.type === "grammar_phrase").length >= 5 },
  { id: "creator_10", label: "10 creations", emoji: "🧱", condition: (a: Artifact[]) => a.length >= 10 },
  { id: "creator_25", label: "25 creations", emoji: "🏗️", condition: (a: Artifact[]) => a.length >= 25 },
  { id: "creator_50", label: "50 creations", emoji: "🏛️", condition: (a: Artifact[]) => a.length >= 50 },
  { id: "creator_100", label: "Architecte", emoji: "👑", condition: (a: Artifact[]) => a.length >= 100 },
] as const;

// ===== ESCAPE GAME STATE =====
export interface InventoryItem {
  id: string;
  type: FragmentType;
  name: string;
  icon: string;
  description: string;
  roomSource: string;
  obtainedAt: string;
}

export interface EscapeGameState {
  solvedRooms: string[];
  inventory: InventoryItem[];
  discoveredRooms: string[];
  currentMissionStep: string; // narrative bookmark
  sigilsCollected: string[]; // master_sigil fragment names
  newEscapeEvents: string[]; // for reveal animations
  solvedPuzzles: string[]; // puzzle IDs that have been solved
  solvedGateIds: string[]; // PhraseGate challenge IDs that have been solved
  protocolActivated: boolean; // whether Protocole Lazarus meta-puzzle is complete
}

export interface QuestState {
  currentZoneId: ZoneId;
  unlockedZones: ZoneId[];
  unlockedRooms: string[];
  chainProgress: Record<string, number>;
  chainDate: string;
  completedChains: number;
  newUnlocks: string[];
}

interface ProgressState {
  done: Record<string, boolean>;
  xp: number;
  rat: Record<number, number>;
  cl: Record<string, boolean>;
  streak: number;
  lastActiveDate: string;
  quizScores: Record<string, QuizScore[]>;
  hardCards: Record<string, boolean>;
  notes: string;
  pomodoroCount: number;
  grammarDone: Record<string, boolean>;
  artifacts: Artifact[];
  earnedBadges: string[];
  questState: QuestState;
  escapeState: EscapeGameState;
}

const defaultEscapeState: EscapeGameState = {
  solvedRooms: [],
  inventory: [],
  discoveredRooms: ["forge-anvil"],
  currentMissionStep: "ch1",
  sigilsCollected: [],
  newEscapeEvents: [],
  solvedPuzzles: [],
  solvedGateIds: [],
  protocolActivated: false,
};

const defaultQuestState: QuestState = {
  currentZoneId: "forge",
  unlockedZones: ["forge"],
  unlockedRooms: ["forge-vocab"],
  chainProgress: {},
  chainDate: "",
  completedChains: 0,
  newUnlocks: [],
};

const LOCAL_STORAGE_KEY = "fluent-focus-progress-backup";

function safeLocalGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeLocalSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* quota exceeded */ }
}

const defaultState: ProgressState = {
  done: {}, xp: 0, rat: {}, cl: {},
  streak: 0, lastActiveDate: "",
  quizScores: {}, hardCards: {}, notes: "",
  pomodoroCount: 0, grammarDone: {},
  artifacts: [],
  earnedBadges: [],
  questState: defaultQuestState,
  escapeState: defaultEscapeState,
};

function calcStreak(lastDate: string, currentStreak: number): { streak: number; lastActiveDate: string } {
  const today = new Date().toISOString().split("T")[0];
  if (lastDate === today) return { streak: currentStreak, lastActiveDate: today };
  const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
  if (lastDate === yesterday) return { streak: currentStreak + 1, lastActiveDate: today };
  return { streak: 1, lastActiveDate: today };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function checkUnlocks(artifacts: Artifact[], state: ProgressState): { zones: ZoneId[]; rooms: string[] } {
  const qs = state.questState;
  const newZones: ZoneId[] = [];
  const newRooms: string[] = [];

  for (const zone of ZONES) {
    if (!qs.unlockedZones.includes(zone.id) && zone.unlockCondition(artifacts, state)) {
      newZones.push(zone.id);
    }
    if (qs.unlockedZones.includes(zone.id) || newZones.includes(zone.id)) {
      for (const room of zone.rooms) {
        if (!qs.unlockedRooms.includes(room.id) && room.unlockCondition(artifacts, state)) {
          newRooms.push(room.id);
        }
      }
    }
  }
  return { zones: newZones, rooms: newRooms };
}

function updateChainProgress(artifacts: Artifact[], questState: QuestState): QuestState {
  const today = new Date().toISOString().split("T")[0];
  const todayArtifacts = artifacts.filter(a => a.date.startsWith(today));

  // Compute required artifact count from typed steps (excluding chain-free)
  const requiredFromOtherSteps = DAILY_CHAIN_STEPS
    .filter(s => s.artifactTypes.length > 0)
    .reduce((sum, s) => sum + s.minCount, 0);

  const chainProgress: Record<string, number> = {};
  for (const step of DAILY_CHAIN_STEPS) {
    if (step.artifactTypes.length === 0) {
      // "Creation libre": count only artifacts beyond what other steps require
      const extraCount = Math.max(0, todayArtifacts.length - requiredFromOtherSteps);
      chainProgress[step.id] = extraCount;
    } else {
      chainProgress[step.id] = todayArtifacts.filter(a => step.artifactTypes.includes(a.type)).length;
    }
  }

  let chainComplete = true;
  for (const step of DAILY_CHAIN_STEPS) {
    if (chainProgress[step.id] < step.minCount) {
      chainComplete = false;
      break;
    }
  }

  return {
    ...questState,
    chainProgress,
    chainDate: today,
    completedChains: chainComplete && questState.chainDate !== today
      ? questState.completedChains + 1
      : questState.completedChains,
  };
}

// ===== CHECK ESCAPE GAME ROOM SOLVES =====
function checkEscapeRoomSolves(artifacts: Artifact[], escapeState: EscapeGameState): {
  newSolvedRooms: string[];
  newFragments: InventoryItem[];
  newSigils: string[];
  newDiscoveredRooms: string[];
} {
  const newSolvedRooms: string[] = [];
  const newFragments: InventoryItem[] = [];
  const newSigils: string[] = [];
  const newDiscoveredRooms: string[] = [];
  const allSolved = [...escapeState.solvedRooms];

  for (const zone of ESCAPE_ZONES) {
    // Check zone unlock first
    const zoneStatus = computeZoneStatus(zone, allSolved, artifacts);
    if (!zoneStatus.unlocked) continue;

    for (const room of zone.rooms) {
      if (allSolved.includes(room.id)) continue;

      const status = computeRoomStatus(room, allSolved, artifacts, artifacts.length);

      // Track newly discovered rooms
      if ((status === "accessible" || status === "in_progress" || status === "solved") &&
          !escapeState.discoveredRooms.includes(room.id)) {
        newDiscoveredRooms.push(room.id);
      }

      if (status === "solved") {
        newSolvedRooms.push(room.id);
        allSolved.push(room.id);

        // Generate reward fragment
        const fragment: InventoryItem = {
          id: generateId(),
          type: room.reward.type,
          name: room.reward.name,
          icon: room.reward.icon,
          description: room.reward.description,
          roomSource: room.id,
          obtainedAt: new Date().toISOString(),
        };
        newFragments.push(fragment);

        // Track sigils
        if (room.reward.type === "master_sigil") {
          newSigils.push(room.reward.name);
        }
      }
    }
  }

  return { newSolvedRooms, newFragments, newSigils, newDiscoveredRooms };
}

export function useProgress() {
  const { user, authUnavailable } = useAuth();
  const [state, setState] = useState<ProgressState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Helper: load state from localStorage backup
  const loadFromLocalStorage = (): boolean => {
    try {
      const backup = safeLocalGet(LOCAL_STORAGE_KEY);
      if (backup) {
        const parsed = JSON.parse(backup) as Partial<ProgressState>;
        setState({
          ...defaultState,
          ...parsed,
          artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [],
          earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
          questState: { ...defaultQuestState, ...(parsed.questState || {}) },
          escapeState: { ...defaultEscapeState, ...(parsed.escapeState || {}) },
        });
        return true;
      }
    } catch { /* localStorage unavailable or corrupted */ }
    return false;
  };

  // Load from database (or localStorage in offline mode)
  useEffect(() => {
    // Offline mode: load from localStorage only
    if (!user && authUnavailable) {
      loadFromLocalStorage();
      setLoaded(true);
      return;
    }

    if (!user) { setState(defaultState); setLoaded(false); return; }

    const load = async () => {
      try {
        const { data } = await supabase
          .from("user_progress")
          .select("progress_data")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data?.progress_data) {
          const loaded = data.progress_data as unknown as Partial<ProgressState>;
          // Guard against corrupted arrays and objects
          const safeArtifacts = Array.isArray(loaded.artifacts)
            ? loaded.artifacts.filter((a: unknown) => a && typeof a === "object" && "id" in (a as Artifact) && "type" in (a as Artifact))
            : [];
          const safeEscapeState = loaded.escapeState && typeof loaded.escapeState === "object"
            ? loaded.escapeState
            : {};
          const safeQuestState = (loaded.questState && typeof loaded.questState === "object"
            ? loaded.questState
            : {}) as Record<string, unknown>;
          setState({
            ...defaultState,
            ...loaded,
            xp: typeof loaded.xp === "number" && loaded.xp >= 0 ? loaded.xp : 0,
            streak: typeof loaded.streak === "number" && loaded.streak >= 0 ? loaded.streak : 0,
            artifacts: safeArtifacts,
            earnedBadges: Array.isArray(loaded.earnedBadges) ? loaded.earnedBadges.filter((b: unknown) => typeof b === "string") : [],
            questState: {
              ...defaultQuestState,
              ...safeQuestState,
              unlockedZones: Array.isArray(safeQuestState.unlockedZones) ? safeQuestState.unlockedZones : defaultQuestState.unlockedZones,
              unlockedRooms: Array.isArray(safeQuestState.unlockedRooms) ? safeQuestState.unlockedRooms : defaultQuestState.unlockedRooms,
            },
            escapeState: {
              ...defaultEscapeState,
              ...safeEscapeState,
              solvedRooms: Array.isArray(safeEscapeState.solvedRooms) ? safeEscapeState.solvedRooms : [],
              inventory: Array.isArray(safeEscapeState.inventory) ? safeEscapeState.inventory : [],
              sigilsCollected: Array.isArray(safeEscapeState.sigilsCollected) ? safeEscapeState.sigilsCollected : [],
              solvedPuzzles: Array.isArray(safeEscapeState.solvedPuzzles) ? safeEscapeState.solvedPuzzles : [],
              solvedGateIds: Array.isArray(safeEscapeState.solvedGateIds) ? safeEscapeState.solvedGateIds : [],
            },
          });
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("[useProgress] Supabase load failed, trying localStorage:", err);
        }
        loadFromLocalStorage();
      }
      setLoaded(true);
    };
    load();
  }, [user, authUnavailable]);

  // Debounced save to database
  useEffect(() => {
    if (!loaded) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const serialized = JSON.stringify(state);
      // Always save to localStorage as backup
      safeLocalSet(LOCAL_STORAGE_KEY, serialized);
      // Only save to Supabase if authenticated
      if (user) {
        try {
          await supabase
            .from("user_progress")
            .upsert([{
              user_id: user.id,
              progress_data: JSON.parse(serialized),
            }], { onConflict: "user_id" });
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error("[useProgress] Supabase save failed (localStorage backup saved):", err);
          }
        }
      }
    }, 1000);

    return () => clearTimeout(saveTimer.current);
  }, [state, user, loaded]);

  const updateStreak = useCallback(() => {
    setState(s => {
      const { streak, lastActiveDate } = calcStreak(s.lastActiveDate, s.streak);
      if (lastActiveDate === s.lastActiveDate && streak === s.streak) return s;
      return { ...s, streak, lastActiveDate };
    });
  }, []);

  const toggleTask = useCallback((date: string, idx: number) => {
    setState(s => {
      const k = `${date}-${idx}`;
      const was = s.done[k];
      const { streak, lastActiveDate } = calcStreak(s.lastActiveDate, s.streak);
      return { ...s, done: { ...s.done, [k]: !was }, xp: was ? Math.max(0, s.xp - XP_VALUES.TASK_TOGGLE) : s.xp + XP_VALUES.TASK_TOGGLE, streak, lastActiveDate };
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(s => {
      const { streak, lastActiveDate } = calcStreak(s.lastActiveDate, s.streak);
      return { ...s, xp: s.xp + amount, streak, lastActiveDate };
    });
  }, []);

  const setRating = useCallback((qIdx: number, rating: number) => {
    setState(s => ({ ...s, rat: { ...s.rat, [qIdx]: rating }, xp: s.xp + XP_VALUES.RATING_HIGH }));
  }, []);

  const toggleChecklist = useCallback((key: string) => {
    setState(s => ({ ...s, cl: { ...s.cl, [key]: !s.cl[key] } }));
  }, []);

  const addQuizScore = useCallback((deckName: string, correct: number, total: number) => {
    setState(s => {
      const date = new Date().toISOString().split("T")[0];
      const prev = s.quizScores[deckName] || [];
      return { ...s, quizScores: { ...s.quizScores, [deckName]: [...prev, { correct, total, date }] } };
    });
  }, []);

  const toggleHardCard = useCallback((deckIdx: number, cardIdx: number) => {
    setState(s => {
      const k = `${deckIdx}-${cardIdx}`;
      return { ...s, hardCards: { ...s.hardCards, [k]: !s.hardCards[k] } };
    });
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState(s => ({ ...s, notes }));
  }, []);

  const addPomodoro = useCallback(() => {
    setState(s => ({ ...s, pomodoroCount: s.pomodoroCount + 1 }));
  }, []);

  const toggleGrammarExercise = useCallback((key: string) => {
    setState(s => ({ ...s, grammarDone: { ...s.grammarDone, [key]: true }, xp: s.xp + XP_VALUES.GRAMMAR_QCM }));
  }, []);

  const addArtifact = useCallback((artifact: Omit<Artifact, "id" | "date">) => {
    setState(s => {
      const newArtifact: Artifact = {
        ...artifact,
        id: generateId(),
        date: new Date().toISOString(),
      };
      const newArtifacts = [...s.artifacts, newArtifact];
      const { streak, lastActiveDate } = calcStreak(s.lastActiveDate, s.streak);

      // Check badges
      const newBadges = [...(s.earnedBadges || [])];
      for (const badge of CREATION_BADGES) {
        if (!newBadges.includes(badge.id) && badge.condition(newArtifacts)) {
          newBadges.push(badge.id);
        }
      }

      // Check legacy zone/room unlocks
      const tempState = { ...s, artifacts: newArtifacts, earnedBadges: newBadges };
      const { zones: newZones, rooms: newRooms } = checkUnlocks(newArtifacts, tempState);

      // Update chain progress
      const updatedQuestState = updateChainProgress(newArtifacts, s.questState);

      // ===== ESCAPE GAME: Check room solves =====
      const escapeState = s.escapeState || defaultEscapeState;
      const {
        newSolvedRooms,
        newFragments,
        newSigils,
        newDiscoveredRooms,
      } = checkEscapeRoomSolves(newArtifacts, escapeState);

      const escapeEvents: string[] = [];
      if (newSolvedRooms.length > 0) escapeEvents.push(...newSolvedRooms.map(r => `room_solved:${r}`));
      if (newFragments.length > 0) escapeEvents.push(...newFragments.map(f => `fragment:${f.name}`));
      if (newSigils.length > 0) escapeEvents.push(...newSigils.map(s => `sigil:${s}`));

      return {
        ...s,
        artifacts: newArtifacts,
        xp: s.xp + artifact.xpEarned,
        streak,
        lastActiveDate,
        earnedBadges: newBadges,
        questState: {
          ...updatedQuestState,
          unlockedZones: [...updatedQuestState.unlockedZones, ...newZones],
          unlockedRooms: [...updatedQuestState.unlockedRooms, ...newRooms],
          newUnlocks: [...newZones, ...newRooms],
        },
        escapeState: {
          ...escapeState,
          solvedRooms: [...escapeState.solvedRooms, ...newSolvedRooms],
          inventory: [...escapeState.inventory, ...newFragments],
          discoveredRooms: [...new Set([...escapeState.discoveredRooms, ...newDiscoveredRooms])],
          sigilsCollected: [...new Set([...escapeState.sigilsCollected, ...newSigils])],
          newEscapeEvents: escapeEvents,
        },
      };
    });
  }, []);

  const solvePuzzle = useCallback((puzzleId: string, xpEarned: number) => {
    setState(s => {
      const escapeState = s.escapeState || defaultEscapeState;
      const solvedPuzzles = escapeState.solvedPuzzles || [];
      if (solvedPuzzles.includes(puzzleId)) return s;

      const { streak, lastActiveDate } = calcStreak(s.lastActiveDate, s.streak);
      return {
        ...s,
        xp: s.xp + xpEarned,
        streak,
        lastActiveDate,
        escapeState: {
          ...escapeState,
          solvedPuzzles: [...solvedPuzzles, puzzleId],
          newEscapeEvents: [...escapeState.newEscapeEvents, `puzzle_solved:${puzzleId}`],
        },
      };
    });
  }, []);

  const solveGate = useCallback((gateId: string, xpEarned: number) => {
    setState(s => {
      const escapeState = s.escapeState || defaultEscapeState;
      const solvedGateIds = escapeState.solvedGateIds || [];
      if (solvedGateIds.includes(gateId)) return s;

      const { streak, lastActiveDate } = calcStreak(s.lastActiveDate, s.streak);
      return {
        ...s,
        xp: s.xp + xpEarned,
        streak,
        lastActiveDate,
        escapeState: {
          ...escapeState,
          solvedGateIds: [...solvedGateIds, gateId],
          newEscapeEvents: [...escapeState.newEscapeEvents, `gate_solved:${gateId}`],
        },
      };
    });
  }, []);

  const activateProtocol = useCallback(() => {
    setState(s => {
      const escapeState = s.escapeState || defaultEscapeState;
      return {
        ...s,
        xp: s.xp + 200,
        escapeState: {
          ...escapeState,
          protocolActivated: true,
          newEscapeEvents: [...escapeState.newEscapeEvents, "protocol_lazarus_activated"],
        },
      };
    });
  }, []);

  const clearNewUnlocks = useCallback(() => {
    setState(s => ({
      ...s,
      questState: { ...s.questState, newUnlocks: [] },
      escapeState: { ...(s.escapeState || defaultEscapeState), newEscapeEvents: [] },
    }));
  }, []);

  const setCurrentZone = useCallback((zoneId: ZoneId) => {
    setState(s => ({ ...s, questState: { ...s.questState, currentZoneId: zoneId } }));
  }, []);

  // Computed values
  const today = new Date().toISOString().split("T")[0];
  const creationsToday = useMemo(() =>
    state.artifacts.filter(a => a.date.startsWith(today)).length,
    [state.artifacts, today]
  );
  const totalCreations = state.artifacts.length;

  // Legacy zone status
  const zoneStatus = useMemo(() => {
    const status: Record<ZoneId, { unlocked: boolean; progress: number; rooms: { id: string; unlocked: boolean }[] }> = {} as any;
    for (const zone of ZONES) {
      const unlocked = state.questState.unlockedZones.includes(zone.id);
      const rooms = zone.rooms.map(r => ({
        id: r.id,
        unlocked: state.questState.unlockedRooms.includes(r.id),
      }));
      const unlockedRoomCount = rooms.filter(r => r.unlocked).length;
      status[zone.id] = {
        unlocked,
        progress: zone.rooms.length > 0 ? unlockedRoomCount / zone.rooms.length : 0,
        rooms,
      };
    }
    return status;
  }, [state.questState.unlockedZones, state.questState.unlockedRooms]);

  // ===== ESCAPE GAME: Computed zone/room status =====
  const escapeZoneStatus = useMemo(() => {
    const escapeState = state.escapeState || defaultEscapeState;
    const result: Record<string, {
      unlocked: boolean;
      roomsSolved: number;
      totalRooms: number;
      progress: number;
      rooms: Array<{ id: string; status: RoomStatus; progress: number }>;
    }> = {};

    for (const zone of ESCAPE_ZONES) {
      const zs = computeZoneStatus(zone, escapeState.solvedRooms, state.artifacts);
      const rooms = zone.rooms.map(room => {
        const status = zs.unlocked
          ? computeRoomStatus(room, escapeState.solvedRooms, state.artifacts, state.artifacts.length)
          : "locked" as RoomStatus;
        const prog = computeRoomProgress(room, state.artifacts);
        return { id: room.id, status, progress: prog.percentage };
      });
      result[zone.id] = { ...zs, rooms };
    }
    return result;
  }, [state.artifacts, state.escapeState]);

  // Chain status
  const chainStatus = useMemo(() => {
    const todayArtifacts = state.artifacts.filter(a => a.date.startsWith(today));
    const requiredFromOtherSteps = DAILY_CHAIN_STEPS
      .filter(s => s.artifactTypes.length > 0)
      .reduce((sum, s) => sum + s.minCount, 0);

    return DAILY_CHAIN_STEPS.map((step, i) => {
      const count = step.artifactTypes.length === 0
        ? Math.max(0, todayArtifacts.length - requiredFromOtherSteps)
        : todayArtifacts.filter(a => step.artifactTypes.includes(a.type)).length;
      const completed = count >= step.minCount;
      const previousCompleted = i === 0 || (() => {
        const prev = DAILY_CHAIN_STEPS[i - 1];
        const prevCount = prev.artifactTypes.length === 0
          ? Math.max(0, todayArtifacts.length - requiredFromOtherSteps)
          : todayArtifacts.filter(a => prev.artifactTypes.includes(a.type)).length;
        return prevCount >= prev.minCount;
      })();
      return { ...step, count, completed, active: previousCompleted && !completed, locked: !previousCompleted && !completed };
    });
  }, [state.artifacts, today]);

  useEffect(() => { if (loaded) updateStreak(); }, [updateStreak, loaded]);

  // Sync unlocks on load
  useEffect(() => {
    if (!loaded || state.artifacts.length === 0) return;
    const { zones: newZones, rooms: newRooms } = checkUnlocks(state.artifacts, state);
    if (newZones.length > 0 || newRooms.length > 0) {
      setState(s => ({
        ...s,
        questState: {
          ...s.questState,
          unlockedZones: [...new Set([...s.questState.unlockedZones, ...newZones])],
          unlockedRooms: [...new Set([...s.questState.unlockedRooms, ...newRooms])],
        },
      }));
    }
    // Sync escape game state on load
    const escapeState = state.escapeState || defaultEscapeState;
    const { newSolvedRooms, newFragments, newSigils, newDiscoveredRooms } = checkEscapeRoomSolves(state.artifacts, escapeState);
    if (newSolvedRooms.length > 0 || newDiscoveredRooms.length > 0) {
      setState(s => ({
        ...s,
        escapeState: {
          ...(s.escapeState || defaultEscapeState),
          solvedRooms: [...new Set([...(s.escapeState || defaultEscapeState).solvedRooms, ...newSolvedRooms])],
          inventory: [...(s.escapeState || defaultEscapeState).inventory, ...newFragments],
          discoveredRooms: [...new Set([...(s.escapeState || defaultEscapeState).discoveredRooms, ...newDiscoveredRooms])],
          sigilsCollected: [...new Set([...(s.escapeState || defaultEscapeState).sigilsCollected, ...newSigils])],
        },
      }));
    }
  }, [loaded]);

  return {
    ...state, toggleTask, addXp, setRating, toggleChecklist,
    addQuizScore, toggleHardCard, setNotes, addPomodoro, toggleGrammarExercise,
    addArtifact, creationsToday, totalCreations, solveGate,
    clearNewUnlocks, setCurrentZone, zoneStatus, chainStatus,
    escapeZoneStatus, solvePuzzle, activateProtocol,
  };
}
