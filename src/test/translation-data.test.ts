import { describe, it, expect } from "vitest";
import { INTERVIEW_ZONES } from "@/data/interviewZones";
import { SCENARIOS, GRAM } from "@/data/content";

// ── Interview zones FR translations ───────────────────────────

describe("interview zones FR translations", () => {
  it("all zones have nameFr and descriptionFr", () => {
    for (const zone of INTERVIEW_ZONES) {
      expect(zone.nameFr, `${zone.id} missing nameFr`).toBeTruthy();
      expect(zone.descriptionFr, `${zone.id} missing descriptionFr`).toBeTruthy();
    }
  });

  it("all questions have qFr and rFr", () => {
    for (const zone of INTERVIEW_ZONES) {
      for (const q of zone.questions) {
        expect(q.qFr, `${q.id} missing qFr`).toBeTruthy();
        expect(q.rFr, `${q.id} missing rFr`).toBeTruthy();
      }
    }
  });

  it("all questions have followUpsFr matching followUps length", () => {
    for (const zone of INTERVIEW_ZONES) {
      for (const q of zone.questions) {
        expect(q.followUpsFr, `${q.id} missing followUpsFr`).toBeTruthy();
        expect(
          q.followUpsFr!.length,
          `${q.id} followUpsFr length mismatch`,
        ).toBe(q.followUps.length);
      }
    }
  });

  it("FR translations are not empty strings", () => {
    for (const zone of INTERVIEW_ZONES) {
      for (const q of zone.questions) {
        expect(q.qFr!.length, `${q.id} qFr is empty`).toBeGreaterThan(5);
        expect(q.rFr!.length, `${q.id} rFr is empty`).toBeGreaterThan(10);
      }
    }
  });

  it("has 36 total questions across 6 zones", () => {
    const total = INTERVIEW_ZONES.reduce((sum, z) => sum + z.questions.length, 0);
    expect(total).toBe(36);
    expect(INTERVIEW_ZONES.length).toBe(6);
  });
});

// ── Scenarios FR translations ─────────────────────────────────

describe("scenarios FR translations", () => {
  it("all scenarios have sitFr", () => {
    for (const s of SCENARIOS) {
      const rec = s as Record<string, unknown>;
      expect(rec.sitFr, `${s.title} missing sitFr`).toBeTruthy();
      expect(typeof rec.sitFr).toBe("string");
    }
  });

  it("all scenarios have vocabFr matching vocab length", () => {
    for (const s of SCENARIOS) {
      const rec = s as Record<string, unknown>;
      expect(rec.vocabFr, `${s.title} missing vocabFr`).toBeTruthy();
      expect(
        (rec.vocabFr as string[]).length,
        `${s.title} vocabFr length mismatch`,
      ).toBe(s.vocab.length);
    }
  });

  it("all scenarios have stepsFr matching steps length", () => {
    for (const s of SCENARIOS) {
      const rec = s as Record<string, unknown>;
      expect(rec.stepsFr, `${s.title} missing stepsFr`).toBeTruthy();
      expect(
        (rec.stepsFr as string[]).length,
        `${s.title} stepsFr length mismatch`,
      ).toBe(s.steps.length);
    }
  });
});

// ── Grammar exercises FR translations (pre-existing) ──────────

describe("grammar exercises FR translations", () => {
  it("all exercises have .fr field", () => {
    for (const g of GRAM) {
      if (!g.exercises) continue;
      for (const ex of g.exercises) {
        expect(ex.fr, `${g.title} exercise missing fr`).toBeTruthy();
        expect(ex.fr.length).toBeGreaterThan(3);
      }
    }
  });
});
