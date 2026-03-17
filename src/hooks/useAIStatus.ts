import { useEffect, useCallback, useSyncExternalStore } from "react";
import { supabaseAvailable } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Global AI status store — shared across all components.
 * Tracks: credits exhausted, rate limited, last health check, fallback mode.
 */

type AIGlobalStatus = "available" | "fallback" | "degraded" | "credits_exhausted" | "rate_limited" | "offline" | "unknown";

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

  const newStatus = reason === "credits_exhausted" ? "credits_exhausted"
    : reason === "rate_limited" ? "rate_limited"
    : "offline";
  state = {
    status: newStatus,
    lastChecked: Date.now(),
    failCount: state.failCount + 1,
    message: messages[reason] || messages.error,
  };
  logger.warn("AIStatus", `AI failure reported: ${reason}`, { failCount: state.failCount, status: newStatus });
  emitChange();
}

/** Report AI recovery */
export function reportAIRecovery() {
  if (state.status !== "available") {
    logger.info("AIStatus", "AI recovered from fallback", { previousStatus: state.status });
  }
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

const HEALTH_CHECK_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-coach`
  : null;
let healthCheckInProgress = false;

/** Run a lightweight health check against the edge function */
async function runHealthCheck(): Promise<boolean> {
  // Skip health checks if Supabase is not configured
  if (!HEALTH_CHECK_URL || !supabaseAvailable) return false;
  // Prevent concurrent health checks
  if (healthCheckInProgress) return state.status === "available";
  healthCheckInProgress = true;
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
  } finally {
    healthCheckInProgress = false;
  }
}

/** Hook to consume global AI status */
export function useAIStatus() {
  const current = useSyncExternalStore(subscribe, getSnapshot);

  const checkHealth = useCallback(async () => {
    return runHealthCheck();
  }, []);

  // Auto health check — delayed on mount (avoid blocking startup), then every 2 minutes
  // If in fallback, check more frequently (every 30 seconds) to detect recovery quickly
  useEffect(() => {
    const initialDelay = setTimeout(runHealthCheck, 3000); // Don't block app startup
    const interval = setInterval(
      runHealthCheck,
      current.status !== "available" ? 30_000 : 120_000,
    );
    return () => { clearTimeout(initialDelay); clearInterval(interval); };
  }, [current.status]);

  return {
    ...current,
    isAvailable: current.status === "available",
    isFallback: current.status !== "available",
    checkHealth,
  };
}
