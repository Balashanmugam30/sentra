import { test, expect } from "@playwright/test";
import { setupAuthSession } from "./helpers/auth";

test.describe("14 - Real Data Plane, Calibrated Prediction & MLOps Governance QA", () => {
  test.beforeEach(async ({ context, page }) => {
    await setupAuthSession(context, page);
  });

  test("verifies Prediction Cockpit, Data Health, 90% Uncertainty Intervals, MLOps Bar, and Human Safety Gate", async ({
    page,
  }) => {
    await page.goto("/app/incidents");

    // Ensure page loads
    const heading = page.locator("h1:has-text('Crisis Incident Command')").first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Select the first incident card to display the tactical cockpit
    const incidentCard = page
      .locator(
        ".sentra-incidents-workspace article, .sentra-incidents-workspace [role='button'], .sentra-incidents-workspace .glass-card-interactive"
      )
      .first();
    if ((await incidentCard.count()) > 0) {
      await incidentCard.click();
    }

    // 1. Verify Prediction Cockpit Header & Status
    const cockpitTag = page.locator("text=Phase 5 Prediction Cockpit").first();
    await expect(cockpitTag).toBeVisible({ timeout: 10000 });

    const cockpitTitle = page
      .locator("h1:has-text('Crisis Prediction & Model Operations Engine')")
      .first();
    await expect(cockpitTitle).toBeVisible();

    // 2. Verify Data Stream Health Card
    await expect(page.locator("text=Data Stream Health").first()).toBeVisible();
    await expect(page.locator("text=Sensor Coverage Ratio").first()).toBeVisible();
    await expect(page.locator("text=Stream Freshness").first()).toBeVisible();

    // 3. Verify Calibrated Escalation Risk with 90% Uncertainty Interval
    await expect(
      page.locator("text=Escalation Risk (Calibrated)").first()
    ).toBeVisible();
    await expect(page.locator("text=90% Confidence Interval").first()).toBeVisible();
    await expect(page.locator("text=Epistemic Uncertainty").first()).toBeVisible();
    await expect(page.locator("text=Aleatoric Uncertainty").first()).toBeVisible();

    // 4. Verify Evacuation Corridors & Pinch-Point Risk
    await expect(page.locator("text=Evacuation Corridors").first()).toBeVisible();
    await expect(page.locator("text=Pinch Risk:").first()).toBeVisible();

    // 5. Verify MLOps Governance & Observability Plane
    await expect(
      page.locator("text=MLOps Governance & Observability Plane").first()
    ).toBeVisible();
    await expect(page.locator("text=Active Production Model").first()).toBeVisible();
    await expect(page.locator("text=Shadow Candidate Model").first()).toBeVisible();
    await expect(page.locator("text=Shadow Mode Divergence").first()).toBeVisible();
    await expect(page.locator("text=Population Stability Index:").first()).toBeVisible();
    await expect(page.locator("text=Inference Telemetry").first()).toBeVisible();

    // 6. Verify Deterministic Fallback Toggle
    const fallbackBtn = page.locator("button:has-text('Trigger Fallback')").first();
    if (await fallbackBtn.isVisible()) {
      await fallbackBtn.click();
      await expect(
        page.locator("text=Deterministic Heuristic Fallback Engaged").first()
      ).toBeVisible();
      // Toggle back
      await page.locator("button:has-text('Fallback Active')").first().click();
    }

    // 7. Verify Human Operational Safety Gate
    const prioritizeBtn = page.locator("button:has-text('Prioritize')").first();
    if (await prioritizeBtn.isVisible()) {
      await prioritizeBtn.click();

      // Modal verification
      const modalHeader = page
        .locator("h3:has-text('Human Operational Authorization')")
        .first();
      await expect(modalHeader).toBeVisible();
      await expect(page.locator("text=Sentra Core Safety Protocols")).toBeVisible();

      // Execute simulated authorization
      const authorizeBtn = page
        .locator("button:has-text('AUTHORIZE & EXECUTE (SIMULATED)')")
        .first();
      await expect(authorizeBtn).toBeVisible();
      await authorizeBtn.click();

      // Toast confirmation
      await expect(
        page.locator("text=SIMULATED DIRECTIVE ISSUED").first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("verifies responsive layout on mobile viewport (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/incidents");

    const cockpitTag = page.locator("text=Phase 5 Prediction Cockpit").first();
    await expect(cockpitTag).toBeVisible({ timeout: 10000 });

    // Ensure no horizontal window scrolling
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("verifies Prediction Cockpit in Operational Analytics Workspace", async ({
    page,
  }) => {
    await page.goto("/app/analytics");
    const heading = page.locator("h1:has-text('Operations & Risk Telemetry')").first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    const cockpitTag = page.locator("text=Phase 5 Prediction Cockpit").first();
    await expect(cockpitTag).toBeVisible({ timeout: 8000 });
  });

  test("verifies Prediction Cockpit in Predictive Digital Twin Route", async ({
    page,
  }) => {
    await page.goto("/twin/predictive");
    const heading = page
      .locator("h1:has-text('Predictive Twin Intelligence')")
      .first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    const cockpitTag = page.locator("text=Phase 5 Prediction Cockpit").first();
    await expect(cockpitTag).toBeVisible({ timeout: 8000 });
  });
});
