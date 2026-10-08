import { test, expect } from "@playwright/test";
import { setupAuthSession } from "./helpers/auth";

test.describe("12 - Authenticated Crisis Operations & Command Surface QA", () => {
  test.beforeEach(async ({ context, page }) => {
    await setupAuthSession(context, page);
  });

  test("verifies Command Center (/app) renders authenticated workspace and shell", async ({ page }) => {
    await page.goto("/app");

    // Shell container check
    await expect(page.locator(".sentra-auth-shell").first()).toBeVisible({ timeout: 10000 });

    // Header top bar check
    await expect(page.locator("header").first()).toBeVisible();

    // Mode switcher or workspace title
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("verifies Incidents Operations Queue (/app/incidents) loads, filters, and exhibits tactical cockpit", async ({ page }) => {
    await page.goto("/app/incidents");

    // Title and heading check
    const heading = page.locator("h1:has-text('Crisis Incident Command')").first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // KPI cards check
    await expect(page.locator("text=Active Incidents").first()).toBeVisible();
    await expect(page.locator("text=Critical / High").first()).toBeVisible();
    await expect(page.locator("text=Responders Deployed").first()).toBeVisible();
    await expect(page.locator("text=Mean Containment ETA").first()).toBeVisible();

    // Filter controls check
    const searchInput = page.locator('input[placeholder*="Filter by title"]').first();
    await expect(searchInput).toBeVisible();

    // Incident list item selection check
    const incidentCards = page.locator(".sentra-incidents-workspace article, .sentra-incidents-workspace [role='button'], .sentra-incidents-workspace .glass-card-interactive");
    if (await incidentCards.count() > 0) {
      await incidentCards.first().click();
    }

    // Tactical cockpit check
    await expect(page.locator("text=Deploy Response Team").first()).toBeVisible();
    await expect(page.locator("text=Continuous Operational Timeline").first()).toBeVisible();
    await expect(page.locator("text=Forensic Telemetry & Sensor Evidence").first()).toBeVisible();

    // Test operator command action
    const deployBtn = page.locator("button:has-text('Deploy Response Team')").first();
    await deployBtn.click();
    await expect(page.locator("text=Command Dispatched").first()).toBeVisible();

    // Test view toggle to Analytics
    const analyticsTab = page.locator("button:has-text('Intelligence & Trend Analytics')").first();
    await analyticsTab.click();
    await expect(page.locator("text=Incident intelligence").first()).toBeVisible();
  });

  test("verifies Operational Analytics (/app/analytics) loads telemetry and executive charts", async ({ page }) => {
    await page.goto("/app/analytics");

    // Header check
    const heading = page.locator("h1:has-text('Operations & Risk Telemetry')").first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // KPI cards check
    await expect(page.locator("text=Readiness Index").first()).toBeVisible();
    await expect(page.locator("text=Loss Prevented").first()).toBeVisible();
    await expect(page.locator("text=Response Acceleration").first()).toBeVisible();

    // Refresh telemetry action button check
    const refreshBtn = page.locator("button[title='Refresh Analytics Dataset']").first();
    await expect(refreshBtn).toBeVisible({ timeout: 10000 });
  });

  test("verifies Spatial Command Live Map (/app/map) loads digital twin stage", async ({ page }) => {
    await page.goto("/app/map");

    // Digital twin container check
    await expect(page.locator(".sentra-twin-shell, .hyperreal-live-twin, main").first()).toBeVisible({ timeout: 10000 });
  });

  test("verifies Platform Settings (/app/settings) renders controls with 44px min touch targets", async ({ page }) => {
    await page.goto("/app/settings");

    // Heading check
    const heading = page.locator("h1:has-text('Platform settings')").first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Back button touch target check
    const backBtn = page.locator("button:has-text('Back')").first();
    await expect(backBtn).toBeVisible();
    const backBox = await backBtn.boundingBox();
    expect(backBox).not.toBeNull();
    if (backBox) {
      expect(backBox.height).toBeGreaterThanOrEqual(44);
    }

    // Appearance section check
    await expect(page.locator("text=Appearance").first()).toBeVisible();
    await expect(page.locator("text=Follows OS").first()).toBeVisible();

    // Security section check
    await expect(page.locator("text=Security").first()).toBeVisible();
  });
});
