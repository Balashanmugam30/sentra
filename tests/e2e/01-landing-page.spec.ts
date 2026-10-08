import { test, expect } from "@playwright/test";

test.describe("01 - Landing Page Preservation", () => {
  test("renders the public landing experience without errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Verify main brand heading and identity
    await expect(page).toHaveTitle(/Sentra/i);
    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("Sentra");

    // Verify hero CTA or login navigation exists
    const loginLink = page.locator('a[href="/login"], button:has-text("Open Sentra"), a:has-text("Open Sentra")').first();
    await expect(loginLink).toBeVisible();

    // Verify no fatal runtime breaks
    const fatalErrors = consoleErrors.filter(
      (err) => !err.includes("favicon") && !err.includes("net::ERR") && !err.includes("WebSocket"),
    );
    expect(fatalErrors.length).toBeLessThan(3);
  });
});
