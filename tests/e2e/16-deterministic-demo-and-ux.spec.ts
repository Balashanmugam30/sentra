import { test, expect } from "@playwright/test";
import { setupAuthSession } from "./helpers/auth";

test.describe("16 - Deterministic Demo Suite & Operator-Centered UX QA (Phase 8)", () => {
  test.beforeEach(async ({ context, page }) => {
    await setupAuthSession(context, page);
  });

  test("verifies Deterministic Demo Suite tab, 5 canonical scenarios, execution, and SHA-256 chain validation", async ({
    page,
  }) => {
    await page.goto("/app/operations");

    // 1. Verify Command Center Header
    const heading = page.locator("h1:has-text('Crisis Operations Command Center')").first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // 2. Locate and click the Deterministic Demo Suite tab
    const demoTab = page.locator("button:has-text('Deterministic Demo Suite')").first();
    await expect(demoTab).toBeVisible();
    await demoTab.click();

    // 3. Verify Deterministic Demo Engine Banner & Guarantees
    await expect(page.locator("text=Deterministic Crisis Demonstration Suite").first()).toBeVisible();
    await expect(page.locator("text=Phase 8 • Demo Intelligence").first()).toBeVisible();
    await expect(page.locator("text=Cryptographic Chain Guard").first()).toBeVisible();
    await expect(page.locator("text=Zero Live Actuation").first()).toBeVisible();

    // 4. Verify all 5 Canonical Scenarios are rendered
    await expect(page.locator("text=Urban Conflagration & Rapid Evacuation").first()).toBeVisible();
    await expect(page.locator("text=Multi-Sensor Conflict & Uncertainty Dampening").first()).toBeVisible();
    await expect(page.locator("text=Telemetry Heartbeat Loss & Degraded Fallback").first()).toBeVisible();
    await expect(page.locator("text=Tactical Action on Unconfigured Physical Adapter").first()).toBeVisible();
    await expect(page.locator("text=Counterfactual Digital-Twin Simulation Sweep").first()).toBeVisible();

    // 5. Execute Scenario 1: Urban Conflagration (fire_escalation)
    const runFireBtn = page.locator("button[data-testid='btn-run-demo-fire_escalation']").first();
    await expect(runFireBtn).toBeVisible();
    await runFireBtn.click();

    // 6. Verify Execution Report Card & Cryptographic Verification
    const execCard = page.locator("[data-testid='demo-execution-card']").first();
    await expect(execCard).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=SHA-256 Chain: VALID").first()).toBeVisible();
    await expect(page.locator("text=Execution Report: Urban Conflagration & Rapid Evacuation").first()).toBeVisible();

    // 7. Execute Scenario 2: Multi-Sensor Conflict (sensor_disagreement)
    const runConflictBtn = page.locator("button[data-testid='btn-run-demo-sensor_disagreement']").first();
    await expect(runConflictBtn).toBeVisible();
    await runConflictBtn.click();

    // Verify Safety Gate blocked policy enforcement
    await expect(page.locator("text=Execution Report: Multi-Sensor Conflict & Uncertainty Dampening").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Safety Gate: BLOCKED_BY_POLICY").first()).toBeVisible();
    await expect(page.locator("text=SHA-256 Chain: VALID").first()).toBeVisible();

    // 8. Execute Scenario 4: Hardware Honesty (adapter_unconfigured)
    const runHardwareBtn = page.locator("button[data-testid='btn-run-demo-adapter_unconfigured']").first();
    await expect(runHardwareBtn).toBeVisible();
    await runHardwareBtn.click();
    await expect(page.locator("text=Execution Report: Tactical Action on Unconfigured Physical Adapter").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Hardware:").first()).toBeVisible();
  });

  test("verifies responsive behavior on mobile (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/operations");

    const demoTab = page.locator("button:has-text('Deterministic Demo Suite')").first();
    await expect(demoTab).toBeVisible({ timeout: 15000 });
    await demoTab.click();

    await expect(page.locator("text=Deterministic Crisis Demonstration Suite").first()).toBeVisible();
    await expect(page.locator("button[data-testid='btn-run-demo-fire_escalation']").first()).toBeVisible();
  });

  test("verifies responsive behavior on tablet (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/app/operations");

    const demoTab = page.locator("button:has-text('Deterministic Demo Suite')").first();
    await expect(demoTab).toBeVisible({ timeout: 15000 });
    await demoTab.click();

    await expect(page.locator("text=Deterministic Crisis Demonstration Suite").first()).toBeVisible();
  });
});
