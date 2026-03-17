import { describe, it, expect } from "vitest";
import {
  ACTION_LABELS,
  STATUS_LABELS,
  WEBGL_LABELS,
  AUTH_ERRORS,
  AI_LABELS,
  TRANSLATION_LABELS,
} from "@/data/uiLabels";
import { getFallbackLabel, normalizeFallbackReason } from "@/components/3d/WebGLDetect";

// ── Centralized UI labels are French ──────────────────────────

describe("uiLabels centralized dictionary", () => {
  it("ACTION_LABELS are all non-empty French strings", () => {
    for (const [key, val] of Object.entries(ACTION_LABELS)) {
      expect(val, `ACTION_LABELS.${key} is empty`).toBeTruthy();
      expect(typeof val).toBe("string");
    }
  });

  it("STATUS_LABELS are all non-empty French strings", () => {
    for (const [key, val] of Object.entries(STATUS_LABELS)) {
      expect(val, `STATUS_LABELS.${key} is empty`).toBeTruthy();
      expect(typeof val).toBe("string");
    }
  });

  it("AUTH_ERRORS are all non-empty French strings", () => {
    for (const [key, val] of Object.entries(AUTH_ERRORS)) {
      expect(val, `AUTH_ERRORS.${key} is empty`).toBeTruthy();
      expect(typeof val).toBe("string");
    }
  });

  it("AI_LABELS are all non-empty French strings", () => {
    for (const [key, val] of Object.entries(AI_LABELS)) {
      expect(val, `AI_LABELS.${key} is empty`).toBeTruthy();
      expect(typeof val).toBe("string");
    }
  });

  it("WEBGL_LABELS are all non-empty French strings", () => {
    for (const [key, val] of Object.entries(WEBGL_LABELS)) {
      expect(val, `WEBGL_LABELS.${key} is empty`).toBeTruthy();
      expect(typeof val).toBe("string");
    }
  });

  it("TRANSLATION_LABELS are all non-empty French strings", () => {
    for (const [key, val] of Object.entries(TRANSLATION_LABELS)) {
      expect(val, `TRANSLATION_LABELS.${key} is empty`).toBeTruthy();
      expect(typeof val).toBe("string");
    }
  });

  it("contains expected critical keys", () => {
    expect(ACTION_LABELS.retry).toBe("Reessayer");
    expect(ACTION_LABELS.cancel).toBe("Annuler");
    expect(ACTION_LABELS.submit).toBe("Soumettre");
    expect(STATUS_LABELS.error).toBe("Erreur inattendue");
    expect(STATUS_LABELS.offline).toBe("Mode hors-ligne");
    expect(AUTH_ERRORS.invalidCredentials).toContain("incorrect");
    expect(AUTH_ERRORS.sessionExpired).toContain("expire");
  });
});

// ── WebGL fallback labels are in French ───────────────────────

describe("WebGL fallback labels are French", () => {
  const expectedLabels: Record<string, string> = {
    webgl_unavailable: "WebGL non disponible",
    context_lost: "Contexte WebGL perdu",
    shader_compile_failure: "Echec de compilation des shaders",
    low_gpu_tier: "GPU insuffisant pour la 3D",
    low_memory: "Memoire insuffisante",
    postprocessing_disabled: "Post-traitement desactive",
    reduced_motion: "Mouvement reduit prefere",
    runtime_error: "Erreur d'execution survenue",
    unknown_fallback: "Mode de secours inconnu",
  };

  for (const [reason, expectedLabel] of Object.entries(expectedLabels)) {
    it(`getFallbackLabel("${reason}") returns French label`, () => {
      const label = getFallbackLabel(reason as Parameters<typeof getFallbackLabel>[0]);
      expect(label).toBe(expectedLabel);
    });
  }

  it("getFallbackLabel returns empty string for empty reason", () => {
    expect(getFallbackLabel("")).toBe("");
  });

  it("normalizeFallbackReason handles common aliases", () => {
    expect(normalizeFallbackReason("no-webgl")).toBe("webgl_unavailable");
    expect(normalizeFallbackReason("context-lost")).toBe("context_lost");
    expect(normalizeFallbackReason("shader-compile")).toBe("shader_compile_failure");
    expect(normalizeFallbackReason("low-gpu")).toBe("low_gpu_tier");
    expect(normalizeFallbackReason("reduced-motion")).toBe("reduced_motion");
    expect(normalizeFallbackReason("runtime-error")).toBe("runtime_error");
    expect(normalizeFallbackReason("")).toBe("");
  });
});
