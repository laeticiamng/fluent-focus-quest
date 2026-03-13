import { useState, useEffect, useCallback } from "react";

const SKEY = "op-bienne-v5";

interface ProgressState {
  done: Record<string, boolean>;
  xp: number;
  rat: Record<number, number>;
  cl: Record<string, boolean>;
}

const defaultState: ProgressState = { done: {}, xp: 0, rat: {}, cl: {} };

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(SKEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch { return defaultState; }
}

function save(state: ProgressState) {
  try { localStorage.setItem(SKEY, JSON.stringify(state)); } catch {}
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(load);

  useEffect(() => { save(state); }, [state]);

  const toggleTask = useCallback((date: string, idx: number) => {
    setState(s => {
      const k = `${date}-${idx}`;
      const was = s.done[k];
      return { ...s, done: { ...s.done, [k]: !was }, xp: was ? Math.max(0, s.xp - 25) : s.xp + 25 };
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(s => ({ ...s, xp: s.xp + amount }));
  }, []);

  const setRating = useCallback((qIdx: number, rating: number) => {
    setState(s => ({ ...s, rat: { ...s.rat, [qIdx]: rating }, xp: s.xp + 15 }));
  }, []);

  const toggleChecklist = useCallback((key: string) => {
    setState(s => ({ ...s, cl: { ...s.cl, [key]: !s.cl[key] } }));
  }, []);

  return { ...state, toggleTask, addXp, setRating, toggleChecklist };
}
