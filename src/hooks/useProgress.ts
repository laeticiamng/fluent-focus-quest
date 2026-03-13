import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface QuizScore {
  correct: number;
  total: number;
  date: string;
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
}

const defaultState: ProgressState = {
  done: {}, xp: 0, rat: {}, cl: {},
  streak: 0, lastActiveDate: "",
  quizScores: {}, hardCards: {}, notes: "",
  pomodoroCount: 0, grammarDone: {}
};

function calcStreak(lastDate: string, currentStreak: number): { streak: number; lastActiveDate: string } {
  const today = new Date().toISOString().split("T")[0];
  if (lastDate === today) return { streak: currentStreak, lastActiveDate: today };
  const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
  if (lastDate === yesterday) return { streak: currentStreak + 1, lastActiveDate: today };
  return { streak: 1, lastActiveDate: today };
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
        setState({ ...defaultState, ...(data.progress_data as unknown as Partial<ProgressState>) });
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
          progress_data: state as unknown as Record<string, unknown>,
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
      return { ...s, done: { ...s.done, [k]: !was }, xp: was ? Math.max(0, s.xp - 25) : s.xp + 25, streak, lastActiveDate };
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(s => {
      const { streak, lastActiveDate } = calcStreak(s.lastActiveDate, s.streak);
      return { ...s, xp: s.xp + amount, streak, lastActiveDate };
    });
  }, []);

  const setRating = useCallback((qIdx: number, rating: number) => {
    setState(s => ({ ...s, rat: { ...s.rat, [qIdx]: rating }, xp: s.xp + 15 }));
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
    setState(s => ({ ...s, grammarDone: { ...s.grammarDone, [key]: true }, xp: s.xp + 10 }));
  }, []);

  useEffect(() => { if (loaded) updateStreak(); }, [updateStreak, loaded]);

  return {
    ...state, toggleTask, addXp, setRating, toggleChecklist,
    addQuizScore, toggleHardCard, setNotes, addPomodoro, toggleGrammarExercise
  };
}
