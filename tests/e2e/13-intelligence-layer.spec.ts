import { test, expect } from "@playwright/test";
import { setupAuthSession } from "./helpers/auth";

test.describe("13 - Real Multimodal Crisis Intelligence Layer QA", () => {
  test.beforeEach(async ({ context, page }) => {
    await setupAuthSession(context, page);
  });

  test("verifies AI Incident Commander, Evidence Graph DAG, Specialist Council, and Human Safety Gate", async ({
    page,
  }) => {
    await page.goto("/app/incidents");

    // Ensure page loads
    const heading = page.locator("h1:has-text('Crisis Incident Command')").first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Select the first incident card to display the tactical cockpit
    const incidentCard = page.locator(".sentra-incidents-workspace article, .sentra-incidents-workspace [role='button'], .sentra-incidents-workspace .glass-card-interactive").first();
    if (await incidentCard.count() > 0) {
      await incidentCard.click();
    }

    // 1. Verify AI Incident Commander Situation Assessment
    const commanderTag = page.locator("text=AI COMMANDER").first();
    await expect(commanderTag).toBeVisible({ timeout: 8000 });

    const executiveAssessment = page.locator("text=Executive Situation Assessment").first();
    await expect(executiveAssessment).toBeVisible();

    // Verify Fused Confidence & Consensus
    await expect(page.locator("text=Fused Confidence").first()).toBeVisible();

    // 2. Verify Evidence Graph DAG Tab & Nodes
    const graphTabBtn = page.locator("button:has-text('Evidence Graph DAG')").first();
    await expect(graphTabBtn).toBeVisible();
    await graphTabBtn.click();

    await expect(page.locator("text=Topological Evidence Lineage").first()).toBeVisible();
    await expect(page.locator("text=Ingested Observation Nodes").first()).toBeVisible();

    // 3. Verify Specialist Agents Deliberation Tab
    const agentsTabBtn = page.locator("button:has-text('Specialist Agents')").first();
    await expect(agentsTabBtn).toBeVisible();
    await agentsTabBtn.click();

    await expect(page.locator("text=Multi-Agent Specialist Deliberation").first()).toBeVisible();
    await expect(page.locator("text=Fire Commander").first()).toBeVisible();
    await expect(page.locator("text=Evacuation Coordinator").first()).toBeVisible();

    // 4. Verify RAG SOP Citations Tab
    const citationsTabBtn = page.locator("button:has-text('RAG SOP Citations')").first();
    await expect(citationsTabBtn).toBeVisible();
    await citationsTabBtn.click();

    await expect(page.locator("text=Verifiable Emergency Standard Operating Procedures").first()).toBeVisible();
    await expect(page.locator("text=NFPA").first()).toBeVisible();

    // 5. Verify Human Approval Safety Gate & State Machine
    const proposalsTabBtn = page.locator("button:has-text('Human Approval Gate')").first();
    await expect(proposalsTabBtn).toBeVisible();
    await proposalsTabBtn.click();

    await expect(page.locator("text=Mandatory Human Safety Boundary").first()).toBeVisible();
    const authorizeBtn = page.locator("button:has-text('Authorize & Execute')").first();
    await expect(authorizeBtn).toBeVisible();

    // Execute operator sign-off
    await authorizeBtn.click();

    // Verify state transition to AUTHORIZED & DISPATCHED
    const authorizedBadge = page.locator("text=AUTHORIZED & DISPATCHED").first();
    await expect(authorizedBadge).toBeVisible({ timeout: 5000 });
  });
});
