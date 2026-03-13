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
}

const defaultState: ProgressState = {
  done: {}, xp: 0, rat: {}, cl: {},
  streak: 0, lastActiveDate: "",
  quizScores: {}, hardCards: {}, notes: "",
  pomodoroCount: 0, grammarDone: {},
  artifacts: [],
  earnedBadges: [],
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
        setState({ ...defaultState, ...loaded, artifacts: loaded.artifacts || [], earnedBadges: loaded.earnedBadges || [] });
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

      return {
        ...s,
        artifacts: newArtifacts,
        xp: s.xp + artifact.xpEarned,
        streak,
        lastActiveDate,
        earnedBadges: newBadges,
      };
    });
  }, []);

  // Computed values
  const today = new Date().toISOString().split("T")[0];
  const creationsToday = useMemo(() =>
    state.artifacts.filter(a => a.date.startsWith(today)).length,
    [state.artifacts, today]
  );
  const totalCreations = state.artifacts.length;

  useEffect(() => { if (loaded) updateStreak(); }, [updateStreak, loaded]);

  return {
    ...state, toggleTask, addXp, setRating, toggleChecklist,
    addQuizScore, toggleHardCard, setNotes, addPomodoro, toggleGrammarExercise,
    addArtifact, creationsToday, totalCreations,
  };
}
