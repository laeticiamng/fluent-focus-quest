import { describe, it, expect, beforeEach } from "vitest";
import { safeClean } from "@/utils/safeClean";
import { getTranslationPreference } from "@/hooks/useTranslationPreference";

// ── safeClean utility ──────────────────────────────────────────

describe("safeClean", () => {
  it("returns cleaned text when ratio is safe", () => {
    const result = safeClean("  Hello World  ", (t) => t.trim(), "test");
    expect(result).toBe("Hello World");
  });

  it("falls back to original when cleaning removes > 70%", () => {
    // This regex removes almost everything
    const result = safeClean("Hello World!", (t) => t.replace(/[a-zA-Z !]/g, ""), "test");
    expect(result).toBe("Hello World!");
  });

  it("returns empty string for empty input", () => {
    const result = safeClean("", (t) => t.trim(), "test");
    expect(result).toBe("");
  });

  it("handles null/undefined gracefully", () => {
    const result = safeClean(null as unknown as string, (t) => t.trim(), "test");
    expect(result).toBe("");
  });

  it("allows moderate cleaning (< 70% removed)", () => {
    // Remove punctuation from "Hallo! Wie geht's?!" → "Hallo Wie gehts" (some removed)
    const result = safeClean("Hallo! Wie geht's?!", (t) => t.replace(/[!?']/g, ""), "test");
    expect(result).toBe("Hallo Wie gehts");
  });
});

// ── Translation preference persistence ────────────────────────

describe("translation preference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to false when no preference stored", () => {
    expect(getTranslationPreference()).toBe(false);
  });

  it("reads stored preference", () => {
    localStorage.setItem("fluent-focus-show-fr-translations", "true");
    expect(getTranslationPreference()).toBe(true);
  });

  it("returns false for non-true values", () => {
    localStorage.setItem("fluent-focus-show-fr-translations", "false");
    expect(getTranslationPreference()).toBe(false);
  });
});
