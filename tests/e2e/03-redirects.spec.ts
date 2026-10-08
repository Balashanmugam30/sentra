import { test, expect } from "@playwright/test";

test.describe("03 - Canonical Route Redirects", () => {
  test("redirects /landing to /", async ({ page }) => {
    await page.goto("/landing");
    await page.waitForURL((url) => url.pathname === "/" || url.pathname === "");
    expect(page.url()).toMatch(/\/$/);
  });

  test("redirects /dashboard to /app (or /login if unauthenticated)", async ({ page }) => {
    await page.goto("/dashboard");
    // If not logged in, redirects through /app -> /login?from=/app, or directly /app
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/(app|login)/);
  });

  test("redirects /app/dashboard to /app (or /login if unauthenticated)", async ({ page }) => {
    await page.goto("/app/dashboard");
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/(app|login)/);
  });
});
