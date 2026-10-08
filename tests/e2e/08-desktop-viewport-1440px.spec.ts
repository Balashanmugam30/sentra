import { test, expect } from "@playwright/test";

test.describe("08 - Large Desktop Viewport 1440px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("renders widescreen command layout at 1440px", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Sentra/i);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
