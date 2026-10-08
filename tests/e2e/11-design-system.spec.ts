import { test, expect } from "@playwright/test";
import { setupAuthSession } from "./helpers/auth";

test.describe("11 - Sentra Liquid Glass Design System QA", () => {
  test.beforeEach(async ({ context, page }) => {
    await setupAuthSession(context, page);
  });
  test("renders design system showcase without errors", async ({ page }) => {
    await page.goto("/app/design-system");

    // Title and heading check
    const title = page.locator("h1:has-text('Sentra Liquid Glass')").first();
    await expect(title).toBeVisible();

    // 3 Glass Material tiers check
    await expect(page.locator("text=Glass 01").first()).toBeVisible();
    await expect(page.locator("text=Glass 02").first()).toBeVisible();
    await expect(page.locator("text=Glass 03").first()).toBeVisible();

    // 8 Semantic statuses check
    await expect(page.locator("text=SAFE").first()).toBeVisible();
    await expect(page.locator("text=WARNING").first()).toBeVisible();
    await expect(page.locator("text=CRITICAL").first()).toBeVisible();
    await expect(page.locator("text=INTELLIGENCE").first()).toBeVisible();
    await expect(page.locator("text=INFO").first()).toBeVisible();
    await expect(page.locator("text=OFFLINE").first()).toBeVisible();
    await expect(page.locator("text=UNKNOWN").first()).toBeVisible();
    await expect(page.locator("text=EXECUTIVE").first()).toBeVisible();

    // Future intelligence visual grammar check
    await expect(page.locator("text=Thermal Anomaly Verified at Stairwell B").first()).toBeVisible();
    await expect(page.locator("text=Model Calibration").first()).toBeVisible();
  });

  test("verifies touch target minimum size (44px) on primary buttons", async ({ page }) => {
    await page.goto("/app/design-system");

    const primaryBtn = page.locator('button:has-text("Primary Tactical")').first();
    await expect(primaryBtn).toBeVisible();

    const box = await primaryBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("interacts with modal dialog preview", async ({ page }) => {
    await page.goto("/app/design-system");

    const previewModalBtn = page.locator('[data-testid="preview-modal-button"]').first();
    await expect(previewModalBtn).toBeVisible();

    // Click button to open modal
    await previewModalBtn.click();

    const dialogTitle = page.locator("h2:has-text('Tactical Command Protocol 04')").first();
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });

    // Close dialog via close button or cancel
    const closeBtn = page.locator('button[aria-label="Close dialog"], button:has-text("Cancel")').first();
    await closeBtn.click();
    await expect(dialogTitle).not.toBeVisible();
  });

  test("verifies ultra-narrow 320px viewport without horizontal leak", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto("/app/design-system");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(320);

    const title = page.locator("h1:has-text('Sentra Liquid Glass')").first();
    await expect(title).toBeVisible();
  });

  test("verifies standard mobile 390px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/design-system");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);

    await expect(page.locator("text=Zone Containment").first()).toBeVisible();
  });

  test("verifies tablet 768px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/app/design-system");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768);

    await expect(page.locator("text=Button Hierarchy").first()).toBeVisible();
  });

  test("verifies widescreen 1440px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/app/design-system");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1440);

    await expect(page.locator("text=Audited 8-Viewport Responsive System").first()).toBeVisible();
  });
});
