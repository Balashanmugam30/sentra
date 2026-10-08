import { test, expect } from "@playwright/test";

test.describe("09 - PWA Manifest & Service Worker", () => {
  test("serves valid manifest.json", async ({ request }) => {
    const response = await request.get("/manifest.json");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.name).toBe("Sentra Mobile");
    expect(data.short_name).toBe("Sentra");
    expect(data.start_url).toBe("/mobile/home");
    expect(data.scope).toBe("/mobile");
    expect(Array.isArray(data.icons)).toBe(true);
    expect(data.icons.length).toBeGreaterThan(0);
  });

  test("serves sw.js service worker script", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("SENTRA_CACHE");
    expect(text).toContain("APP_SHELL");
    expect(text).toContain("/mobile/home");
  });

  test("serves mobile icons", async ({ request }) => {
    const iconRes = await request.get("/icons/sentra-icon.svg");
    expect(iconRes.status()).toBe(200);
    const maskableRes = await request.get("/icons/sentra-maskable.svg");
    expect(maskableRes.status()).toBe(200);
  });
});
