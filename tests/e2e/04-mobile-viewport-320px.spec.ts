import { test, expect } from "@playwright/test";

test.describe("04 - Mobile Viewport 320px (Ultra-narrow)", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("renders landing page cleanly at 320px without horizontal scroll leak", async ({ page }) => {
    await page.goto("/");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    // Tolerance for minor rendering sub-pixels
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("renders login page at 320px cleanly", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
  });
});
