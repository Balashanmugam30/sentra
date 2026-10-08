import { test, expect } from "@playwright/test";

test.describe("07 - Desktop Viewport 1024px", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("renders desktop layout at 1024px breakpoint", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav, header").first();
    await expect(nav).toBeVisible();
  });
});
