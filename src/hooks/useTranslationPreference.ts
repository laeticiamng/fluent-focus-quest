import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "fluent-focus-show-fr-translations";

/**
 * Global preference for showing French translations.
 * Persisted in localStorage.  Components can also override locally.
 */
export function useTranslationPreference() {
  const [showFr, setShowFr] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(showFr));
    } catch {
      // storage full or unavailable — ignore
    }
  }, [showFr]);

  const toggleFr = useCallback(() => setShowFr((v) => !v), []);

  return { showFr, setShowFr, toggleFr } as const;
}

/** Read-only helper (no state) for non-hook contexts */
export function getTranslationPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
