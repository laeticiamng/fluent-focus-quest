import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Anti-regression: ensures no client-side env guard blocks Supabase auth.
 *
 * These files must NEVER contain direct import.meta.env checks that prevent
 * login from functioning. The only source of truth for Supabase availability
 * is the auto-generated client at @/integrations/supabase/client.
 */

const PROTECTED_FILES = [
  "src/App.tsx",
  "src/main.tsx",
  "src/pages/Auth.tsx",
  "src/hooks/useAuth.tsx",
];

const FORBIDDEN_PATTERNS = [
  /import\.meta\.env\.VITE_SUPABASE_URL/,
  /import\.meta\.env\.VITE_SUPABASE_PUBLISHABLE_KEY/,
  /validateClientEnv/,
  /EnvValidationGuard/,
  /isAuthConfigured/,
];

describe("no client-side env guards blocking auth", () => {
  for (const file of PROTECTED_FILES) {
    it(`${file} must not contain direct env guards for Supabase`, () => {
      const filePath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(filePath)) return; // file may not exist yet
      const content = fs.readFileSync(filePath, "utf-8");

      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(content).not.toMatch(pattern);
      }
    });
  }
});
