import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
  // Creation (high value)
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
  // Passive (low value)
  FLASHCARD_FLIP: 3,
  QCM_CORRECT: 5,
  GRAMMAR_QCM: 5,
  POMODORO: 20,
  RATING_HIGH: 10,
  TASK_TOGGLE: 25,
  ANALYSIS: 30,
} as const;

// ===== QUEST ZONE SYSTEM =====
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
    id: "forge",
    name: "La Forge",
    icon: "🔨",
    description: "Forge tes premieres armes linguistiques",
    color: "amber",
    unlockCondition: () => true,
    unlockHint: "Toujours accessible",
    rooms: [
      { id: "forge-vocab", name: "Enclume a mots", icon: "📖", unlockCondition: () => true, unlockHint: "" },
      { id: "forge-phrases", name: "Etabli de phrases", icon: "✍️", unlockCondition: (a) => a.filter(x => x.type === "phrase_forged").length >= 3, unlockHint: "Forge 3 phrases" },
      { id: "forge-master", name: "Salle du Maitre Forgeron", icon: "⚒️", unlockCondition: (a) => a.filter(x => x.type === "phrase_forged").length >= 15, unlockHint: "Forge 15 phrases" },
    ],
  },
  {
    id: "grammar",
    name: "L'Arbre des Regles",
    icon: "🌳",
    description: "Construis l'architecture de ta grammaire",
    color: "grammar",
    unlockCondition: (a) => a.filter(x => x.type === "phrase_forged").length >= 5,
    unlockHint: "Forge 5 phrases pour debloquer",
    rooms: [
      { id: "gram-roots", name: "Racines", icon: "🌱", unlockCondition: () => true, unlockHint: "" },
      { id: "gram-branches", name: "Branches", icon: "🌿", unlockCondition: (a) => a.filter(x => x.type === "grammar_phrase" || x.type === "grammar_rule").length >= 3, unlockHint: "Construis 3 regles" },
      { id: "gram-canopy", name: "Canopee", icon: "🌲", unlockCondition: (a) => a.filter(x => x.type === "grammar_phrase" || x.type === "grammar_rule" || x.type === "grammar_transform").length >= 10, unlockHint: "10 constructions grammaticales" },
    ],
  },
  {
    id: "studio",
    name: "Le Studio",
    icon: "💼",
    description: "Prepare tes reponses d'entretien comme un pro",
    color: "accent",
    unlockCondition: (a) => a.filter(x => x.type === "grammar_phrase" || x.type === "grammar_rule" || x.type === "grammar_transform").length >= 3,
    unlockHint: "Construis 3 regles de grammaire",
    rooms: [
      { id: "studio-prep", name: "Salle de preparation", icon: "📝", unlockCondition: () => true, unlockHint: "" },
      { id: "studio-record", name: "Studio d'enregistrement", icon: "🎙️", unlockCondition: (a) => a.filter(x => x.type === "interview_answer").length >= 5, unlockHint: "Cree 5 reponses" },
      { id: "studio-master", name: "Salle de conference", icon: "🏛️", unlockCondition: (a) => new Set(a.filter(x => x.type === "interview_answer").map(x => x.metadata?.questionIdx)).size >= 15, unlockHint: "15 questions couvertes" },
    ],
  },
  {
    id: "clinical",
    name: "L'Hopital",
    icon: "🏥",
    description: "Raisonnement clinique en allemand medical",
    color: "clinical",
    unlockCondition: (a) => a.filter(x => x.type === "interview_answer").length >= 3,
    unlockHint: "Cree 3 reponses d'entretien",
    rooms: [
      { id: "clin-triage", name: "Triage", icon: "🚑", unlockCondition: () => true, unlockHint: "" },
      { id: "clin-ward", name: "Service", icon: "🩺", unlockCondition: (a) => a.filter(x => x.type === "diagnostic" || x.type === "clinical_note").length >= 3, unlockHint: "3 diagnostics construits" },
      { id: "clin-chief", name: "Bureau du Chef", icon: "👨‍⚕️", unlockCondition: (a) => a.filter(x => x.type === "diagnostic" || x.type === "clinical_note" || x.type === "case_patient").length >= 8, unlockHint: "8 dossiers cliniques" },
    ],
  },
  {
    id: "atelier",
    name: "Les Ateliers",
    icon: "✨",
    description: "9 ateliers de creation avancee",
    color: "primary",
    unlockCondition: (a) => a.filter(x => x.type === "diagnostic" || x.type === "clinical_note").length >= 1,
    unlockHint: "Construis 1 diagnostic clinique",
    rooms: [
      { id: "atl-basic", name: "Ateliers de base", icon: "🧪", unlockCondition: () => true, unlockHint: "" },
      { id: "atl-advanced", name: "Ateliers avances", icon: "⚡", unlockCondition: (a) => a.length >= 20, unlockHint: "20 creations au total" },
      { id: "atl-master", name: "Atelier du Maitre", icon: "👑", unlockCondition: (a) => a.length >= 50, unlockHint: "50 creations au total" },
    ],
  },
  {
    id: "archive",
    name: "Les Archives",
    icon: "📚",
    description: "Ton portfolio et tes statistiques de progression",
    color: "info",
    unlockCondition: (a) => a.length >= 10,
    unlockHint: "Cree 10 artefacts au total",
    rooms: [
      { id: "arch-gallery", name: "Galerie", icon: "🖼️", unlockCondition: () => true, unlockHint: "" },
      { id: "arch-stats", name: "Observatoire", icon: "📊", unlockCondition: (a) => a.length >= 25, unlockHint: "25 creations" },
      { id: "arch-legend", name: "Hall of Fame", icon: "🏆", unlockCondition: (a) => a.length >= 75, unlockHint: "75 creations" },
    ],
  },
];

