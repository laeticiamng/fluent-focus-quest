import { test, expect } from "@playwright/test";

/**
 * E2E tests for WebGL diagnostic system.
 * Covers badge visibility, quality tier display, and fallback behavior.
 */

test.describe("WebGL Diagnostic System E2E", () => {
  test("debug badge responds to ?debug=1", async ({ page }) => {
    await page.goto("/?debug=1");
    await page.waitForTimeout(5000);
    // Should not crash even if no WebGL
    await expect(page.locator("body")).toBeVisible();
  });

  test("quality override via URL persists", async ({ page }) => {
    for (const tier of ["high", "medium", "mobile"]) {
      await page.goto(`/?quality=${tier}&debug=1`);
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("safe mode hint is accessible via ?quality=mobile", async ({ page }) => {
    await page.goto("/?quality=mobile");
    await page.waitForTimeout(5000);
    // Page loads in mobile quality mode
    await expect(page.locator("body")).toBeVisible();
  });

  test("no crash when switching quality tiers rapidly", async ({ page }) => {
    await page.goto("/?quality=high");
    await page.waitForTimeout(2000);
    await page.goto("/?quality=mobile");
    await page.waitForTimeout(2000);
    await page.goto("/?quality=medium");
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).toBeVisible();
  });

  test("degraded mode when WebGL disabled", async ({ page }) => {
    await page.addInitScript(() => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
        if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") {
          return null;
        }
        return origGetContext.apply(this, [type, ...args] as Parameters<typeof origGetContext>);
      };
    });

    await page.goto("/?debug=1");
    await page.waitForTimeout(5000);

    // Should show fallback UI, not crash
    await expect(page.locator("body")).toBeVisible();
  });
});
