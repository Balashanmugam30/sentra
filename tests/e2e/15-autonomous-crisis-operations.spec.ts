import { test, expect } from "@playwright/test";
import { setupAuthSession } from "./helpers/auth";

test.describe("15 - Autonomous Crisis Operations & Safety-Governed Action Orchestration QA", () => {
  test.beforeEach(async ({ context, page }) => {
    await setupAuthSession(context, page);
  });

  test("verifies Operations Command Center, Autonomy Modes, Kill Switch, DAG Playbooks, Timeline, and Digital Twin Simulator", async ({
    page,
  }) => {
    await page.goto("/app/operations");

    // 1. Verify Command Center Header & Safety Enforced Pill
    const heading = page.locator("h1:has-text('Crisis Operations Command Center')").first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    await expect(page.locator("text=Phase 6 • Autonomous Crisis Operations").first()).toBeVisible();
    await expect(page.locator("text=Safety Gate Enforced").first()).toBeVisible();

    // 2. Verify Autonomy Mode Selector & Kill Switch
    await expect(page.locator("text=Mode:").first()).toBeVisible();
    const killSwitchBtn = page.locator("button:has-text('Emergency Stop (Kill Switch)')").first();
    await expect(killSwitchBtn).toBeVisible();

    // 3. Verify Active Playbook & Procedural Step DAG Tracker
    await expect(page.locator("text=Active Crisis SOP").first()).toBeVisible();
    await expect(page.locator("text=PB-FIRE-01").first()).toBeVisible();
    await expect(page.locator("text=Procedural Step Progression (DAG)").first()).toBeVisible();
    await expect(page.locator("text=HVAC Isolation").first()).toBeVisible();

    // 4. Verify Crisis Playbook Catalog
    await expect(page.locator("text=Versioned Crisis Playbook Catalog").first()).toBeVisible();
    await expect(page.locator("text=PB-GAS-02").first()).toBeVisible();
    await expect(page.locator("text=PB-CROWD-03").first()).toBeVisible();
    await expect(page.locator("text=PB-CONFLICT-04").first()).toBeVisible();
    await expect(page.locator("text=PB-OUTAGE-05").first()).toBeVisible();

    // 5. Test Action Governance Tab & Proposal Review Modal
    const proposalsTab = page.locator("button:has-text('Action Governance')").first();
    await proposalsTab.click();
    await expect(page.locator("text=Two-Person Integrity Policy:").first()).toBeVisible();

    // If an action proposal is awaiting review, verify modal
    const reviewBtn = page.locator("button:has-text('Review & Authorize')").first();
    if ((await reviewBtn.count()) > 0) {
      await reviewBtn.click();
      await expect(page.locator("text=Proposal Authorization").first()).toBeVisible();
      await expect(page.locator("text=Cryptographic Hash:").first()).toBeVisible();
      // Close modal
      const closeBtn = page.locator("button:has-text('✕')").first();
      await closeBtn.click();
    }

    // 6. Test Continuous Operations Timeline Tab
    const timelineTab = page.locator("button:has-text('Unified Operations Timeline')").first();
    await timelineTab.click();
    await expect(page.locator("text=Continuous Unified Operations Timeline").first()).toBeVisible();

    // 7. Test Digital Twin & What-If Crisis Simulator Tab
    const simTab = page.locator("button:has-text('Digital Twin & What-If Simulator')").first();
    await simTab.click();

    // Verify mandatory Simulation Disclaimer
    await expect(
      page.locator("text=SIMULATION / NOT LIVE OPERATIONAL DATA — Isolated Digital-Twin Sandbox").first()
    ).toBeVisible();
    await expect(page.locator("text=Scenario Parameters").first()).toBeVisible();

    // Execute simulation
    const runSimBtn = page.locator("button:has-text('Execute What-If Simulation')").first();
    await runSimBtn.click();
    await expect(page.locator("text=Containment Prob").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Recommended Tactical Adjustments").first()).toBeVisible();

    // 8. Test Execution Adapters Tab
    const adaptersTab = page.locator("button:has-text('Execution Adapters')").first();
    await adaptersTab.click();
    await expect(page.locator("text=Sentra-Simulation-Adapter").first()).toBeVisible();
    await expect(page.locator("text=NO REAL DISPATCH ADAPTER CONFIGURED").first()).toBeVisible();
    await expect(page.locator("text=Sentra-CAP-Notification-Adapter").first()).toBeVisible();
    await expect(page.locator("text=Sentra-Tactical-CAD-Adapter").first()).toBeVisible();
  });

  test("verifies responsive behavior on mobile (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/operations");

    const heading = page.locator("h1:has-text('Crisis Operations Command Center')").first();
    await expect(heading).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Safety Gate Enforced").first()).toBeVisible();
  });

  test("verifies responsive behavior on tablet (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/app/operations");

    const heading = page.locator("h1:has-text('Crisis Operations Command Center')").first();
    await expect(heading).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Safety Gate Enforced").first()).toBeVisible();
  });
});
