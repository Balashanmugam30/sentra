import { test, expect } from "@playwright/test";

test.describe("10 - Mobile Field Ops Unified App", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("renders mobile shell and bottom navigation on /mobile/home", async ({ page }) => {
    await page.goto("/mobile/home");
    // Verify mobile page loaded
    const nav = page.locator('nav[aria-label="Primary mobile navigation"]').first();
    await expect(nav).toBeVisible();

    // Verify link to desktop command exists in bottom nav
    const commandLink = nav.locator('a[href="/app"]');
    await expect(commandLink).toBeVisible();
  });

  test("renders mobile alert screen", async ({ page }) => {
    await page.goto("/mobile/alert");
    expect(page.url()).toContain("/mobile/alert");
  });

  test("renders mobile route guidance screen", async ({ page }) => {
    await page.goto("/mobile/route");
    expect(page.url()).toContain("/mobile/route");
  });
});