// Daily chain steps — sequential, each requires previous
export const DAILY_CHAIN_STEPS: { id: string; label: string; activeLabel: string; icon: string; zoneId: ZoneId; artifactTypes: ArtifactType[]; minCount: number }[] = [
  { id: "chain-forge", label: "Forge 2 phrases", activeLabel: "Forge en cours", icon: "🔨", zoneId: "forge", artifactTypes: ["phrase_forged"], minCount: 2 },
  { id: "chain-grammar", label: "Construis 1 regle", activeLabel: "Construction en cours", icon: "🌳", zoneId: "grammar", artifactTypes: ["grammar_phrase", "grammar_rule", "grammar_transform"], minCount: 1 },
  { id: "chain-studio", label: "Cree 1 reponse", activeLabel: "Creation en cours", icon: "💼", zoneId: "studio", artifactTypes: ["interview_answer"], minCount: 1 },
  { id: "chain-clinical", label: "Construis 1 diagnostic", activeLabel: "Diagnostic en cours", icon: "🏥", zoneId: "clinical", artifactTypes: ["diagnostic", "clinical_note"], minCount: 1 },
  { id: "chain-free", label: "Creation libre", activeLabel: "Creation libre en cours", icon: "✨", zoneId: "atelier", artifactTypes: [], minCount: 1 },
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

export interface QuestState {
  currentZoneId: ZoneId;
  unlockedZones: ZoneId[];
  unlockedRooms: string[];
  chainProgress: Record<string, number>; // chainStepId -> count for today
  chainDate: string; // YYYY-MM-DD
  completedChains: number; // total completed daily chains
  newUnlocks: string[]; // zone/room IDs just unlocked (for reveal animation)
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
}

const defaultQuestState: QuestState = {
  currentZoneId: "forge",
  unlockedZones: ["forge"],
  unlockedRooms: ["forge-vocab"],
  chainProgress: {},
  chainDate: "",
  completedChains: 0,
  newUnlocks: [],
};

const defaultState: ProgressState = {
  done: {}, xp: 0, rat: {}, cl: {},
  streak: 0, lastActiveDate: "",
  quizScores: {}, hardCards: {}, notes: "",
  pomodoroCount: 0, grammarDone: {},
  artifacts: [],
  earnedBadges: [],
  questState: defaultQuestState,
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

  // Reset chain if new day
  const chainProgress: Record<string, number> = {};
  for (const step of DAILY_CHAIN_STEPS) {
    if (step.artifactTypes.length === 0) {
      // "Free creation" — any artifact counts
      chainProgress[step.id] = todayArtifacts.length > 0 ? 1 : 0;
    } else {
      chainProgress[step.id] = todayArtifacts.filter(a => step.artifactTypes.includes(a.type)).length;
    }
  }

  // Check if chain is complete
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

export function useProgress() {
  const { user } = useAuth();
  const [state, setState] = useState<ProgressState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load from database
  useEffect(() => {
    if (!user) { setState(defaultState); setLoaded(false); return; }

    const load = async () => {
      const { data } = await supabase
        .from("user_progress")
        .select("progress_data")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.progress_data) {
        const loaded = data.progress_data as unknown as Partial<ProgressState>;
        setState({ ...defaultState, ...loaded, artifacts: loaded.artifacts || [], earnedBadges: loaded.earnedBadges || [], questState: { ...defaultQuestState, ...(loaded.questState || {}) } });
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  // Debounced save to database
  useEffect(() => {
    if (!user || !loaded) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase
        .from("user_progress")
        .upsert([{
          user_id: user.id,
          progress_data: JSON.parse(JSON.stringify(state)),
        }], { onConflict: "user_id" });
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

      // Check for newly earned badges
      const newBadges = [...(s.earnedBadges || [])];
      for (const badge of CREATION_BADGES) {
        if (!newBadges.includes(badge.id) && badge.condition(newArtifacts)) {
          newBadges.push(badge.id);
        }
      }

      // Check zone/room unlocks
      const tempState = { ...s, artifacts: newArtifacts, earnedBadges: newBadges };
      const { zones: newZones, rooms: newRooms } = checkUnlocks(newArtifacts, tempState);

      // Update chain progress
      const updatedQuestState = updateChainProgress(newArtifacts, s.questState);

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
      };
    });
  }, []);

  const clearNewUnlocks = useCallback(() => {
    setState(s => ({ ...s, questState: { ...s.questState, newUnlocks: [] } }));
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

  // Zone unlock status
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

  // Chain status for today
  const chainStatus = useMemo(() => {
    const todayArtifacts = state.artifacts.filter(a => a.date.startsWith(today));
    return DAILY_CHAIN_STEPS.map((step, i) => {
      const count = step.artifactTypes.length === 0
        ? (todayArtifacts.length > 0 ? 1 : 0)
        : todayArtifacts.filter(a => step.artifactTypes.includes(a.type)).length;
      const completed = count >= step.minCount;
      // Previous step must be completed for this to be active
      const previousCompleted = i === 0 || (() => {
        const prev = DAILY_CHAIN_STEPS[i - 1];
        const prevCount = prev.artifactTypes.length === 0
          ? (todayArtifacts.length > 0 ? 1 : 0)
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
  }, [loaded]);

  return {
    ...state, toggleTask, addXp, setRating, toggleChecklist,
    addQuizScore, toggleHardCard, setNotes, addPomodoro, toggleGrammarExercise,
    addArtifact, creationsToday, totalCreations,
    clearNewUnlocks, setCurrentZone, zoneStatus, chainStatus,
  };
}
