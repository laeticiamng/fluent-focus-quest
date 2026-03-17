import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC_DIR = path.resolve(__dirname, "..");

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relativePath), "utf-8");
}

function getAllTsFiles(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules") && entry.name !== "test") {
      getAllTsFiles(fullPath, files);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("Production Invariants", () => {
  describe("No env-based auth guards", () => {
    const authFiles = ["App.tsx", "pages/Auth.tsx", "hooks/useAuth.tsx", "main.tsx"];
    for (const file of authFiles) {
      it(`${file} must not use env guards for auth bypass`, () => {
        const content = readFile(file);
        // Must not bypass auth with VITE_ env checks
        expect(content).not.toMatch(/import\.meta\.env\.VITE_.*(?:BYPASS|SKIP|DISABLE).*auth/i);
        expect(content).not.toMatch(/if\s*\(\s*import\.meta\.env\.VITE_.*\)\s*return\s*<Index/);
      });
    }
  });

  describe("No catch (err: any) pattern", () => {
    it("source files should not use catch (err: any)", () => {
      const files = getAllTsFiles(SRC_DIR);
      const violations: string[] = [];
      for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        if (/catch\s*\(\s*\w+\s*:\s*any\s*\)/.test(content)) {
          violations.push(path.relative(SRC_DIR, file));
        }
      }
      expect(violations).toEqual([]);
    });
  });

  describe("Supabase client checks supabaseAvailable", () => {
    it("client.ts exports supabaseAvailable flag", () => {
      const content = readFile("integrations/supabase/client.ts");
      expect(content).toContain("supabaseAvailable");
    });
  });

  describe("Auth system enforces session requirement", () => {
    it("App.tsx shows Auth page when no user session", () => {
      const content = readFile("App.tsx");
      expect(content).toMatch(/if\s*\(\s*!user\s*\)/);
      expect(content).toContain("<Auth");
    });

    it("App.tsx handles authUnavailable state explicitly", () => {
      const content = readFile("App.tsx");
      expect(content).toContain("authUnavailable");
    });
  });

  describe("Progress hook validates data integrity", () => {
    it("useProgress validates artifact arrays", () => {
      const content = readFile("hooks/useProgress.ts");
      expect(content).toContain("Array.isArray(loaded.artifacts)");
      expect(content).toContain("Array.isArray(loaded.earnedBadges)");
    });

    it("useProgress checks supabaseAvailable before saving", () => {
      const content = readFile("hooks/useProgress.ts");
      expect(content).toContain("supabaseAvailable");
    });
  });

  describe("Logger is used for critical flows", () => {
    it("useAuth.tsx uses structured logging", () => {
      const content = readFile("hooks/useAuth.tsx");
      expect(content).toContain("logger.");
    });

    it("useProgress.ts uses structured logging", () => {
      const content = readFile("hooks/useProgress.ts");
      expect(content).toContain("logger.");
    });

    it("useAICoach.ts uses structured logging", () => {
      const content = readFile("hooks/useAICoach.ts");
      expect(content).toContain("logger.");
    });
  });

  describe("Leaderboard is transparently marked as simulated", () => {
    it("shows simulated data disclaimer", () => {
      const content = readFile("components/Leaderboard.tsx");
      expect(content).toMatch(/simul/i);
      // Must have visible disclaimer, not hidden
      expect(content).toContain("Apercu");
    });
  });
});
