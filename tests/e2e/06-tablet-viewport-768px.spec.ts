import { test, expect } from "@playwright/test";

test.describe("06 - Tablet Viewport 768px", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("renders layout properly at 768px tablet width", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    await expect(body).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
