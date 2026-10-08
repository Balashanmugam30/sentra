import { test, expect } from "@playwright/test";

test.describe("02 - Authentication & Demo Flow", () => {
  test("renders login page and allows demo credential interaction", async ({ page }) => {
    await page.goto("/login");

    // Verify title and heading
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();

    // Verify input for email is visible on step 1
    const emailInput = page.locator('input[type="email"], input[name="email"], input[id*="email"]').first();
    await expect(emailInput).toBeVisible();

    // Verify demo quick access buttons exist
    const adminButton = page.locator('button:has-text("Admin Console")').first();
    await expect(adminButton).toBeVisible();
  });
});
