import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

/**
 * Global AI status store — shared across all components.
 * Tracks: credits exhausted, rate limited, last health check, fallback mode.
 */

type AIGlobalStatus = "available" | "fallback" | "credits_exhausted" | "rate_limited" | "offline";

interface AIStatusState {
  status: AIGlobalStatus;
  lastChecked: number;
  failCount: number;
  message: string;
}

const DEFAULT_STATE: AIStatusState = {
  status: "available",
  lastChecked: 0,
  failCount: 0,
  message: "",
};

let state: AIStatusState = { ...DEFAULT_STATE };
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function getSnapshot(): AIStatusState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Report an AI failure from any component */
export function reportAIFailure(reason: "credits_exhausted" | "rate_limited" | "network" | "error") {
  const messages: Record<string, string> = {
    credits_exhausted: "Credits IA epuises — mode pedagogique local active.",
    rate_limited: "Coach IA temporairement sature — feedback local active.",
    network: "Connexion au coach IA interrompue — mode hors-ligne active.",
    error: "Coach IA indisponible — feedback local active.",
  };

  state = {
    status: reason === "credits_exhausted" ? "credits_exhausted"
      : reason === "rate_limited" ? "rate_limited"
      : "offline",
    lastChecked: Date.now(),
    failCount: state.failCount + 1,
    message: messages[reason] || messages.error,
  };
  emitChange();
}

/** Report AI recovery */
export function reportAIRecovery() {
  state = {
    status: "available",
    lastChecked: Date.now(),
    failCount: 0,
    message: "",
  };
  emitChange();
}

/** Check if AI is currently in fallback mode */
export function isAIInFallback(): boolean {
  return state.status !== "available";
}

const HEALTH_CHECK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-coach`;

/** Run a lightweight health check against the edge function */
async function runHealthCheck(): Promise<boolean> {
  try {
    const resp = await fetch(HEALTH_CHECK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "health-check" }],
        mode: "phrase-lab",
        healthCheck: true,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (resp.status === 402) {
      reportAIFailure("credits_exhausted");
      return false;
    }
    if (resp.status === 429) {
      reportAIFailure("rate_limited");
      return false;
    }

    const data = await resp.json().catch(() => null);

    // Health check endpoint response
    if (data?.healthy === true) {
      if (state.status !== "available") {
        reportAIRecovery();
      }
      return true;
    }
    if (data?.healthy === false) {
      reportAIFailure("error");
      return false;
    }

    // Fallback responses from regular endpoint
    if (data?.fallback && data?.reason === "credits_exhausted") {
      reportAIFailure("credits_exhausted");
      return false;
    }
    if (data?.fallback && data?.reason === "rate_limited") {
      reportAIFailure("rate_limited");
      return false;
    }

    // If we got here, edge function is responding
    if (state.status !== "available") {
      reportAIRecovery();
    }
    return true;
  } catch {
    reportAIFailure("network");
    return false;
  }
}

/** Hook to consume global AI status */
export function useAIStatus() {
  const current = useSyncExternalStore(subscribe, getSnapshot);

  const checkHealth = useCallback(async () => {
    return runHealthCheck();
  }, []);

  // Auto health check on mount + every 2 minutes
  useEffect(() => {
    runHealthCheck();
    const interval = setInterval(runHealthCheck, 120_000);
    return () => clearInterval(interval);
  }, []);

  return {
    ...current,
    isAvailable: current.status === "available",
    isFallback: current.status !== "available",
    checkHealth,
  };
}
