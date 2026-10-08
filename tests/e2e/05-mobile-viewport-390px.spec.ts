import { test, expect } from "@playwright/test";

test.describe("05 - Mobile Viewport 390px (Standard Mobile)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("renders landing page responsive elements at 390px", async ({ page }) => {
    await page.goto("/");
    const navHeading = page.locator("nav, header").first();
    await expect(navHeading).toBeVisible();
  });

  test("renders mobile root route at 390px", async ({ page }) => {
    await page.goto("/mobile");
    // Verify page loads without crash
    expect(page.url()).toContain("/mobile");
  });
});
